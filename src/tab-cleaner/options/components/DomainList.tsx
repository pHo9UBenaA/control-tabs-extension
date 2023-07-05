import { List, ListItem } from '@chakra-ui/react';
import React from 'react';

type DomainListProps = {
	domains?: string[];
};

export const DomainList: React.FC<DomainListProps> = ({ domains }) => (
	<List spacing={3}>
		{domains && domains.length ? (
			domains.map((domain) => <ListItem key={domain}>{domain}</ListItem>)
		) : (
			<ListItem color='gray.400'>No domains registered</ListItem>
		)}
	</List>
);
