// Game code

// Define logging level
verbose = 0; // 0 - no console logging, 1 - basic console logging, 2 - some console logging, 3 - log everything

// Run game initialization
init()

//
// Main game loop
//
function mainLoop() {
    // Clear last drawn frame
    ctx.clearRect(0, 0, 1280, 720);

    if (bossDefeated) { // Winscreen
        if(winScreenLoc === 0) {
            ctx.drawImage(gameWon1, 0, 0);
            setTimeout(() => {
                winScreenLoc = 1;
            }, 1000);
        } else if (winScreenLoc === 1) {
            ctx.drawImage(gameWon2, 0, 0);
            setTimeout(() => {
                winScreenLoc = 2;
            }, 1000);
        } else if (winScreenLoc === 2) {
            setTimeout(() => {
                winScreenLoc = 3;
            }, 1000);
            ctx.drawImage(gameWon3, 0, 0);
        } else if (winScreenLoc === 3) {
            ctx.drawImage(gameWon4, 0, 0);
        }

    } else {
        // If game hasn't started, draw starting UI
        if (!gameStarted) {
            ctx.drawImage(pressAnyKey, 0, 0);
        }
        if (char.hp === 0) {
            ctx.drawImage(gameOverImg, 0, 0);
        }
        // Otherwise, draw the level
        if (gameStarted && char.hp > 0) {
            ctx.drawImage(roomAsset, 0, 0);

            handle_animation();
            doMovement();
            handle_dmg();
            heal();
            check_savepoint();

            handle_boss();

            // Draw room objects

            roomObjects[room].forEach(drawObjects);
            drawUI();
            drawText();

            if (room !== 4) {
                normalBGMusic.play();
            }

            // Draw player sprite
            ctx.drawImage(char.sprite, char.X, char.Y);
            if (fightStartSequence >= 1) {
                ctx.drawImage(spotlight.sprite, char.X + spotlight.offsetX, char.Y + spotlight.offsetY);
            }
        }
    }
}

// Check if the savepoints been reached, set savepoint if so
function check_savepoint() {
    if (room === 3 && char.X > 960) {
        save1Reached = true;
    }
}

function handle_boss() {
    if (((bossStagger && bossFight) || (bossFight && curtains.destroyed) || !bossFight) && room === 4) {
        ctx.drawImage(curtainsDrawn.sprite, curtainsDrawn.X, curtainsDrawn.Y);
    } // Draw drawn curtains if they should be drawn

    if (!bossFight && room === 4 && char.X > 160) { // Start boss sequence
        bossFight = true;
        r5Obstacle.destroyed = false;

        bossStartSound.play();
        normalBGMusic.pause();

        control = false;
        mikuMoveInterval = setInterval(mikuEnters, 15);

    } else if (mikuInPlace && !bossFightStarted) { // Once Miku is in place
        clearInterval(mikuMoveInterval);
        if (bossDiaStarted === false) {
            attemptInteract();
        }
    }
    if (bossDiaEnded && !bossFightStarted) { // When in the fight proper
        if (bossTicks >= 0 && fightStartSequence === 0) { // Turn on the spotlight
            fightStartSequence++;
            leverSound.play();
            if (verbose > 0) {
                console.log(`Ticks & Sequence: ${bossTicks}, ${fightStartSequence}`);
            }
        } else if (bossTicks >= 25 && fightStartSequence === 1) { // Looking around VV
            fightStartSequence++;
            char.direction = 2;
            char.sprite.src = "assets/game_assets/player/PlayerDown.png";
            if (verbose > 0) {
                console.log(`Ticks & Sequence: ${bossTicks}, ${fightStartSequence}`);
            }
        } else if (bossTicks >= 15 + 25 && fightStartSequence === 2) {
            fightStartSequence++;
            char.direction = 3;
            char.sprite.src = "assets/game_assets/player/PlayerLeft.png";
            if (verbose > 0) {
                console.log(`Ticks & Sequence: ${bossTicks}, ${fightStartSequence}`);
            }
        } else if (bossTicks >= 30 + 25 && fightStartSequence === 3) {
            fightStartSequence++;
            char.direction = 2;
            char.sprite.src = "assets/game_assets/player/PlayerDown.png";
            if (verbose > 0) {
                console.log(`Ticks & Sequence: ${bossTicks}, ${fightStartSequence}`);
            }
        } else if (bossTicks >= 45 + 25 && fightStartSequence === 4) {
            fightStartSequence++;
            char.direction = 1;
            char.sprite.src = "assets/game_assets/player/PlayerRight.png";
            if (verbose > 0) {
                console.log(`Ticks & Sequence: ${bossTicks}, ${fightStartSequence}`);
            }
        } else if (bossTicks >= 50 + 25 && fightStartSequence === 5) { // Curtains close
            fightStartSequence++;
            curtains.destroyed = false;
            if (verbose > 0) {
                console.log(`Ticks & Sequence: ${bossTicks}, ${fightStartSequence}`);
            }
        } else if (bossTicks >= 55 + 25 && fightStartSequence === 6) { // Laugh and start fight
            fightStartSequence++;

            laughSound.play();
            staggerCounter = 0;
            control = true;

            if (verbose > 0) {
                console.log(`Ticks & Sequence: ${bossTicks}, ${fightStartSequence}`);
            }
        } else if (bossTicks >= 60 + 25 && fightStartSequence === 7) {
            bossFightStarted = true;
            attackInterval = setInterval(bossAttack, 5000);
            bossAttack();
        }



        bossTicks++; // Time passed since fight started in 33ms increments
    }

    if (bossFightStarted) {
        bossMusic.play();

        if (bossMiku.hp === 0) {
            endGame();
        }
    }
}

function bossAttack() {
    if (!bossStagger) { // If not in a stagger, pick an attack and execute it
        staggerCounter++;
        switch (Math.floor(Math.random() * 2.999)) {
            case 0:
                if (verbose > 0) {
                    console.log("Throwing fireballs!");
                }
                throwFireballs();
                if (staggerCounter >= 3) { // If three attacks have happened, next will be a stagger
                    bossStagger = true;
                    staggerTimer = 1; // Stagger for this many attack cycles
                    curtains.destroyed = true;
                }
                break;
            case 1:
                if (verbose > 0) {
                    console.log("Summoning enemies!");
                }
                summonEnemies();
                if (staggerCounter >= 3) { // If three attacks have happened, next will be a stagger
                    bossStagger = true;
                    staggerTimer = 1; // Stagger for this many attack cycles
                    curtains.destroyed = true;
                }
                break;
            case 2:
                if (verbose > 0) {
                    console.log("Spawning roses!");
                }
                summonRoses();
                if (staggerCounter >= 3) { // If three attacks have happened, next will be a stagger
                    bossStagger = true;
                    staggerTimer = 1; // Stagger for this many attack cycles
                    curtains.destroyed = true;
                }
                break;
        }

    } else { // If currently staggered, just manage the stagger
        staggerTimer--;
        if (staggerTimer <= 0) {
            bossStagger = false;
            curtains.destroyed = false;
            if (char.X > 810) {
                char.X = 805;
                char.Y = 305;
            }
        }
    }

}

