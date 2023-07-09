import { StorageKey } from '../constants/storage';
import { Domain } from '../models/storage';

// TODO DRY 依存関係合わせて、ディレクトリ構造をなんとかしなきゃ
const domainsRegister = async (domains: Domain[]) => {
	const prevDomains: Domain[] = await new Promise((resolve) => {
		chrome.storage.local.get(StorageKey.domains, (data) => {
			resolve(data[StorageKey.domains] || []);
		});
	});

	const uniqueDomains: Domain[] = [...new Set([...prevDomains, ...domains])];

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
    const domains = tabs
        .map((tab) => tab.url)
        .filter((url): url is Domain => url !== undefined);
    const hostnames = domains
        .map((domain) => {
            try {
                const lineAddSchema = domain.includes('://') ? domain : `http://${domain}`;
                const url = new URL(lineAddSchema);
                return url.hostname;
            } catch {
                console.error('Invalid URL:', domain);
            }
        })
        .filter((x): x is Domain => x !== undefined);
    domainsRegister(hostnames);
};

export { handleRegisterDomainEvent };
