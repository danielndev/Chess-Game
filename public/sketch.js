
let width;
let height;

let pieces;
let selected = null;

let r;
let b;
let g;

const TESTING = false;

let isWhite = true;
function preload(){
    console.log(publicUrl + "pieces/b_bishop.png")
    pieces  = {
        b: [
            loadImage(publicUrl + "pieces/b_pawn.png"),
            loadImage(publicUrl + "pieces/b_rook.png"),
            loadImage(publicUrl + "pieces/b_knight.png"),
            loadImage(publicUrl + "pieces/b_bishop.png"),
            loadImage(publicUrl + "pieces/b_queen.png"),
            loadImage(publicUrl + "pieces/b_king.png"),             
        ],
        w: [
            loadImage(publicUrl + "pieces/w_pawn.png"),
            loadImage(publicUrl + "pieces/w_rook.png"),
            loadImage(publicUrl + "pieces/w_knight.png"),
            loadImage(publicUrl + "pieces/w_bishop.png"),
            loadImage(publicUrl + "pieces/w_queen.png"),
            loadImage(publicUrl + "pieces/w_king.png"),  
        ]    
    }
}

function setup() {
    r = createSlider(0, 255, 255);
    g = createSlider(0, 255, 100);
    b = createSlider(0, 255, 0);
    width = windowWidth;
    height = windowHeight;
    canvas = createCanvas(width, height);

    startTheGame();
}

let justClicked = false;
let mouseClick = false;
function draw() { 
    if(!justClicked && mouseIsPressed){
        justClicked = true;
        mouseClick = true;
    }else if(justClicked){
        mouseClick = false;
    }
    if(!mouseIsPressed){
        justClicked = false;
    }

    background(220);

    if(!TESTING){
        if(currentRoom == null){
            mainMenu();
        }else if(!gameStarted){
            lobby();
        }else{
            game();
        }
    }else{
        game();
    }
    

}

let mainMenuSection = 0;
let code = "";

//Menu sections
function mainMenu(){    
    let buttonWidth = width / 4;
    let buttonHeight = 75;

    //Create Room Button
    textSize(32);
    textAlign(CENTER, CENTER)


    if(mainMenuSection == 0){
        textSize(24);
        uiButton((width / 2) - (buttonWidth * 0.75) / 2, 100, buttonWidth * 0.75, buttonHeight * 0.75, "Username: " + username, () => {
            let tempUserName = prompt("Enter Username: ");
            if(tempUserName){
                username = tempUserName;
            }
        })

         //Create Room button
        uiButton((width / 2) - buttonWidth / 2, 200, buttonWidth, buttonHeight, "Create Room", () => {
            createRoom();
        })
    
        uiButton((width / 2) - buttonWidth / 2, 300, buttonWidth, buttonHeight, "Join Room", () => {
            mainMenuSection = 1;
        })
    }else if(mainMenuSection == 1){
        textSize(24);

        uiButton(50, 50, 150, 50, "Back", () => {
            mainMenuSection = 0;
        })

        textSize(32);

        uiButton((width / 2) - buttonWidth / 2, 100, buttonWidth, buttonHeight, "Join Room", () => {
            if(code.length == 6){
                joinRoom(code);
            }
            
        })

        textSize(48);

        uiButton((width / 2) - (buttonWidth* 1.25) / 2, 200, buttonWidth * 1.25, buttonHeight, code, () => {
            
        })

        uiButton((width / 2) - (buttonWidth* 1.25) / 2 + (buttonWidth* 1.25) + 25, 200, buttonWidth / 4, buttonHeight, "<-", () => {
            code = code.slice(0, -1);
        })

        //Numberpad
        let numpadSize = width / 4;
        let gap = 6;
        let counter = 9;
        for(let i = 0; i < 3; i ++){
            for(let j = 2; j >= 0; j --){
                uiButton((width / 2) - numpadSize / 2 + j * numpadSize / 3 + gap / 2, 300 + i * numpadSize / 3 + gap / 2, numpadSize / 3 - gap, numpadSize / 3 - gap, counter, () => {
                    code += counter;
                })
                counter --;
            }
        }
        
        uiButton((width / 2) - numpadSize / 2 + numpadSize / 3 + gap / 2, 300 + 3 * numpadSize / 3 + gap / 2, numpadSize / 3 - gap, numpadSize / 3 - gap, 0, () => {
            code += counter;
        })
    }
}

