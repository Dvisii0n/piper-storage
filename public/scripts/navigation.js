export function renderPath() {
	const currentHistory = JSON.parse(localStorage.getItem("history"));
	const container = document.querySelector(".pathNavigation");

	for (let visitedFolder of currentHistory) {
		const pathLink = document.createElement("a");
		pathLink.className = "pathLink";
		pathLink.href = `/home/folder/${visitedFolder.id}`;
		pathLink.textContent = visitedFolder.name;
		const slash = document.createElement("span");
		slash.textContent = "/";

		container.appendChild(pathLink);
		container.appendChild(slash);
	}
}

export function appendToHistory() {
	const currentFolder = document.querySelector(".openFolder");

	const folderObj = {
		name: currentFolder.getAttribute("folderName"),
		id: currentFolder.getAttribute("folderId"),
	};

	const currentHistory = localStorage.getItem("history");
	if (!currentHistory) {
		const history = [folderObj];
		localStorage.setItem("history", JSON.stringify(history));
		return;
	}

	const arr = JSON.parse(currentHistory);
	const folderMatches = arr.filter((folder) => folder.id === folderObj.id);
	const folderInHistory = folderMatches[0];

	//if folder was already visited
	if (folderMatches.length > 0) {
		const indexOfFolder = arr.indexOf(folderInHistory);

		//if that folder is the last folder visited, do nothing, meaning the user did not visit other folders after this one, meaning its probably a page refresh
		if (arr[arr.length - 1].id === folderInHistory.id) {
			return;
		}

		//else slice the array to get the history up to this folder visit, discarding later visits, meaning the user is jumping from another later visited folder
		const slicedHistory = arr.slice(0, indexOfFolder + 1);
		localStorage.setItem("history", JSON.stringify(slicedHistory));

		return;
	}

	arr.push(folderObj);
	const updatedHistory = arr;
	localStorage.setItem("history", JSON.stringify(updatedHistory));
}
