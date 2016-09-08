// TODO:
// - 1 tai 2 pelaajan valinta

var BOF = {
    toPlay: "black",
    moves: 0,
    players: 1,
    board: [
        [".", ".", "."],
        [".", ".", "."],
        [".", ".", "."]
    ]
};

$(function () {
    // Initialize some game data
    $(".blackball").attr("draggable", "true");
    $(".whiteball").attr("draggable", "false");
    $("#gameboard td").addClass("gamesquare");
    $("#txtRound").attr("value", "0");
    $("#winner").hide();
    $("#btnNew").click(function () { ResetBoard(); });

    // Handle player move
    $("#gameboard td").on("drop", function(ev) {
        ev.originalEvent.preventDefault();
        var data = ev.originalEvent.dataTransfer.getData("text");
        var ball = document.getElementById(data);
        ev.originalEvent.target.appendChild(ball);
        ev.originalEvent.target.classList.remove("dragsquare");

        console.log(data);
        PrintBoard();

        // Mark the previous location empty
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (BOF.board[i][j] === data) {
                    BOF.board[i][j] = ".";
                }
            }
        }
        // Mark the new location
        BOF.board[$("#"+data).parent().attr("data-row")][$("#"+data).parent().attr("data-col")] = data;

        PrintBoard();

        // Increment moves
        $("#txtRound").attr("value", ++BOF.moves);

        // Check for a win
        if (IsWinner(BOF.toPlay)) {
            $("#winner").text(BOF.toPlay.toUpperCase() + " wins!");
            $("#winner").show();
            return;
        }

        // Game continues, update turn
        UpdateTurn();

        if (BOF.players == 1) {
            // One player game, computer's turn
            ChooseMove();
            // Increment moves and check for a win
            $("#txtRound").attr("value", ++BOF.moves);
            if (IsWinner(BOF.toPlay)) {
                $("#winner").text(BOF.toPlay.toUpperCase() + " wins!");
                $("#winner").show();
                return;
            }
            // Game continues, update turn
            UpdateTurn();
        }
    });

    // Handle dragover, see if the square is valid and empty
    $("#gameboard td").on("dragover", function (ev) {
        if (ev.originalEvent.target.classList.contains("gamesquare")) {
            if (IsFree(ev.originalEvent.target)) {
                ev.originalEvent.target.classList.add("dragsquare");
                ev.originalEvent.preventDefault();
            }
        }
    });

    // Handle dragleave
    $("#gameboard td").on("dragleave", function (ev) {
        ev.originalEvent.target.classList.remove("dragsquare");
    });

    // Handle dragstart
    $(".blackball, .whiteball").on("dragstart", function (ev) {
        ev.originalEvent.dataTransfer.setData("text", ev.originalEvent.target.id);
    });

});

//---------------------------------------------------------------------------------
// function UpdateTurn
// Updates some states when turn changes.
// returns nothing
//---------------------------------------------------------------------------------
function UpdateTurn() {
    $(".blackball").attr("draggable", "false");
    $(".whiteball").attr("draggable", "false");
    if (BOF.toPlay === "black") {
        BOF.toPlay = "white";
        $(".whiteball").attr("draggable", "true");
    }
    else {
        BOF.toPlay = "black";
        $(".blackball").attr("draggable", "true");
    }
    $("#btnTurn").toggleClass("turnWhite");
}

//---------------------------------------------------------------------------------
// function ResetBoard
// Resets the game.
// returns nothing
//---------------------------------------------------------------------------------
function ResetBoard() {
    window.location.reload(true);
}

//---------------------------------------------------------------------------------
// function PrintBoard
// Debug function, prints the game board.
// returns nothing
//---------------------------------------------------------------------------------
function PrintBoard() {
    var row = "";
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            row += BOF.board[i][j] + " ";
        }
        console.log(row);
        row = "";
    }
    console.log("\n");
}

//---------------------------------------------------------------------------------
// function IsFree
// Checks whether a given square (or row, column position) is available.
// returns true or false
//---------------------------------------------------------------------------------
function IsFree(square, r, c) {
    if (square === -1) {
        return (BOF.board[r][c] === ".");
    }
    console.log(square.dataset.row + ", " + square.dataset.col);
    return (BOF.board[square.dataset.row][square.dataset.col] === ".");
}

//---------------------------------------------------------------------------------
// function IsWinner
// Checks whether a player has won the game.
// returns true or false
//---------------------------------------------------------------------------------
function IsWinner(player) {
    if (BOF.moves < 5) {
        return false;
    }
    var b1 = GetRowCol( player === "black" ? "bb1" : "wb1" );
    var b2 = GetRowCol( player === "black" ? "bb2" : "wb2" );
    var b3 = GetRowCol( player === "black" ? "bb3" : "wb3" );

    if (b1[0] === b2[0] && b1[0] === b3[0]) {
        return true; // Same row
    }
    if (b1[1] === b2[1] && b1[1] === b3[1]) {
        return true; // Same column
    }
    if (IsInArray([0, 0], [b1, b2, b3]) &&
        IsInArray([1, 1], [b1, b2, b3]) &&
        IsInArray([2, 2], [b1, b2, b3])) {
        return true; // Diagonal 1
    }
    if (IsInArray([0, 2], [b1, b2, b3]) &&
        IsInArray([1, 1], [b1, b2, b3]) &&
        IsInArray([2, 0], [b1, b2, b3])) {
        return true; // Diagonal 2
    }
    return false;
}

