import { StorageKey } from './constants/storage';
import { ClearHistory, Domain } from './models/storage';

const renderDomains = () => {
	const ul = document.getElementById('domains') as HTMLUListElement | null;
	if (!ul) {
		console.error('domains not found');
		return;
	}

	ul.innerHTML = '';

	chrome.storage.local.get(StorageKey.domains, (data) => {
		const domains: Domain[] = data.domains || [];
		domains.forEach((domain) => {
			const li = document.createElement('li');
			li.textContent = domain;
			ul.appendChild(li);
		});
	});
};

const renderCleanedPages = () => {
	const ul = document.getElementById('cleaned-pages') as HTMLUListElement | null;
	if (!ul) {
		console.error('cleaned-pages not found');
		return;
	}

	ul.innerHTML = '';

	chrome.storage.local.get(StorageKey.clearHistories, (data) => {
		const clearHistories: ClearHistory[] = data.clearHistories || [];
		clearHistories.forEach((clearHistory) => {
			const { id, title, url } = clearHistory;
			const anchor = document.createElement('a');

			if (title) {
				anchor.textContent = title;
			}
			if (url) {
				anchor.href = url;
				anchor.target = '_blank';
				anchor.rel = 'noopener noreferrer';
			}

			ul.appendChild(anchor);
		});
	});
};

const renderHtml = () => {
	renderDomains();
	renderCleanedPages();
};

const getDomainInputValueWithoutSchemeAndTrailingSlash = (): string | undefined => {
	const domainInput = document.getElementById('domain') as HTMLInputElement | null;
	const domainInputValue = domainInput?.value;
	const domainInputValueWithoutScheme = domainInputValue
		// without scheme: https://stackoverflow.com/a/19709846
		?.replace(/(^\w+:|^)\/\//, '')
		// without trailing slash: https://stackoverflow.com/a/6680827
		.replace(/\/$/, '');
	return domainInputValueWithoutScheme;
};

const submitEventListener = (ev: MouseEvent) => {
	const domainInputValueWithoutScheme = getDomainInputValueWithoutSchemeAndTrailingSlash();
	if (!domainInputValueWithoutScheme) {
		console.error('domainInputValueWithoutScheme is undefined');
		return;
	}

	chrome.storage.local.get(StorageKey.domains, (data) => {
		const prevDomains: Domain[] = data.domains || [];
		const domains: Domain[] = [...prevDomains, domainInputValueWithoutScheme];
		const uniqueDomains: Domain[] = [...new Set(domains)];
		chrome.storage.local.set({ [StorageKey.domains]: uniqueDomains });
	});
};

// TODO: domainとhistoryを分ける
const clearEventListener = (ev: MouseEvent) => {
	chrome.storage.local.clear();
};

document.addEventListener('DOMContentLoaded', () => {
	const submitButton = document.getElementById('submit');
	const clearButton = document.getElementById('clear');
	submitButton?.addEventListener('click', submitEventListener);
	clearButton?.addEventListener('click', clearEventListener);
	renderHtml();
});

// Memo: 念の為で入れてる、そのうち多分消す
let debounceTimeoutId: number | null = null;
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (debounceTimeoutId) {
		clearTimeout(debounceTimeoutId);
	}

	debounceTimeoutId = setTimeout(() => {
		for (let key in changes) {
			if (key === StorageKey.domains) {
				renderHtml();
				return;
			}
			if (key === StorageKey.clearHistories) {
				renderHtml();
				return;
			}
		}
		debounceTimeoutId = null;
	}, 100);
});
