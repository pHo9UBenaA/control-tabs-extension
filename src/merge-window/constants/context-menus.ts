const contextMenusIdsKey = ['mergeWindow', 'mergeSecretWindow'] as const;

const contextMenusIds = {
	// TODO
	[contextMenusIdsKey[0]]: contextMenusIdsKey[0],
	[contextMenusIdsKey[1]]: contextMenusIdsKey[1],
} as const satisfies { [key in (typeof contextMenusIdsKey)[number]]: key };

export { contextMenusIds };
