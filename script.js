// Global game variables object
var BOF = {
    toPlay: "black",
    moves: 0,
    players: 1,
    won: false,
    board: [
        [".", ".", "."],
        [".", ".", "."],
        [".", ".", "."]
    ]
};

$(function () {
    // jQuery UI initializations
    $("#controlgroup").controlgroup();
    $("#statisticsDialog").dialog({
        autoOpen: false,
        width: 375,
        buttons: [{
            text: "Ok",
            click: function () { $(this).dialog("close"); }
        }]
    });

    // Initialize some game data
    $(".blackball").attr("draggable", "true");
    $(".whiteball").attr("draggable", "false");
    $("#gameboard td").addClass("gamesquare");
    $("#btnNew").click(function () { ResetBoard(); });
    $("#btnStats").click(function (event) { ShowStats(event); });

    // Handle player move
    $("#gameboard td").on("drop", function(ev) {
        ev.originalEvent.preventDefault();
        var data = ev.originalEvent.dataTransfer.getData("text");
        var ball = document.getElementById(data);
        ev.originalEvent.target.appendChild(ball);
        ev.originalEvent.target.classList.remove("dragsquare");

        BOF.players = ($("#onePlayer").prop("checked") ? 1 : 2);
        $("#onePlayer").prop("disabled", true);
        $("#twoPlayers").prop("disabled", true);

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

        // Increment moves
        BOF.moves++;

        // Check for a win
        if (IsWinner(BOF.toPlay)) {
            BOF.won = true;
            SetNoDrag();
            AddNewStat();
            return;
        }

        // Game continues, update turn
        UpdateTurn();

        if (BOF.players === 1) {
            // One player game, computer's turn
            ChooseMove().done( function() {
                // Increment moves and check for a win
                BOF.moves++;
                if (IsWinner(BOF.toPlay)) {
                    BOF.won = true;
                    SetNoDrag();
                    AddNewStat();
                    return;
                }
                // Game continues, update turn
                UpdateTurn();
            });
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
    SetNoDrag();
    if (!BOF.won) {
        if (BOF.toPlay === "black") {
            BOF.toPlay = "white";
            $(".whiteball").attr("draggable", "true");
        }
        else {
            BOF.toPlay = "black";
            $(".blackball").attr("draggable", "true");
        }
    }
    $("#infoText").html("<strong>Moves: </strong>" + BOF.moves + ", <strong>To move: </strong>" + BOF.toPlay);
}

//---------------------------------------------------------------------------------
// function SetNoDrag
// Prevents moves.
// returns nothing
//---------------------------------------------------------------------------------
function SetNoDrag() {
    $(".blackball").attr("draggable", "false");
    $(".whiteball").attr("draggable", "false");
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
// function ShowStats
// Retrieves and shows game statistics.
// returns nothing
//---------------------------------------------------------------------------------
function ShowStats(event) {
    $.ajax({
        type: "GET",
        url: "stats.php?col=stats&plr=0",
        dataType: "html",
        error: function (req, status, err) {
            // console.log("ShowStats error: "+ err + ": " + status);
        },
        success: function (data) {
            jdata = JSON.parse(data);
            $("#statsTotal").html(jdata.total);
            $("#statsBlack").html(jdata.black);
            $("#statsWhite").html(jdata.white);
            $("#statisticsDialog").dialog("open");
            event.preventDefault();
        }
    });
}

//---------------------------------------------------------------------------------
// function AddNewStat
// Updates a new game statistic in the database.
// returns nothing
//---------------------------------------------------------------------------------
function AddNewStat() {
    $.ajax({
        type: "GET",
        url: "stats.php?col=" + BOF.toPlay + "&plr=" + BOF.players,
        dataType: "html",
        error: function (req, status, err) {
            // console.log("AddNewStat error: "+ err + ": " + status);
        },
        success: function (response) {
            // No action
        }
    });
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
        SetWinner(b1, b2, b3);
        return true; // Same row
    }
    if (b1[1] === b2[1] && b1[1] === b3[1]) {
        SetWinner(b1, b2, b3);
        return true; // Same column
    }
    if (IsInArray([0, 0], [b1, b2, b3]) &&
        IsInArray([1, 1], [b1, b2, b3]) &&
        IsInArray([2, 2], [b1, b2, b3])) {
        SetWinner(b1, b2, b3);
        return true; // Diagonal 1
    }
    if (IsInArray([0, 2], [b1, b2, b3]) &&
        IsInArray([1, 1], [b1, b2, b3]) &&
        IsInArray([2, 0], [b1, b2, b3])) {
        SetWinner(b1, b2, b3);
        return true; // Diagonal 2
    }
    return false;
}

//---------------------------------------------------------------------------------
// function SetWinner
// Sets the background color of the winning combination.
// returns nothing
//---------------------------------------------------------------------------------
function SetWinner(b1, b2, b3) {
    $(".gamesquare[data-row='" + b1[0] + "'][data-col='" + b1[1] + "']").addClass("winnerbg");
    $(".gamesquare[data-row='" + b2[0] + "'][data-col='" + b2[1] + "']").addClass("winnerbg");
    $(".gamesquare[data-row='" + b3[0] + "'][data-col='" + b3[1] + "']").addClass("winnerbg");
    $("#infoText").html("<strong>" + BOF.toPlay.capitalize() + " wins!</strong>");
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
    var w1 = GetRowCol("wb1");
    var w2 = GetRowCol("wb2");
    var w3 = GetRowCol("wb3");
    var b1 = GetRowCol("bb1");
    var b2 = GetRowCol("bb2");
    var b3 = GetRowCol("bb3");
    var ballToMove;
    var oldLocation;
    var newLocation = [-1, -1];

    if (BOF.moves >= 3) { // Enough moves for the opponent to win with next move, may have to block
        if (BOF.moves >= 5) { // Enough moves for a possibility to win: logic to make a winning move
            // Two on the same row (pt 1)
            if ((w1[0] === w2[0] || w1[0] === w3[0]) && (IsFree(-1, w1[0], 0) || IsFree(-1, w1[0], 1) || IsFree(-1, w1[0], 2))) {
                if (w1[0] === w2[0]) {
                    // Move wb3
                    ballToMove = "wb3";
                    oldLocation = [w3[0], w3[1]];
                }
                else {
                    // Move wb2
                    ballToMove = "wb2";
                    oldLocation = [w2[0], w2[1]];
                }
                if (IsFree(-1, w1[0], 0)) {
                    // Move to w1[0], 0
                    newLocation = [w1[0], 0];
                }
                else if (IsFree(-1, w1[0], 1)) {
                    // Move to w1[0], 1
                    newLocation = [w1[0], 1];
                }
                else {
                    // Move to w1[0], 2
                    newLocation = [w1[0], 2];
                }
            }
            // Two on the same row (pt 2)
            else if (w2[0] === w3[0] && (IsFree(-1, w2[0], 0) || IsFree(-1, w2[0], 1) || IsFree(-1, w2[0], 2))) {
                ballToMove = "wb1"; // Move wb1
                oldLocation = [w1[0], w1[1]];
                if (IsFree(-1, w2[0], 0)) {
                    // Move to w2[0], 0
                    newLocation = [w2[0], 0];
                }
                else if (IsFree(-1, w2[0], 1)) {
                    // Move to w2[0], 1
                    newLocation = [w2[0], 1];
                }
                else {
                    // Move to w2[0], 2
                    newLocation = [w2[0], 2];
                }
            }
            // Two in the same column (pt 1)
            else if ((w1[1] === w2[1] || w1[1] === w3[1]) && (IsFree(-1, 0, w1[1]) || IsFree(-1, 1, w1[1]) || IsFree(-1, 2, w1[1]))) {
                if (w1[1] === w2[1]) {
                    ballToMove = "wb3"; // Move wb3
                    oldLocation = [w3[0], w3[1]];
                }
                else {
                    ballToMove = "wb2"; // Move wb2
                    oldLocation = [w2[0], w2[1]];
                }
                if (IsFree(-1, 0, w1[1])) {
                    // Move to 0, w1[1]
                    newLocation = [0, w1[1]];
                }
                else if (IsFree(-1, 1, w1[1])) {
                    // Move to 1, w1[1]
                    newLocation = [1, w1[1]];
                }
                else {
                    // Move to 2, w1[1]
                    newLocation = [2, w1[1]];
                }
            }
            // Two in the same column (pt 2)
            else if (w2[1] === w3[1] && (IsFree(-1, 0, w2[1]) || IsFree(-1, 1, w2[1]) || IsFree(-1, 2, w2[1]))) {
                ballToMove = "wb1"; // Move wb1
                oldLocation = [w1[0], w1[1]];
                if (IsFree(-1, 0, w2[1])) {
                    // Move to 0, w2[1]
                    newLocation = [0, w2[1]];
                }
                else if (IsFree(-1, 1, w2[1])) {
                    // Move to 1, w2[1]
                    newLocation = [1, w2[1]];
                }
                else {
                    // Move to 2, w2[1]
                    newLocation = [2, w2[1]];
                }
            }
            // Two in the same diagonal
            else if (IsInArray([0, 0], [w1, w2, w3]) && IsInArray([1, 1], [w1, w2, w3]) && IsFree(-1, 2, 2)) {
                newLocation = [2, 2];
                ballToMove = (w1.equals([0, 0]) ? (w2.equals([1, 1]) ? "wb3" : "wb2") : (w1.equals([1, 1]) ? (w2.equals([0, 0]) ? "wb3" : "wb2") : "wb1"));
                oldLocation = GetRowCol(ballToMove);
            } else if (IsInArray([0, 0], [w1, w2, w3]) && IsInArray([2, 2], [w1, w2, w3]) && IsFree(-1, 1, 1)) {
                newLocation = [1, 1];
                ballToMove = (w1.equals([0, 0]) ? (w2.equals([2, 2]) ? "wb3" : "wb2") : (w1.equals([2, 2]) ? (w2.equals([0, 0]) ? "wb3" : "wb2") : "wb1"));
                oldLocation = GetRowCol(ballToMove);
            } else if (IsInArray([1, 1], [w1, w2, w3]) && IsInArray([2, 2], [w1, w2, w3]) && IsFree(-1, 0, 0)) {
                newLocation = [0, 0];
                ballToMove = (w1.equals([1, 1]) ? (w2.equals([2, 2]) ? "wb3" : "wb2") : (w1.equals([2, 2]) ? (w2.equals([1, 1]) ? "wb3" : "wb2") : "wb1"));
                oldLocation = GetRowCol(ballToMove);
            } else if (IsInArray([0, 2], [w1, w2, w3]) && IsInArray([1, 1], [w1, w2, w3]) && IsFree(-1, 2, 0)) {
                newLocation = [2, 0];
                ballToMove = (w1.equals([0, 2]) ? (w2.equals([1, 1]) ? "wb3" : "wb2") : (w1.equals([1, 1]) ? (w2.equals([0, 2]) ? "wb3" : "wb2") : "wb1"));
                oldLocation = GetRowCol(ballToMove);
            } else if (IsInArray([0, 2], [w1, w2, w3]) && IsInArray([2, 0], [w1, w2, w3]) && IsFree(-1, 1, 1)) {
                newLocation = [1, 1];
                ballToMove = (w1.equals([0, 2]) ? (w2.equals([2, 0]) ? "wb3" : "wb2") : (w1.equals([2, 0]) ? (w2.equals([0, 2]) ? "wb3" : "wb2") : "wb1"));
                oldLocation = GetRowCol(ballToMove);
            } else if (IsInArray([2, 0], [w1, w2, w3]) && IsInArray([1, 1], [w1, w2, w3]) && IsFree(-1, 0, 2)) {
                newLocation = [0, 2];
                ballToMove = (w1.equals([2, 0]) ? (w2.equals([1, 1]) ? "wb3" : "wb2") : (w1.equals([1, 1]) ? (w2.equals([2, 0]) ? "wb3" : "wb2") : "wb1"));
                oldLocation = GetRowCol(ballToMove);
            }
        } // Moves >= 5

        if (newLocation.equals([-1, -1])) {
            // No winning move was found; need to block?
            if (BOF.moves === 3) {
                ballToMove = "wb2";
            } else if (BOF.moves === 5) {
                ballToMove = "wb3";
            } else {
                while (true) {
                    // Attempt to not select a ball that has two black balls on the same row/column/diagonal
                    ballToMove = ("wb" + Math.floor((Math.random() * 3) + 1));
                    oldLocation = GetRowCol(ballToMove);
                    str = BOF.board[oldLocation[0]][0] + BOF.board[oldLocation[0]][1] + BOF.board[oldLocation[0]][2];
                    if ((str.split("bb").length - 1) === 2) {
                        continue;
                    }
                    str = BOF.board[0][oldLocation[1]] + BOF.board[1][oldLocation[1]] + BOF.board[2][oldLocation[1]];
                    if ((str.split("bb").length - 1) === 2) {
                        continue;
                    }
                    if (oldLocation.equals([0, 0]) || oldLocation.equals([1, 1]) || oldLocation.equals([2, 2])) {
                        str = BOF.board[0][0] + BOF.board[1][1] + BOF.board[2][2];
                        if ((str.split("bb").length - 1) === 2) {
                            continue;
                        }
                    }
                    if (oldLocation.equals([0, 2]) || oldLocation.equals([1, 1]) || oldLocation.equals([2, 0])) {
                        str = BOF.board[0][2] + BOF.board[1][1] + BOF.board[2][0];
                        if ((str.split("bb").length - 1) === 2) {
                            continue;
                        }
                    }
                    break; // Accept this move
                }
            }
            oldLocation = GetRowCol(ballToMove);

            // Two on the same row (pt 1)
            if ((b1[0] === b2[0] || b1[0] === b3[0]) && (IsFree(-1, b1[0], 0) || IsFree(-1, b1[0], 1) || IsFree(-1, b1[0], 2))) {
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
                newLocation = [2, 2];
            } else if (IsInArray([0, 0], [b1, b2, b3]) && IsInArray([2, 2], [b1, b2, b3]) && IsFree(-1, 1, 1)) {
                newLocation = [1, 1];
            } else if (IsInArray([1, 1], [b1, b2, b3]) && IsInArray([2, 2], [b1, b2, b3]) && IsFree(-1, 0, 0)) {
                newLocation = [0, 0];
            } else if (IsInArray([0, 2], [b1, b2, b3]) && IsInArray([1, 1], [b1, b2, b3]) && IsFree(-1, 2, 0)) {
                newLocation = [2, 0];
            } else if (IsInArray([0, 2], [b1, b2, b3]) && IsInArray([2, 0], [b1, b2, b3]) && IsFree(-1, 1, 1)) {
                newLocation = [1, 1];
            } else if (IsInArray([2, 0], [b1, b2, b3]) && IsInArray([1, 1], [b1, b2, b3]) && IsFree(-1, 0, 2)) {
                newLocation = [0, 2];
            }
        }
    } // Moves >= 3

    // Not enough moves yet or no winning/blocking move found: move randomly
    if (newLocation.equals([-1, -1])) {
        if (BOF.moves === 1) {
            ballToMove = "wb1";
        } else if (BOF.moves === 3) {
            ballToMove = "wb2";
        } else if (BOF.moves === 5) {
            ballToMove = "wb3";
        } else {
            while (true) {
                // Attempt to not select a ball that has two black balls on the same row/column/diagonal
                ballToMove = ("wb" + Math.floor((Math.random() * 3) + 1));
                oldLocation = GetRowCol(ballToMove);
                str = BOF.board[oldLocation[0]][0] + BOF.board[oldLocation[0]][1] + BOF.board[oldLocation[0]][2];
                if ((str.split("bb").length - 1) === 2) {
                    continue;
                }
                str = BOF.board[0][oldLocation[1]] + BOF.board[1][oldLocation[1]] + BOF.board[2][oldLocation[1]];
                if ((str.split("bb").length - 1) === 2) {
                    continue;
                }
                if (oldLocation.equals([0, 0]) || oldLocation.equals([1, 1]) || oldLocation.equals([2, 2])) {
                    str = BOF.board[0][0] + BOF.board[1][1] + BOF.board[2][2];
                    if ((str.split("bb").length - 1) === 2) {
                        continue;
                    }
                }
                if (oldLocation.equals([0, 2]) || oldLocation.equals([1, 1]) || oldLocation.equals([2, 0])) {
                    str = BOF.board[0][2] + BOF.board[1][1] + BOF.board[2][0];
                    if ((str.split("bb").length - 1) === 2) {
                        continue;
                    }
                }
                break; // Accept this move
            }
        }
        oldLocation = GetRowCol(ballToMove);

        // Claim center spot if not taken
        if (IsFree(-1, 1, 1)) {
            newLocation = [1, 1];
        } else {
            var i = 0;
            var j = 0;
            do {
                i = Math.floor((Math.random() * 3));
                j = Math.floor((Math.random() * 3));
            } while (!IsFree(-1, i, j));
            newLocation = [i, j];
        }
    }

    console.log(".ballToMove: " + ballToMove);
    console.log(".oldLocation: " + oldLocation[0] + ", " + oldLocation[1]);
    console.log(".newLocation: " + newLocation[0] + ", " + newLocation[1]);

    // Move from oldLocation to newLocation
    if (BOF.moves > 6) {
        BOF.board[oldLocation[0]][oldLocation[1]] = ".";
    }
    BOF.board[newLocation[0]][newLocation[1]] = ballToMove;

    $("#" + ballToMove).animate({
        opacity: '0.2'
    }, 400, "linear", function () {
        $("#" + ballToMove).appendTo(".gamesquare[data-row='" + newLocation[0] + "'][data-col='" + newLocation[1] + "']");
    });

    return $("#" + ballToMove).animate({
        opacity: '1'
    }, 400, "linear").promise();

}

//---------------------------------------------------------------------------------
// Array.prototype.equals
// A method for comparing arrays for equality
// returns true or false
//---------------------------------------------------------------------------------
Array.prototype.equals = function (arr) {
    // Sanity checks
    if (!arr) {
        return false;
    }
    if (this.length != arr.length) {
        return false;
    }
    // Actual comparison
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] != arr[i]) {
            return false; // If even one item is different, no need to continue
        }
    }
    return true;
}

//---------------------------------------------------------------------------------
// String.prototype.capitalize
// A method for capitalizing the first letter of a string
// returns result string
//---------------------------------------------------------------------------------
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}