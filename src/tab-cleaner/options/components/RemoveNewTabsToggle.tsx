import { Switch, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';

type RemoveNewTabToggleProps = {
	isChecked: boolean;
	onClickToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const RemoveNewTabToggle: React.FC<RemoveNewTabToggleProps> = ({
	isChecked,
	onClickToggle,
}) => {
	return (
		<FormControl display='flex' alignItems='center'>
			<FormLabel htmlFor='remote-new-tab-switch' mb='0'>
				Clear new tab?
			</FormLabel>
			<Switch id='remote-new-tab-switch' isChecked={isChecked} onChange={onClickToggle} />
		</FormControl>
	);
};

export default RemoveNewTabToggle;
