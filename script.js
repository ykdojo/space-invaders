const canvas = document.getElementById('gameCanvas');
const scoreBoard = document.getElementById('scoreBoard');
const stageDisplay = document.getElementById('stageDisplay');
const ctx = canvas.getContext('2d');

// --- Game Configuration ---
const canvasWidth = 800;
const canvasHeight = 600;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const playerColor = '#607D8B'; // Blue Grey
const invaderColor = '#FF5722'; // Deep Orange
const bulletColor = '#009688'; // Teal
let score = 0;
let stage = 0;
const backgroundColor = '#ffffff'; // White

// --- Player ---
const playerWidth = 50;
const playerHeight = 20;
const playerSpeed = 7;
let player = {
    x: canvasWidth / 2 - playerWidth / 2,
    y: canvasHeight - playerHeight - 20,
    width: playerWidth,
    height: playerHeight,
    dx: 0 // Horizontal speed
};

function drawPlayer() {
    ctx.fillStyle = playerColor;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function movePlayer() {
    player.x += player.dx;

    // Keep player within bounds
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvasWidth) {
        player.x = canvasWidth - player.width;
    }
}

// --- Invaders ---
const invaderWidth = 40;
const invaderHeight = 20;
const invaderPadding = 15;
const invaderOffsetTop = 30;
const invaderOffsetLeft = 30;
const invaderRowCount = 3;
const invaderColumnCount = 6;
const initialInvaderSpeed = 0.8; // Base speed for stage 0
const initialInvaderSideSpeed = 0.5; // Base side speed for stage 0
const speedIncreasePerStage = 0.3; // How much speed increases per stage
let currentInvaderSpeed = initialInvaderSpeed;
let currentInvaderSideSpeed = initialInvaderSideSpeed;
let invaders = [];
let invaderDirection = 1; // 1 for right, -1 for left

function createInvaders() {
    invaders = []; // Reset invaders
    for (let c = 0; c < invaderColumnCount; c++) {
        for (let r = 0; r < invaderRowCount; r++) {
            invaders.push({
                x: invaderOffsetLeft + c * (invaderWidth + invaderPadding),
                y: invaderOffsetTop + r * (invaderHeight + invaderPadding),
                width: invaderWidth,
                height: invaderHeight,
                status: 1 // 1 = alive, 0 = dead
            });
        }
    }
}

function drawInvaders() {
    invaders.forEach(invader => {
        if (invader.status === 1) {
            ctx.fillStyle = invaderColor;
            ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        }
    });
}

function moveInvaders() {
    // Check if any active invader has reached the canvas edge
    let hitEdge = false;
    let lowestInvader = 0;
    
    invaders.forEach(invader => {
        if (invader.status === 1) {
            // Track the lowest invader for game over condition
            lowestInvader = Math.max(lowestInvader, invader.y + invader.height);
            
            // Check if any invader hits the side edge
            if ((invader.x + invader.width + currentInvaderSideSpeed * invaderDirection > canvasWidth) || 
                (invader.x + currentInvaderSideSpeed * invaderDirection < 0)) {
                hitEdge = true;
            }
        }
    });
    
    // Move all invaders
    invaders.forEach(invader => {
        if (invader.status === 1) {
            // If edge was hit, move down and change direction
            if (hitEdge) {
                invader.y += currentInvaderSpeed * 10; // Move down more when hitting edge
            }
            
            // Move side to side
            invader.x += currentInvaderSideSpeed * invaderDirection;
            
            // Check if invader reached bottom (game over condition)
            if (invader.y + invader.height > player.y) {
                console.log("GAME OVER - Invader reached player level");
                document.location.reload(); // Reload to restart
            }
        }
    });
    
    // Change direction if edge was hit
    if (hitEdge) {
        invaderDirection *= -1;
    }
}


// --- Bullets ---
const bulletWidth = 5;
const bulletHeight = 10;
const bulletSpeed = 10;
let bullets = [];

function drawBullets() {
    bullets.forEach((bullet, index) => {
        ctx.fillStyle = bulletColor;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Move bullet
        bullet.y -= bulletSpeed;

        // Remove bullet if it goes off-screen
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });
}

function shoot() {
    if (bullets.length < 5) { // Limit bullets on screen
        bullets.push({
            x: player.x + player.width / 2 - bulletWidth / 2,
            y: player.y,
            width: bulletWidth,
            height: bulletHeight
        });
    }
}


// --- Collision Detection ---
function collisionDetection() {
    bullets.forEach((bullet, bulletIndex) => {
        invaders.forEach((invader, invaderIndex) => {
            if (invader.status === 1) {
                if (
                    bullet.x < invader.x + invader.width &&
                    bullet.x + bullet.width > invader.x &&
                    bullet.y < invader.y + invader.height &&
                    bullet.y + bullet.height > invader.y
                ) {
                    // Collision!
                    invader.status = 0; // Mark invader as dead
                    score += 10; // Increase score
                    bullets.splice(bulletIndex, 1); // Remove bullet

                    // Check if all invaders are defeated
                    if (invaders.every(inv => inv.status === 0)) {
                        console.log("Stage completed!");
                        advanceToNextStage();
                    }
                }
            }
        });
    });
}

// --- Game Loop ---
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw & Update
    drawPlayer();
    movePlayer();
    drawInvaders();
    moveInvaders();
    drawBullets();
    collisionDetection();

    // Update Score Board and Stage Display
    scoreBoard.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;

    requestAnimationFrame(gameLoop); // Keep the loop going
}

// --- Event Listeners ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = playerSpeed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -playerSpeed;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
         shoot();
    }
});

document.addEventListener('keyup', (e) => {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        player.dx = 0;
    }
});

// --- Stage Progression ---
function advanceToNextStage() {
    // Display stage clear message
    showStageMessage(`STAGE ${stage} CLEAR!`);
    
    // Increment stage
    stage++;
    
    // Increase speeds with more significant progression based on stage
    currentInvaderSpeed = initialInvaderSpeed + (speedIncreasePerStage * stage);
    currentInvaderSideSpeed = initialInvaderSideSpeed + (speedIncreasePerStage * stage / 2);
    
    console.log(`Stage ${stage} - Speed increased! Down: ${currentInvaderSpeed.toFixed(2)}, Side: ${currentInvaderSideSpeed.toFixed(2)}`);
    
    // Reset invader positions but keep the score
    createInvaders();
}

// Display a temporary message in the center of the screen
function showStageMessage(message) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#FF5722';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvasWidth / 2, canvasHeight / 2);
    
    // Display for 1.5 seconds
    setTimeout(() => {
        ctx.restore();
    }, 1500);
}

// --- Start Game ---
createInvaders();
showStageMessage(`STAGE ${stage} START!`);
gameLoop();
