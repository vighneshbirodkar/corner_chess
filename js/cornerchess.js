
'use strict';
console.log('Corner Chess'); 

function waitAndHideAlert(){
  $("#alertbox").delay(2000).animate({opacity: 0.0}, 300)
};


function showAlert(msg, hide){
  $("#alertbox").text(msg);

  if (hide == undefined || hide == true) {
    $("#alertbox").animate({opacity: 1.0}, 300, waitAndHideAlert);
  } else if (hide == false) {
    $("#alertbox").animate({opacity: 1.0});
  }
};

function showWhoMoves(whoMoves){
  $("#msgbox").html("<b>" + whoMoves + "</b> to move.");
};

function showNumMoves(n){
  $("#moves").html("" + n);
}

function appendMoveInUI(source, target, piece) {

  var pieceMap = {r: 'Rook', b: 'Bishop', k: 'King', q: 'Queen', n: 'Knight', p: 'Pawn'};
  var playerMap = {w: 'White', b: 'Black'};

  var htmlPre = '<li class="list-group-item">';
  var htmlPost = '</li>';
  var moveStr = playerMap[piece[0].toLowerCase()] + ': ' + 
                pieceMap[piece[1].toLowerCase()] + 
                ' from ' + source + ' to ' + target + '.';

  // Add move to UI
  var element = $( '#moveHistory' );
  element.append( htmlPre + moveStr + htmlPost );
  
  // Scroll to bottom
  var height = element[0].scrollHeight;
  console.log(height)
  element.scrollTop(height);
}

function clearMoveHistory() {
  $( '#moveHistory' ).html( '' ); 
}

// chessboard.js object, holds the UI state of the game
var board;

