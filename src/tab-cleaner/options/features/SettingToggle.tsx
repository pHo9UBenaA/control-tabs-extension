import { Switch, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';

type SettingToggleProps = {
	label: string;
	isChecked: boolean;
	onClickToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const SettingToggle: React.FC<SettingToggleProps> = ({
	label,
	isChecked,
	onClickToggle,
}) => {
	return (
		<FormControl display='flex' alignItems='center' width='auto'>
			<FormLabel htmlFor={label} mb='0'>
				{label}
			</FormLabel>
			<Switch id={label} isChecked={isChecked} onChange={onClickToggle} />
		</FormControl>
	);
};

export default SettingToggle;
