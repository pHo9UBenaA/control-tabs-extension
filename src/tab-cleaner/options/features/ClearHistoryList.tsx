import { Link, List, ListItem, Text } from '@chakra-ui/react';
import React from 'react';
// TODO alias
import { ClearHistory } from '../../models/storage';

type ClearHistoryProps = {
	clearHistories?: ClearHistory[];
};

export const ClearHistoryList: React.FC<ClearHistoryProps> = ({ clearHistories }) => (
	<List spacing={3}>
		{clearHistories && clearHistories.length ? (
			clearHistories.map((clearHistory, i) => (
				<ListItem key={clearHistory.id}>
					<Link href={clearHistory.url} textDecoration='underline' isExternal>
						<Text isTruncated>{clearHistory.title}</Text>
					</Link>
				</ListItem>
			))
		) : (
			<ListItem color='gray.400'>No pages cleaned</ListItem>
		)}
	</List>
);