function lobby(){
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Lobby", width / 2, 50);
    textSize(24);
    text("Code: " + currentRoom, width / 2, 100);

    let playerBoxWidth = width / 4;
    let playerBoxHeight = 75;


    //Ready up button
    uiButton((width / 2) - playerBoxWidth / 2, 150, playerBoxWidth / 2 - 2, playerBoxHeight / 2,findPlayerInfo(SOCKETID).ready ? "Unready" : "Ready", () =>{
        readyUp(!findPlayerInfo(SOCKETID).ready);
    })

    //Start Button
    if(playersInRoom.length > 0 && playersInRoom[0].id == SOCKETID && allReady()){
        uiButton((width / 2) + 2, 150, playerBoxWidth / 2, playerBoxHeight / 2, "Start", () =>{
            startGame();
        })
    }
   
    for(let i = 0; i < playersInRoom.length; i ++){
        rect((width / 2) - playerBoxWidth / 2, 200 + i * (playerBoxHeight + 25), playerBoxWidth, playerBoxHeight);
        textSize(24);
        textAlign(LEFT, CENTER);
        text(playersInRoom[i].username, (width / 2) - playerBoxWidth / 2 + 10, 200 + (playerBoxHeight / 2) + i * (playerBoxHeight + 25));
        textAlign(RIGHT, CENTER);
        text(playersInRoom[i].ready ? "Ready" : "Unready", (width / 2) - playerBoxWidth / 2 + playerBoxWidth - 10, 200 + (playerBoxHeight / 2) + i * (playerBoxHeight + 25));
    }
}

function allReady(){
    for(let i = 0; i < playersInRoom.length; i ++){
        if(playersInRoom[i].ready == false){
            return false
        }
    }
    return true;
}

function findPlayerInfo(id){
    for(let i = 0; i < playersInRoom.length; i ++){
        if(playersInRoom[i].id == id){
            return playersInRoom[i];
        }
    }
    return null;
}

function uiButton(x, y, w, h, innerText, callback){
    rect(x, y, w, h);

    text(innerText, x + w / 2, y + h / 2);

    if(mouseClick){
        if(mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h){
            callback();
        }
    }
}

//Game logic

function startTheGame(){
    for(let i = 0; i < playersInRoom.length; i ++){
        if(playersInRoom[i].id == SOCKETID){
            isWhite = playersInRoom[i].white;
            console.log(isWhite)
        }
    }

    boardState = [];
    for(let i = 0; i < 8; i ++){
        boardState.push([]);
        for(let j = 0; j < 8; j ++){
            let piece = null;
            let pieceIndex = null;

            if(j == 1){
                team = 1;
                piece = 0;
                pieceIndex = 0;
            }else if(j == 6){
                team = 0;
                piece = 0;
                pieceIndex = 0;
            }else if(j == 0){
                if(i == 0 || i == 7){
                    team = 1;
                    piece = 1;
                    pieceIndex = 1;
                } else if(i == 1 || i == 6){
                    team = 1;
                    piece = 2;
                    pieceIndex = 2;
                }else if(i == 2 || i == 5){
                    team = 1;
                    piece = 3;
                    pieceIndex = 3;
                }else if(i == 3){
                    team = 1;
                    piece = 4;
                    pieceIndex = 4;
                }else{
                    team = 1;
                    piece = 5;
                    pieceIndex = 5;
                }
            }else if(j == 7){
                if(i == 0 || i == 7){
                    team = 0;
                    piece = 1;
                    pieceIndex = 1;
                } else if(i == 1 || i == 6){
                    team = 0;
                    piece = 2;
                    pieceIndex = 2;
                }else if(i == 2 || i == 5){
                    team = 0;
                    piece = 3;
                    pieceIndex = 3;
                }else if(i == 3){
                    team = 0;
                    piece = 4;
                    pieceIndex = 4;
                }else{
                    team = 0;
                    piece = 5;
                    pieceIndex = 5;
                }
            }
            boardState[i].push({
                team: team,
                piece: piece,
                pieceIndex: pieceIndex,
                selectedState: 0,
                timesMoved: 0
            })
        }
    }
}

