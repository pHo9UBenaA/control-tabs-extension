import React, { useEffect, useState } from 'react';
import { ClearHistory, Domain } from '../../models/storage';

export function useStorageChange<T extends (Domain | ClearHistory)[]>(
	key: string
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] {
	const [value, setValue] = useState<T>();

	const getCallback = (data: { [key: string]: T }) => {
		setValue(data[key] || undefined);
	};
	const onChangeCallback = (changes: { [key: string]: chrome.storage.StorageChange }) => {
		if (changes[key]) {
			setValue(changes[key].newValue || undefined);
		}
	};
	useEffect(() => {
		chrome.storage.local.get(key, (data) => getCallback(data));
		chrome.storage.local.onChanged.addListener((changes) => onChangeCallback(changes));
	}, [key]);

	return [value, setValue];
}
