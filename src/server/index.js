const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUserInRoom, setStartGame, users, startGame, genTetrominoArr, deadUser } = require('./users');
// const genTetrominoArr = require('./pieceHelper');

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  pingInterval: 10000,
  pingTimeout: 50000,
  cookie: false
});

io.on("connection", (socket) => {
    console.log('We have a new conection!!!');
    socket.on('join', ({ name, room }, callback) => {
      const { error, user } = addUser({ id: socket.id, name, room});

      if(error){
        return callback(error)
      }else{
        // console.log('SERVER SIDE!')  
        // console.log(users);
        socket.join(room);
        io.to(room).emit("updateUsers", users.filter((user) => user.room === room));
      }

    });

    socket.on("gameStart", (room) => {
      io.to(room).emit("gameStarted", startGame(room));
    });

    socket.on('genTetrominoArr', (room) => {
      const tetroArr = genTetrominoArr();
      io.to(room).emit("tetrominoArr", tetroArr);
    });

    socket.on("setBoard", (stage) => {
      let user = getUser(socket.id);
      users.map((user) => {
        if(user.id === socket.id){
          user.board = [...stage];
        }
      });
      let room = user.room ? user.room : Object.keys(socket.rooms)[1];
      io.to(room).emit("updateUsers", users.filter((user) => user.room === room));
    });

    socket.on("winner", (champ) => {
      if(champ){
        io.to(champ.room).emit("winner", {champ, users});
      }
    });

    socket.on("deadUser", (id) => {
      let user = getUser(id);
      let room = user.room;
      io.to(room).emit("deadUser", deadUser(id));
    });

    socket.on("clearRow", () => {
      // console.log("in clearRow")
      let user = getUser(socket.id);
      let room = user.room;
      if(room){
        socket.to(room).emit("addRow")
      }
    })
    
    socket.on("disconnect", () => {
      const user = removeUser(socket.id);
      console.log(user? `${user.username} has left!!!`: 'User has left');
      if(user){
        let room = user.room;
        if(user.inGame){
          io.to(room).emit("deadUser", deadUser(socket.id));
        } else {
          let usersInRoom = users.filter((user) => user.room === room);
          if(usersInRoom.length > 0){
            io.to(room).emit("updateUsers", usersInRoom);
          }          
        }
      }
    });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));