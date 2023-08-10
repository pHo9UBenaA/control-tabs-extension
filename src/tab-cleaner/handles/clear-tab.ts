import { StorageKey } from '../constants/storage';
import { ClearHistory, Domain, Setting } from '../models/storage';

const enableAutoRemoveNewTabs = (enableAutoRemoveNewTab: Setting['enableAutoRemoveNewTab']) => {
	if (!enableAutoRemoveNewTab) {
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
	clearHistoriesLimit: Setting['clearHistoriesLimit'],
	removeOtherDomains: Setting['removeOtherDomains']
) => {
	const getClearHistories = (tabs: chrome.tabs.Tab[]): ClearHistory[] => {
		const isTabWhitelisted = (url: string | undefined): boolean => {
			if (!url) {
				return false;
			}

			return domains.some((domain) => {
				const domainName = typeof domain === 'string' ? domain : domain.name;
				return url.includes(domainName);
			});
		};

		const clearHistories = tabs
			.filter(({ id }) => id)
			.filter(({ url }) => !(removeOtherDomains && isTabWhitelisted(url)))
			.map(({ id, title, url }) => ({ id, title, url }))
			// TODO
			.filter((x): x is ClearHistory => x.id !== undefined);

		tabs.forEach((tab) => {
			if (!tab.id) {
				console.error('Tab id is not defined. details: ', tab);
			}
		});

		return clearHistories;
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
			const updateClearHistories: ClearHistory[] = getClearHistoriesLimit([
				...clearHistories,
				...prevClearHistories,
			]);
			chrome.storage.local.set({
				[StorageKey.clearHistories]: updateClearHistories,
			});
		};

	// TODO: removeOtherDomains
	const tabsQuery: chrome.tabs.QueryInfo = removeOtherDomains
		? {}
		: {
				url: domains.map((domain) => {
					const domainName = typeof domain === 'string' ? domain : domain.name;
					return `*://${domainName}/*`;
				}),
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

const handleClearTabEvent = async () => {
	const setting = await new Promise<Setting>((resolve) => {
		chrome.storage.local.get(StorageKey.setting, (data) => {
			resolve(data[StorageKey.setting]);
		});
	});
	const enableAutoRemoveNewTab = setting?.enableAutoRemoveNewTab || false;
	enableAutoRemoveNewTabs(enableAutoRemoveNewTab);

	const domains = await new Promise<Domain[]>((resolve) => {
		chrome.storage.local.get(StorageKey.domains, (data) => {
			resolve(data[StorageKey.domains]);
		});
	});
	const removeOtherDomains = setting?.removeOtherDomains || false;
	removeTabsByDomain(domains, setting?.clearHistoriesLimit, removeOtherDomains);
};

export { handleClearTabEvent };
