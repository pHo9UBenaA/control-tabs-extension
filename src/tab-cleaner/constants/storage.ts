const storageKey = ['domains', 'clearHistories', 'removeNewTab'] as const;

export const StorageKey = {
	[storageKey[0]]: storageKey[0],
	[storageKey[1]]: storageKey[1],
	[storageKey[2]]: storageKey[2],
} as const satisfies { [key in (typeof storageKey)[number]]: key };

export type StorageKey = keyof typeof StorageKey;
