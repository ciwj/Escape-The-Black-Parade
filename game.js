// Game code

// Define logging level
verbose = 2; // 0 - no console logging, 1 - basic console logging, 2 - some console logging, 3 - log everything

// Run game initialization
init()

//
// Main game loop
//
function mainLoop() {
    // Clear last drawn frame
    ctx.clearRect(0, 0, 1280, 720);
    // If game hasn't started, draw starting UI
    if (!gameStarted) {
        ctx.drawImage(pressAnyKey, 390, 273);
    }
    // Otherwise, draw the level
    if (gameStarted) {
        // Draw collision boxes
        roomsCollision[room].forEach(drawRectFromObj);

        // Draw player sprite
        ctx.drawImage(char.Sprite, char.X, char.Y);
    }
}

// Helper f'n to draw a rectangle from a literal
function drawRectFromObj(rectObj) {
    ctx.fillRect(rectObj.X, rectObj.Y, rectObj.W, rectObj.H);
}

// Keypress event function
function KeyDown() {
    if(verbose >= 2) {
        console.log(event.key);
    }
    // Start the game at the first keystroke
    if (!gameStarted) {
        gameStarted = true;
    }
    // Handle WASD movement
    if (event.key === "d" && (!checkCollision(char) || (checkCollision(char) && !checkCollision({
        X: char.X + char.speed,
        Y: char.Y,
        H: char.H,
        W: char.W
    })))) {
        char.X += char.speed;
    }
    if (event.key === "a" && (!checkCollision(char) || (checkCollision(char) && !checkCollision({
        X: char.X - char.speed,
        Y: char.Y,
        H: char.H,
        W: char.W
    })))) {
        char.X -= char.speed;
    }
    if (event.key === "w" && (!checkCollision(char) || (checkCollision(char) && !checkCollision({
        X: char.X,
        Y: char.Y - char.speed,
        H: char.H,
        W: char.W
    })))) {
        char.Y -= char.speed;
    }
    if (event.key === "s" && (!checkCollision(char) || (checkCollision(char) && !checkCollision({
        X: char.X,
        Y: char.Y + char.speed,
        H: char.H,
        W: char.W
    })))) {
        char.Y += char.speed;
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

        if (verbose >= 3) {
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

//
// Initialize game
//
function init() {
    //
    // Initialize variables
    //

    // Initialize canvas and 2D context
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "green";

    // Define game size and default wall border
    canvasSize = {
        W: 1280,
        H: 720
    }
    defaultBorder = 50;

    // Define game state variables
    gameStarted = false;
    lives = 3;
    room = 0;

    //Initialize character sprite and sprite
    char = {
        X: 72,
        Y: 575,
        Sprite: new Image(),
        H: 75,
        W: 75,
        speed: 5
    }
    char.Sprite.src = "assets/game_assets/dummyChar_75x75.png";

    //
    // Define collision boxes for room 1
    //
    room1Bottom = {
        ID: "r1bottom",
        X: 0,
        Y: canvasSize.H - defaultBorder,
        W: canvasSize.W,
        H: defaultBorder
    }

    room1Top = {
        ID: "r1top",
        X: 0,
        Y: 0,
        W: canvasSize.W,
        H: defaultBorder
    }

    room1Left = {
        ID: "r1left",
        X: 0,
        Y: 0,
        W: defaultBorder,
        H: canvasSize.H
    }

    room1Right = {
        ID: "r1right",
        X: canvasSize.W - defaultBorder,
        Y: 0,
        W: defaultBorder,
        H: canvasSize.H
    }

    // Create arrays for collidable objects
    room1Collision = [room1Bottom, room1Left, room1Right, room1Top];
    roomsCollision = [room1Collision];


    // Define starting UI
    pressAnyKey = new Image();
    pressAnyKey.src = "assets/game_assets/pressAnyKey.png";

    // Set interval for redrawing
    setInterval(mainLoop, 33);

    // Key listener
    window.addEventListener('keydown', KeyDown);
}