function throwFireballs() {
    for (i = 0; i < Math.floor(Math.random() * 1.999) + 1; i++) {
        newFireball = {
            X: -1,
            Y: -1,
            sprite: new Image(),
            H: 60,
            W: 60,
            interactable: false,
            enemy: true,
            destructible: true,
            hp: 1,
            destroyed: false,
            type: "fireball",
            speed: 10,
            direction: -1
        };
        newFireball.sprite.src = "assets/game_assets/sprites/fireball.png"; // Duplicate fireball

        // Select random X, Y, and direction
        let randomX = Math.floor(Math.random() * 720 - 0.0001) + 90;
        let randomY = Math.floor(Math.random() * canvasSize.H - 160 - 0.0001) + 80;
        let randomDir = Math.floor(Math.random() * 3.999);
        newFireball.direction = randomDir;

        // Set starting positions for the fireball
        if (randomDir === 0) {
            newFireball.Y = canvasSize.H + Math.floor(Math.random() * 30); // Going up, Y = 720 + random offset
            newFireball.X = randomX;
        } else if (randomDir === 1) {
            newFireball.X = 0 - Math.floor(Math.random() * 30) - newFireball.W; // Going right, X = 0 - offset - width
            newFireball.Y = randomY;
        } else if (randomDir === 2) {
            newFireball.Y = 0 - Math.floor(Math.random() * 30) - newFireball.H; // Going down, Y = 0 - random offset - height
            newFireball.X = randomX;
        } else if (randomDir === 3) {
            newFireball.X = canvasSize.W + Math.floor(Math.random() * 30); // Going right, X = 1280 + offset
            newFireball.Y = randomY;
        }

        // Add to array of moving objects
        room5Moving.push(newFireball);
        room5Objects.push(newFireball);
        room5dmgable.push(newFireball);

        if (verbose > 0) {
            console.log(`created fireball @ X/Y ${newFireball.X} / ${newFireball.Y} with dir ${newFireball.direction}`);
        }
    }
}

function summonEnemies() {
    let enemiesToGen = Math.floor(Math.random() * 1.9999) + 1;
    if (verbose > 0) {
        console.log(`Attempting to summon ${enemiesToGen}`);
    }
    for (i = 0; i < enemiesToGen; i++) { // Run for random # of enemies

        let validPlacement = false;
        let randomCoordsX = -1;
        let randomCoordsY = -1;
        let attemptCounter = 0;

        while (!validPlacement) { // Run until valid or it fails
            randomCoordsX = Math.floor(Math.random() * (710 - 80 - 0.0001)) + 80; // Randomly generate X
            randomCoordsY = Math.floor(Math.random() * (550 - 80 - 0.0001)) + 80; // Randomly generate Y
            let isValid = true;

            if (verbose > 1) {
                console.log(`Rose ${i} attempt ${attemptCounter}: X/Y ${randomCoordsX}, ${randomCoordsY}`);
            }

            let collCheckBox = {
                X: randomCoordsX - 30,
                Y: randomCoordsY - 30,
                H: 70 + 60,
                W: 70 + 60,
                destroyed: false
            }

            let charBiggerBox = {
                X: char.X - 30,
                Y: char.Y - 30,
                H: char.H + 30 * 2,
                W: char.W + 30 * 2
            }

            for (n = 0; n < room5Enemies.length; n++) {
                if (checkCollBetween(room5Enemies[n], collCheckBox)) { // Make sure it doesnt overlap other enemies
                    isValid = false;
                }
            }

            if (checkCollBetween(charBiggerBox, collCheckBox)) { // Make sure it doesnt overlap the player
                isValid = false;
            }


            if (isValid) { // Stop running if its either worked or too many attempts have happened
                let newEnemy;
                if (Math.floor(Math.random() * 2.999)) {
                    newEnemy = {
                        X: randomCoordsX,
                        Y: randomCoordsY,
                        sprite: new Image(),
                        H: 70,
                        W: 70,
                        interactable: false,
                        enemy: true,
                        destructible: true,
                        hp: 6,
                        destroyed: false,
                        rangeR: 750,
                        rangeL: 100,
                        rangeU: 80,
                        rangeD: 570,
                        direction: 2,
                        speed: 3,
                        type: "Clown"
                    };
                    newEnemy.sprite.src = "assets/game_assets/non_player/ClownDown.png";
                } else {
                    newEnemy = {
                        X: randomCoordsX,
                        Y: randomCoordsY,
                        sprite: new Image(),
                        H: 70,
                        W: 70,
                        interactable: false,
                        enemy: true,
                        destructible: true,
                        hp: 3,
                        destroyed: false,
                        rangeR: 750,
                        rangeL: 100,
                        rangeU: 80,
                        rangeD: 570,
                        direction: 2,
                        speed: 5,
                        type: "Vamp"
                    };
                    newEnemy.sprite.src = "assets/game_assets/non_player/VampDown.png";
                }

                room5dmgable.push(newEnemy);
                room5Objects.push(newEnemy);
                room5Enemies.push(newEnemy);
                room5Moving.push(newEnemy);

                validPlacement = true;
            }

            attemptCounter++;
            if (attemptCounter >= 15) {
                validPlacement = true;
            }
        }

    }

}

