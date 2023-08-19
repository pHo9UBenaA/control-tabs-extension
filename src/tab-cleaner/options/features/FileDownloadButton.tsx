import { Button } from '@chakra-ui/react';

type FileDownloadButtonProps = {
	isDisabled: boolean;
	onFileDownload: () => void;
};

export function FileDownloadButton({ isDisabled, onFileDownload }: FileDownloadButtonProps) {
	return (
		<Button isDisabled={isDisabled} onClick={onFileDownload} size='sm'>
			Download .txt file
		</Button>
	);
}
