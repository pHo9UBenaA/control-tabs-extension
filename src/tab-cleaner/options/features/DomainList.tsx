import { DeleteIcon } from '@chakra-ui/icons';
import { Box, IconButton, VStack, useDisclosure } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { Domain } from '../../models/storage';
import { ConfirmDialog, DialogProperty } from '../components/ConfirmDialog';

type DomainItemProps = {
	domain: Domain;
	handleDelete: (uuid: string) => void;
};

const DomainItem: React.FC<DomainItemProps> = ({ domain, handleDelete }) => {
	if (typeof domain === 'string') {
		return <Box w='100%'>{domain}</Box>;
	}

	return (
		<Box key={domain.uuid} w='100%'>
			<Box display='flex' alignItems='center' justifyContent='space-between' width='100%'>
				<span>{domain.name}</span>
				<IconButton
					size='sm'
					icon={<DeleteIcon />}
					aria-label='Delete domain'
					onClick={() => handleDelete(domain.uuid)}
				/>
			</Box>
		</Box>
	);
};

type DomainListProps = {
	domains?: Domain[];
	handleRemoveDomain: (uuid: string) => void;
};

export const DomainList: React.FC<DomainListProps> = ({ domains, handleRemoveDomain }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = useRef<HTMLButtonElement>(null);
	const [currentDomain, setCurrentDomain] = React.useState<string | null>(null);

	const handleClick = (uuid: string) => {
		setCurrentDomain(uuid);
		onOpen();
	};

	const handleDelete = () => {
		if (currentDomain) {
			handleRemoveDomain(currentDomain);
		}
		onClose();
	};

	const dialogProperty: DialogProperty = {
		title: 'Delete Domain',
		confirmMessage: 'Are you sure you want to delete this domain?',
		actionMessage: 'Delete',
		handleAction: handleDelete,
	};

	return (
		<>
			<VStack spacing={3} maxHeight='415px' overflowY='auto' width='100%'>
				{domains && domains.length ? (
					domains.map((domain, i) => (
						<DomainItem key={i} domain={domain} handleDelete={handleClick} />
					))
				) : (
					<Box color='gray.400' w='100%'>
						No domains target
					</Box>
				)}
			</VStack>
			<ConfirmDialog
				isOpen={isOpen}
				onClose={onClose}
				dialogProperty={dialogProperty}
				cancelRef={cancelRef}
			/>
		</>
	);
};