function summonRoses() {
    let rosesToGen = Math.floor(Math.random() * 4.9999) + 1;
    if (verbose > 0) {
        console.log(`Attempting to summon ${rosesToGen} roses`);
    }
    for (i = 0; i < rosesToGen; i++) { // Run for random # of roses

        let validPlacement = false;
        let randomGridX = -1;
        let randomGridY = -1;
        let attemptCounter = 0;

        while (!validPlacement) { // Run until valid or it fails
            randomGridX = Math.floor(Math.random() * (9 - 0.0001)) + 1; // Randomly generate 1 - 10
            randomGridY = Math.floor(Math.random() * (6 - 0.0001)) + 1; // Randomly generate 1 - 7
            let isValid = true;

            if (verbose > 1) {
                console.log(`Rose ${i} attempt ${attemptCounter}: X/Y ${randomGridX}, ${randomGridY}`);
            }

            for (n = 0; n < room5Roses.length; n++) {
                let coordsToCheck = coordsToGrid(room5Roses[n].X, room5Roses[n].Y); // Get grid placement
                if (coordsToCheck.X === randomGridX && coordsToCheck.Y === randomGridY) {
                    isValid = false;
                }
            }
            let collCheckBox = {
                X: randomGridX * 80,
                Y: randomGridY * 80,
                H: 80,
                W: 80,
                destroyed: false
            }

            let charBiggerBox = {
                X: char.X - 30,
                Y: char.Y - 30,
                H: char.H + 30 * 2,
                W: char.W + 30 * 2
            }

            if (checkCollBetween(charBiggerBox, collCheckBox)) { // Make sure it doesnt overlap the player
                isValid = false;
            }

            if (isValid) { // Stop running if its either worked or too many attempts have happened
                let newRose = {
                    X: randomGridX * 80,
                    Y: randomGridY * 80,
                    sprite: new Image(),
                    H: 80,
                    W: 80,
                    interactable: false,
                    enemy: true,
                    destructible: true,
                    hp: 1,
                    destroyed: false,
                    type: "rose"
                };
                newRose.sprite.src = "assets/game_assets/sprites/roses.png";

                room5Roses.push(newRose);
                room5dmgable.push(newRose);
                room5Objects.push(newRose);
                room5Collision.push(newRose);

                validPlacement = true;
            }

            attemptCounter++;
            if (attemptCounter >= 15) {
                validPlacement = true;
            }
        }

    }

}

function endGame() {
    control = false;
    bossMiku.hp = -1;

    setTimeout(() => { // Look down
        char.direction = 2;
        char.sprite.src = "assets/game_assets/player/PlayerDown.png";
    }, 1000);

    setTimeout(() => { // Look back
        char.direction = 1;
        char.sprite.src = "assets/game_assets/player/PlayerRight.png";
    }, 1000);
    setTimeout(() => { // Disable spotlight
        fightStartSequence = -1;
        leverSound.play();
    }, 750);
    setTimeout(() => {
        bossDefeated = true;
        clearInterval(attackInterval);
    }, 1500);


}

function mikuEnters() {
    if (bossMiku.Y < 200) {
        bossMiku.Y += 5;
        if (verbose > 1) {
            console.log(`Miku is at ${bossMiku.Y}`);
        }
        if (bossMiku.Y > 100) {
            laughSound.play();
        }
    } else {
        mikuInPlace = true;
    }

}

function drawUI() {
    let tempHP = char.hp;
    let drawCorner = 980;

    let heartIcon = new Image();
    heartIcon.src = "assets/game_assets/sprites/hearticon.png";
    ctx.drawImage(heartIcon, drawCorner, 5);
    drawCorner += 120;

    let fullImg = new Image();
    fullImg.src = "/assets/game_assets/sprites/fullnote.png";
    let halfImg = new Image();
    halfImg.src = "/assets/game_assets/sprites/halfnote.png";

    while (tempHP > 0) {
        if (tempHP > 1) {
            ctx.drawImage(fullImg, drawCorner, 5);
            drawCorner += 65;
            tempHP -= 2;
        }
        if (tempHP === 1) {
            ctx.drawImage(halfImg, drawCorner, 5);
            tempHP -= 1;
        }
    }
}

// Draw the room's objects
function drawObjects(obj) {
    if (obj.destroyed === false) {
        ctx.drawImage(obj.sprite, obj.X, obj.Y);
    }
}

function drawText() {
    if (dialogue_loc !== 0) {
        ctx.fillStyle = "black";
        //ctx.fillRect(40, 20, 1200, 220);
        ctx.font = "30px Courier New"
        ctx.drawImage(dialogueImg, 40, 20);

        ctx.fillStyle = "white";

        for (i = 0; i < dialogue_text[dialogue_loc].length; i++) {
            if (dialogue_text[dialogue_loc].length <= 2) {
                ctx.fillText(dialogue_text[dialogue_loc][i], 100, 110 + i * 50, 1160);
            } else {
                ctx.fillText(dialogue_text[dialogue_loc][i], 100, 80 + i * 50, 1160);
            }
        }
        if (dialogue_loc === 15 && !bossDiaLaugh) {
            laughSound.play();
            bossDiaLaugh = true;
        }
    }
}

