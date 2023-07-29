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
import { ClearHistory, Domain, Setting } from './models/storage';
import { handleClearTabEvent } from './handles/clear-tab';
import { ConfirmDialog, DialogProperty } from './options/components/ConfirmDialog';
import { FileUploadButton } from './options/features/FileUploadButton';
import { DomainInput } from './options/features/DomainInput';
import { DomainList } from './options/features/DomainList';
import { ClearHistoryList } from './options/features/ClearHistoryList';
import { RemoveNewTabToggle } from './options/features/RemoveNewTabsToggle';

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

const useRemoveNewTabToggleChange = (): [
	Setting['removeNewTab'],
	React.Dispatch<React.SetStateAction<Setting['removeNewTab']>>,
] => {
	const [isChecked, setIsChecked] = useState<Setting['removeNewTab']>(false);

	useEffect(() => {
		(async () => {
			const setting: Setting = await getStorageSettingValue(StorageKey.setting);
			setIsChecked(setting?.removeNewTab || false);
		})();
	}, []);

	return [isChecked, setIsChecked];
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


const Options = () => {
	const cancelRef = useRef(null);
	const [dialogProperty, setDialogProperty] = useState<DialogProperty>(initDialogProperty);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isChecked, setIsChecked] = useRemoveNewTabToggleChange();
	const [domains, setDomains] = useStorageChange<Domain[]>(StorageKey.domains);
	const [clearHistories, setClearHistories] = useStorageChange<ClearHistory[]>(
		StorageKey.clearHistories
	);

	const handleClickRemoveNewTabToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.checked;
		setIsChecked(value);
		const storageValue: Setting = await new Promise((resolve) => {
			chrome.storage.local.get(StorageKey.setting, (result) => {
				resolve(result[StorageKey.setting] || {});
			});
		});
		const newStorageValue = { ...storageValue, removeNewTab: value };
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
			title: 'Clear Registered Domains',
			confirmMessage: 'Are you sure you want to clear all registered domains?',
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
			title: 'Clear Cleaned Pages',
			confirmMessage: 'Are you sure you want to clear all cleaned pages?',
			actionMessage: 'Clear',
			handleAction: () => {
				chrome.storage.local.remove(StorageKey.clearHistories);
				setClearHistories([]);
			},
		});
		onOpen();
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
						<RemoveNewTabToggle
							isChecked={isChecked}
							onClickToggle={handleClickRemoveNewTabToggle}
						/>
						<Button onClick={handleClearTabEvent}>Execute</Button>
					</Stack>
				</Flex>

				<Divider />

				<Flex w='100%' justify='space-between' alignItems='center'>
					<Heading as='h1' size='lg'>
						Registered Domains
					</Heading>
					<Stack direction='row' spacing={2} align='center'>
						<FileUploadButton onFileUpload={handleFileUpload} />
						<Button onClick={handleClearDomains} size='sm'>
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
					<Stack direction='row' spacing={2} align={'center'}>
						<Button onClick={handleClearHistories} size='sm'>
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
		<Box maxWidth='800px' m='auto' mt={3} p={5}>
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
