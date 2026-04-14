// ─────────────────────────────────────────────
//  CUSTOMIZATION — edit these values freely
// ─────────────────────────────────────────────
const senderName   = "Thomas";
const revealText   = "Pay up. Du vet jeg har kontakter";
const audioPath    = "cartel-song.mp3";
const audioDelay   = 600;   // ms before audio plays on reveal
const unwrapMs     = 1600;  // duration of unwrap animation

// GIFs shown in sequence, 3 seconds apart
const gifs = [
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjJhbnUydWk4ZDhmN2t0M2dkeGtyaGFtaWt5M2U5cXdvc3ZvOXQ5eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iHmgjfjJJJFCw/giphy.gif",
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHhqNWF1OWZtdW96ZjkwcTAybDFlbXdvNXJyanI1MmVtbmo0cjVxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRMn9aY8M6ZlT32/giphy.gif",
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2x0c2l6Yjd2MW9zNHBqcXQycDRheGZ2cHN5c3lwdzFocTR1NTAyZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohs7ReNomQgdXOB7W/giphy.gif",
];
// ─────────────────────────────────────────────

// DOM refs
const stepEntry  = document.getElementById("step-entry");
const stepUnwrap = document.getElementById("step-unwrap");
const stepReveal = document.getElementById("step-reveal");
const openBtn    = document.getElementById("open-btn");
const replayBtn  = document.getElementById("replay-btn");
const progressBar   = document.getElementById("progress-bar");
const revealMessage = document.getElementById("reveal-message");
const revealGif     = document.getElementById("reveal-gif");
const entryTitle    = document.getElementById("entry-title");

// Set dynamic sender name
entryTitle.textContent = `${senderName} sendte deg en gave`;

// Audio setup
const audio = new Audio(audioPath);
audio.preload = "auto";

// ── Helpers ──────────────────────────────────

function showScreen(hideEl, showEl) {
  hideEl.classList.remove("active");
  hideEl.style.display = "none";

  showEl.style.display = "flex";
  showEl.style.opacity = "0";
  requestAnimationFrame(() => {
    showEl.classList.add("active", "fade-in");
    showEl.style.opacity = "1";
  });
}

function animateProgress(durationMs, onDone) {
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const pct = Math.min((elapsed / durationMs) * 100, 100);
    progressBar.style.width = pct + "%";
    if (pct < 100) {
      requestAnimationFrame(step);
    } else {
      onDone();
    }
  }
  requestAnimationFrame(step);
}

let gifIndex = 0;
let gifTimer = null;

function startGifSequence() {
  gifIndex = 0;
  showGif(gifIndex);
}

function showGif(idx) {
  // pop-in animation reset
  revealGif.style.animation = "none";
  revealGif.offsetHeight; // reflow
  revealGif.style.animation = "";

  revealGif.src = gifs[idx];

  if (idx < gifs.length - 1) {
    gifTimer = setTimeout(() => {
      gifIndex++;
      showGif(gifIndex);
    }, 3000);
  }
}

function tryPlayAudio() {
  audio.currentTime = 0;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay blocked — attach one-time listener to body
      const unlock = () => {
        audio.play();
        document.body.removeEventListener("click", unlock);
        document.body.removeEventListener("touchstart", unlock);
      };
      document.body.addEventListener("click", unlock);
      document.body.addEventListener("touchstart", unlock);
    });
  }
}

// Vibrate on mobile (bonus)
function tryVibrate() {
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 400]);
  }
}

// ── Flow ─────────────────────────────────────

function startFlow() {
  // Step 1 → Step 2
  showScreen(stepEntry, stepUnwrap);
  animateProgress(unwrapMs, goToReveal);
}

function goToReveal() {
  // Step 2 → Step 3
  showScreen(stepUnwrap, stepReveal);

  revealMessage.textContent = revealText;
  startGifSequence();

  setTimeout(tryPlayAudio, audioDelay);
  tryVibrate();
}

function replay() {
  // Clear any running gif timer
  if (gifTimer) { clearTimeout(gifTimer); gifTimer = null; }

  // Reset audio
  audio.pause();
  audio.currentTime = 0;

  // Reset progress bar
  progressBar.style.width = "0%";

  // Go back to step 1
  showScreen(stepReveal, stepEntry);
}

// ── Event listeners ───────────────────────────
openBtn.addEventListener("click", startFlow);
replayBtn.addEventListener("click", replay);
