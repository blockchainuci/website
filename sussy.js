window.addEventListener("DOMContentLoaded", event => {
    document.getElementById("gay").addEventListener("click", () => {
        const origAudio = document.getElementById("sfx");
        const newAudio = origAudio.cloneNode()
        newAudio.play();
    });

    document.getElementById("stinky").addEventListener("click", () => {
        const origAudio = document.getElementById("sfx2");
        const newAudio = origAudio.cloneNode()
        newAudio.play();
    });
});