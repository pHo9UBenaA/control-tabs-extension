import React, { useEffect, useState } from 'react';
import { getStorageSettingValue } from '../states/chromeStorage';
import { StorageKey } from '../../constants/storage';
import { Setting } from '../../models/storage';

export function useClearHistoriesLimit(): [
	Setting['clearHistoriesLimit'],
	React.Dispatch<React.SetStateAction<Setting['clearHistoriesLimit']>>,
] {
	const [clearHistoriesLimit, setClearHistoriesLimit] =
		useState<Setting['clearHistoriesLimit']>();

	useEffect(() => {
		(async () => {
			const setting: Setting = await getStorageSettingValue(StorageKey.setting);
			setClearHistoriesLimit(setting?.clearHistoriesLimit);
		})();
	}, []);

	return [clearHistoriesLimit, setClearHistoriesLimit];
}
