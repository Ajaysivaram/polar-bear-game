// Disable scrolling
document.body.style.overflow = "hidden";

// --- Global Variables ---
const bears = document.querySelectorAll(".bear");
const colorPicker = document.getElementById("color");
const message = document.getElementById("message");
const resetBtn = document.getElementById("resetBtn");
const successSound = document.getElementById("successSound");
const errorSound = document.getElementById("errorSound");

const totalBears = bears.length;
const BASE_ANIMATION = 'gentleShake 3s infinite ease-in-out';

// 🎉 Confetti setup
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
let animationFrameId;

let confettiPieces = [];

// Ensure canvas size updates on resize
window.addEventListener("resize", () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
});


// --- Confetti Functions ---

function createConfetti() {
    confettiPieces = [];
    for (let i = 0; i < 100; i++) {
        confettiPieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            w: 10,
            h: 10,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            speed: Math.random() * 5 + 2,
        });
    }
}

function drawConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach((c) => {
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, c.w, c.h);
        c.y += c.speed;
        if (c.y > confettiCanvas.height) c.y = -10;
    });
    animationFrameId = requestAnimationFrame(drawConfetti);
}

function stopConfetti() {
    cancelAnimationFrame(animationFrameId);
    confettiPieces = [];
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiCanvas.style.display = 'none';
}

function startConfetti() {
    confettiCanvas.style.display = 'block';
    createConfetti();
    let duration = 2500;
    let end = Date.now() + duration;
    (function frame() {
      drawConfetti();
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        stopConfetti();
      }
    })();
}


// --- Game State Functions ---

function checkWinCondition() {
    const currentCorrectCount = document.querySelectorAll('.bear.correct').length;
    
    if (currentCorrectCount === totalBears) {
        showMessage("🎉 SUPER WINNER! YOU COLOURED ALL THE BEARS! 🏆", "darkorange");
        startConfetti();
    }
}

function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
    message.style.display = "block";
    message.style.borderColor = color; 
    
    setTimeout(() => (message.style.display = "none"), 2000);
}

// 🧸 Bear click behavior
bears.forEach((bear) => {
    bear.addEventListener("click", () => {
        const selectedColor = colorPicker.value;
        const correctColor = bear.dataset.condition;
        
        // 1. PREVENT RE-COLORING
        if (bear.classList.contains("correct")) {
            showMessage(`✅ Already the right color!`, "gray");
            return;
        }

        if (selectedColor === correctColor) {
            // Correct Logic
            bear.classList.add("correct");
            bear.classList.remove("wrong");
            
            // Set inline color which CSS uses for the filter/glow (for the popCorrect animation)
            bear.style.color = selectedColor; 
            
            // Stop base shake, let CSS run popCorrect animation
            bear.style.animation = 'popCorrect 0.5s ease-out forwards'; 
            
            successSound.currentTime = 0;
            successSound.play().catch(e => console.error("Sound playback failed:", e));
            showMessage(`🎉 YEAH! Correct! ${selectedColor} Bear! 🐻`, "green");
            
            // 2. CHECK WIN CONDITION
            checkWinCondition(); 
            
        } else {
            // Incorrect Logic (Flash red, no permanent coloring)
            
            bear.classList.add("wrong");
            bear.classList.remove("correct");
            
            // Temporary red color for the drop-shadow flash
            bear.style.color = 'red'; 
            
            errorSound.currentTime = 0;
            errorSound.play().catch(e => console.error("Sound playback failed:", e));
            showMessage(`❌ Oops! Wrong colour!`, "red");
            
            // Remove the 'wrong' state after a quick flash (400ms)
            setTimeout(() => {
                bear.classList.remove("wrong");
                bear.style.color = ''; // Clear the red flash color
            }, 400); 
        }
    });
});

// 🔄 Reset bears
resetBtn.addEventListener("click", () => {
    bears.forEach((bear) => {
        bear.classList.remove("correct", "wrong");
        // Clear all relevant inline styles and reapply gentle shake
        bear.style.filter = "none";
        bear.style.backgroundColor = "transparent";
        bear.style.opacity = "1";
        bear.style.color = ""; 
        // Reapply the base animation
        bear.style.animation = BASE_ANIMATION; 
    });
    
    stopConfetti(); 
    
    showMessage("🔄 Game reset! Pick a color again 🎨", "black");
});