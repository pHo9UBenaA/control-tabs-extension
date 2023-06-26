const contextMenusIdsKey = ['mergeWindow', 'mergeSecretWindow'] as const;

// TODO
const contextMenusIds = {
	[contextMenusIdsKey[0]]: contextMenusIdsKey[0],
	[contextMenusIdsKey[1]]: contextMenusIdsKey[1],
} as const satisfies { [key in (typeof contextMenusIdsKey)[number]]: key };

export { contextMenusIds };
