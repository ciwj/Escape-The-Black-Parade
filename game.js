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

// Room transition function
function changeRoom() {
    if (room === 0 && char.Y <= 0) { // Rm1 -> Rm2
        room = 1;
        char.Y = 640;
    } else if (room === 1 && char.Y >= canvasSize.H - char.H) { // Rm2 -> Rm1
        room = 0;
        char.Y = 5;
    } else if (room === 1 && char.X <= 0) { // Rm2 -> Rm3
        room = 2;
        char.X = canvasSize.W - defaultBorder;
    } else if (room === 1 && char.X >= canvasSize.W - char.W) { // Rm2 -> Rm4
        room = 3;
        char.X = 5;
    } else if (room === 2 && char.X >= canvasSize.W - char.W) { // Rm3 -> Rm2
        room = 1;
        char.X = 5;
    } else if (room === 3 && char.X <= 0) { // Rm4 -> Rm2
        room = 1;
        char.X = canvasSize.W - defaultBorder;
    } else if (room === 3 && char.X >= canvasSize.W - char.W) { // Rm4 -> Stage
        room = 4;
        char.X = 5;
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
    if (event.key === "d" && (!checkCollision({X: char.X + char.speed, Y: char.Y, H: char.H, W: char.W}))) {
        char.Sprite.src = "assets/game_assets/player/playerRight.png";
        char.X += char.speed;
    }
    if (event.key === "a" && (!checkCollision({X: char.X - char.speed, Y: char.Y, H: char.H, W: char.W}))) {
        char.Sprite.src = "assets/game_assets/player/playerLeft.png";
        char.X -= char.speed;
    }
    if (event.key === "w" && (!checkCollision({X: char.X, Y: char.Y - char.speed, H: char.H, W: char.W}))) {
        char.Sprite.src = "assets/game_assets/player/playerUp.png";
        char.Y -= char.speed;
    }
    if (event.key === "s" && (!checkCollision({X: char.X, Y: char.Y + char.speed, H: char.H, W: char.W}))) {
        char.Sprite.src = "assets/game_assets/player/playerDown.png";
        char.Y += char.speed;
    }

    if (verbose >= 2) {
        console.log("X: " + char.X + " Y: " + char.Y + ".");
    }
    changeRoom();
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
    };
    defaultBorder = 80;

    // Define game state variables
    gameStarted = false;
    lives = 3;
    room = 0;

    //Initialize character sprite and sprite
    char = {
        X: 960,
        Y: 240,
        Sprite: new Image(),
        H: 75,
        W: 75,
        speed: 5
    };
    char.Sprite.src = "assets/game_assets/player/playerDown.png";

    defineRooms()

    // Define starting UI
    pressAnyKey = new Image();
    pressAnyKey.src = "assets/game_assets/misc/pressAnyKey.png";

    // Set interval for redrawing
    setInterval(mainLoop, 33);

    // Key listener
    window.addEventListener('keydown', KeyDown);
}

