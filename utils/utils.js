export function capitalize(str) {
	return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

export function getBodyErrors(errorsArr) {
	const names = new Set();
	errorsArr.forEach((err) => names.add(err.path));
	const nameObj = {};
	for (let name of names.entries()) {
		nameObj[`${name[0]}Errors`] = errorsArr.filter(
			(err) => err.path === name[0],
		);
	}

	return nameObj;
}

export function getExpiringDate(duration) {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + duration);
	return expiresAt;
}

export function createSharedFolderData(folder, duration, shareId) {
	const expiringDate = getExpiringDate(duration);
	return {
		id: shareId,
		expiresAt: expiringDate,
		sharedFolderId: folder.id,
	};
}

export function getFullSharedFoldersData(folders, folderId, duration) {
	const [rootFolder] = folders.filter((folder) => folder.id === folderId);

	const shareIds = new Map();

	for (let folder of folders) {
		shareIds.set(folder.id, crypto.randomUUID());
	}

	const rootShareData = createSharedFolderData(
		rootFolder,
		duration,
		shareIds.get(rootFolder.id),
	);

	const fullShareData = [rootShareData];
	const rootShareId = rootShareData.id;

	let i = 1;
	let checks = 0;
	const checkedValues = [];
	const registeredParents = new Set();
	registeredParents.add(rootFolder.id);
	while (checks < folders.length) {
		for (let folder of folders) {
			if (checkedValues.includes(folder.id)) {
				continue;
			}
			//if folder parent is registered

			if (registeredParents.has(folder.parentFolderId)) {
				const parentShareId = shareIds.get(folder.parentFolderId);
				const shareId = shareIds.get(folder.id);
				const sharedFolderData = createSharedFolderData(
					folder,
					duration,
					shareId,
				);
				sharedFolderData["parentShareId"] = parentShareId;
				fullShareData.push(sharedFolderData);
				checkedValues.push(folder.id);
				registeredParents.add(folder.id);
				i++;
			}
		}
		checks++;
	}

	return [rootShareId, fullShareData];
}
