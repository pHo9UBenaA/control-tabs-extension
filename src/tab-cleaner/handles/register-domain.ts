import { v4 as uuid_v4 } from 'uuid';
import { StorageKey } from '../constants/storage';
import { Domain } from '../models/storage';

// TODO DRY 依存関係合わせて、ディレクトリ構造をなんとかしなきゃ
const domainsRegister = async (hostnames: string[]) => {
	const domains = hostnames.map((hostname) => {
		return {
			uuid: uuid_v4(),
			name: hostname,
		};
	});

	const prevDomains: Domain[] = await new Promise((resolve) => {
		chrome.storage.local.get(StorageKey.domains, (data) => {
			resolve(data[StorageKey.domains] || []);
		});
	});

	const filteredDomains: Domain[] = domains.filter((domain) => {
		const isUnique = prevDomains.every((prevDomain) => {
			if (typeof prevDomain === 'string') {
				return prevDomain !== domain.name;
			}
			return prevDomain.name !== domain.name;
		});
		return isUnique;
	});

	const uniqueDomains: Domain[] = [...new Set([...prevDomains, ...filteredDomains])];

	chrome.storage.local.set({
		[StorageKey.domains]: uniqueDomains,
	});
};

const handleRegisterDomainEvent = async () => {
	const tabs: chrome.tabs.Tab[] = await new Promise((resolve) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			resolve(tabs);
		});
	});
	const urls = tabs.map((tab) => tab.url).filter((url): url is string => url !== undefined);
	const hostnames = urls
		.map((url) => {
			try {
				const lineAddSchema = url.includes('://') ? url : `http://${url}`;
				const hostname = new URL(lineAddSchema).hostname;
				return hostname;
			} catch {
				console.error('Invalid URL:', url);
			}
		})
		.filter((x): x is string => x !== undefined);
	domainsRegister(hostnames);
};

export { handleRegisterDomainEvent };
