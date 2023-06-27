import { contextMenusIds } from './constants/context-menus';
import { mergeSecretWindowEventHandler, mergeWindowEventHandler } from './handlers/merge-window';

const handlerMapper = {
	[contextMenusIds.mergeWindow]: mergeWindowEventHandler,
	[contextMenusIds.mergeSecretWindow]: mergeSecretWindowEventHandler,
} as const satisfies { [key in keyof typeof contextMenusIds]: () => void };

const initContextMenus = () => {
	const removeAllContextMenus = () => {
		chrome.contextMenus.removeAll();
	};

	const createContextMenus = () => {
		chrome.contextMenus.create({
			id: contextMenusIds.mergeWindow,
			title: chrome.i18n.getMessage('mergeWindowTitle'),
			contexts: ['all'],
		});

		chrome.contextMenus.create({
			id: contextMenusIds.mergeSecretWindow,
			title: chrome.i18n.getMessage('mergeIncognitoWindowTitle'),
			contexts: ['all'],
		});
	};

	removeAllContextMenus();
	createContextMenus();
};

const updateMergeSecretWindowContextMenu = async () => {
	const isAllowedIncognitoAccess = await chrome.extension.isAllowedIncognitoAccess();
	chrome.contextMenus.update(contextMenusIds.mergeSecretWindow, {
		enabled: isAllowedIncognitoAccess,
	});
};

chrome.runtime.onInstalled.addListener(() => {
	console.info('debug: background.ts onInstalled');
	initContextMenus();
	updateMergeSecretWindowContextMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	const menuItemId = info.menuItemId.toString();
	if (menuItemId in handlerMapper) {
		// TODO
		handlerMapper[menuItemId as keyof typeof handlerMapper]();
	}
});

chrome.action.onClicked.addListener((tab) => {
	const handler = Object.values(handlerMapper);
	handler.forEach((handler) => handler());
});

// シークレットウィンドウの設定の変更を検知したい
updateMergeSecretWindowContextMenu();
console.info('debug: background.ts');
