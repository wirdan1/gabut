const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');

// Load images
const birdImg = new Image();
birdImg.src = 'bird.png';

const pipeImg = new Image();
pipeImg.src = 'pipe.png';

const backgroundImg = new Image();
backgroundImg.src = 'background.png';

let bird = {
    x: 100,
    y: canvas.height / 2,
    width: 34, // Sesuaikan dengan lebar gambar burung
    height: 24, // Sesuaikan dengan tinggi gambar burung
    velocity: 0,
    gravity: 0.5,
    jump: -10
};

let pipes = [];
let score = 0;
let gameOver = false;
let frameCount = 0;

const pipeWidth = 52; // Sesuaikan dengan lebar gambar pipa
const pipeGap = 150;
const pipeSpeed = 2;

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Gambar pipa atas (flip vertikal)
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.top + pipe.height / 2);
        ctx.rotate(Math.PI); // Rotasi 180 derajat
        ctx.drawImage(pipeImg, -pipeWidth / 2, -pipe.height / 2, pipeWidth, pipe.height);
        ctx.restore();

        // Gambar pipa bawah
        ctx.drawImage(pipeImg, pipe.x, pipe.top + pipeGap, pipeWidth, canvas.height - pipe.top - pipeGap);
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver = true;
    }
}

function updatePipes() {
    if (frameCount % 90 === 0) {
        const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({ x: canvas.width, top: topHeight, height: 320 }); // Tinggi pipa disesuaikan dengan gambar
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        // Collision detection
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipeWidth &&
            (bird.y < pipe.top + pipe.height || 
             bird.y + bird.height > pipe.top + pipeGap)) {
            gameOver = true;
        }

        // Score increment
        if (bird.x > pipe.x + pipeWidth && !pipe.scored) {
            score++;
            pipe.scored = true;
            scoreElement.textContent = score;
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function gameLoop() {
    if (gameOver) {
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'block';
        return;
    }

    drawBackground();
    drawBird();
    drawPipes();
    updateBird();
    updatePipes();
    frameCount++;
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameOver = false;
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    gameLoop();
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !gameOver) {
        bird.velocity = bird.jump;
    }
});

canvas.addEventListener('click', () => {
    if (!gameOver) {
        bird.velocity = bird.jump;
    }
});

// Mulai game setelah gambar dimuat
backgroundImg.onload = () => {
    birdImg.onload = () => {
        pipeImg.onload = () => {
            gameLoop();
        };
    };
};
