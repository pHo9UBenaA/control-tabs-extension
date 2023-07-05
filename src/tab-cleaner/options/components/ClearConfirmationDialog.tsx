import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
} from '@chakra-ui/react';
import React from 'react';
// TODO alias
import { DialogProperty } from '../../options';

type ClearConfirmationDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	dialogProperty: DialogProperty;
	cancelRef: React.RefObject<HTMLButtonElement>;
};

export const ClearConfirmationDialog: React.FC<ClearConfirmationDialogProps> = ({
	isOpen,
	onClose,
	dialogProperty,
	cancelRef,
}) => {
	const handleClearAndClose = () => {
		dialogProperty.handleClear();
		onClose();
	};

	return (
		<AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize='lg' fontWeight='bold'>
						{dialogProperty.title}
					</AlertDialogHeader>

					<AlertDialogBody>{dialogProperty.confirmMessage}</AlertDialogBody>

					<AlertDialogFooter>
						<Button ref={cancelRef} onClick={onClose}>
							Cancel
						</Button>
						<Button colorScheme='red' onClick={handleClearAndClose} ml={3}>
							Clear
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
};