function drawBoard(){
    background(200);
    stroke(0)
    fill(0)
    textAlign(LEFT)
    text(isWhite ? "White" : "Black", 10, 50);
    let gridSize = 100;
    let pieceSize = 5 * gridSize / 8;

    let boardPositionX = (windowWidth - gridSize*8) / 2
    let boardPositionY = (windowHeight - gridSize*8) / 2
    for(let i = 0; i < boardState.length; i ++){
        for(let j = 0; j < boardState.length; j ++){
            noStroke();

            fill((i + j) % 2 == 0? 0:255);
            uiButton(boardPositionX + i*gridSize, boardPositionY + j*gridSize, gridSize, gridSize, "", () => {
                console.log(selected, turnNum % 2 == 1 && isWhite)
                if((turnNum % 2 == 1 && isWhite) || (turnNum % 2 == 0 && !isWhite)){
                    if(selected != null && boardState[i][j].selectedState == 2){
                        movePiece(i, j);
                        if(TESTING){
                            ////FOR TEST PURPOSES SWAP BETWEEN BLACK AND WHITE//////////////////////////////
                            isWhite = !isWhite;
                            turnNum ++;
                        }
                        

                    }else if(isWhite && boardState[i][j].team == 0 || !isWhite && boardState[i][j].team == 1){
                        selectSquare(i, j);
                        
                    }
                } 
            });

            textSize(42)

            if(boardState[i][j].piece != null){
                let im = boardState[i][j].team == 0 ? pieces.w[boardState[i][j].piece] : pieces.b[boardState[i][j].piece];
                image(im,(gridSize-pieceSize) / 2 + boardPositionX + i*gridSize,(gridSize-pieceSize) / 2 + boardPositionY + j*gridSize, pieceSize, pieceSize);
            }

            //Is selected
           
            if(boardState[i][j].selectedState == 2){
                fill(`rgba(${r.value()},${g.value()},${b.value()},0.6)`);
                rect(boardPositionX + i*gridSize + 2, boardPositionY + j*gridSize + 2, gridSize - 4, gridSize - 4, gridSize / 10);
            }
        }
    }
    if(selected != null){
        strokeWeight(2)
        stroke(255, 150, 0)
        noFill();
        rect(boardPositionX + selected[0]*gridSize, boardPositionY + selected[1]*gridSize, gridSize, gridSize);
    }
}

function selectSquare(x, y){
    for(let i = 0; i < boardState.length; i ++){
        for(let j = 0; j < boardState[i].length; j ++){
            boardState[i][j].selectedState = 0;   
        }
    }

    if(boardState[x][y].piece != null){     
        selected = [x, y];
        boardState[x][y].selectedState = 1;
        console.log(boardState[x][y])
        calculatePossibleMoves(x, y, boardState[x][y].piece)
        
    }else{
        selected = null;
    }


    
}

function movePiece(x, y){
    boardState[x][y].piece = boardState[selected[0]][selected[1]].piece;
    boardState[x][y].team = boardState[selected[0]][selected[1]].team;
    boardState[x][y].pieceIndex = boardState[selected[0]][selected[1]].pieceIndex;
    boardState[x][y].timesMoved = boardState[selected[0]][selected[1]].timesMoved + 1;

    boardState[selected[0]][selected[1]].piece = null;
    boardState[selected[0]][selected[1]].team = null;
    boardState[selected[0]][selected[1]].pieceIndex = null;
    boardState[selected[0]][selected[1]].timesMoved = null;

    if(boardState[x][y].specialMove != null){
        boardState[x][y].specialMove();
    }

    for(let i = 0; i < boardState.length; i ++){
        for(let j = 0; j < boardState[i].length; j ++){
            boardState[i][j].selectedState = 0;
            boardState[i][j].specialMove = null;
        }
    }
    

    if(boardState[x][y].piece == 0 && Math.abs(y - selected[1]) == 2 ){
        console.log("Special", y - Math.sign(y - selected[1]))
        boardState[x][y - Math.sign(y - selected[1])].specialMove = () => {
            boardState[x][y].piece = null;
            boardState[x][y].team = null;
            boardState[x][y].pieceIndex = null;
            boardState[x][y].timesMoved = null;
        }
    }

    selected = null;

    checkGameOver();
    updateBoardState(boardState);
}

