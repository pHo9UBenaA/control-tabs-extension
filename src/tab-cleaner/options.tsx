import * as ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import { StorageKey } from './constants/storage';
import { ClearHistory, Domain } from './models/storage';
import {
	Box,
	Button,
	Input,
	List,
	ListItem,
	Link,
	VStack,
	Heading,
	ChakraProvider,
} from '@chakra-ui/react';

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Failed to find root element');
}
const root = ReactDOM.createRoot(rootElement);

const Options = () => {
	const [domains, setDomains] = useState<Domain[]>([]);
	const [clearHistories, setClearHistories] = useState<ClearHistory[]>([]);
	const [domainInputValue, setDomainInputValue] = useState('');

	useEffect(() => {
		chrome.storage.local.get(StorageKey.domains, (data) => {
			setDomains(data.domains || []);
		});

		chrome.storage.local.get(StorageKey.clearHistories, (data) => {
			setClearHistories(data.clearHistories || []);
		});

		chrome.storage.local.onChanged.addListener((changes) => {
			if (changes[StorageKey.domains]) {
				setDomains(changes[StorageKey.domains].newValue || []);
			}
			if (changes[StorageKey.clearHistories]) {
				setClearHistories(changes[StorageKey.clearHistories].newValue || []);
			}
		});
	}, []);

	const handleDomainSubmit = () => {
		const domainInputValueWithoutScheme = domainInputValue
			.replace(/(^\w+:|^)\/\//, '')
			.replace(/\/$/, '');

		if (!domainInputValueWithoutScheme) {
			console.error('domainInputValueWithoutScheme is undefined');
			return;
		}

		const newDomains = [...domains, domainInputValueWithoutScheme];
		const uniqueDomains = [...new Set(newDomains)];
		chrome.storage.local.set({ [StorageKey.domains]: uniqueDomains });
		setDomains(uniqueDomains);
		setDomainInputValue('');
	};

	const handleClear = () => {
		chrome.storage.local.clear();
		setDomains([]);
		setClearHistories([]);
	};

	return (
		<ChakraProvider>
			<VStack spacing={5}>
				<Heading as='h1' size='lg'>
					Options
				</Heading>
				<Box>
					<Input
						type='text'
						id='domain'
						value={domainInputValue}
						onChange={(e) => setDomainInputValue(e.target.value)}
					/>
					<Button onClick={handleDomainSubmit}>Submit</Button>
				</Box>
				<Box>
					<Button onClick={handleClear}>Clear</Button>
				</Box>
				<Heading as='h1' size='lg'>
					Registered Domains:
				</Heading>
				<List spacing={3}>
					{domains.length ? (
						domains.map((domain, index) => <ListItem key={index}>{domain}</ListItem>)
					) : (
						<ListItem>No domains registered</ListItem>
					)}
				</List>
				<Heading as='h1' size='lg'>
					Cleaned Pages:
				</Heading>
				<List spacing={3}>
					{clearHistories.length ? (
						clearHistories.map((clearHistory, index) => (
							<ListItem key={index}>
								<Link href={clearHistory.url} isExternal>
									{clearHistory.title}
								</Link>
							</ListItem>
						))
					) : (
						<ListItem>No pages cleaned</ListItem>
					)}
				</List>
			</VStack>
		</ChakraProvider>
	);
};

root.render(<Options />);
