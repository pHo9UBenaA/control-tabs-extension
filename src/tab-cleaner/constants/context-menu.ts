const ContextMenuIdsKey = ['clearTab'] as const;

const ContextMenuIds = {
	// TODO
	[ContextMenuIdsKey[0]]: ContextMenuIdsKey[0],
} as const satisfies { [key in (typeof ContextMenuIdsKey)[number]]: key };

export { ContextMenuIds };