var init = function(boardSize) {

clearMoveHistory();

var position = '8/8/8/8/8/8/8/8 w - c3 0 1';

var moves = 0;
var gameStarted = false;
var hasBlackChecked = false;

// Configurable - Minimum number of moves before black can check
var minTurnsBeforeCheckBlack = 2;

// Configurable - Minimum number of moves before white can check
var minTurnsBeforeCheckWhite = 4;

var gameOver = false;

// chess.js object, holds the game state for move validation
var game = new Chess(position);

// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {

    if (gameStarted) {
        if (game.in_checkmate()) {

            showAlert("The game has ended in a checkmate.", false);
            endGame();
        } else if (game.in_stalemate()) {

            showAlert("The game has ended in a draw (stalemate).", false);
            endGame();
        } else if (game.in_threefold_repetition()) {

            showAlert("The game has ended in a draw (three fold repetition).", false);
            endGame();
        }
    }

  if ((gameOver === true) ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var endGame = function() {
  gameOver = true;

  // Send score to 
  try {
    var winner = (game.turn() == 'w') ? 'Black' : 'White';
    var score = 100.00 / (moves / 2);
    $.ajax({
      url: '../../dbman/saveScore.php',
      data: {
        gamename: 'Corner Chess',
        playername: winner,
        score: score
      },
      dataType: 'json',
      type: 'GET',
      success: function(response) {
        console.log('AJAX success', response);
      },
      error: function(xhr, ajaxOptions, thrownError) {
        console.log('AJAX error', xhr, ajaxOptions, thrownError);
      }
    });
  } catch(err) {
    console.log(err);
  }
}

var isPieceKing = function(piece) {
    return piece[1].toLowerCase() == 'k';
};

var isSpareMoveValid = function(piece, target) {

    // First move for each must be a king move
    if (moves < 2) {
        if (isPieceKing(piece) == false) {
            showAlert('The first move must bring the King into the board.');
            return false;
        }
    }

    // Should not place on top of existing piece
    var existingPiece = game.get(target);
    // console.log('target', target, existingPiece);

    if (existingPiece != null) {
        showAlert('Can\'t capture a piece from outside the board.');
        return false;
    }

    return true;
};

var ruleViolated = function(turn, piece, target, newPos) {

    // console.log('ruleViolated', turn, piece, target);
    // console.log('hasBlackChecked', hasBlackChecked);

    // Rule 1: Can't move to a check position
    var prevTurn = (turn === 'w') ? 'b' : 'w';
    var board = getBoardFromPosition(prevTurn, newPos);
    if (board.in_check()) {

        // console.log('Can\'t move into check');
        showAlert('Can\'t move into check');
        return true;
    }


    // Rule 2: White can't check before black has
    if (turn == 'w') {
        if (hasBlackChecked == false) {
            var board = getBoardFromPosition(turn, newPos);

            if (moves / 2 <= minTurnsBeforeCheckWhite && board.in_check()) {
                showAlert(
                  'Black hasn\'t checked yet, and it hasn\'t been '
                  + minTurnsBeforeCheckWhite + ' moves yet, so white can\'t check black.');
                return true;
            }
        }
    }

    // Rule 3: Black can't check for <minTurnsBeforeCheckBlack> turns
    if (turn == 'b') {
        var board = getBoardFromPosition(turn, newPos);

        if (moves / 2 <= minTurnsBeforeCheckBlack && board.in_check()) {
            showAlert('Black can\'t check for the first ' + minTurnsBeforeCheckBlack + ' turns.');
            return true;
        }
    }

    return false;
};

var getBoardFromPosition = function(turn, pos) {
    var fen = ChessBoard.objToFen(pos);
    var nextMove = (turn === 'w') ? 'b' : 'w';
    var suffix = ' ' + nextMove + ' - c3 0 1';

    return new Chess(fen + suffix);
};

var setGameState = function(pos) {

    var turn = game.turn();

    game = getBoardFromPosition(turn, pos);

    // Check if black has checked
    if (game.turn() == 'w' && game.in_check()) {
        hasBlackChecked = true;
    }
};

var updateMove = function(source, target, piece) {
  moves++;
  showNumMoves(parseInt(moves / 2, 10));  

  appendMoveInUI(source, target, piece);
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

        updateMove(source, target, piece);

        if (moves == 2) {
            // console.log('moves', moves);
            gameStarted = true;
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
  if (move === null) {
    showAlert('Invalid move');
    return 'snapback';
  }

  updateMove(source, target, piece);
  updateStatus();
};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position();
};

var noValidMovesInBoard = function() {

  if (moves <= 2) {
    return false;
  }

  var columnMap = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8};
  var legalMoves = game.moves({ verbose: true });
  var hasValidMove = false;

  for (var i = 0, len = legalMoves.length; i < len; i++) {
    var legalMove = legalMoves[i].to;
    
    var row = parseInt(legalMove[1], 10);
    var column = columnMap[legalMove[0]];

    if (row <= cfg.boardSize && column <= cfg.boardSize) {
      return false;
    }
  }

  return true;
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  showWhoMoves(moveColor);

  // checkmate?
  if (noValidMovesInBoard() === true) {

    console.log(game.in_check());
    console.log(game.fen());

    if (game.in_check()) {
      status = 'Game over, ' + moveColor + ' is checkmated.';
    } else {
      status = 'Game over, ' + moveColor + ' is in a stalemate.';
    }

    endGame();
    showAlert(status, false);
  }
  else if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is checkmated.';
    showAlert(status, false);
  }

  // game still on
  else {
    status = moveColor + ' to move';

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';

      if (game.turn() == 'w') {
        console.log('Setting hasBlackChecked to true')
        hasBlackChecked = true;
      }

      showAlert(status);
    }
  }
};

var columnStr = 'abcdefgh';
columnStr = columnStr.substring(0, boardSize);

// alert(columnStr);

var cfg = {
  draggable: true,
  dropOffBoard: 'snapback',
  position: 'clear',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  boardSize: boardSize,
  sparePieces: true,
  columns: columnStr,
  showNotation: true,
  position: position
};

board = ChessBoard('board', cfg);

updateStatus();
};

init(5);

$('#btn4').click(function() {
  board.destroy();
  init(4);
});

$('#btn5').click(function() {
  board.destroy();
  init(5);
});

$('#btn6').click(function() {
  board.destroy();
  init(6);
});

$('#btn7').click(function() {
  board.destroy();
  init(7);
});

$('#btn8').click(function() {
  board.destroy();
  init(8);
});
