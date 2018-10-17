chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
	console.log(tabs[0].url);
	var onSite = tabs[0].url.includes("open.spotify.com") ? true : false;
	var p = document.querySelector("body p");
	p.innerHTML = "You are " + (!onSite ? "not " : "") + "on Spotify Web Player !";
	if (!onSite) return;

    p.classList.add("onSite");
	var s = document.createElement("script");
	s.src = chrome.extension.getURL("script.js");
	s.onload = function() {
		this.remove();
	};
	(document.head || document.documentElement).appendChild(s);
});
