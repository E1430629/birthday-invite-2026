const introLines = [
  "Incoming invitation packet...",
  "Decrypting event data...",
  "System Event Detected: Lewis_v22.02",
  "Loading celebration protocol...",
];

const introEl = document.getElementById("intro");
const introLinesEl = document.getElementById("intro-lines");
const appEl = document.getElementById("app");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const formEl = document.getElementById("rsvpForm");
const resultEl = document.getElementById("result");
const submitBtn = formEl.querySelector('button[type="submit"]');

const nameInput = document.getElementById("name");
const countInput = document.getElementById("count");
const messageInput = document.getElementById("message");

const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");

let confetti = [];
let confettiAnimId = null;

function typeIntro() {
  let index = 0;
  const stepMs = 520;

  const timer = setInterval(() => {
    if (index >= introLines.length) {
      clearInterval(timer);
      revealMainContent();
      return;
    }

    const p = document.createElement("p");
    p.className = "intro-line";
    p.textContent = introLines[index];
    introLinesEl.appendChild(p);

    window.setTimeout(() => {
      p.classList.add("complete");
    }, 380);

    index += 1;
  }, stepMs);
}

function revealMainContent() {
  setTimeout(() => {
    introEl.classList.add("hidden");
    appEl.classList.remove("hidden");
    appEl.classList.add("reveal");
    appEl.setAttribute("aria-hidden", "false");
  }, 420);
}

function setResult(message, kind) {
  resultEl.className = "result";
  if (kind) resultEl.classList.add(kind);
  resultEl.textContent = message;
}

function resetRSVPState() {
  formEl.classList.add("hidden");
  formEl.reset();
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit RSVP";
  }
}

function handleYesPath() {
  formEl.classList.remove("hidden");
  setResult("Excellent. Please complete your RSVP payload.", "");
  nameInput.focus();
}

function handleNoPath() {
  resetRSVPState();
  const messages = [
    "Friendship level decreased.",
    "This action has been logged.",
    "Warning: Lewis memory module updated.",
    "Fallback mission activated: send memes as compensation.",
  ];

  setResult(messages.join(" "), "error");
}

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

function launchConfetti() {
  resizeCanvas();

  const count = 130;
  confetti = Array.from({ length: count }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height * 0.35,
    size: 4 + Math.random() * 6,
    speedY: 1.5 + Math.random() * 3.2,
    speedX: -1.5 + Math.random() * 3,
    rotation: Math.random() * Math.PI,
    spin: -0.08 + Math.random() * 0.16,
    color: ["#7ef7b6", "#56e4ff", "#f4ca64", "#f58ea5"][Math.floor(Math.random() * 4)],
    alpha: 0.65 + Math.random() * 0.35,
  }));

  const endAt = performance.now() + 1800;

  function draw(now) {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confetti.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.rotation += piece.spin;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.globalAlpha = piece.alpha;
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      ctx.restore();
    });

    if (now < endAt) {
      confettiAnimId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confetti = [];
      confettiAnimId = null;
    }
  }

  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
  }
  confettiAnimId = requestAnimationFrame(draw);
}

yesBtn.addEventListener("click", handleYesPath);
noBtn.addEventListener("click", handleNoPath);

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  if (!name) {
    setResult("Name is required before transmitting RSVP.", "error");
    nameInput.focus();
    return;
  }

  const people = countInput.value.trim();
  const note = messageInput.value.trim();

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  try {
    const response = await fetch(formEl.action, {
      method: formEl.method || "POST",
      body: new FormData(formEl),
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Formspree submission failed");
    }

    const details = [];
    details.push(`RSVP received, ${name}.`);
    if (people) details.push(`Party size registered: ${people}.`);
    if (note) details.push("Message uploaded successfully.");
    details.push("You are now part of the celebration protocol.");

    setResult(details.join(" "), "success");
    launchConfetti();
    formEl.classList.add("hidden");
    formEl.reset();
  } catch (_error) {
    setResult(
      "Submission failed. Please try again in a moment, or refresh and retry.",
      "error",
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit RSVP";
    }
  }
});

window.addEventListener("resize", () => {
  if (confetti.length > 0) resizeCanvas();
});

typeIntro();
