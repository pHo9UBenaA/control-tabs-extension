import { Button, Flex, FormControl, FormErrorMessage, Input } from '@chakra-ui/react';
import React, { useState } from 'react';

type DomainInputProps = {
	onDomainSubmit: (value: string) => void;
};

export const DomainInput: React.FC<DomainInputProps> = ({ onDomainSubmit }) => {
	const [domainInputValue, setDomainInputValue] = useState('');
	const [error, setError] = useState('');

	const handleDomainSubmit = () => {
		//TODO .com
		try {
			const domainAddSchema = domainInputValue.includes('://')
				? domainInputValue
				: `http://${domainInputValue}`;
			const url = new URL(domainAddSchema);
			onDomainSubmit(url.hostname);
			setDomainInputValue('');
			setError('');
		} catch {
			setError('Please enter a valid URL');
			return;
		}
	};

	return (
		<FormControl isInvalid={!!error}>
			<Flex>
				<Input
					type='text'
					id='domain'
					value={domainInputValue}
					onChange={(e) => {
						setDomainInputValue(e.target.value);
						setError('');
					}}
					isInvalid={!!error}
					errorBorderColor='red.300'
					mr={2}
				/>
				<Button onClick={handleDomainSubmit}>Submit</Button>
			</Flex>
			<FormErrorMessage>{error}</FormErrorMessage>
		</FormControl>
	);
};
