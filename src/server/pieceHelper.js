const Pieces = require("./classes/Pieces");

const genTetrominoArr = () => {
  let Piece = new Pieces();
	let shapes = [];
	let i = 0;
	while (i < 50) {
		shapes.push(Piece.randomTetromino());
		i++;
	}
	return shapes;
};
module.exports = genTetrominoArr;