function doMovement() {
    if (roomsMoving[room].length > 0) {
        for (i = 0; i < roomsMoving[room].length; i++) {
            if (!roomsMoving[room][i].destroyed) {
                let movingObj = roomsMoving[room][i];

                if (movingObj.type !== "fireball") { // Handle vampires/clowns

                    let randomDir = -1;

                    let changeDir = false;
                    let noL = false;
                    let noR = false;
                    let noU = false;
                    let noD = false;

                    // If it's near the edge of the range, change the direction
                    if (movingObj.rangeL + 2 * movingObj.speed > movingObj.X) {
                        noL = true;
                        changeDir = true;
                    } else if (movingObj.rangeR - 2 * movingObj.speed < movingObj.X) {
                        noR = true;
                        changeDir = true;
                    } else if (movingObj.rangeU + 2 * movingObj.speed > movingObj.Y) {
                        noU = true;
                        changeDir = true;
                    } else if (movingObj.rangeD - 2 * movingObj.speed < movingObj.Y) {
                        noD = true;
                        changeDir = true;
                    }

                    if (verbose > 2) {
                        console.log(`RangeL: ${movingObj.rangeL + 2 * movingObj.speed < movingObj.X} RangeR: ${movingObj.rangeR - 2 * movingObj.speed > movingObj.X} RangeU: ${movingObj.rangeU + 2 * movingObj.speed < movingObj.Y} RangeD: ${movingObj.rangeD - 2 * movingObj.speed > movingObj.Y}`);
                        console.log(`X/Y: ${movingObj.X} ${movingObj.Y} RangeL: ${movingObj.rangeL + 2 * movingObj.speed} RangeR: ${movingObj.rangeR - 2 * movingObj.speed} RangeU: ${movingObj.rangeU + 2 * movingObj.speed} RangeD: ${movingObj.rangeD - 2 * movingObj.speed}`);
                    }

                    // Run X% chance of changing direction anyway
                    if (Math.random() * 12 < 1) {
                        changeDir = true;
                        if (verbose > 2) {
                            console.log(`Change movement dir randomly!`);
                        }
                    }

                    if (changeDir) {
                        randomDir = Math.floor(Math.random() * 3.999);
                        if (randomDir === 0 && noU) {
                            randomDir = 2;
                        } else if (randomDir === 1 && noR) {
                            randomDir = 3;
                        } else if (randomDir === 2 && noD) {
                            randomDir = 0;
                        } else if (randomDir === 3 && noL) {
                            randomDir = 1;
                        }

                        movingObj.direction = randomDir;

                        switch (randomDir) {
                            case 0:
                                movingObj.sprite.src = `assets/game_assets/non_player/${movingObj.type}Up.png`;
                                break;
                            case 1:
                                movingObj.sprite.src = `assets/game_assets/non_player/${movingObj.type}Right.png`;
                                break;
                            case 2:
                                movingObj.sprite.src = `assets/game_assets/non_player/${movingObj.type}Down.png`;
                                break;
                            case 3:
                                movingObj.sprite.src = `assets/game_assets/non_player/${movingObj.type}Left.png`;
                                break;
                        }

                    }


                }
                // Move obj is direction
                switch (movingObj.direction) {
                    case 0:
                        movingObj.Y -= movingObj.speed;
                        break;
                    case 1:
                        movingObj.X += movingObj.speed;
                        break;
                    case 2:
                        movingObj.Y += movingObj.speed;
                        break;
                    case 3:
                        movingObj.X -= movingObj.speed;
                        break;
                }
                if (verbose > 2) {
                    console.log(`obj ${movingObj.type} moved ${movingObj.direction}`);
                }
            }
        }
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
    } else if (room === 4 && char.X <= 0) {
        room = 3;
        char.X = canvasSize.W - defaultBorder;
    }
    roomAsset.src = `assets/game_assets/rooms/room${room}.png`;
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
        drawRectFromObj(createBoxInFrontOf(char, 50, 50, char.direction));
    }
    // Iterate through the current room's objects
    for (i = 0; i < roomObjects[room].length; i++) {
        // Create a box in front of the player to compare to object distance
        let boxToCheck = createBoxInFrontOf(char, 50, 50, char.direction);

        if (verbose >= 1) {
            console.log("Interaction distance check:" + checkCollBetween(boxToCheck, roomObjects[room][i]) + " Interactable: " + roomObjects[room][i].interactable);
        }

        if (checkCollBetween(boxToCheck, roomObjects[room][i]) && roomObjects[room][i].interactable) {
            if (roomObjects[room][i].interactionID === 0 && control) { // If it's room 1 miku
                if (verbose >= 1) {
                    console.log("initiate miku dialogue");
                }
                control = false;
                dialogue_loc = 1;
            }
            if (roomObjects[room][i].interactionID === 1) { // If it's room 1 lever
                if (!roomObjects[room][i].flipped) {
                    r1Door.destroyed = true;
                    roomObjects[room][i].flipped = true;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_right.png";
                    leverSound.play();
                } else {
                    //r1Door.destroyed = false;
                    //roomObjects[room][i].flipped = false;
                    //roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_left.png";
                }

            }
            if (roomObjects[room][i].interactionID === 2) { // If it's room 3 lever 1
                if (!roomObjects[room][i].flipped) {
                    roomObjects[room][i].flipped = true;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_right.png";

                } else {
                    roomObjects[room][i].flipped = false;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_left.png";
                }
                r3Door3.destroyed = !r3Door3.destroyed;
                leverSound.play();
            }
            if (roomObjects[room][i].interactionID === 3) { // If it's room 3 lever 2
                if (!roomObjects[room][i].flipped) {
                    roomObjects[room][i].flipped = true;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_right.png";
                } else {
                    roomObjects[room][i].flipped = false;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_left.png";
                }
                r3Door2.destroyed = !r3Door2.destroyed;
                r3Door3.destroyed = !r3Door3.destroyed;
                leverSound.play();
            }
            if (roomObjects[room][i].interactionID === 4) { // If it's room 3 lever 3
                if (!roomObjects[room][i].flipped) {
                    roomObjects[room][i].flipped = true;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_right.png";
                } else {
                    roomObjects[room][i].flipped = false;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_left.png";
                }
                r3Door1.destroyed = !r3Door1.destroyed;
                r3Door2.destroyed = !r3Door2.destroyed;
                leverSound.play();
            }
            if (roomObjects[room][i].interactionID === 5) { // If it's room 3 lever 4
                if (!roomObjects[room][i].flipped) {
                    roomObjects[room][i].flipped = true;
                    roomObjects[room][i].sprite.src = "assets/game_assets/sprites/lever_right.png";
                }
                r2Door.destroyed = true;
                leverSound.play();
            }
            if (roomObjects[room][i].interactionID === 6 && !bossDiaStarted) { // If it's room 1 miku
                if (verbose >= 1) {
                    console.log("boss miku dialogue");
                }
                dialogue_loc = 11;
                bossDiaStarted = true;
            }
        }
    }

    // Handle dialogue
    if (dialogue_loc >= 0) {
        dialogue_loc++;
        if (verbose >= 1) {
            console.log("Current dialogue location: " + dialogue_loc);
        }
        if (dialogue_loc === 11 || dialogue_loc === 1 || dialogue_loc === 17) { // 20 IS THE PLACEHOLDER FOR 1 AFTER THE BOSS'S DIALOGUE
            dialogue_loc = 0;
            control = true;
            if (room === 4) {
                bossDiaEnded = true; // Execute pre-fight sequence
                control = false; //Turn this back off
            }
        }
    }
}

// Create an object in front of a given object with given relative width and height
function createBoxInFrontOf(obj, W, H, dir) {
    let newObj = {
        X: -1,
        Y: -1,
        W: -1,
        H: -1,
        direction: dir
    };
    if (obj.direction === 0) {
        newObj.X = obj.X + obj.W / 2 - W / 2;
        newObj.Y = obj.Y - H;
        newObj.W = W;
        newObj.H = H;
    } else if (obj.direction === 1) {
        newObj.X = obj.X + obj.W;
        newObj.Y = obj.Y + obj.H / 2 - W / 2;
        newObj.W = H;
        newObj.H = W;
    } else if (obj.direction === 2) {
        newObj.X = obj.X + obj.W / 2 - W / 2;
        newObj.Y = obj.Y + obj.H;
        newObj.W = W;
        newObj.H = H;
    } else if (obj.direction === 3) {
        newObj.X = obj.X - H;
        newObj.Y = obj.Y + obj.H / 2 - W / 2;
        newObj.W = H;
        newObj.H = W;
    }
    return newObj;
}

