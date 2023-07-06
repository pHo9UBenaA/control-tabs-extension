import { StorageKey } from '../constants/storage';
import { ClearHistory, Domain, RemoveNewTab } from '../models/storage';

const removeNewTabs = (removeNewTab: RemoveNewTab) => {
	if (!removeNewTab) {
		return;
	}
	chrome.tabs.query({ url: 'chrome://newtab/' }, (tabs) => {
		tabs.forEach((tab) => {
			const { id } = tab;
			if (!id) {
				console.error('Tab id is not defined. details: ', tab);
				return;
			}
			chrome.tabs.remove(id);
		});
	});
};

const removeTabsByDomain = (domain: string): Promise<void> => {
	return new Promise((resolve) => {
		chrome.tabs.query({ url: `*://${domain}/*` }, (tabs) => {
			const clearHistories: ClearHistory[] = tabs
				.map((tab) => {
					const { id, title, url } = tab;
					if (!id) {
						console.error('Tab id is not defined. details: ', tab);
						return;
					}
					chrome.tabs.remove(id);
					return { id, title, url };
				})
				// TODO
				.filter((x): x is ClearHistory => x !== undefined);

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
	chrome.storage.local.get(StorageKey.removeNewTab, (data) => {
		const removeNewTab: boolean = data.removeNewTab || false;
		removeNewTabs(removeNewTab);
	});
	chrome.storage.local.get(StorageKey.domains, async (data) => {
		const domains: Domain[] = data.domains || [];
		for (let domain of domains) {
			await removeTabsByDomain(domain);
		}
	});
};

export { handleClearTabEvent };