function calculatePossibleMoves(x, y, pieceIndex){
    console.log(pieceIndex)
    /**
     * 0 = pawn
     * 1 = rook
     * 2 = knight
     * 3 = bishop
     * 4 = king
     * 5 = queen
     */
    switch(pieceIndex){
        case(0):
            pawn(x, y);       
            break;
        case(1):
            rook(x, y);
            break;
        case(2):
            knight(x, y);
            break;
        case(3):
            bishop(x, y);
            break;
        case(4):
            queen(x, y);
            break;
        case(5):
            king(x, y);
    }
}

//Piece movements
function pawn(x, y){
    if(boardState[x][y].team == 1){
        if(y < 7){
            if(boardState[x][y + 1].piece == null){
                boardState[x][y + 1].selectedState = 2; 
            }
            if(x > 0){
                if((boardState[x - 1][y + 1].piece != null && boardState[x - 1][y + 1].team == 0) || boardState[x - 1][y + 1].specialMove != null){
                    boardState[x - 1][y + 1].selectedState = 2; 
                }
            }
            if(x < 7){
                if((boardState[x + 1][y + 1].piece != null && boardState[x + 1][y + 1].team == 0) || boardState[x + 1][y + 1].specialMove != null){
                    boardState[x + 1][y + 1].selectedState = 2; 
                }
            }
        }
        if(y + 1 == 7){
            console.log("Upgrade Pawn")
            boardState[x][y + 1].specialMove = () => {
                console.log("Upgrade Pawn")
                boardState[x][y + 1].piece = 4;
                boardState[x][y + 1].pieceIndex = 4;
            };
            if(x > 0)boardState[x - 1][y + 1].specialMove = () => {
                console.log("Upgrade Pawn")
                boardState[x - 1][y + 1].piece = 4;
                boardState[x - 1][y + 1].pieceIndex = 4;
            };
            if(x < 7)boardState[x + 1][y + 1].specialMove = () => {
                console.log("Upgrade Pawn")
                boardState[x + 1][y + 1].piece = 4;
                boardState[x + 1][y + 1].pieceIndex = 4;
            };
        }
        if(boardState[x][y].timesMoved == 0 && y < 6){
            boardState[x][y + 2].selectedState = 2; 
        }
    }else{
        if(y > 0){
            if(boardState[x][y - 1].piece == null){
                boardState[x][y - 1].selectedState = 2; 
            }
        
            if(x > 0){
                if((boardState[x - 1][y - 1].piece != null && boardState[x - 1][y - 1].team == 1) || boardState[x - 1][y - 1].specialMove != null){
                    boardState[x - 1][y - 1].selectedState = 2; 
                }
            }
            if(x < 7){
                if((boardState[x + 1][y - 1].piece != null && boardState[x + 1][y - 1].team == 1) || boardState[x + 1][y - 1].specialMove != null){
                    boardState[x + 1][y - 1].selectedState = 2;
                } 
            }
        }
        if(y - 1 == 0){
            console.log("Upgrade Pawn")
            boardState[x][y - 1].specialMove = () => {
                console.log("Upgrade Pawn")
                boardState[x][y - 1].piece = 4;
                boardState[x][y - 1].pieceIndex = 4;
            };
            if(x > 0)boardState[x - 1][y - 1].specialMove = () => {
                console.log("Upgrade Pawn")
                boardState[x - 1][y - 1].piece = 4;
                boardState[x - 1][y - 1].pieceIndex = 4;
            };
            if(x < 7)boardState[x + 1][y - 1].specialMove = () => {
                console.log("Upgrade Pawn")
                boardState[x + 1][y - 1].piece = 4;
                boardState[x + 1][y - 1].pieceIndex = 4;
            };
        }
        if(boardState[x][y].timesMoved == 0 && y > 1){
            boardState[x][y - 2].selectedState = 2; 
        }
    }
}

