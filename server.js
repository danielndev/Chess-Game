const express = require('express')
const app = express()
const path = require('path');
const httpServer = require("http").createServer(app);

const options = {
    cors: {
        origin: "https://danielnestor-chessgame.herokuapp.com/",
        methods: ["GET", "POST"]
      }
}
const PORT = process.env.PORT || 80;

httpServer.listen(PORT, () => {
  console.log("App Listening at port: " + PORT)
});

const io = require("socket.io")(httpServer);



app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index')
})

io.on("connection", socket => {
  console.log(socket.id, "Connected");

  socket.on("join", arg => {
    console.log(arg);
    socket.join(arg.roomCode);
    io.to(arg.roomCode).emit("joined", [socket.id, arg]);
  })

  socket.on("synchronise joined", arg => {
    let playerList = [];
    let removeList = [];
    let playerCap = 2;
    //Player cap of 2
    if(playerList.length > playerCap){
      playerList = [playerList[0], playerList[1]];
    }

    for(let i = 0; i < arg[1].length; i ++){
      if(playerList.length < playerCap){
        playerList.push(arg[1][i]);
      }else{
        removeList.push(arg[1][i]);
      }
      
    }
    io.to(arg[0]).emit("synchronise joined", {playerList: playerList, removeList: removeList, playerCap: playerCap});
  })

  socket.on("too many", arg => {
    io.to(arg.id).emit("leave room", arg);
  })

  socket.on("leave room", room => {
    socket.leave(room);

  })

  socket.on("ready up", arg => {
    io.to(arg[1]).emit("player ready", [socket.id, arg[0]]);
  })

  socket.on("start game", arg => {
    io.to(arg.room).emit("start game", arg.players);
  })

  socket.on("update board", arg => {
    io.to(arg.room).emit("update board", arg.board);
  })
})