// Keypress event function
function KeyDown() {
    if (verbose >= 3) {
        console.log(event.key);
    }
    // Start the game at the first keystroke
    if (!gameStarted) {
        gameStarted = true;
        control = true;
        spawnSound.play();
        normalBGMusic.play();
    } else if (event.key === "d" && (!checkCollision({
        X: char.X + char.speed,
        Y: char.Y,
        H: char.H,
        W: char.W
    })) && control) {     // Handle WASD movement
        char.sprite.src = "assets/game_assets/player/playerRight.png";
        char.direction = 1;
        char.X += char.speed;
    }
    if (event.key === "a" && (!checkCollision({X: char.X - char.speed, Y: char.Y, H: char.H, W: char.W})) && control) {
        char.sprite.src = "assets/game_assets/player/playerLeft.png";
        char.direction = 3;
        char.X -= char.speed;
    }
    if (event.key === "w" && (!checkCollision({X: char.X, Y: char.Y - char.speed, H: char.H, W: char.W})) && control) {
        char.sprite.src = "assets/game_assets/player/playerUp.png";
        char.direction = 0;
        char.Y -= char.speed;
    }
    if (event.key === "s" && (!checkCollision({X: char.X, Y: char.Y + char.speed, H: char.H, W: char.W})) && control) {
        char.sprite.src = "assets/game_assets/player/playerDown.png";
        char.direction = 2;
        char.Y += char.speed;
    }
    if (event.key === "e") {
        attemptInteract();
    }
    if (event.key === "j" && control) {
        melee();
    }
    if (event.key === "k" && control) {
        dodge();
    }
    if (event.key === "r" && char.hp === 0) {
        char.hp = 5;

        if (!save1Reached) {
            room = 0;
            char.X = 965;
            char.Y = 245;
        } else {
            room = 3;
            char.X = 960;
            char.Y = 320;
        }

    }
    if (verbose >= 3) {
        console.log("X: " + char.X + " Y: " + char.Y + ".");
    }
    changeRoom();
}

// Ranged attack
function dodge() {
    // NOT IMPLEMENTED
}

function heal() {
    if (room === 3 && checkCollBetween(r4Heal, char) && !r4Heal.destroyed) {
        r4Heal.destroyed = true;
        char.hp = 5;
        healSound.play();
    } else if (room === 0 && checkCollBetween(r1Heal, char) && !r1Heal.destroyed) {
        r1Heal.destroyed = true;
        char.hp = 5;
        healSound.play();
    }
}

function handle_dmg() {
    if(dummy.invincible > 0) {
        dummy.invincible--
        if(dummy.invincible === 1) {
            dummy.sprite.src = "assets/game_assets/non_player/dummy.png";
        }
    }
    if(bossMiku.invincible > 0) {
        bossMiku.invincible--
        if(bossMiku.invincible === 1) {
            bossMiku.sprite.src = "assets/game_assets/non_player/miku.png";
        }
    }
    if (invincible > 0) { // count i-frames
        if (invincible === 1) {
            char.sprite.src = dmgSpriteTemp;
        }
        invincible--;
    } else if (invincible === 0) { // if no iframes, check for dmg
        roomsdmgable[room].forEach(check_dmg);
    }

}

function check_dmg(obj) {
    // create thin box in every direction of
    let dmg_margin = 7;
    let charBiggerBox = {
        X: char.X - dmg_margin,
        Y: char.Y - dmg_margin,
        H: char.H + dmg_margin * 2,
        W: char.W + dmg_margin * 2
    }

    // if collide with obj, subtract health and set i-frames?
    if (checkCollBetween(charBiggerBox, obj) && !obj.destroyed) {
        if (verbose >= 1) {
            console.log("dmg detected! hp:" + char.hp);
        }
        char.hp -= 1;
        invincible = invinc_def;
        dmgSpriteTemp = char.sprite.src;
        if (char.direction === 0) {
            char.Y += char.speed * 4;
            char.sprite.src = "assets/game_assets/player/PlayerUp_Hurt.png";
        } else if (char.direction === 1) {
            char.X -= char.speed * 4;
            char.sprite.src = "assets/game_assets/player/PlayerRight_Hurt.png";
        } else if (char.direction === 2) {
            char.Y -= char.speed * 4;
            char.sprite.src = "assets/game_assets/player/PlayerBack_Hurt.png";
        } else if (char.direction === 3) {
            char.X += char.speed * 4;
            char.sprite.src = "assets/game_assets/player/PlayerLeft_Hurt.png";
        }
    }

    if (char.hp === 0) {
        gameOverSound.play();
    }
}

// Attack frame animations
function handle_animation() {
    if (charAttackFrame !== 0) {
        charAttackFrame++;
        if (charAttackFrame <= 11) {
            char.sprite.src = char.sprite.src = `assets/game_assets/player/melee/frame${charAttackFrame}.png`;
        } else {
            if (char.direction === 0) {
                char.sprite.src = "assets/game_assets/player/playerUp.png";
            } else if (char.direction === 1) {
                char.sprite.src = "assets/game_assets/player/playerRight.png";
            } else if (char.direction === 2) {
                char.sprite.src = "assets/game_assets/player/playerDown.png";
            } else if (char.direction === 3) {
                char.sprite.src = "assets/game_assets/player/playerLeft.png";
            }
            charAttackFrame = 0;
        }
    }

}

