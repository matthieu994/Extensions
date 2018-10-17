window.addEventListener("keydown", async e => {
	if (e.key === "ArrowLeft") fade(document.querySelector("button[title='Précédent']"));
	if (e.key === "ArrowRight") fade(document.querySelector("button[title='Suivant']"));
});

async function fade(el) {
	el.click();
	el.style.transform = "scale(1.5)";
	el.style.color = "#1db954";
	await sleep(400);
	el.style.transform = "";
	el.style.color = "rgba(255, 255, 255, 0.6)";
}

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
