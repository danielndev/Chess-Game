const socketUrl = "http://localhost:3001/";
const publicUrl = "http://localhost:3000/static/";
const socket = io(socketUrl);

let currentRoom;
let gameStarted = false;

let SOCKETID;
let playerCap = 2;
let username = "Player";
let playersInRoom = [];

let turnNum = 1;
let boardState = [];

let createRoom = () => {
    let code = "";
    for(let i = 0; i < 6; i ++){
        code += Math.floor(Math.random()*10);
    }

    socket.emit('join', {
        roomCode: code,
        username: username
    });
}

let joinRoom = code => {
    socket.emit('join', {
        roomCode: code,
        username: username
    });
}

socket.on("connect", () =>{
    SOCKETID = socket.id;
})

///////Lobby
socket.on("joined", arg => {
    if(playersInRoom.length < playerCap){
        playersInRoom.push({
            id: arg[0],
            username: arg[1].username,
            ready: false,
            white: false
        })
        console.log(arg[1].username, "Joined to room", arg[1].roomCode);
        currentRoom = arg[1].roomCode;
        socket.emit("synchronise joined", [arg[1].roomCode, playersInRoom]);
    }else{
        socket.emit("too many", {roomCode: currentRoom, id: arg[0]})
    }
})

socket.on("leave room", arg => {
    currentRoom = null;
    playersInRoom = [];
    socket.emit("leave room", arg.roomCode)
    console.log("Too many players");
})

socket.on("synchronise joined", arg => {
    if(arg.playerList.length > playersInRoom.length){
        playersInRoom = arg.playerList;
    }
})

let readyUp = ready => {
    socket.emit("ready up", [ready, currentRoom]);
}

socket.on("player ready", arg => {
    for(let i = 0; i < playersInRoom.length; i ++){
        if(playersInRoom[i].id == arg[0]){
            playersInRoom[i].ready = arg[1];
            break;
        }
    }
})

//
let startGame = () => {
    if(Math.random() < 0.5){
        playersInRoom[0].white = true;
    }else{
        playersInRoom[1].white = true;
    }
    socket.emit("start game", {room: currentRoom, players: playersInRoom});
}

socket.on("start game", arg => {
    console.log("GAME HAS STARTED");
    playersInRoom = arg;
    gameStarted = true;
    startTheGame();
})
//In game

let updateBoardState = boardState => {
    
    socket.emit("update board", {
        room: currentRoom,
        board: boardState,
    });
}

socket.on("update board", arg => {
    turnNum ++;
    boardState = arg;
})