import { Button } from '@chakra-ui/react';
import React from 'react';

type FileDownloadButtonProps = {
    isDisabled: boolean;
	onFileDownload: () => void;
};

export const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({ isDisabled, onFileDownload }) => {
	return <Button isDisabled={isDisabled} onClick={onFileDownload} size='sm'>Download .txt file</Button>;
};
