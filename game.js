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
        doMovement();
        // Draw collision boxes
        roomsCollision[room].forEach(drawRectFromObj);
        // Draw room objects
        roomObjects[room].forEach(drawObjects);

        // Draw player sprite
        ctx.drawImage(char.sprite, char.X, char.Y);
    }
}

// Draw the room's objects
function drawObjects(obj) {
    if (obj.destroyed === false) {
        ctx.drawImage(obj.sprite, obj.X, obj.Y);
    }
}

function doMovement() {
    // IMPLEMENT
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
    if (!rectObj.destroyed) {
        ctx.fillRect(rectObj.X, rectObj.Y, rectObj.W, rectObj.H);
    }
}

// Runs when E is pressed
function attemptInteract() {
    if (verbose >= 1) {
        drawRectFromObj(createBoxInFrontOf(char, 50, 50));
    }
    // Iterate through the current room's objects
    for (i = 0; i < roomObjects[room].length; i++) {
        // Create a box in front of the player to compare to object distance
        let boxToCheck = createBoxInFrontOf(char, 50, 50);

        if (verbose >= 1) {
            console.log("Interaction distance check:" + checkCollBetween(boxToCheck, roomObjects[room][i]) + " Interactable: " + roomObjects[room][i].interactable);
        }

        if (checkCollBetween(boxToCheck, roomObjects[room][i]) && roomObjects[room][i].interactable) {
            if (roomObjects[room][i].interactionID === 0) { // If it's room 1 miku
                // IMPLEMENT
            }
            if (roomObjects[room][i].interactionID === 1) { // If it's room 1 lever
                // IMPLEMENT lever noise
                r1Door.destroyed = true;
            }
            if (roomObjects[room][i].interactionID === 2) { // If it's room 3 lever 1
                r3Door3.destroyed = !r3Door3.destroyed;
            }
            if (roomObjects[room][i].interactionID === 3) { // If it's room 3 lever 2
                r3Door2.destroyed = !r3Door2.destroyed;
                r3Door3.destroyed = !r3Door3.destroyed;
            }
            if (roomObjects[room][i].interactionID === 4) { // If it's room 3 lever 3
                r3Door1.destroyed = !r3Door1.destroyed;
                r3Door2.destroyed = !r3Door2.destroyed;
            }
            if (roomObjects[room][i].interactionID === 5) { // If it's room 3 lever 4
                r2Door.destroyed = true;
            }
        }
    }
}

// Create an object in front of a given object with given relative width and height
function createBoxInFrontOf (obj, W, H) {
    let newObj = {
        X: -1,
        Y: -1,
        W: -1,
        H: -1,
        direction: obj.direction
    };
    if (obj.direction === 0) {
        newObj.X = obj.X + obj.W/2 - W/2;
        newObj.Y = obj.Y - H;
        newObj.W = W;
        newObj.H = H;
    } else if (obj.direction === 1) {
        newObj.X = obj.X + obj.W;
        newObj.Y = obj.Y + obj.H/2 - W/2;
        newObj.W = H;
        newObj.H = W;
    } else if (obj.direction === 2) {
        newObj.X = obj.X + obj.W/2 - W/2;
        newObj.Y = obj.Y + obj.H;
        newObj.W = W;
        newObj.H = H;
    } else if (obj.direction === 3) {
        newObj.X = obj.X - H;
        newObj.Y = obj.Y + obj.H/2 - W/2;
        newObj.W = H;
        newObj.H = W;
    }
    return newObj;
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
        char.sprite.src = "assets/game_assets/player/playerRight.png";
        char.direction = 1;
        char.X += char.speed;
    }
    if (event.key === "a" && (!checkCollision({X: char.X - char.speed, Y: char.Y, H: char.H, W: char.W}))) {
        char.sprite.src = "assets/game_assets/player/playerLeft.png";
        char.direction = 3;
        char.X -= char.speed;
    }
    if (event.key === "w" && (!checkCollision({X: char.X, Y: char.Y - char.speed, H: char.H, W: char.W}))) {
        char.sprite.src = "assets/game_assets/player/playerUp.png";
        char.direction = 0;
        char.Y -= char.speed;
    }
    if (event.key === "s" && (!checkCollision({X: char.X, Y: char.Y + char.speed, H: char.H, W: char.W}))) {
        char.sprite.src = "assets/game_assets/player/playerDown.png";
        char.direction = 2;
        char.Y += char.speed;
    }
    if (event.key === "e") {
        attemptInteract();
    }
    if (event.key === "j") {
        melee();
    }
    if (event.key === "k") {
        ranged();
    }

    if (verbose >= 2) {
        console.log("X: " + char.X + " Y: " + char.Y + ".");
    }
    changeRoom();
}

