const mergeSecretWindow = () => {
	chrome.windows.getAll({ populate: true }, (windows) => {
		const secretWindowIds = windows
			.filter((window) => window.incognito && window.type === 'normal' && window.id)
			.map((window) => window.id);

		console.log(secretWindowIds);

		// シークレットウィンドウが複数ある場合
		if (secretWindowIds.length < 1) {
			return;
		}

		secretWindowIds.forEach((windowId) => {
			chrome.tabs.query({ windowId }, (tabs) => {
				if (tabs[0].id) {
					chrome.tabs.move(tabs[0].id, { windowId: secretWindowIds[0], index: -1 });
				}
			});
		});
	});
};

document.addEventListener('DOMContentLoaded', () => {
	const mergeSecretWindowButton = document.getElementById('mergeSecretWindowButton');
	mergeSecretWindowButton?.addEventListener('click', mergeSecretWindow);
});
