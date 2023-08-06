import {
	Box,
	Button,
	ChakraProvider,
	Divider,
	Flex,
	Heading,
	Stack,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { v4 as uuid_v4 } from 'uuid';
import { StorageKey } from './constants/storage';
import { handleClearTabEvent } from './handles/clear-tab';
import { ClearHistory, Domain, Setting } from './models/storage';
import { ConfirmDialog, DialogProperty } from './options/components/ConfirmDialog';
import { ClearHistoryList } from './options/features/ClearHistoryList';
import { DomainInput } from './options/features/DomainInput';
import { DomainList } from './options/features/DomainList';
import { FileUploadButton } from './options/features/FileUploadButton';
import { SettingToggle } from './options/features/SettingToggle';
import { SelectCleanHistoryLimit } from './options/features/SelectCleanHistoryLimit';

const initDialogProperty: DialogProperty = {
	title: '',
	confirmMessage: '',
	actionMessage: 'Clear',
	handleAction: () => {},
};

const getStorageSettingValue = (key: string): Promise<Setting> => {
	return new Promise((resolve) => {
		chrome.storage.local.get(key, (result) => {
			resolve(result[key] || {});
		});
	});
};

const domainRegister = async (
	urlHostname: string,
	setDomains: React.Dispatch<React.SetStateAction<Domain[] | undefined>>
) => {
	const urlHostnameWithoutScheme = urlHostname.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');

	if (!urlHostnameWithoutScheme) {
		console.error('urlHostnameWithoutScheme is undefined');
		return;
	}

	const prevDomains: Domain[] = await new Promise((resolve) => {
		chrome.storage.local.get(StorageKey.domains, (data) => {
			resolve(data[StorageKey.domains] || []);
		});
	});

	const isDuplicate = prevDomains.some((prevDomain) => {
		if (typeof prevDomain === 'string') {
			return prevDomain === urlHostnameWithoutScheme;
		}
		return prevDomain.name === urlHostnameWithoutScheme;
	});
	if (isDuplicate) {
		console.info('Duplicate domain');
		return;
	}

	const uniqueDomains: Domain[] = [
		...new Set([
			...prevDomains,
			{
				uuid: uuid_v4(),
				name: urlHostnameWithoutScheme,
			},
		]),
	];

	return new Promise((resolve) => {
		chrome.storage.local.set(
			{
				[StorageKey.domains]: uniqueDomains,
			},
			() => {
				setDomains(uniqueDomains);
				resolve(null);
			}
		);
	});
};

type SettingToggleType = Exclude<
	Setting['enableAutoRemoveNewTab'] | Setting['removeOtherDomains'],
	undefined
>;
const useSettingToggleChange = (
	key: Extract<keyof Setting, 'enableAutoRemoveNewTab' | 'removeOtherDomains'>
): [string, SettingToggleType, React.Dispatch<React.SetStateAction<SettingToggleType>>] => {
	const toggleButtonLabel = (
		{
			enableAutoRemoveNewTab: 'Clear new tab?',
			removeOtherDomains: 'Clear Non-Registered Domains?',
		} satisfies { [K in typeof key]: string }
	)[key];

	const [isChecked, setIsChecked] = useState<SettingToggleType>(false);

	useEffect(() => {
		(async () => {
			const setting: Setting = await getStorageSettingValue(StorageKey.setting);
			setIsChecked(setting?.[key] || false);
		})();
	}, [key]);

	return [toggleButtonLabel, isChecked, setIsChecked];
};

const useStorageChange = <T extends (Domain | ClearHistory)[]>(
	key: string
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] => {
	const [value, setValue] = useState<T>();

	const getCallback = (data: { [key: string]: T }) => {
		setValue(data[key] || []);
	};
	const onChangeCallback = (changes: { [key: string]: chrome.storage.StorageChange }) => {
		if (changes[key]) {
			setValue(changes[key].newValue || []);
		}
	};
	useEffect(() => {
		chrome.storage.local.get(key, (data) => getCallback(data));
		chrome.storage.local.onChanged.addListener((changes) => onChangeCallback(changes));
	}, [key]);

	return [value, setValue];
};

const useClearHistoriesLimit = (): [
	Setting['clearHistoriesLimit'],
	React.Dispatch<React.SetStateAction<Setting['clearHistoriesLimit']>>,
] => {
	const [clearHistoriesLimit, setClearHistoriesLimit] =
		useState<Setting['clearHistoriesLimit']>();

	useEffect(() => {
		(async () => {
			const setting: Setting = await getStorageSettingValue(StorageKey.setting);
			setClearHistoriesLimit(setting?.clearHistoriesLimit);
		})();
	}, []);

	return [clearHistoriesLimit, setClearHistoriesLimit];
};

type test = keyof Setting;

const Options = () => {
	const cancelRef = useRef(null);
	const [dialogProperty, setDialogProperty] = useState<DialogProperty>(initDialogProperty);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [removeNewTabLabel, removeNewTabIsChecked, removeNewTabSetIsChecked] =
		useSettingToggleChange('enableAutoRemoveNewTab');
	const [removeOtherDomainsLabel, removeOtherDomainsIsChecked, removeOtherDomainsSetIsChecked] =
		useSettingToggleChange('removeOtherDomains');
	const [domains, setDomains] = useStorageChange<Domain[]>(StorageKey.domains);
	const [clearHistories, setClearHistories] = useStorageChange<ClearHistory[]>(
		StorageKey.clearHistories
	);
	const [clearHistoriesLimit, setClearHistoriesLimit] = useClearHistoriesLimit();

	const handleClickSettingToggle =
		(
			key: keyof Setting,
			setIsChecked: React.Dispatch<React.SetStateAction<SettingToggleType>>
		) =>
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const value = event.target.checked;
			setIsChecked(value);
			const storageValue: Setting = await new Promise((resolve) => {
				chrome.storage.local.get(StorageKey.setting, (result) => {
					resolve(result[StorageKey.setting] || {});
				});
			});
			// keyをもとにnewStorageValueを作成
			const newStorageValue = { ...storageValue, [key]: value };
			chrome.storage.local.set({ [StorageKey.setting]: newStorageValue });
		};

	const handleDomainSubmit = (urlHostname: string) => {
		domainRegister(urlHostname, setDomains);
	};

	const handleFileUpload = async (content: string) => {
		const lines = content.split('\n').filter((line) => line.trim() !== '');
		for (let line of lines) {
			try {
				const lineAddSchema = line.includes('://') ? line : `http://${line}`;
				const url = new URL(lineAddSchema);
				await domainRegister(url.hostname, setDomains);
			} catch {
				console.error('Invalid URL:', line);
			}
		}
	};

	const handleClearDomains = () => {
		setDialogProperty({
			title: 'Clear Target Domains',
			confirmMessage: 'Are you sure you want to clear all target domains?',
			actionMessage: 'Clear',
			handleAction: () => {
				chrome.storage.local.remove(StorageKey.domains);
				setDomains([]);
			},
		});
		onOpen();
	};

	const handleRemoveDomain = (uuid: string) => {
		chrome.storage.local.get(StorageKey.domains, (data) => {
			const prevDomains: Domain[] = data[StorageKey.domains] || [];
			const newDomains = prevDomains.filter(
				(domain) => typeof domain === 'string' || domain.uuid !== uuid
			);
			chrome.storage.local.set({ [StorageKey.domains]: newDomains }, () => {
				setDomains(newDomains);
			});
		});
	};

	const handleClearHistories = () => {
		setDialogProperty({
			title: 'Clear Cleaned History',
			confirmMessage: 'Are you sure you want to clear all cleaned history?',
			actionMessage: 'Clear',
			handleAction: () => {
				chrome.storage.local.remove(StorageKey.clearHistories);
				setClearHistories([]);
			},
		});
		onOpen();
	};

	const handleClearHistoriesLimitChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newValue = isNaN(Number(event.target.value)) ? undefined : Number(event.target.value);
		setClearHistoriesLimit(newValue);
		const storageValue: Setting = await getStorageSettingValue(StorageKey.setting);
		const newStorageValue = { ...storageValue, clearHistoriesLimit: newValue };
		await chrome.storage.local.set({ [StorageKey.setting]: newStorageValue });
	};

	return (
		<VStack spacing={5} align='start'>
			<ConfirmDialog
				isOpen={isOpen}
				onClose={onClose}
				dialogProperty={dialogProperty}
				cancelRef={cancelRef}
			/>
			<Stack spacing={5} w='100%'>
				<Flex w='100%' justify='space-between' alignItems='center'>
					<Heading as='h1' size='lg'>
						Tab Cleaner
					</Heading>
					<Stack direction='row' spacing={2} align='center'>
						<SettingToggle
							label={removeOtherDomainsLabel}
							isChecked={removeOtherDomainsIsChecked}
							onClickToggle={handleClickSettingToggle(
								'removeOtherDomains',
								removeOtherDomainsSetIsChecked
							)}
						/>
						<SettingToggle
							label={removeNewTabLabel}
							isChecked={removeNewTabIsChecked}
							onClickToggle={handleClickSettingToggle(
								'enableAutoRemoveNewTab',
								removeNewTabSetIsChecked
							)}
						/>
						<Button onClick={handleClearTabEvent}>Execute</Button>
					</Stack>
				</Flex>

				<Divider />

				<Flex w='100%' justify='space-between' alignItems='center'>
					<Heading as='h1' size='lg'>
						Target Domains
					</Heading>
					<Stack direction='row' spacing={2} align='center'>
						<FileUploadButton onFileUpload={handleFileUpload} />
						{/* TODO: minWidth */}
						<Button onClick={handleClearDomains} size='sm' minWidth='60px'>
							Clear
						</Button>
					</Stack>
				</Flex>
				<DomainInput onDomainSubmit={handleDomainSubmit} />
				<DomainList domains={domains} handleRemoveDomain={handleRemoveDomain} />

				<Divider />

				<Flex w='100%' justify='space-between' alignItems='center'>
					<Heading as='h1' size='lg'>
						Cleaned History
					</Heading>
					<Stack direction='row' spacing={2} align='center'>
						<SelectCleanHistoryLimit
							clearHistoriesLimit={clearHistoriesLimit}
							onSelectChange={handleClearHistoriesLimitChange}
						/>
						{/* TODO: minWidth */}
						<Button onClick={handleClearHistories} size='sm' minWidth='60px'>
							Clear
						</Button>
					</Stack>
				</Flex>
				<ClearHistoryList clearHistories={clearHistories} />
			</Stack>
		</VStack>
	);
};

const App = () => (
	<ChakraProvider>
		<Box maxWidth='992px' m='auto' my={3} p={5}>
			<Options />
		</Box>
	</ChakraProvider>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
	const errorMessage = 'Failed to find root element';
	alert(errorMessage);
	throw new Error(errorMessage);
}

// https://github.com/chakra-ui/chakra-ui/discussions/5051
if (!localStorage.getItem('chakra-ui-color-mode-default')) {
	localStorage.setItem('chakra-ui-color-mode', 'dark');
	localStorage.setItem('chakra-ui-color-mode-default', 'set');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