function rook(x, y){  
    if(x < 7){     
        for(let i = x + 1; i < 8; i ++){
            if(boardState[i][y].piece == null){
                boardState[i][y].selectedState = 2;
            }else if(boardState[i][y].team != boardState[x][y].team){
                boardState[i][y].selectedState = 2;
                break;
            }else{
                break;
            }
        }
    }
    if(x > 0){
        for(let i = x - 1; i >= 0; i --){
            if(boardState[i][y].piece == null){
                boardState[i][y].selectedState = 2;
            }else if(boardState[i][y].team != boardState[x][y].team){
                boardState[i][y].selectedState = 2;
                break;
            }else{
                break;
            }
        }
    }
    if(y < 7){
        for(let j = y + 1; j < 8; j ++){  
            if(boardState[x][j].piece == null){
                boardState[x][j].selectedState = 2;
            }else if(boardState[x][j].team != boardState[x][y].team){
                boardState[x][j].selectedState = 2;
                break;
            }else{
                break;
            }
        }
    }
    if(y > 0){
        for(let j = y - 1; j >= 0; j --){
            if(boardState[x][j].piece == null){
                boardState[x][j].selectedState = 2;
            }else if(boardState[x][j].team != boardState[x][y].team){
                boardState[x][j].selectedState = 2;
                break;
            }else{
                break;
            }
        }
    }

    
}

function knight(x, y){
    if(x + 2 < 8 && y + 1 < 8){
        if(boardState[x + 2][y + 1].piece == null || boardState[x + 2][y + 1].team != boardState[x][y].team){
            boardState[x + 2][y + 1].selectedState = 2;
        }
    }
    if(x + 1 < 8 && y + 2 < 8){
        if(boardState[x + 1][y + 2].piece == null || boardState[x + 1][y + 2].team != boardState[x][y].team){
            boardState[x + 1][y + 2].selectedState = 2;
        }
    }
    if(x - 2 > 0 && y + 1 < 8){
        if(boardState[x - 2][y + 1].piece == null || boardState[x - 2][y + 1].team != boardState[x][y].team){
            boardState[x - 2][y + 1].selectedState = 2;
        }
    }
    if(x - 1 > 0 && y + 2 < 8){
        if(boardState[x - 1][y + 2].piece == null || boardState[x - 1][y + 2].team != boardState[x][y].team){
            boardState[x - 1][y + 2].selectedState = 2;
        }
    }

    if(x + 2 < 8 && y - 1 >= 0){
        if(boardState[x + 2][y - 1].piece == null || boardState[x + 2][y - 1].team != boardState[x][y].team){
            boardState[x + 2][y - 1].selectedState = 2;
        }
    }
    if(x + 1 < 8 && y - 2 >= 0){
        if(boardState[x + 1][y - 2].piece == null || boardState[x + 1][y - 2].team != boardState[x][y].team){
            boardState[x + 1][y - 2].selectedState = 2;
        }
    }
    if(x - 2 >= 0 && y - 1 >= 0){
        if(boardState[x - 2][y - 1].piece == null || boardState[x - 2][y - 1].team != boardState[x][y].team){
            boardState[x - 2][y - 1].selectedState = 2;
        }
    }
    if(x - 1 >= 0 && y - 2 > 0){
        if(boardState[x - 1][y - 2].piece == null || boardState[x - 1][y - 2].team != boardState[x][y].team){
            boardState[x - 1][y - 2].selectedState = 2;
        }
    }
    
}

function bishop(x, y){
    let i = x;
    let j = y;
    while(i < 7 && j < 7){
        i ++;
        j ++;

        if(boardState[i][j].piece == null){
            boardState[i][j].selectedState = 2;
        }else if(boardState[i][j].team != boardState[x][y].team){
            boardState[i][j].selectedState = 2;
            break;
        }else{
            break;
        }       
    }
    i = x;
    j = y;

    while(i < 7 && j > 0){    
        i ++;
        j --;
        if(boardState[i][j].piece == null){
            boardState[i][j].selectedState = 2;
        }else if(boardState[i][j].team != boardState[x][y].team){
            boardState[i][j].selectedState = 2;
            break;
        }else{
            break;
        }

    }

    i = x;
    j = y;
    
    while(i > 0 && j < 7){    
        i --;
        j ++;
        if(boardState[i][j].piece == null){
            boardState[i][j].selectedState = 2;
        }else if(boardState[i][j].team != boardState[x][y].team){
            boardState[i][j].selectedState = 2;
            break;
        }else{
            break;
        }

    }
    i = x;
    j = y;
    
    while(i > 0 && j > 0){    
        i --;
        j --;
        if(boardState[i][j].piece == null){
            boardState[i][j].selectedState = 2;
        }else if(boardState[i][j].team != boardState[x][y].team){
            boardState[i][j].selectedState = 2;
            break;
        }else{
            break;
        }

    }
}