// Ranged attack
function ranged() {
    // IMPLEMENT
}

function heal() {
    // IMPLEMENT
}

// Melee attack
function melee() {
    if (verbose >= 1) {
        drawRectFromObj(createBoxInFrontOf(char, 90, 50));
    }

    for (i = 0; i < roomObjects[room].length; i++) {
        // Create a box in front of the player to compare to object distance
        let boxToCheck = createBoxInFrontOf(char, 90, 50);

        if (verbose >= 1) {
            console.log("Interaction distance check:" + checkCollBetween(boxToCheck, roomObjects[room][i]));
        }

        if (checkCollBetween(boxToCheck, roomObjects[room][i]) && roomObjects[room][i].enemy) {
            roomObjects[room][i].hp--
            if (roomObjects[room][i].hp <= 0) {
                roomObjects[room][i].destroyed = true;
            }
            if (verbose >= 1) {
                console.log("Hit detected! Obj HP: " + roomObjects[room][i].hp);
            }
        }
    }
}

// Check for collision between any two objects
function checkCollBetween(obj1, obj2) {
    let isCollide = false;

    // Set boundaries
    let obj1L = obj1.X;
    let obj1R = obj1.X + obj1.W;
    let obj1T = obj1.Y;
    let obj1B = obj1.Y + obj1.H;

    let obj2L = obj2.X;
    let obj2R = obj2.X + obj2.W;
    let obj2T = obj2.Y;
    let obj2B = obj2.Y + obj2.H;

    // Check if its within bounds, set to true if its inside a collidable object
    if (!(obj1B <= obj2T || obj1T >= obj2B || obj1R <= obj2L || obj1L >= obj2R)) {
        isCollide = true;
    }
    // Return result
    return isCollide;
}

