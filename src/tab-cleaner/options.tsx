import {
	Box,
	Button,
	ChakraProvider,
	Divider,
	Flex,
	Heading,
	Stack,
	VStack,
	extendTheme,
	useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { StorageKey } from './constants/storage';
import { ClearHistory, Domain } from './models/storage';
import { ClearConfirmationDialog } from './components/ClearConfirmationDialog';
import { FileUploadButton } from './components/FileUploadButton';
import { DomainInput } from './components/DomainInput';
import { DomainList } from './components/DomainList';
import { ClearHistoryList } from './components/ClearHistoryList';

export type DialogProperty = {
	title?: string;
	confirmMessage?: string;
	handleClear?: () => void;
};

const useStorageChange = <T extends (Domain | ClearHistory)[]>(
	key: string
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] => {
	const [value, setValue] = useState<T>();
	useEffect(() => {
		chrome.storage.local.get(key, (data) => {
			setValue(data[key] || []);
		});

		chrome.storage.local.onChanged.addListener((changes) => {
			if (changes[key]) {
				setValue(changes[key].newValue || []);
			}
		});
	}, [key]);

	return [value, setValue];
};

const Options = () => {
	const [domains, setDomains] = useStorageChange<Domain[]>(StorageKey.domains);
	const [clearHistories, setClearHistories] = useStorageChange<ClearHistory[]>(
		StorageKey.clearHistories
	);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [dialogProperty, setDialogProperty] = useState<DialogProperty>({});
	const cancelRef = useRef(null);

	const domainRegister = async (urlHostname: string) => {
		return new Promise((resolve) => {
			const urlHostnameWithoutScheme = urlHostname
				.replace(/(^\w+:|^)\/\//, '')
				.replace(/\/$/, '');

			if (!urlHostnameWithoutScheme) {
				console.error('urlHostnameWithoutScheme is undefined');
				return;
			}

			chrome.storage.local.get(StorageKey.domains, (data) => {
				const prev: Domain[] = data[StorageKey.domains] || [];
				const uniqueDomains: Domain[] = [...new Set([...prev, urlHostnameWithoutScheme])];
				setDomains(uniqueDomains);
				chrome.storage.local.set(
					{
						[StorageKey.domains]: uniqueDomains,
					},
					() => resolve(null)
				);
			});
		});
	};

	const handleDomainSubmit = (urlHostname: string) => {
		domainRegister(urlHostname);
	};

	const handleClear = (property: DialogProperty) => {
		setDialogProperty(property);
		onOpen();
	};

	const handleClearItems = (key: string, setValue: (value: any) => void) => {
		chrome.storage.local.remove(key);
		setValue([]);
	};

	const handleFileUpload = async (content: string) => {
		const lines = content.split('\n').filter((line) => line.trim() !== '');
		for (let line of lines) {
			try {
				const url = new URL(line);
				await domainRegister(url.hostname);
			} catch {
				console.error('Invalid URL:', line);
			}
		}
	};

	return (
		<VStack spacing={5} align='start'>
			<ClearConfirmationDialog
				isOpen={isOpen}
				onClose={onClose}
				dialogProperty={dialogProperty}
				cancelRef={cancelRef}
			/>
			<Stack spacing={5} w='100%'>
				<Heading as='h1' size='lg'>
					Tab Cleaner
				</Heading>
				<Divider />
				<Flex w='100%' justify='space-between' alignItems='center'>
					<Heading as='h1' size='lg'>
						Registered Domains
					</Heading>
					<Box>
						<Button
							onClick={() =>
								handleClear({
									title: 'Clear Registered Domains',
									confirmMessage:
										'Are you sure you want to clear all registered domains?',
									handleClear: () =>
										handleClearItems(StorageKey.domains, setDomains),
								})
							}
							size='sm'
							mr={2}
						>
							Clear
						</Button>
						<FileUploadButton onFileUpload={handleFileUpload} />
					</Box>
				</Flex>
				<DomainInput onDomainSubmit={handleDomainSubmit} />
				<DomainList domains={domains} />
				<Divider />
				<Flex w='100%' justify='space-between' alignItems='center'>
					<Heading as='h1' size='lg'>
						Cleaned Pages
					</Heading>
					<Button
						onClick={() =>
							handleClear({
								title: 'Clear Cleaned Pages',
								confirmMessage: 'Are you sure you want to clear all cleaned pages?',
								handleClear: () =>
									handleClearItems(StorageKey.clearHistories, setClearHistories),
							})
						}
						size='sm'
					>
						Clear
					</Button>
				</Flex>
				<ClearHistoryList clearHistories={clearHistories} />
			</Stack>
		</VStack>
	);
};

const App = () => {
	const theme = {
		config: {
			initialColorMode: 'dark',
			useSystemColorMode: false,
		},
	};
	return (
		<ChakraProvider theme={extendTheme(theme)}>
			<Box maxWidth='800px' m='auto' p={5}>
				<Options />
			</Box>
		</ChakraProvider>
	);
};

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
