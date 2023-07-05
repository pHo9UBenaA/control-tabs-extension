const storageKey = ['domains', 'clearHistories', 'removeNewTab'] as const;

const StorageKey = {
	[storageKey[0]]: storageKey[0],
	[storageKey[1]]: storageKey[1],
	[storageKey[2]]: storageKey[2],
} as const satisfies { [key in (typeof storageKey)[number]]: key };

export { StorageKey };

export type StorageKey = keyof typeof StorageKey;
