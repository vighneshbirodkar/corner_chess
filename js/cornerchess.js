
'use strict';
console.log('corner chess'); 

function waitAndHideAlert(){
  $("#alertbox").delay(1000).animate({opacity: 0.0}, 300)
};


function showAlert(msg){
  $("#alertbox").text(msg);
  $("#alertbox").animate({opacity: 1.0}, 300, waitAndHideAlert);
};

function showWhoMoves(whoMoves){
  $("#msgbox").html("<b>" + whoMoves + "</b> to move.");
}

var init = function() {

// var position = '8/8/8/8/7K/8/7R/3k4 w - c3 0 1';
var position = '8/8/8/8/8/8/8/8 w - c3 0 1';

var moves = 0;
var gameStarted = false;
var hasBlackChecked = false;
var minTurnsBeforeCheck = 3;

var board,
  game = new Chess(position),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

// alert(game.fen());

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {

    var gameOver = false;

    if (gameStarted) {
        if (game.in_checkmate()) {
            
            console.log('In checkmate');
            gameOver = true;
        } else if (game.in_stalemate()) {
            
            console.log('In stalemate');
            gameOver = true;
        } else if (game.in_threefold_repetition()) {
            
            console.log('In three fold repetition');
            gameOver = true;
        }
    }

    // console.log('Game over', gameOver);

  if (gameOver ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var isPieceKing = function(piece) {
    return piece[1].toLowerCase() == 'k';
}

var isSpareMoveValid = function(piece, target) {

    // First move for each must be a king move
    if (moves < 2) {
        if (isPieceKing(piece) == false) {
            return false;
        }
    }

    // Should not place on top of existing piece
    var existingPiece = game.get(target);
    // console.log('target', target, existingPiece);

    if (existingPiece != null) {
        return false;
    }

    moves++;
    if (moves == 2) {
        gameStarted = true;
    }

    return true;
}

var ruleViolated = function(turn, piece, target, newPos) {

    // console.log('ruleViolated', turn, piece, target);

    // Rule 1: Can't move to a check position
    var prevTurn = (turn === 'w') ? 'b' : 'w';
    var board = getBoardFromPosition(prevTurn, newPos);
    if (board.in_check()) {

        // console.log('Can\'t move into check');
        return true;
    }


    // Rule 2: White can't check before black has
    if (turn == 'w') {
        // console.log('hasBlackChecked', hasBlackChecked);
        if (hasBlackChecked == false) {
            var board = getBoardFromPosition(turn, newPos);

            if (board.in_check()) {
                // console.log('Black hasn\'t checked yet.');
                return true;
            }
        }
    }

    // Rule 3: Black can't check for <minTurnsBeforeCheck> turns
    if (turn == 'b') {
        var board = getBoardFromPosition(turn, newPos);

        if (moves / 2 <= minTurnsBeforeCheck && board.in_check()) {
            // console.log('Black can\'t check for ' + minTurnsBeforeCheck + ' turns');
            return true;
        }
    }

    return false;
}

var getBoardFromPosition = function(turn, pos) {
    var fen = ChessBoard.objToFen(pos);
    var nextMove = (turn === 'w') ? 'b' : 'w';
    var suffix = ' ' + nextMove + ' - c3 0 1';

    return new Chess(fen + suffix);
}

var setGameState = function(pos) {

    var turn = game.turn();

    game = getBoardFromPosition(turn, pos);

    // Check if black has checked
    if (game.turn() == 'w' && game.in_check()) {
        hasBlackChecked = true;
    }
}

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {

    // console.log(source, target, piece, newPos, oldPos, orientation);
    var turn = game.turn();

    if (source == 'spare') {

        if (target == 'offboard') {
            return;
        }

        if (isSpareMoveValid(piece, target) == false) {
            // console.log('Spare move is invalid');
            return 'snapback';
        }

        if (ruleViolated(turn, piece, target, newPos)) {
            // console.log('Rule violated');
            return 'snapback';
        }

        setGameState(newPos);
        updateStatus();
        return;
    }

    if (ruleViolated(turn, piece, target, newPos)) {
        return 'snapback';
    }

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return 'snapback';

  updateStatus();
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position();
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  // console.log(game.fen());

  statusEl.html(status);
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};

var cfg = {
  draggable: true,
  dropOffBoard: 'snapback',
  position: 'clear',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  boardSize: 8,
  sparePieces: true,
  columns: 'abcdefgh',
  showNotation: true,
  position: position
};

board = ChessBoard('board', cfg);

updateStatus();


};
$(document).ready(init);
