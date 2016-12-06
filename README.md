# Corner Chess
- By Adithya Parthasarathy and Vighnesh Birodkar

## Configuration

### Spare pieces
To edit the spare pieces abailable for each player change the variables `BLACK_SPARES`
and `WHITE_SPARES` in the file `js/chessboard-0.3.0.js`.

### Board and Piece Colors
Edit the file `css/chessboard-0.3.0.css` to change the board square colors. The pieces
are stored as png files in `img/chesspieces/`.

### Minimum number of moves to check
Edit the variables `minTurnsBeforeCheckBlack` and  `minTurnsBeforeCheckWhite` in
`js/cornerchess.js` to configure how many turns each color has to wait before placing their
opponent in check.
