import { Box, Button, Input } from '@chakra-ui/react';
import React, { useRef } from 'react';

type FileUploadButtonProps = {
	onFileUpload: (content: string) => void;
};

const readFileAsText = (
	file: File,
	onSuccess: (content: string) => void,
	onError: (error: Error) => void
): void => {
	const reader = new FileReader();
	reader.onload = (e) => {
		const content = e.target?.result;
		if (typeof content !== 'string') {
			onError(new Error('File content could not be read as string.'));
			return;
		}
		onSuccess(content);
	};
	reader.onerror = (e) => {
		onError(new Error(reader.error?.message || 'Failed to read file.'));
	};
	reader.readAsText(file);
};

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileUpload }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			const errorMessage = 'No file selected';
			alert(errorMessage);
			console.error(errorMessage);
			return;
		}

		const fileExtension = file.name.split('.').pop();
		if (fileExtension !== 'txt') {
			const errorMessage = 'File is not a .txt file';
			alert(errorMessage);
			console.error(errorMessage);
			return;
		}

		readFileAsText(file, onFileUpload, (error) => {
			alert('Failed to load file: ' + error.message);
			console.error('Failed to load:', error);
		});

		// Reset the value of the input element to ensure onChange fires again if the same file is selected
		event.target.value = '';
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			<Box display='none'>
				<Input type='file' accept='.txt' onChange={handleFileUpload} ref={fileInputRef} />
			</Box>
			<Button onClick={handleButtonClick} size='sm'>
				Upload .txt file
			</Button>
		</>
	);
};
