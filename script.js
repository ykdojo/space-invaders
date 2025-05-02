const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game Configuration ---
const canvasWidth = 800;
const canvasHeight = 600;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const playerColor = '#607D8B'; // Blue Grey
const invaderColor = '#FF5722'; // Deep Orange
const bulletColor = '#009688'; // Teal
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
const invaderRowCount = 4;
const invaderColumnCount = 8;
const invaderSpeed = 1.5; // How much they move down each frame initially
let invaders = [];
let invadersMoveDown = true; // Start by moving down

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
    invaders.forEach(invader => {
        if (invader.status === 1) {
             invader.y += invaderSpeed; // Move down

             // Check if invader reached bottom (game over condition)
             if (invader.y + invader.height > player.y) {
                 // For simplicity, just stop the game for now
                 console.log("GAME OVER - Invader reached player level");
                 document.location.reload(); // Reload to restart
             }
        }
    });
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
                    bullets.splice(bulletIndex, 1); // Remove bullet

                    // Check win condition
                    if (invaders.every(inv => inv.status === 0)) {
                         console.log("YOU WIN!");
                         document.location.reload(); // Reload to restart
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

// --- Start Game ---
createInvaders();
gameLoop();