function queen(x, y){
    rook(x, y);
    bishop(x, y);
}

function king(x, y){
    for(let i = x - 1; i <= x + 1; i ++){
        for(let j = y - 1; j <= y + 1; j ++){
            if(i >= 0 && i < 8 && j >= 0 && j < 8 && i != j){
                if(boardState[i][j].piece == null){
                    boardState[i][j].selectedState = 2;
                }else if(boardState[i][j].team != boardState[x][y].team){
                    boardState[i][j].selectedState = 2;
                }
            }
        }
    }

    //Castling
    if(boardState[x][y].timesMoved == 0){
        let direction = 1;
        if(boardState[x][y].team == 0){
            direction = -1;
        }
        console.log(direction)
        if(
            boardState[x + 1][y].piece == null && boardState[x + 2][y].piece == null && boardState[x + 3][y].piece == 1 &&
            boardState[x + 1][y + direction].piece == 0 && boardState[x + 2][y + direction].piece == 0 && boardState[x + 3][y + direction].piece == 0
        ){
            boardState[x + 2][y].selectedState = 2;
            boardState[x + 2][y].specialMove = () => {
                console.log("CASTLED")
                selected = [x + 3, y];
                movePiece(x + 1, y);
             
            };
        }

        if(
            boardState[x - 1][y].piece == null && boardState[x - 2][y].piece == null && boardState[x - 3][y].piece == null && boardState[x - 4][y].piece == 1 &&
            boardState[0][y + direction].piece == 0 && boardState[1][y + direction].piece == 0 && boardState[2][y + direction].piece == 0
        ){
            boardState[x - 2][y].selectedState = 2;
            boardState[x - 2][y].specialMove = () => {
                console.log("CASTLED")
                selected = [0, y];
                movePiece(x - 1, y);
            };
        }
    }
}

function checkForCheck(team){
    for(let i = 0; i < boardState.length; i ++){
        for(let j = 0; j < boardState[i].length; j ++){
            boardState[i][j].selectedState = 0;
        }
    }
    let kingX;
    let kingY;
    for(let i = 0; i < boardState.length; i ++){
        for(let j = 0; j < boardState[i].length; j ++){
            if(boardState[i][j].team != team && boardState[i][j].pieceIndex == 5){
                kingX = i;
                kingY = j;
            }
            if(boardState[i][j].team == team){
                calculatePossibleMoves(i, j, boardState[i][j].pieceIndex);
            }
        }
    }
    let isChecked = false;
    if(boardState[kingX][kingY].selectedState == 2){
        console.log("Check");
        isChecked = true;
    }

    if(isChecked){
        if(checkForCheckMate(kingX, kingY)){
            console.log("Check Mate")
        }
       

    }

    for(let i = 0; i < boardState.length; i ++){
        for(let j = 0; j < boardState[i].length; j ++){
            boardState[i][j].selectedState = 0;
        }
    }
   
}

function checkForCheckMate(x, y){
    let checkMate = true;
    for(let i = x - 1; i <= x + 1; i ++){
        for(let j = y - 1; j <= y + 1; j ++){
            if(i >= 0 && i < 8 && j >= 0 && j < 8 && i != j){
                if(boardState[i][j].piece == null && boardState[i][j].selectedState != 2){
                   checkMate = false;
                }
            }
        }
    }
    return checkMate;
}

// function mousePressed(e){
//     if(e.button == 2){
//         selected = null;
//     }
// }

//Function that handles whether or not someone has won
function checkGameOver(){
    checkForCheck(isWhite ? 0 : 1);
}

function game(){
    drawBoard();
}
