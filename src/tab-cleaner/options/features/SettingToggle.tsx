import { Switch, FormControl, FormLabel, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { Setting } from '../../models/storage';
import { QuestionOutlineIcon } from '@chakra-ui/icons';

type SettingToggleProps = {
	labelId: Extract<keyof Setting, 'enableAutoRemoveNewTab' | 'removeOtherDomains'>;
	isChecked: boolean;
	onClickToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const SettingToggle: React.FC<SettingToggleProps> = ({
	labelId,
	isChecked,
	onClickToggle,
}) => {
	const toggleButtonLabel = (
		{
			enableAutoRemoveNewTab: 'Clear new tab?',
			removeOtherDomains: (
				<>
					Clear Non-Target Domains?
					<Tooltip
						label='This is a pilot feature. When enabled, it clear tabs that do not include "Target Domains" in the URL. The internal logic is a partial matches.'
						placement='bottom'
						fontSize='sm'
					>
						<QuestionOutlineIcon ml='1' color='skyblue' />
					</Tooltip>
				</>
			),
		} satisfies { [K in typeof labelId]: React.ReactNode }
	)[labelId];

	return (
		<FormControl display='flex' alignItems='center' width='auto'>
			<FormLabel htmlFor={`label_${labelId}`} display='flex' alignItems='center' mb='0'>
				{toggleButtonLabel}
			</FormLabel>
			<Switch id={`switch_${labelId}`} isChecked={isChecked} onChange={onClickToggle} />
		</FormControl>
	);
};

export default SettingToggle;
