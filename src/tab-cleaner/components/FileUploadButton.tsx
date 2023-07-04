import { Box, Button, Input } from '@chakra-ui/react';
import React, { useRef } from 'react';

type FileUploadButtonProps = {
	onFileUpload: (content: string) => void;
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

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result;
			if (typeof content === 'string') {
				onFileUpload(content);
			}
		};
		reader.readAsText(file);

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
