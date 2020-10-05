import { useState, useEffect } from 'react';
import { createStage } from '../gameHelpers';

import socket from '../client_socket';

export const useStage = (player, resetPlayer, tetrominoArr, tetrominoArrIndex) => {
    const [stage, setStage] = useState(createStage());
    //const [score, setScore] = useState(0);

    const addRow = (stage, setStage) => {
      console.log("In stage addRow");
      for (let i = 1; i < stage.length; i++)
        stage[i - 1] = [...stage[i]];
      stage[stage.length - 1] = new Array(stage[0].length).fill(["X", ""]);
      setStage(stage);
    };

    useEffect(() => {
        let counter = 1;
        //setScore(0);
        const clearRow = (newStage) => 
            newStage.reduce((acc, row) => {
                if(row.findIndex((cell) => cell[0] === 0 || cell[0] === "X") === -1){
                    acc.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                    //setScore((prev) => prev + 10);
                    counter++;
                    if(counter > 1){
                      // console.log("in clearRow stage");
                      socket.emit("clearRow");                      
                    }
                    // console.log(counter)
                    return acc;
                }
                acc.push(row);
                return acc;
            }, [])

        const updateStage = prevStage => {
            //first flush the stage, clear from previois render
            const newStage = prevStage.map(row => 
              row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            //Then draw the tetromino
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if(value !== 0){
                        newStage[y + player.pos.y][x + player.pos.x] = [
                            value,
                            `${player.collided ? 'merged' : 'clear'}`,
                        ];
                    }
                });
            });

            if(player.collided){
              resetPlayer(tetrominoArr, tetrominoArrIndex);
              let tempStage = clearRow(newStage);
              //console.log(tempStage)
              socket.emit("setBoard", tempStage)
              return tempStage;
            }
            return newStage;
        }
        setStage(prev => updateStage(prev));
// eslint-disable-next-line
    }, [player, resetPlayer])

    return[stage, setStage, addRow]
}