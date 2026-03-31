import { appendToHistory, renderPath } from "./navigation.js";

window.addEventListener("pageshow", (e) => {
	if (e.persisted) {
		window.location.reload();
	}
});

appendToHistory();
renderPath();
