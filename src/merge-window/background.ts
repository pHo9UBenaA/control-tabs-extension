import { contextMenusIds } from './constants/context-menus';
import { mergeSecretWindowEventHandler, mergeWindowEventHandler } from './handlers/merge-window';

const handlerMapper = {
	[contextMenusIds.mergeWindow]: mergeWindowEventHandler,
	[contextMenusIds.mergeSecretWindow]: mergeSecretWindowEventHandler,
} as const satisfies { [key in keyof typeof contextMenusIds]: () => void };

chrome.runtime.onInstalled.addListener(() => {
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

	chrome.extension.isAllowedIncognitoAccess().then((isAllowedIncognitoAccess) => {
		if (isAllowedIncognitoAccess) {
			return;
		}
		chrome.contextMenus.update(contextMenusIds.mergeSecretWindow, {
			enabled: false,
		});
	});
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
