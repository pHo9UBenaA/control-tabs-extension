import { StorageKey } from '../constants/storage';
import { ClearHistory, Domain, RemoveNewTab } from '../models/storage';

const removeNewTabs = (removeNewTab: RemoveNewTab) => {
	if (!removeNewTab) {
		return;
	}

	const getRemoveIds = (tabs: chrome.tabs.Tab[]): number[] => {
		return tabs
			.map((tab) => {
				const { id } = tab;
				if (!id) {
					console.error('Tab id is not defined. details: ', tab);
					return;
				}
				return id;
			})
			.filter((x): x is number => x !== undefined);
	};

	const removeTabs = (tabs: chrome.tabs.Tab[]) => {
		const removeIds = getRemoveIds(tabs);
		chrome.tabs.remove(removeIds);
	};

	chrome.tabs.query({ url: 'chrome://newtab/' }, removeTabs);
};

const removeTabsByDomain = (domains: string[]) => {
	const getClearHistories = (tabs: chrome.tabs.Tab[]): ClearHistory[] => {
		return tabs
			.slice()
			.reverse()
			.map((tab) => {
				const { id, title, url } = tab;
				if (!id) {
					console.error('Tab id is not defined. details: ', tab);
					return;
				}
				return { id, title, url };
			})
			.filter((x): x is ClearHistory => x !== undefined);
	};

	const updateClearHistoriesStorage =
		(clearHistories: ClearHistory[]) => (data: { [s: string]: ClearHistory[] }) => {
			const prevClearHistories: ClearHistory[] = data[StorageKey.clearHistories] || [];
			const updateClearHistories: ClearHistory[] = [...clearHistories, ...prevClearHistories];
			chrome.storage.local.set({
				[StorageKey.clearHistories]: updateClearHistories,
			});
		};

	const tabsQuery: chrome.tabs.QueryInfo = {
		url: domains.map((domain) => `*://${domain}/*`),
	};

	chrome.tabs.query(tabsQuery, (tabs) => {
		const clearHistories = getClearHistories(tabs);
		chrome.tabs.remove(clearHistories.map((x) => x.id));
		chrome.storage.local.get(
			StorageKey.clearHistories,
			updateClearHistoriesStorage(clearHistories)
		);
	});
};

const handleClearTabEvent = () => {
	chrome.storage.local.get(StorageKey.removeNewTab, (data) => {
		const removeNewTab: boolean = data[StorageKey.removeNewTab] || false;
		removeNewTabs(removeNewTab);
	});

	chrome.storage.local.get(StorageKey.domains, (data) => {
		const domains: Domain[] = data[StorageKey.domains] || [];
		removeTabsByDomain(domains);
	});
};

export { handleClearTabEvent };
