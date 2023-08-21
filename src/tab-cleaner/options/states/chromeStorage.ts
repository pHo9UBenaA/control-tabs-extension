import { Setting } from '../../models/storage';
export const getStorageSettingValue = (key: string): Promise<Setting> => {
	return new Promise((resolve) => {
		chrome.storage.local.get(key, (result) => {
			resolve(result[key] || {});
		});
	});
};