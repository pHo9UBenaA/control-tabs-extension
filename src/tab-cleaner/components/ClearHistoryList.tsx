import { Link, List, ListItem } from '@chakra-ui/react';
import React from 'react';
import { ClearHistory } from '../models/storage';

type ClearHistoryProps = {
	clearHistories?: ClearHistory[];
};

export const ClearHistoryList: React.FC<ClearHistoryProps> = ({ clearHistories }) => (
	<List spacing={3}>
		{clearHistories && clearHistories.length ? (
			clearHistories.map((clearHistory) => (
				<ListItem key={clearHistory.url}>
					<Link href={clearHistory.url} isExternal>
						{clearHistory.title}
					</Link>
				</ListItem>
			))
		) : (
			<ListItem color='gray.400'>No pages cleaned</ListItem>
		)}
	</List>
);
