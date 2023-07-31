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

export type DialogProperty = {
	title: string;
	confirmMessage: string;
	actionMessage: string;
	handleAction: () => void;
};

type ConfirmDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	dialogProperty: DialogProperty;
	cancelRef: React.RefObject<HTMLButtonElement>;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	onClose,
	dialogProperty,
	cancelRef,
}) => {
	const handleActionAndClose = () => {
		dialogProperty.handleAction();
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
						<Button colorScheme='red' onClick={handleActionAndClose} ml={3}>
							{dialogProperty.actionMessage}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
};
