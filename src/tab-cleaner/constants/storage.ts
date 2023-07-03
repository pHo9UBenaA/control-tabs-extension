const storageKey = ['domains', 'clearHistories'] as const;

const StorageKey = {
	[storageKey[0]]: storageKey[0],
	[storageKey[1]]: storageKey[1],
} as const satisfies { [key in (typeof storageKey)[number]]: key };

export { StorageKey };
