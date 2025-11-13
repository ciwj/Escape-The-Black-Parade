// Game code

// Initialize canvas and 2D context
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");


// Initialize variables
let verbose = 1; // 0 - no console logging, 1 - basic console logging, 2 - some console logging, 3 - log everything

var gameStarted = false;
var lives = 3;
var room = 0;
let canvasSize = {
    W: 1280,
    H: 720
}
let defaultBorder = 50;

// Initialize character
var char = {
    X: 72,
    Y: 575,
    Sprite: new Image(),
    H: 75,
    W: 75
}

char.Sprite.src = "assets/game_assets/dummyChar_75x75.png";

// Define collision boxes for room 1
const room1Bottom = {
    ID: "r1bottom",
    X: 0,
    Y: canvasSize.H - defaultBorder,
    W: canvasSize.W,
    H: defaultBorder
}

const room1Top = {
    ID: "r1top",
    X: 0,
    Y: 0,
    W: canvasSize.W,
    H: defaultBorder
}

const room1Left = {
    ID: "r1left",
    X: 0,
    Y: 0,
    W: defaultBorder,
    H: canvasSize.H
}

const room1Right = {
    ID: "r1right",
    X: canvasSize.W - defaultBorder,
    Y: 0,
    W: defaultBorder,
    H: canvasSize.H
}

let room1Collision = [room1Bottom, room1Left, room1Right, room1Top];
let roomsCollision = [room1Collision];



// Starting UI
var pressAnyKey = new Image();
pressAnyKey.src="assets/game_assets/pressAnyKey.png";

// Helper f'n to draw from obj
function drawRectFromObj(rectObj) {
    ctx.fillRect(rectObj.X, rectObj.Y, rectObj.W, rectObj.H);
}

// Set interval for redrawing
setInterval(mainLoop, 33);
// Draw frames at ~30fps
function mainLoop() {
    ctx.clearRect(0, 0, 1280, 720);
    if (!gameStarted) {
        ctx.drawImage(pressAnyKey, 390, 273);
    }
    if (gameStarted) {
            roomsCollision[room].forEach(drawRectFromObj);
            checkCollision(char)

        ctx.drawImage(char.Sprite, char.X, char.Y);
    }
}

// Key press handling
window.addEventListener('keydown', KeyDown);

function KeyDown()
{
    console.log(event.key);
    if (!gameStarted) {
        gameStarted = true;
    }
    if (event.key == "d" && !checkCollision(char)) {
        char.X++;
    }

    if (event.key == "a" && !checkCollision(char)) {
        char.X--;
    }
    if (event.key == "w" && !checkCollision(char)) {
        char.Y--;
    }
    if (event.key == "s" && !checkCollision(char)) {
        char.Y++;
    }
    if (verbose >= 2) {
        console.log("X: " + char.X + " Y: " + char.Y + ".");
    }

}

// Check for collision - returns a boolean. true = collision, false = no collision
function checkCollision(spriteObj) {
    let isCollide = false;
    // Set sprite's boundaries
    let spriteL = spriteObj.X;
    let spriteR = spriteObj.X + spriteObj.W;
    let spriteT = spriteObj.Y;
    let spriteB = spriteObj.Y + spriteObj.H;
    if (verbose >= 3) {
        console.log("sprite L/R/T/B: " + spriteL + "/" + spriteR + "/" + spriteT + "/" + spriteB);
    }
    // Iterate thru each collidable in the room
    for (i = 0; i < roomsCollision[room].length; i++) {
        // Set collidable object's boundaries
        let collidableL = roomsCollision[room][i].X;
        let collidableR = roomsCollision[room][i].X + roomsCollision[room][i].W;
        let collidableT = roomsCollision[room][i].Y;
        let collidableB = roomsCollision[room][i].Y + roomsCollision[room][i].H;


        if(verbose >= 3) {
            console.log("Collidable " + roomsCollision[room][i].ID + ": L/R/T/B: " + collidableL + "/" + collidableR + "/" + collidableT + "/" + collidableB);
            console.log(`SpriteL ${spriteL} >= CollR ${collidableR}: ${spriteL >= collidableR}`);
            console.log(`SpriteR ${spriteR} <= CollL ${collidableL}: ${spriteR <= collidableL}`);
            console.log(`SpriteT ${spriteT} >= CollB ${collidableB}: ${spriteT >= collidableB}`);
            console.log(`SpriteB ${spriteB} <= CollT ${collidableT}: ${spriteB <= collidableT}`);
        }

        // Check if its within bounds, set to true if its inside a collidable object
        if (!(spriteB <= collidableT || spriteT >= collidableB || spriteR <= collidableL || spriteL >= collidableR)) {
            isCollide = true;
            if (verbose >= 1) {
                console.log("collision detected with " + roomsCollision[room][i].ID);
            }
        }

    }
    // Return result
    return isCollide;
}