//---------------------------------------------------------------------------------
// function GetRowCol
// Finds the row and column of a given ball.
// returns array [row, col] or [-1, -1] if not in play yet
//---------------------------------------------------------------------------------
function GetRowCol(ballId) {
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (BOF.board[i][j] === ballId) {
                return [i, j];
            }
        }
    }
    return [-1, -1]; // Ball not in play yet
}

//---------------------------------------------------------------------------------
// function IsInArray
// Checks whether a given location [row, col] is found in an array of locations.
// returns true or false
//---------------------------------------------------------------------------------
function IsInArray(loc, locarr) {
    for (var i = 0; i < 3; i++) {
        if (locarr[i][0] === loc[0] && locarr[i][1] === loc[1]) {
            return true;
        }
    }
    return false;   // Not found
}

//---------------------------------------------------------------------------------
// function ChooseMove
// Picks a move for the computer in a one player game.
// returns nothing
//---------------------------------------------------------------------------------
function ChooseMove() {
    var b1 = GetRowCol(BOF.toPlay === "black" ? "bb1" : "wb1");
    var b2 = GetRowCol(BOF.toPlay === "black" ? "bb2" : "wb2");
    var b3 = GetRowCol(BOF.toPlay === "black" ? "bb3" : "wb3");
    var ballToMove = (BOF.toPlay === "black" ? "b" : "w");
    var oldLocation;
    var newLocation = [-1, -1];

    console.log("ChooseMove");

    // Enough moves for a possibility to win
    if (BOF.moves >= 5) {
        console.log(".logic");
        // Two on the same row (pt 1)
        if ((b1[0] === b2[0] || b1[0] === b3[0]) && (IsFree(-1, b1[0], 0) || IsFree(-1, b1[0], 1) || IsFree(-1, b1[0], 2))) {
            console.log("..1");
            if (b1[0] === b2[0]) {
                // Move b3
                ballToMove += "b3";
                oldLocation = [b3[0], b3[1]];
            }
            else {
                // Move b2
                ballToMove += "b2";
                oldLocation = [b2[0], b2[1]];
            }
            if (IsFree(-1, b1[0], 0)) {
                // Move to b1[0], 0
                newLocation = [b1[0], 0];
            }
            else if (IsFree(-1, b1[0], 1)) {
                // Move to b1[0], 1
                newLocation = [b1[0], 1];
            }
            else {
                // Move to b1[0], 2
                newLocation = [b1[0], 2];
            }
        }
        // Two on the same row (pt 2)
        else if (b2[0] === b3[0] && (IsFree(-1, b2[0], 0) || IsFree(-1, b2[0], 1) || IsFree(-1, b2[0], 2))) {
            console.log("..2");
            ballToMove += "b1"; // Move b1
            oldLocation = [b1[0], b1[1]];
            if (IsFree(-1, b2[0], 0)) {
                // Move to b2[0], 0
                newLocation = [b2[0], 0];
            }
            else if (IsFree(-1, b2[0], 1)) {
                // Move to b2[0], 1
                newLocation = [b2[0], 1];
            }
            else {
                // Move to b2[0], 2
                newLocation = [b2[0], 2];
            }
        }
        // Two in the same column (pt 1)
        else if ((b1[1] === b2[1] || b1[1] === b3[1]) && (IsFree(-1, 0, b1[1]) || IsFree(-1, 1, b1[1]) || IsFree(-1, 2, b1[1]))) {
            console.log("..3");
            if (b1[1] === b2[1]) {
                ballToMove += "b3"; // Move b3
                oldLocation = [b3[0], b3[1]];
            }
            else {
                ballToMove += "b2"; // Move b2
                oldLocation = [b2[0], b2[1]];
            }
            if (IsFree(-1, 0, b1[1])) {
                // Move to 0, b1[1]
                newLocation = [0, b1[1]];
            }
            else if (IsFree(-1, 1, b1[1])) {
                // Move to 1, b1[1]
                newLocation = [1, b1[1]];
            }
            else {
                // Move to 2, b1[1]
                newLocation = [2, b1[1]];
            }
        }
        // Two in the same column (pt 2)
        else if (b2[1] === b3[1] && (IsFree(-1, 0, b2[1]) || IsFree(-1, 1, b2[1]) || IsFree(-1, 2, b2[1]))) {
            console.log("..4");
            ballToMove += "b1"; // Move b1
            oldLocation = [b1[0], b1[1]];
            if (IsFree(-1, 0, b2[1])) {
                // Move to 0, b2[1]
                newLocation = [0, b2[1]];
            }
            else if (IsFree(-1, 1, b2[1])) {
                // Move to 1, b2[1]
                newLocation = [1, b2[1]];
            }
            else {
                // Move to 2, b2[1]
                newLocation = [2, b2[1]];
            }
        }
        // Two in the same diagonal
        else if (IsInArray([0, 0], [b1, b2, b3]) && IsInArray([1, 1], [b1, b2, b3]) && IsFree(-1, 2, 2)) {
            console.log("..5");
            newLocation = [2, 2];
            ballToMove += (b1 == [0, 0] ? (b2 == [1, 1] ? "b3" : "b2") : (b1 == [1, 1] ? (b2 == [0, 0] ? "b3" : "b2") : "b1"));
            oldLocation = GetRowCol(ballToMove);
        } else if (IsInArray([0, 0], [b1, b2, b3]) && IsInArray([2, 2], [b1, b2, b3]) && IsFree(-1, 1, 1)) {
            console.log("..6");
            newLocation = [1, 1];
            ballToMove += (b1 == [0, 0] ? (b2 == [2, 2] ? "b3" : "b2") : (b1 == [2, 2] ? (b2 == [0, 0] ? "b3" : "b2") : "b1"));
            oldLocation = GetRowCol(ballToMove);
        } else if (IsInArray([1, 1], [b1, b2, b3]) && IsInArray([2, 2], [b1, b2, b3]) && IsFree(-1, 0, 0)) {
            console.log("..7");
            newLocation = [0, 0];
            ballToMove += (b1 == [1, 1] ? (b2 == [2, 2] ? "b3" : "b2") : (b1 == [2, 2] ? (b2 == [1, 1] ? "b3" : "b2") : "b1"));
            oldLocation = GetRowCol(ballToMove);
        } else if (IsInArray([0, 2], [b1, b2, b3]) && IsInArray([1, 1], [b1, b2, b3]) && IsFree(-1, 2, 0)) {
            console.log("..8");
            newLocation = [2, 0];
            ballToMove += (b1 == [0, 2] ? (b2 == [1, 1] ? "b3" : "b2") : (b1 == [1, 1] ? (b2 == [0, 2] ? "b3" : "b2") : "b1"));
            oldLocation = GetRowCol(ballToMove);
        } else if (IsInArray([0, 2], [b1, b2, b3]) && IsInArray([2, 0], [b1, b2, b3]) && IsFree(-1, 1, 1)) {
            console.log("..9");
            newLocation = [1, 1];
            ballToMove += (b1 == [0, 2] ? (b2 == [2, 0] ? "b3" : "b2") : (b1 == [2, 0] ? (b2 == [0, 2] ? "b3" : "b2") : "b1"));
            oldLocation = GetRowCol(ballToMove);
        } else if (IsInArray([2, 0], [b1, b2, b3]) && IsInArray([1, 1], [b1, b2, b3]) && IsFree(-1, 0, 2)) {
            console.log("..10");
            newLocation = [0, 2];
            ballToMove += (b1 == [2, 0] ? (b2 == [1, 1] ? "b3" : "b2") : (b1 == [1, 1] ? (b2 == [2, 0] ? "b3" : "b2") : "b1"));
            oldLocation = GetRowCol(ballToMove);
        }
    }

    // Not enough moves yet or no winning move found
    if (newLocation[0] == -1) {
        console.log(".random");
        // TODO: better logic (stop opponent's winning moves if possible); for now just random
        if (BOF.moves == 1) {
            ballToMove += "b1";
        } else if (BOF.moves == 3) {
            ballToMove += "b2";
        } else if (BOF.moves == 5) {
            ballToMove += "b3";
        } else {
            ballToMove += ("b" + Math.floor((Math.random() * 3) + 1));
        }
        oldLocation = GetRowCol(ballToMove);

        var i = 0;
        var j = 0;
        do {
            i = Math.floor((Math.random() * 3));
            j = Math.floor((Math.random() * 3));
        } while (!IsFree(-1, i, j));
        newLocation = [i, j];
    }

    console.log(".ballToMove: " + ballToMove);
    console.log(".oldLocation: " + oldLocation[0] + ", " + oldLocation[1]);
    console.log(".newLocation: " + newLocation[0] + ", " + newLocation[1]);

    // Move from oldLocation to newLocation
    if (BOF.moves > 6) {
        BOF.board[oldLocation[0]][oldLocation[1]] = ".";
    }
    $("#" + ballToMove).appendTo(".gamesquare[data-row='" + newLocation[0] + "'][data-col='" + newLocation[1] + "']");
    BOF.board[newLocation[0]][newLocation[1]] = ballToMove;
}
