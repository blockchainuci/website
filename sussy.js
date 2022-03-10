document.getElementById("gay").addEventListener("click", () => {
    const origAudio = document.getElementById("sfx");
    const newAudio = origAudio.cloneNode()
    newAudio.play();
});