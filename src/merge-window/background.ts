import { contextMenusIds } from './constants/context-menus';
import { handleMergeWindowEvent, handleMergeSecretWindowEvent } from './handles/merge-window';

const handleMapper = {
	[contextMenusIds.mergeWindow]: handleMergeWindowEvent,
	[contextMenusIds.mergeSecretWindow]: handleMergeSecretWindowEvent,
} as const satisfies { [key in keyof typeof contextMenusIds]: () => void };

const initContextMenus = () => {
	const createContextMenu = (id: string, message: string) => {
		chrome.contextMenus.create({
			id,
			title: chrome.i18n.getMessage(message),
			contexts: ['all'],
		});
	};

	const removeAllContextMenus = () => {
		chrome.contextMenus.removeAll();
	};

	const createContextMenus = () => {
		createContextMenu(contextMenusIds.mergeWindow, 'mergeWindowTitle');
		createContextMenu(contextMenusIds.mergeSecretWindow, 'mergeIncognitoWindowTitle');
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
	initContextMenus();
	updateMergeSecretWindowContextMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	const menuItemId = info.menuItemId.toString();
	if (menuItemId in handleMapper) {
		handleMapper[menuItemId]();
	}
});

chrome.action.onClicked.addListener((tab) => {
	const handles = Object.values(handleMapper);
	handles.forEach((handle) => handle());
});

// TODO
updateMergeSecretWindowContextMenu();