function defineRooms () {
    //
    // Define collision boxes for room 1
    //
    room1Bottom = {
        ID: "r1bottom",
        X: 0,
        Y: canvasSize.H - defaultBorder,
        W: canvasSize.W,
        H: defaultBorder
    };
    room1Top1 = {
        ID: "r1top1",
        X: 0,
        Y: 0,
        W: 160,
        H: defaultBorder

    };
    room1Top2 = {
        ID: "r1top2",
        X: 240,
        Y: 0,
        W: canvasSize.W - 320,
        H: defaultBorder
    };
    room1Left = {
        ID: "r1left",
        X: 0,
        Y: 0,
        W: defaultBorder,
        H: canvasSize.H
    };
    room1Right = {
        ID: "r1right",
        X: canvasSize.W - defaultBorder,
        Y: 0,
        W: defaultBorder,
        H: canvasSize.H
    };

    room1Wall1 = {
        ID: "r1wall1",
        X: 80,
        Y: 320,
        W: 720,
        H: defaultBorder
    };

    room1Wall2 = {
        ID: "r1wall2",
        X: 320,
        Y: 80,
        W: defaultBorder,
        H: defaultBorder
    };

    room1Wall3 = {
        ID: "r1wall3",
        X: 320,
        Y: 240,
        W: defaultBorder,
        H: defaultBorder
    };

    room1Wall4 = {
        ID: "r1wall4",
        X: 720,
        Y: 80,
        W: defaultBorder,
        H: defaultBorder
    };

    room1Wall5 = {
        ID: "r1wall5",
        X: 720,
        Y: 240,
        W: defaultBorder,
        H: defaultBorder
    };

    //
    // Define room 2
    //
    room2Top = {
        ID: "r2top",
        X: 0,
        Y: 0,
        W: canvasSize.W,
        H: defaultBorder
    };
    room2Bottom1 = {
        ID: "r2bottom1",
        X: 0,
        Y: canvasSize.H - defaultBorder,
        W: 160,
        H: defaultBorder

    };
    room2Bottom2 = {
        ID: "r2bottom2",
        X: 240,
        Y: canvasSize.H - defaultBorder,
        W: canvasSize.W - 320,
        H: defaultBorder
    };
    room2Left1 = {
        ID: "r2left1",
        X: 0,
        Y: 0,
        W: defaultBorder,
        H: 160
    };
    room2Left2 = {
        ID: "r2left2",
        X: 0,
        Y: 240,
        W: defaultBorder,
        H: 400
    };
    room2Right1 = {
        ID: "r2right1",
        X: canvasSize.W - defaultBorder,
        Y: 0,
        W: defaultBorder,
        H: 320
    };
    room2Right2 = {
        ID: "r2right2",
        X: canvasSize.W - defaultBorder,
        Y: 400,
        W: defaultBorder,
        H: 320
    };
    room2Center = {
        ID: "r2center",
        X: 0,
        Y: 320,
        W: 720,
        H: defaultBorder
    };
    //
    // Define room 3
    //
    room3Right1 = {
        ID: "r3right1",
        X: canvasSize.W - 80,
        Y: 0,
        W: defaultBorder,
        H: 160
    };
    room3Right2 = {
        ID: "r3right2",
        X: canvasSize.W - 80,
        Y: 240,
        W: defaultBorder,
        H: 400
    };
    room3Wall1 = {
        ID: "r3w1",
        X: 480,
        Y: 160,
        W: defaultBorder,
        H: 480
    };
    room3Wall2 = {
        ID: "r3w2",
        X: 880,
        Y: 0,
        W: defaultBorder,
        H: 560
    };
    room3Wall3 = {
        ID: "r3w3",
        X: 640,
        Y: 480,
        W: 320,
        H: defaultBorder
    };
    room3Wall4 = {
        ID: "r3w4",
        X: 640,
        Y: 160,
        W: 160,
        H: defaultBorder
    };
    room3Wall5 = {
        ID: "r3w5",
        X: 640,
        Y: 320,
        W: defaultBorder,
        H: defaultBorder
    };

    //
    // Define room 4
    //
    room4Left1 = {
        ID: "r4l1",
        X: 0,
        Y: 0,
        W: defaultBorder,
        H: 320
    };
    room4Left2 = {
        ID: "r4l2",
        X: 0,
        Y: 400,
        W: defaultBorder,
        H: 320
    };
    //
    // Define stage room
    //
    room5Wall1 = {
        ID: "r5w1",
        X: 880,
        Y: 80,
        W: defaultBorder,
        H: 80
    };
    room5Wall2 = {
        ID: "r5w1",
        X: 880,
        Y: 560,
        W: defaultBorder,
        H: 80
    };

    // Create arrays for collidable objects
    room1Collision = [room1Bottom, room1Left, room1Right, room1Top1, room1Top2, room1Wall1, room1Wall2, room1Wall3, room1Wall4, room1Wall5];
    room2Collision = [room2Top, room2Bottom1, room2Bottom2, room2Left1, room2Left2, room2Right1, room2Right2, room2Center];
    room3Collision = [room2Top, room1Bottom, room1Left, room3Right1, room3Right2, room3Wall1, room3Wall2, room3Wall3, room3Wall4, room3Wall5];
    room4Collision = [room2Right1, room2Right2, room2Top, room1Bottom, room4Left1, room4Left2];
    room5Collision = [room4Left1, room4Left2, room1Bottom, room2Top, room1Right, room5Wall1, room5Wall2];
    roomsCollision = [room1Collision, room2Collision, room3Collision, room4Collision, room5Collision];
}