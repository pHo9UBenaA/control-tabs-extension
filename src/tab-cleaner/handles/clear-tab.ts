import { StorageKey } from '../constants/storage';
import { ClearHistory, Domain, Setting } from '../models/storage';

const removeNewTabs = (removeNewTab: Setting['removeNewTab']) => {
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

const removeTabsByDomain = (
	domains: Domain[],
	clearHistoriesLimit: Setting['clearHistoriesLimit']
) => {
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

	const getClearHistoriesLimit = (clearHistories: ClearHistory[]): ClearHistory[] => {
		if (!clearHistoriesLimit) {
			return clearHistories;
		}
		return clearHistories.slice(0, clearHistoriesLimit);
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
		url: domains.map((domain) => {
			if (typeof domain === 'string') {
				return `*://${domain}/*`;
			}
			return `*://${domain.name}/*`;
		}),
	};

	chrome.tabs.query(tabsQuery, (tabs) => {
		const clearHistories = getClearHistories(tabs);
		chrome.tabs.remove(clearHistories.map((x) => x.id));
		const clearHistoriesLimit = getClearHistoriesLimit(clearHistories);
		chrome.storage.local.get(
			StorageKey.clearHistories,
			updateClearHistoriesStorage(clearHistoriesLimit)
		);
	});
};

const handleClearTabEvent = async () => {
	const setting = await new Promise<Setting>((resolve) => {
		chrome.storage.local.get(StorageKey.setting, (data) => {
			resolve(data[StorageKey.setting]);
		});
	});
	const removeNewTab = setting?.removeNewTab || false;
	removeNewTabs(removeNewTab);

	const domains = await new Promise<Domain[]>((resolve) => {
		chrome.storage.local.get(StorageKey.domains, (data) => {
			resolve(data[StorageKey.domains]);
		});
	});
	removeTabsByDomain(domains, setting?.clearHistoriesLimit);
};

export { handleClearTabEvent };
