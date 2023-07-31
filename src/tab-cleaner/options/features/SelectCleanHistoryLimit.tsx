import { Select, Tooltip } from '@chakra-ui/react';
import React from 'react';

type SelectCleanHistoryLimitProps = {
	clearHistoriesLimit: number | undefined;
	onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SelectCleanHistoryLimit: React.FC<SelectCleanHistoryLimitProps> = ({
	clearHistoriesLimit,
	onSelectChange,
}) => {
	return (
		<Tooltip label='Applied at the time of executing clear tabs' placement='top'>
			<Select
				placeholder='limit'
				value={clearHistoriesLimit}
				onChange={(e) => onSelectChange(e)}
				size='sm'
			>
				<option value='10'>10</option>
				<option value='30'>30</option>
				<option value='100'>100</option>
			</Select>
		</Tooltip>
	);
};
