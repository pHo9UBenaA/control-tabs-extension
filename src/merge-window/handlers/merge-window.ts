const mergeWindow = (windowIds: number[]) => {
	const moveTabs = (tabs: chrome.tabs.Tab[], firstWindowId: number) => {
		const tabIds = tabs
			.map((tab) => tab.id)
			.flatMap((tabId) => (tabId !== undefined ? [tabId] : []));

		tabIds.forEach((id) =>
			chrome.tabs.move(id, {
				windowId: firstWindowId,
				index: -1,
			})
		);

		const fatalCount = tabs.length - tabIds.length;
		if (fatalCount) {
			console.error(`Merge skipped because ${fatalCount} tab IDs could not be found`);
		}
	};

	if (windowIds.length <= 1) {
		console.info('There was only one window.');
		return;
	}

	const firstWindowId = windowIds.shift();
	if (!firstWindowId) {
		console.error('The first window could not be found.');
		return;
	}

	windowIds.forEach((windowId) => {
		chrome.tabs.query({ windowId }, (tabs) => {
			moveTabs(tabs, firstWindowId);
		});
	});
};

const mergeWindowEventHandler = () => {
	chrome.windows.getAll({ populate: true }, (windows) => {
		const windowIds: number[] = windows
			.filter((window) => !window.incognito && window.type === 'normal')
			.flatMap((window) => (window.id !== undefined ? [window.id] : []));
		mergeWindow(windowIds);
	});
};

const mergeSecretWindowEventHandler = () => {
	chrome.windows.getAll({ populate: true }, (windows) => {
		const secretWindowIds: number[] = windows
			.filter((window) => window.incognito && window.type === 'normal')
			.flatMap((window) => (window.id !== undefined ? [window.id] : []));
		mergeWindow(secretWindowIds);
	});
};

export { mergeWindowEventHandler, mergeSecretWindowEventHandler };
