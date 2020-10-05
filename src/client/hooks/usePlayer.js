import { useState, useCallback } from 'react';

import { TETROMINOS } from '../tetrominos';
import { STAGE_WIDTH, checkCollision } from '../gameHelpers';

export const usePlayer = (setTetrominoArrIndex) => {
    const [player, setPlayer] = useState({
        pos: {x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false
    });

    const rotate = (matrix, dir) => {
        const rotatedTetromino = matrix.map((_, index) =>
            matrix.map(col => col[index]),
        );
        if(dir > 0)
            return rotatedTetromino.map(row => row.reverse());
        return rotatedTetromino.reverse();
    };

    const playerRotate = (stage, dir) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })){
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if(offset > clonedPlayer.tetromino[0].length){
                rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }
        setPlayer(clonedPlayer)
    }

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer(prev => ({
            ...prev,
            pos: { x: (prev.pos.x += x), y : (prev.pos.y += y) },
            collided,
        }));
    }

    const playerFall = (stage) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        while (!checkCollision(clonedPlayer, stage, { x: 0, y: 0 })){
            clonedPlayer.pos.y++;
        }
        clonedPlayer.pos.y--;
        setPlayer(clonedPlayer);
    }


    const resetPlayer = useCallback((tetrominoArr, tetrominoArrIndex) => {
        setPlayer({
            pos: {x: STAGE_WIDTH / 2 - 2, y: 0 },
            tetromino: tetrominoArr[tetrominoArrIndex].shape,
            collided: false
        });
        if(tetrominoArrIndex + 1 > tetrominoArr.length - 1) {
          setTetrominoArrIndex(0);
        } else {
          setTetrominoArrIndex(tetrominoArrIndex + 1)
        }
        // console.log(tetrominoArrIndex, tetrominoArr[tetrominoArrIndex].shape)
    }, [setTetrominoArrIndex]);

    return [player, updatePlayerPos, resetPlayer, playerRotate, playerFall];
}