// Check for wall collision - returns a boolean. true = collision, false = no collision
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
        if (!(spriteB <= collidableT || spriteT >= collidableB || spriteR <= collidableL || spriteL >= collidableR) && !roomsCollision[room][i].destroyed) {
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

    // Initialize canvas and 2D context
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");


    // Define game size and default wall border
    canvasSize = {
        W: 1280,
        H: 720
    };
    defaultBorder = 80;

    // Define game state variables
    gameStarted = false;
    lives = 3;
    room = 2;

    //Initialize character sprite and sprite
    char = {
        X: 965,
        Y: 245,
        sprite: new Image(),
        H: 70,
        W: 70,
        speed: 5,
        direction: 2 // 0-Up 1-Right 2-Down 3-Left
    };
    char.sprite.src = "assets/game_assets/player/playerDown.png";

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

    ctx.fillStyle = "green";

    //
    // Define non-wall objects
    //
    miku = {
        X: 565,
        Y: 405,
        sprite: new Image(),
        H: 70,
        W: 70,
        interactable: true,
        enemy: false,
        interactionID: 0,
        destructible: false,
        destroyed: false
    };
    miku.sprite.src = "assets/game_assets/non_player/miku.png";

    dummy = {
        X: 85,
        Y: 485,
        sprite: new Image(),
        H: 70,
        W: 70,
        interactable: false,
        enemy: true,
        destructible: false,
        destroyed: false,
        hp: 999
    };
    dummy.sprite.src = "assets/game_assets/non_player/dummy.png";

    r1Door = {
        X: 720,
        Y: 160,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r1Door.sprite.src = "assets/game_assets/sprites/door.png";

    r1Lever = {
        X: 490,
        Y: 630,
        sprite: new Image(),
        H: 60,
        W: 60,
        interactable: true,
        interactionID: 1,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r1Lever.sprite.src = "assets/game_assets/sprites/lever.png";

    r1Obstacle = {
        X: 320,
        Y: 160,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r1Obstacle.sprite.src = "assets/game_assets/sprites/obstacle.png";

    // Room 2
    r2Door = {
        X: 1200,
        Y: 320,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r2Door.sprite.src = "assets/game_assets/sprites/door.png";

    r2Obstacle = {
        X: 80,
        Y: 160,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r2Obstacle.sprite.src = "assets/game_assets/sprites/obstacle.png";

    // Room 3
    r3Door1 = {
        X: 880,
        Y: 560,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r3Door1.sprite.src = "assets/game_assets/sprites/door.png";

    r3Door2 = {
        X: 640,
        Y: 560,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r3Door2.sprite.src = "assets/game_assets/sprites/door.png";

    r3Door3 = {
        X: 560,
        Y: 480,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r3Door3.sprite.src = "assets/game_assets/sprites/door.png";

    r3Lever1 = {
        X: 1130,
        Y: 630,
        sprite: new Image(),
        H: 60,
        W: 60,
        interactable: true,
        interactionID: 2,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r3Lever1.sprite.src = "assets/game_assets/sprites/lever.png";

    r3Lever2 = {
        X: 1050,
        Y: 630,
        sprite: new Image(),
        H: 60,
        W: 60,
        interactable: true,
        interactionID: 3,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r3Lever2.sprite.src = "assets/game_assets/sprites/lever.png";

    r3Lever3 = {
        X: 970,
        Y: 630,
        sprite: new Image(),
        H: 60,
        W: 60,
        interactable: true,
        interactionID: 4,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r3Lever3.sprite.src = "assets/game_assets/sprites/lever.png";

    r3Lever4 = {
        X: 250,
        Y: 630,
        sprite: new Image(),
        H: 60,
        W: 60,
        interactable: true,
        interactionID: 5,
        enemy: false,
        destructible: false,
        destroyed: false
    };
    r3Lever4.sprite.src = "assets/game_assets/sprites/lever.png";

    r3Obstacle1 = {
        X: 800,
        Y: 80,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r3Obstacle1.sprite.src = "assets/game_assets/sprites/obstacle.png";

    r3Obstacle2 = {
        X: 800,
        Y: 240,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r3Obstacle2.sprite.src = "assets/game_assets/sprites/obstacle.png";

    r3Obstacle3 = {
        X: 560,
        Y: 160,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r3Obstacle3.sprite.src = "assets/game_assets/sprites/obstacle.png";

    r3Obstacle4 = {
        X: 560,
        Y: 240,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r3Obstacle4.sprite.src = "assets/game_assets/sprites/obstacle.png";

    r3Obstacle5 = {
        X: 640,
        Y: 240,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r3Obstacle5.sprite.src = "assets/game_assets/sprites/obstacle.png";

    room1Objects = [miku, dummy, r1Door, r1Lever, r1Obstacle];
    room2Objects = [r2Door, r2Obstacle];
    room3Objects = [r3Door1, r3Door2, r3Door3, r3Lever1, r3Lever2, r3Lever3, r3Lever4, r3Obstacle1, r3Obstacle2, r3Obstacle3, r3Obstacle4, r3Obstacle5];
    room4Objects = [];
    room5Objects = [];
    roomObjects = [room1Objects, room2Objects, room3Objects, room4Objects, room5Objects];

    //
    // Define collision boxes for room 1
    //
    room1Bottom = {
        ID: "r1bottom",
        X: 0,
        Y: canvasSize.H - defaultBorder,
        W: canvasSize.W,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Top1 = {
        ID: "r1top1",
        X: 0,
        Y: 0,
        W: 160,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Top2 = {
        ID: "r1top2",
        X: 240,
        Y: 0,
        W: canvasSize.W - 320,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Left = {
        ID: "r1left",
        X: 0,
        Y: 0,
        W: defaultBorder,
        H: canvasSize.H,
        destructible: false,
        destroyed: false
    };
    room1Right = {
        ID: "r1right",
        X: canvasSize.W - defaultBorder,
        Y: 0,
        W: defaultBorder,
        H: canvasSize.H,
        destructible: false,
        destroyed: false
    };
    room1Wall1 = {
        ID: "r1wall1",
        X: 80,
        Y: 320,
        W: 720,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Wall2 = {
        ID: "r1wall2",
        X: 320,
        Y: 80,
        W: defaultBorder,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Wall3 = {
        ID: "r1wall3",
        X: 320,
        Y: 240,
        W: defaultBorder,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Wall4 = {
        ID: "r1wall4",
        X: 720,
        Y: 80,
        W: defaultBorder,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Wall5 = {
        ID: "r1wall5",
        X: 720,
        Y: 240,
        W: defaultBorder,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };

    //
    // Define room 2
    //
    room2Top = {
        ID: "r2top",
        X: 0,
        Y: 0,
        W: canvasSize.W,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room2Bottom1 = {
        ID: "r2bottom1",
        X: 0,
        Y: canvasSize.H - defaultBorder,
        W: 160,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room2Bottom2 = {
        ID: "r2bottom2",
        X: 240,
        Y: canvasSize.H - defaultBorder,
        W: canvasSize.W - 320,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room2Left1 = {
        ID: "r2left1",
        X: 0,
        Y: 0,
        W: defaultBorder,
        H: 160,
        destructible: false,
        destroyed: false
    };
    room2Left2 = {
        ID: "r2left2",
        X: 0,
        Y: 240,
        W: defaultBorder,
        H: 400,
        destructible: false,
        destroyed: false
    };
    room2Right1 = {
        ID: "r2right1",
        X: canvasSize.W - defaultBorder,
        Y: 0,
        W: defaultBorder,
        H: 320,
        destructible: false,
        destroyed: false
    };
    room2Right2 = {
        ID: "r2right2",
        X: canvasSize.W - defaultBorder,
        Y: 400,
        W: defaultBorder,
        H: 320,
        destructible: false,
        destroyed: false
    };
    room2Center = {
        ID: "r2center",
        X: 0,
        Y: 320,
        W: 720,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };

    //
    // Define room 3
    //
    room3Right1 = {
        ID: "r3right1",
        X: canvasSize.W - 80,
        Y: 0,
        W: defaultBorder,
        H: 160,
        destructible: false,
        destroyed: false
    };
    room3Right2 = {
        ID: "r3right2",
        X: canvasSize.W - 80,
        Y: 240,
        W: defaultBorder,
        H: 400,
        destructible: false,
        destroyed: false
    };
    room3Wall1 = {
        ID: "r3w1",
        X: 480,
        Y: 160,
        W: defaultBorder,
        H: 480,
        destructible: false,
        destroyed: false
    };
    room3Wall2 = {
        ID: "r3w2",
        X: 880,
        Y: 0,
        W: defaultBorder,
        H: 560,
        destructible: false,
        destroyed: false
    };
    room3Wall3 = {
        ID: "r3w3",
        X: 640,
        Y: 480,
        W: 320,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room3Wall4 = {
        ID: "r3w4",
        X: 640,
        Y: 160,
        W: 160,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room3Wall5 = {
        ID: "r3w5",
        X: 640,
        Y: 320,
        W: defaultBorder,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };

    //
    // Define room 4
    //
    room4Left1 = {
        ID: "r4l1",
        X: 0,
        Y: 0,
        W: defaultBorder,
        H: 320,
        destructible: false,
        destroyed: false
    };
    room4Left2 = {
        ID: "r4l2",
        X: 0,
        Y: 400,
        W: defaultBorder,
        H: 320,
        destructible: false,
        destroyed: false
    };

    //
    // Define stage room
    //
    room5Wall1 = {
        ID: "r5w1",
        X: 880,
        Y: 80,
        W: defaultBorder,
        H: 80,
        destructible: false,
        destroyed: false
    };
    room5Wall2 = {
        ID: "r5w1",
        X: 880,
        Y: 560,
        W: defaultBorder,
        H: 80,
        destructible: false,
        destroyed: false
    };

    // Create arrays for walls
    room1Collision = [room1Bottom, room1Left, room1Right, room1Top1, room1Top2, room1Wall1, room1Wall2, room1Wall3, room1Wall4, room1Wall5, miku, dummy, r1Door, r1Obstacle];
    room2Collision = [room2Top, room2Bottom1, room2Bottom2, room2Left1, room2Left2, room2Right1, room2Right2, room2Center];
    room3Collision = [room2Top, room1Bottom, room1Left, room3Right1, room3Right2, room3Wall1, room3Wall2, room3Wall3, room3Wall4, room3Wall5, r3Door1, r3Door2, r3Door3, r3Obstacle1, r3Obstacle2, r3Obstacle3, r3Obstacle4, r3Obstacle5];
    room4Collision = [room2Right1, room2Right2, room2Top, room1Bottom, room4Left1, room4Left2];
    room5Collision = [room4Left1, room4Left2, room1Bottom, room2Top, room1Right, room5Wall1, room5Wall2];
    roomsCollision = [room1Collision, room2Collision, room3Collision, room4Collision, room5Collision];
}