import React, { useEffect, useState } from 'react';
import { StorageKey } from '../../constants/storage';
import { Setting } from '../../models/storage';

// TODO
type SettingToggleType = Exclude<
	Setting['enableAutoRemoveNewTab'] | Setting['removeOtherDomains'],
	undefined
>;

// TODO
const getStorageSettingValue = (key: string): Promise<Setting> => {
	return new Promise((resolve) => {
		chrome.storage.local.get(key, (result) => {
			resolve(result[key] || {});
		});
	});
};

export function useSettingToggleChange(
	key: Extract<keyof Setting, 'enableAutoRemoveNewTab' | 'removeOtherDomains'>
): [typeof key, SettingToggleType, React.Dispatch<React.SetStateAction<SettingToggleType>>] {
	const [isChecked, setIsChecked] = useState<SettingToggleType>(false);

	useEffect(() => {
		(async () => {
			const setting: Setting = await getStorageSettingValue(StorageKey.setting);
			setIsChecked(setting?.[key] || false);
		})();
	}, [key]);

	return [key, isChecked, setIsChecked];
}
