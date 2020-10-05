import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';

import { checkCollision, createStage } from '../gameHelpers';
// import { genTetrominoArr } from '../tetrominos';


// Styled Components
import { StyledTetrisWrapper, StyledTetris, StyledPara, StyledContainer } from './styles/StyledTetris';

// Custom Hooks
import { usePlayer } from '../hooks/usePlayer';
import { useStage } from '../hooks/useStage';
import { useInterval } from '../hooks/useInterval';

// Components
import Stage from './Stage';
import Display from './Display';
import StartButton from './StartButton';

// Sockets
import socket from '../client_socket';

//Front end object for game data
let game = {
  users: [],
  usersLeft: [],
}

const Tetris = (props) => {
  const name = props.location.state ? props.location.state.name : "Ft8oDW1I88";
  const room = props.location.state ? props.location.state.room : "L9G0wsnCAz";
  const [start, setStart] = useState(false);
  const [host, setHost] = useState(false);
  const [winner, setWinner] = useState(null);  
  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [tetrominoArrIndex, setTetrominoArrIndex] = useState(0);
  const [tetrominoArr, setTetrominoArr] = useState(null);
  const [solo, setSolo] = useState(false)


  const [player, updatePlayerPos, resetPlayer, playerRotate, playerFall] = usePlayer(setTetrominoArrIndex);
  const [stage, setStage, addRow] = useStage(player, resetPlayer, tetrominoArr, tetrominoArrIndex);

  const boardRef = useRef(null);



  //Socket section
  socket.on("updateUsers", (users) => {
    if(users.length > 1){
      if(users[0].inGame === false){
        game.users = users;
        if(game.users[0] && game.users[0].id === socket.id){
          setHost(true);
        }
      }
      else if (users[0].inGame === true && users[0].board != null){
        let newUsers = users.filter((user) => user.room === room && user.board !== null);
        game.users = newUsers;
        game.usersLeft = newUsers;
        let checker = setTimeout(() => {
          if(game.users[0] && game.users[0].id === socket.id){
            setHost(true);
          }
        }, 1000);
        stopFunction(checker);
      }
    }else{
      game.users = users;
      if(game.users[0] && game.users[0].id === socket.id){
        setHost(true)
      }
    }
  });

  socket.on("deadUser", (users) => {
    let usersStillPlaying = users.filter((user) => user.room === room && user.inGame === true);
    if(usersStillPlaying.length > 1){
      game.usersLeft = usersStillPlaying;
      if(game.usersLeft[0] && game.usersLeft[0].id === socket.id){
        setHost(true);
      }
    } else if(usersStillPlaying.length === 0){
      setSolo(true);
    } else {
      socket.emit("winner", (usersStillPlaying[0]));
    }
  })

  socket.on("gameStarted", () => {
    setGameOver(false);
    socket.emit("setBoard", (stage));  
  });

  socket.on("tetrominoArr", (tetrominos) => {
    setTetrominoArr(tetrominos)
  });

  socket.on("pong", () => {
    // console.log("ping")
    socket.emit("ping");
  });

  socket.on("winner", ({champ}) => {
    setDropTime(null);
    setWinner(champ);
  });

  const stopFunction = (value) => {
    clearTimeout(value);
  }


  //Game mechanics section
  const movePlayer = dir => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  }

  const drop = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false })
    } 
    else {
      // Game Over
      if (player.pos.y < 1) {
        //console.log("GAME OVER!!!");
        socket.emit("deadUser", socket.id);
        setGameOver(true);
        setDropTime(null);
        setStart(false);
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  }

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  }

  const keyUp = ({ keyCode }) => {
    if(!gameOver){
      if(keyCode === 40){
        setDropTime(1000);
      }
    }
  }


  const move = ({ keyCode }) => {
    //console.log(`gameOver: ${gameOver} and start: ${start}`)
    if (!gameOver) {
      if (keyCode === 37) {
        movePlayer(-1);
      } else if (keyCode === 39) {
        movePlayer(1);
      } else if (keyCode === 40) {
        dropPlayer();
      } else if (keyCode === 38) {
        playerRotate(stage, 1);
      } else if (keyCode === 32) {
        playerFall(stage)
      }
    }
  };



  const setUpGame = useCallback((setWinner, setGameOver, resetPlayer, setDropTime, setStage, setStart) => {
    setWinner(null);
    setGameOver(false);
    resetPlayer(tetrominoArr, tetrominoArrIndex);
    setDropTime(1000);
    setStage(createStage());
    setStart(true);
    setSolo(false)
    // eslint-disable-next-line
  }, [tetrominoArr]);

  const startGame = () => {
    // Reset everything
    socket.emit("gameStart", room);
    socket.emit("genTetrominoArr", room);
  }

  useEffect(() => {
    if(tetrominoArr){
      setUpGame(setWinner, setGameOver, resetPlayer, setDropTime, setStage, setStart);
      boardRef.current.focus();
    }
    // eslint-disable-next-line
  }, [tetrominoArr]);

  useEffect(() => {
    if(winner){
       setTetrominoArrIndex(0)
    }
  }, [winner])

  useInterval(() => {

    socket.on("addRow", () => {
      // console.log("in intervale addRow");
      addRow(stage, setStage);
      updatePlayerPos({ x: 0, y: 0, collided: false });
    }, updatePlayerPos, addRow, stage, setStage).once();

    drop();
  }, dropTime, stage, setStage);

  if(name === "Ft8oDW1I88" || room === "L9G0wsnCAz"){
    return (
      <Redirect 
        to={{ pathname: '/'}}
      />
    )
  } else {
    return (
      <StyledTetrisWrapper ref={boardRef} role="button" tabIndex="0" onKeyDown={event => move(event)} onKeyUp={keyUp}>
        <StyledTetris >
          <Stage stage={stage}/>
          <aside>
          {winner ? (
              <Display text={`Winner: ${winner.username}`} />
            ) : (
              ""
            )}
            {gameOver ? (
              <>
                <Display gameOver={gameOver} text="Game Over" />

                {host && !solo ? (
                  <StartButton callback={startGame} />
                ) : ("")}
                
                {solo ? (
                  <StartButton callback={startGame} />
                ) : ("")}
              </>
            ) : (
              <div>
                <Display text={`User: ${name}`} />
                {/* <Display text={`Score: `} /> */}

                {start ? (
                  //<StyledPara >Game in progress...</StyledPara> 
                  ""
                  ) : (  host ? (
                      <StartButton callback={startGame}/>
                    ) : (
                      <StyledPara > Waiting for host to start game. </StyledPara>
                    )
                  )} 

                {winner && host ? (
                  <StartButton callback={startGame}/>
                  ): ""} 
              </div>
            )}    
          </aside>
          {!gameOver ? (
            <StyledContainer>
              {game.usersLeft ?
                game.users.map((value, index) => {
                  if(value.board && value.id !== socket.id && game.usersLeft.find((user) => user.id === value.id))
                    return (
                      <div key={index} style={{ padding: "0 10px"}}>
                        <StyledPara>{value.username}</StyledPara>
                        <Stage type={1} stage={value.board} />
                      </div>
                    );
                  return null;
                }) : "" }
            </StyledContainer>
          ) : (
            ""
          )}
        </StyledTetris>
      </StyledTetrisWrapper>
    );
  }
};

export default Tetris;
