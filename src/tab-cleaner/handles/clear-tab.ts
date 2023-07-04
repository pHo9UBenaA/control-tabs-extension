import { StorageKey } from '../constants/storage';
import { ClearHistory, Domain } from '../models/storage';

const removeTabsByDomain = (domain: string): Promise<void> => {
	return new Promise((resolve) => {
		chrome.tabs.query({ url: `*://${domain}/*` }, (tabs) => {
			const clearHistories: ClearHistory[] = tabs.map((tab) => {
				const { id, title, url } = tab;
				if (!id) {
					console.error('Tab id is not defined. details: ', tab);
					return { id: undefined, title, url };
				}
				chrome.tabs.remove(id);
				return { id, title, url };
			});
			chrome.storage.local.get(StorageKey.clearHistories, (data) => {
				const prevClearHistories: ClearHistory[] = data.clearHistories || [];
				const updateClearHistories: ClearHistory[] = [
					...clearHistories,
					...prevClearHistories,
				];
				chrome.storage.local.set(
					{
						[StorageKey.clearHistories]: updateClearHistories,
					},
					() => resolve()
				); // Callback function to resolve the Promise once the set operation completes
			});
		});
	});
};

const handleClearTabEvent = () => {
	chrome.storage.local.get(StorageKey.domains, async (data) => {
		const domains: Domain[] = data.domains || [];
		for (let domain of domains) {
			await removeTabsByDomain(domain);
		}
	});
};

export { handleClearTabEvent };