// Melee attack
function melee() {
    if (charAttackFrame === 0) {
        if (verbose >= 1) {
            drawRectFromObj(createBoxInFrontOf(char, 120, 70, char.direction));
        }
        for (i = 0; i < roomObjects[room].length; i++) {

            // Create a box in front of the player to compare to object distance
            let boxToCheck = createBoxInFrontOf(char, 120, 70, char.direction);

            if (verbose >= 1) {
                console.log("Interaction distance check:" + checkCollBetween(boxToCheck, roomObjects[room][i]));
            }

            if (checkCollBetween(boxToCheck, roomObjects[room][i]) && roomObjects[room][i].enemy) {
                roomObjects[room][i].hp--
                if(roomObjects[room][i].type === "theDummy") {
                    roomObjects[room][i].sprite.src = "assets/game_assets/non_player/dummy_hurt.png";
                    roomObjects[room][i].invincible = 10;
                } else if (roomObjects[room][i].type === "miku") {
                    roomObjects[room][i].sprite.src = "assets/game_assets/non_player/miku_hurt.png";
                    roomObjects[room][i].invincible = 10;
                }
                if (roomObjects[room][i].hp <= 0) {
                    roomObjects[room][i].destroyed = true;
                }
                if (verbose >= 1) {
                    console.log("Hit detected! Obj HP: " + roomObjects[room][i].hp);
                }
            }
        }
        charAttackFrame = 1;
        char.sprite.src = `assets/game_assets/player/melee/frame${charAttackFrame}.png`;
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

// Turn X/Y into a 0-15 0-8 grid number
function coordsToGrid(coordX, coordY) {
    return {
        X: Math.floor(coordX / 80),
        Y: Math.floor(coordY / 80)
    }
}

//
// Initialize game
//
function init() {

    // Initialize canvas and 2D context
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    ctx.font = "40px Helvetica";

    // Define sounds
    leverSound = new Audio('assets/game_assets/misc/lever.mp3');
    spawnSound = new Audio('assets/game_assets/misc/spawn.mp3');
    gameOverSound = new Audio('assets/game_assets/misc/game_over.mp3');
    healSound = new Audio('assets/game_assets/misc/heal.mp3');
    bossStartSound = new Audio('assets/game_assets/misc/wayBlocked.mp3');
    laughSound = new Audio('assets/game_assets/misc/laugh.mp3');

    normalBGMusic = new Audio('assets/game_assets/misc/mama.mp3');
    bossMusic = new Audio('assets/game_assets/misc/dead!.mp3');


    // Define game size and default wall border
    canvasSize = {
        W: 1280,
        H: 720
    };
    defaultBorder = 80;

    roomAsset = new Image();
    roomAsset.src = "assets/game_assets/rooms/room0.png";

    // Define game state variables
    gameStarted = false;
    room = 0;
    invincible = 0;
    invinc_def = 30;
    control = false;
    dialogue_loc = 0;
    save1Reached = false;

    // Boss fight variables
    bossFight = false;
    mikuInPlace = false;
    bossDiaStarted = false;
    bossFightStarted = false;
    bossStagger = false;
    bossTicks = 0;
    fightStartSequence = 0;
    bossDiaEnded = false;
    bossDefeated = false;
    attackInterval = 0;
    bossDiaLaugh = false;

    winScreenLoc = 0;


    //Initialize character sprite and sprite
    char = {
        X: 965,
        Y: 245,
        sprite: new Image(),
        H: 70,
        W: 70,
        spriteW: 40,
        spriteH: 50,
        spriteOffsetX: 15,
        spriteOffsetY: 20,
        speed: 8,
        hp: 5,
        direction: 2, // 0-Up 1-Right 2-Down 3-Left
    };
    char.sprite.src = "assets/game_assets/player/playerDown.png";

    dmgSpriteTemp = new Image();

    charAttackFrame = 0;

    defineRooms();

    // Define UI assets
    pressAnyKey = new Image();
    pressAnyKey.src = "assets/game_assets/misc/pressAnyKey.png";

    gameWon1 = new Image();
    gameWon1.src = "assets/game_assets/misc/win1.png";

    gameWon2 = new Image();
    gameWon2.src = "assets/game_assets/misc/win2.png";

    gameWon3 = new Image();
    gameWon3.src = "assets/game_assets/misc/win3.png";

    gameWon4 = new Image();
    gameWon4.src = "assets/game_assets/misc/win4.png";

    gameOverImg = new Image();
    gameOverImg.src = "assets/game_assets/misc/gameover.png";

    dialogueImg = new Image();
    dialogueImg.src = "assets/game_assets/misc/dialogue.png";


    // Define dialogue
    dialogue_text = [["weird mystery text. how did you break the game"], ["you broke the game??"],
        ["oh! hi!!! it's me. hatsune miku."],
        ["If the circle summoned you here then you must be the one…", "you see, there’s a problem. My evil clone has taken over", "these halls and is trying to usurp my time in the spotlight!"],
        [".. why do I have an evil clone?", "Why don’t you have an evil clone?", "Are you jealous?? I could make you one if you help me!"],
        ["Awesome!! I’m glad that’s settled - you help me,", "I help you. You’ll need to know-"],
        ["Yeah I know you’re confused you just got resurrected AGAIN", "that’s why I’m telling you this!!"],
        ["Okay. You see that lever over there? Yeah!", "You can flip those with E. Levers do things."],
        ["This place has gotten sickeningly dangerous too - Debris", "blocks your way and my clone’s minions prowl the halls.", "The rose bushes have always been there,"],
        ["but they definitely also hurt so watch yourself.", "You can keep yourself safe from everything", "by attacking with J."], ["I guess if you perish (AGAIN) in your attempt you’ll", "just end up back here, so good luck!"],
        ["npc ending dialogue (#11) - DOES NOT SHOW"],
        // Boss dialogue here
        ["Oh? You're back again so soon? So eager to die,", "maybe you won't come back again this time."],
        ["What? You look surprised. Did she not tell you how many", "times you've been here? A shame."],
        ["Why are you even trying when you already know how it'll end?", "For her? For yourself? For the sake of the punishment?"],
        ["..."], ["Are you ready, my star? Let's give them", "a performance they won't forget!"],
        ["17 - current boss placeholder ending dialogue"]];

    // Set interval for redrawing
    setInterval(mainLoop, 33);

    // Key listener
    window.addEventListener('keydown', KeyDown);
}


function defineRooms() {

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
    miku.sprite.src = "assets/game_assets/sprites/npc.png";

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
        hp: 999,
        type: "theDummy",
        invincible: 0
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
        destroyed: false,
        flipped: false
    };
    r1Lever.sprite.src = "assets/game_assets/sprites/lever_left.png";

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

    r1rose1 = {
        X: 240,
        Y: 400,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r1rose1.sprite.src = "assets/game_assets/sprites/roses.png";

    r1rose2 = {
        X: 240,
        Y: 480,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r1rose2.sprite.src = "assets/game_assets/sprites/roses.png";

    r1rose3 = {
        X: 240,
        Y: 560,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r1rose3.sprite.src = "assets/game_assets/sprites/roses.png";

    r1Heal = {
        X: 485,
        Y: 165,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: true,
        destroyed: false
    };
    r1Heal.sprite.src = "assets/game_assets/sprites/heal.png";


    // Room 2
    r2clown = {
        X: 565,
        Y: 485,
        sprite: new Image(),
        H: 70,
        W: 70,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 6,
        destroyed: false,
        rangeR: 970,
        rangeL: 80,
        rangeU: 400,
        rangeD: 570,
        direction: 2,
        speed: 3,
        type: "Clown"
    };
    r2clown.sprite.src = "assets/game_assets/non_player/ClownDown.png";

    r2vamp = {
        X: 565,
        Y: 165,
        sprite: new Image(),
        H: 70,
        W: 70,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 3,
        destroyed: false,
        rangeR: 970,
        rangeL: 160,
        rangeU: 80,
        rangeD: 250,
        direction: 2,
        speed: 5,
        type: "Vamp"
    };
    r2vamp.sprite.src = "assets/game_assets/non_player/VampDown.png";

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

    r2rose1 = {
        X: 1040,
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
    r2rose1.sprite.src = "assets/game_assets/sprites/roses.png";

    r2rose2 = {
        X: 1040,
        Y: 560,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r2rose2.sprite.src = "assets/game_assets/sprites/roses.png";

    r2rose3 = {
        X: 1120,
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
    r2rose3.sprite.src = "assets/game_assets/sprites/roses.png";

    r2rose4 = {
        X: 1120,
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
    r2rose4.sprite.src = "assets/game_assets/sprites/roses.png";

    r2rose5 = {
        X: 1120,
        Y: 480,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r2rose5.sprite.src = "assets/game_assets/sprites/roses.png";

    r2rose6 = {
        X: 1120,
        Y: 560,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r2rose6.sprite.src = "assets/game_assets/sprites/roses.png";

    // Room 3
    r3clown = {
        X: 245,
        Y: 325,
        sprite: new Image(),
        H: 70,
        W: 70,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 6,
        destroyed: false,
        rangeR: 410,
        rangeL: 80,
        rangeU: 80,
        rangeD: 510,
        direction: 2,
        speed: 3,
        type: "Clown"
    };
    r3clown.sprite.src = "assets/game_assets/non_player/ClownDown.png";

    r3rose = {
        X: 560,
        Y: 320,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false
    };
    r3rose.sprite.src = "assets/game_assets/sprites/roses.png";

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
        destroyed: false,
        flipped: false
    };
    r3Lever1.sprite.src = "assets/game_assets/sprites/lever_left.png";

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
        destroyed: false,
        flipped: false
    };
    r3Lever2.sprite.src = "assets/game_assets/sprites/lever_left.png";

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
        destroyed: false,
        flipped: false
    };
    r3Lever3.sprite.src = "assets/game_assets/sprites/lever_left.png";

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
    r3Lever4.sprite.src = "assets/game_assets/sprites/lever_left.png";

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

    // Room 4
    r4Heal = {
        X: 1125,
        Y: 325,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: true,
        destroyed: false
    };
    r4Heal.sprite.src = "assets/game_assets/sprites/heal.png";

    r4clown1 = {
        X: 645,
        Y: 245,
        sprite: new Image(),
        H: 70,
        W: 70,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 6,
        destroyed: false,
        rangeR: 880,
        rangeL: 160,
        rangeU: 160,
        rangeD: 490,
        direction: 2,
        speed: 3,
        type: "Clown"
    };
    r4clown1.sprite.src = "assets/game_assets/non_player/ClownDown.png";

    r4clown2 = {
        X: 645,
        Y: 405,
        sprite: new Image(),
        H: 70,
        W: 70,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 6,
        destroyed: false,
        rangeR: 880,
        rangeL: 160,
        rangeU: 160,
        rangeD: 490,
        direction: 2,
        speed: 3,
        type: "Clown"
    };
    r4clown1.sprite.src = "assets/game_assets/non_player/ClownDown.png";

    // Room 5
    r5Obstacle = {
        X: 0,
        Y: 320,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        hp: 1,
        destroyed: true,
        type: "obstacle"
    };
    r5Obstacle.sprite.src = "assets/game_assets/sprites/wall.png";

    r5rose1 = {
        X: 720,
        Y: 160,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false,
        type: "rose"
    };
    r5rose1.sprite.src = "assets/game_assets/sprites/roses.png";

    r5rose2 = {
        X: 720,
        Y: 480,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false,
        type: "rose"
    };
    r5rose2.sprite.src = "assets/game_assets/sprites/roses.png";

    r5rose3 = {
        X: 640,
        Y: 240,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false,
        type: "rose"
    };
    r5rose3.sprite.src = "assets/game_assets/sprites/roses.png";

    r5rose4 = {
        X: 640,
        Y: 400,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false,
        type: "rose"
    };
    r5rose4.sprite.src = "assets/game_assets/sprites/roses.png";

    r5rose5 = {
        X: 560,
        Y: 320,
        sprite: new Image(),
        H: 80,
        W: 80,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 1,
        destroyed: false,
        type: "rose"
    };
    r5rose5.sprite.src = "assets/game_assets/sprites/roses.png";

    bossMiku = {
        X: 1040,
        Y: 0 - 240,
        sprite: new Image(),
        H: 240,
        W: 160,
        interactable: false,
        enemy: true,
        destructible: true,
        hp: 20,
        destroyed: false,
        direction: 2,
        speed: 5,
        type: "miku"
    };
    bossMiku.sprite.src = "assets/game_assets/non_player/miku.png";

    dummyBossInteract = {
        X: 165 + 80,
        Y: 0,
        sprite: new Image(),
        H: canvasSize.H,
        W: 160,
        interactable: true,
        enemy: false,
        destructible: false,
        hp: 1,
        destroyed: false,
        type: "helper",
        interactionID: 6
    };

    curtains = {
        X: 880,
        Y: 160,
        sprite: new Image(),
        H: 400,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        hp: 999,
        destroyed: true,
        type: "curtains"
    }
    curtains.sprite.src = "assets/game_assets/rooms/curtains.png";

    curtainsDrawn = {
        X: 873,
        Y: 160,
        sprite: new Image(),
        H: 400,
        W: 80,
        interactable: false,
        enemy: false,
        destructible: false,
        hp: 999,
        destroyed: false,
        type: "curtainsDrawn"
    }
    curtainsDrawn.sprite.src = "assets/game_assets/rooms/curtainsDrawn.png";

    spotlight = {
        sprite: new Image(),
        H: 326,
        W: 240,
        offsetX: char.W / 2 - 240 / 2,
        offsetY: char.H - 326 + 60
    };
    spotlight.sprite.src = "assets/game_assets/rooms/spotlight_red.png";

    room1Objects = [miku, dummy, r1Door, r1Lever, r1Obstacle, r1rose1, r1rose2, r1rose3, r1Heal];
    room2Objects = [r2Door, r2Obstacle, r2rose1, r2rose2, r2rose3, r2rose4, r2rose5, r2rose6, r2clown, r2vamp];
    room3Objects = [r3clown, r3rose, r3Door1, r3Door2, r3Door3, r3Lever1, r3Lever2, r3Lever3, r3Lever4, r3Obstacle1, r3Obstacle2, r3Obstacle3, r3Obstacle4, r3Obstacle5];
    room4Objects = [r4Heal, r4clown1, r4clown2];
    room5Objects = [bossMiku, r5rose1, r5rose2, r5rose3, r5rose4, r5rose5, r5Obstacle, dummyBossInteract, curtains];
    roomObjects = [room1Objects, room2Objects, room3Objects, room4Objects, room5Objects];

    room1dmgable = [r1rose1, r1rose2, r1rose3];
    room2dmgable = [r2rose1, r2rose2, r2rose3, r2rose4, r2rose5, r2rose6, r2clown, r2vamp];
    room3dmgable = [r3clown, r3rose];
    room4dmgable = [r4clown1, r4clown2];
    room5dmgable = [r5rose1, r5rose2, r5rose3, r5rose4, r5rose5]
    roomsdmgable = [room1dmgable, room2dmgable, room3dmgable, room4dmgable, room5dmgable];

    room1Moving = [];
    room2Moving = [r2clown, r2vamp];
    room3Moving = [r3clown];
    room4Moving = [r4clown1, r4clown2];
    room5Moving = [];
    roomsMoving = [room1Moving, room2Moving, room3Moving, room4Moving, room5Moving];

    room5Roses = [r5rose1, r5rose2, r5rose3, r5rose4, r5rose5];

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
        W: 150,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room1Top2 = {
        ID: "r1top2",
        X: 250,
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
        H: defaultBorder - 10,
        destructible: false,
        destroyed: false
    };
    room1Wall3 = {
        ID: "r1wall3",
        X: 320,
        Y: 240 + 10,
        W: defaultBorder,
        H: defaultBorder - 10,
        destructible: false,
        destroyed: false
    };
    room1Wall4 = {
        ID: "r1wall4",
        X: 720,
        Y: 80,
        W: defaultBorder,
        H: defaultBorder - 10,
        destructible: false,
        destroyed: false
    };
    room1Wall5 = {
        ID: "r1wall5",
        X: 720,
        Y: 240 + 10,
        W: defaultBorder,
        H: defaultBorder - 10,
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
        W: 150,
        H: defaultBorder,
        destructible: false,
        destroyed: false
    };
    room2Bottom2 = {
        ID: "r2bottom2",
        X: 250,
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
        H: 150,
        destructible: false,
        destroyed: false
    };
    room2Left2 = {
        ID: "r2left2",
        X: 0,
        Y: 250,
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
        H: 310,
        destructible: false,
        destroyed: false
    };
    room2Right2 = {
        ID: "r2right2",
        X: canvasSize.W - defaultBorder,
        Y: 410,
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
        H: 150,
        destructible: false,
        destroyed: false
    };
    room3Right2 = {
        ID: "r3right2",
        X: canvasSize.W - 80,
        Y: 250,
        W: defaultBorder,
        H: 400,
        destructible: false,
        destroyed: false
    };
    room3Wall1 = {
        ID: "r3w1",
        X: 480,
        Y: 160,
        W: defaultBorder - 10,
        H: 480,
        destructible: false,
        destroyed: false
    };
    room3Wall2 = {
        ID: "r3w2",
        X: 890,
        Y: 0,
        W: defaultBorder - 10,
        H: 550,
        destructible: false,
        destroyed: false
    };
    room3Wall3 = {
        ID: "r3w3",
        X: 650,
        Y: 490,
        W: 320 - 10,
        H: defaultBorder - 20,
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
        H: 310,
        destructible: false,
        destroyed: false
    };
    room4Left2 = {
        ID: "r4l2",
        X: 0,
        Y: 410,
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

    room5Enemies = [];

    // Create arrays for walls
    room1Collision = [room1Bottom, room1Left, room1Right, room1Top1, room1Top2, room1Wall1, room1Wall2, room1Wall3, room1Wall4, room1Wall5, miku, dummy, r1Door, r1Obstacle, r1rose1, r1rose2, r1rose3];
    room2Collision = [room2Top, room2Bottom1, room2Bottom2, room2Left1, room2Left2, room2Right1, room2Right2, room2Center, r2rose1, r2rose2, r2rose3, r2rose4, r2rose5, r2rose6];
    room3Collision = [r3rose, room2Top, room1Bottom, room1Left, room3Right1, room3Right2, room3Wall1, room3Wall2, room3Wall3, room3Wall4, room3Wall5, r3Door1, r3Door2, r3Door3, r3Obstacle1, r3Obstacle2, r3Obstacle3, r3Obstacle4, r3Obstacle5];
    room4Collision = [room2Right1, room2Right2, room2Top, room1Bottom, room4Left1, room4Left2];
    room5Collision = [room4Left1, room4Left2, room1Bottom, room2Top, room1Right, room5Wall1, room5Wall2, r5Obstacle, r5rose1, r5rose2, r5rose3, r5rose4, r5rose5, curtains];
    roomsCollision = [room1Collision, room2Collision, room3Collision, room4Collision, room5Collision];

    for (i = 1; i < 15; i++) {
        roseObj1 = {
            X: i * 80,
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
        roseObj1.sprite.src = "assets/game_assets/sprites/roses.png";
        roseObj2 = {
            X: i * 80,
            Y: 560,
            sprite: new Image(),
            H: 80,
            W: 80,
            interactable: false,
            enemy: true,
            destructible: true,
            hp: 1,
            destroyed: false
        };
        roseObj2.sprite.src = "assets/game_assets/sprites/roses.png";
        room4Objects.push(roseObj1, roseObj2);
        room4Collision.push(roseObj1, roseObj2);
        room4dmgable.push(roseObj1, roseObj2);
    }

    for (i = 1; i < 11; i++) {
        roseObj1 = {
            X: i * 80,
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
        roseObj1.sprite.src = "assets/game_assets/sprites/roses.png";
        roseObj2 = {
            X: i * 80,
            Y: 560,
            sprite: new Image(),
            H: 80,
            W: 80,
            interactable: false,
            enemy: true,
            destructible: true,
            hp: 1,
            destroyed: false
        };
        roseObj2.sprite.src = "assets/game_assets/sprites/roses.png";

        room5Objects.push(roseObj1, roseObj2);
        room5Collision.push(roseObj1, roseObj2);
        room5dmgable.push(roseObj1, roseObj2);
        room5Roses.push(roseObj1, roseObj2);
    }
}