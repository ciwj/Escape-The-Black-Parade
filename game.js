// Game code

// Initialize canvas and 2D context
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Initialize character sprite & variables
var gameStarted = false;
var lives = 3;
var room = 0;

// Initialize character
var charX = 50;
var charY = 720 - 150;
var charSprite = new Image();
charSprite.src = "assets/game_assets/dummyChar_75x150.png";

// Starting UI
var pressAnyKey = new Image();
pressAnyKey.src="assets/game_assets/pressAnyKey.png";

// Set interval for redrawing
setInterval(draw, 100);

function draw() {
    ctx.clearRect(0, 0, 1280, 720);
    if (!gameStarted) {
        ctx.drawImage(pressAnyKey, 390, 273);
    }
    if (gameStarted) {
        ctx.drawImage(charSprite, charX, charY);
    }
}

// Key press handling
window.addEventListener('keydown', KeyDown);

function KeyDown()
{
    if (!gameStarted) {
        gameStarted = true;
    }
    if (event.key == "ArrowRight") {
        charX++;
    }

    if (event.key == "ArrowLeft") {
        charX--;
    }
}