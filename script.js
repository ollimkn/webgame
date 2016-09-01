// TODO:
// - 1 tai 2 pelaajan valinta
// - tekoäly yhden pelaajan pelissä
// - pallojen siirtely yhden pelaajan pelissä

var BOF = {
    toPlay: "black",
    moves: 0,
    board: [
        [".", ".", "."],
        [".", ".", "."],
        [".", ".", "."]
    ]
};

$(function () {
    $(".blackball").attr("draggable", "true");
    $(".whiteball").attr("draggable", "false");
    $("#gameboard td").addClass("gamesquare");
    $("#txtRound").attr("value", "0");
    $("#winner").hide();
    $("#btnNew").click(function () { ResetBoard(); });

    $("#gameboard td").on("drop", function(ev) {
        ev.originalEvent.preventDefault();
        var data = ev.originalEvent.dataTransfer.getData("text");
        var ball = document.getElementById(data);
        ev.originalEvent.target.appendChild(ball);
        ev.originalEvent.target.classList.remove("dragsquare");

        console.log(data);
        PrintBoard();
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (BOF.board[i][j] === data) {
                    BOF.board[i][j] = ".";
                }
            }
        }
        BOF.board[$("#"+data).parent().attr("data-row")][$("#"+data).parent().attr("data-col")] = data;
        PrintBoard();

        $(".blackball").attr("draggable", "false");
        $(".whiteball").attr("draggable", "false");
        $("#txtRound").attr("value", ++BOF.moves);

        if (WinCheck(BOF.toPlay)) {
            $("#winner").text(BOF.toPlay.toUpperCase() + " wins!");
            $("#winner").show();
            return;
        }
        if (BOF.toPlay === "black") {
            BOF.toPlay = "white";
            $(".whiteball").attr("draggable", "true");
        }
        else {
            BOF.toPlay = "black";
            $(".blackball").attr("draggable", "true");
        }
        $("#btnTurn").toggleClass("turnWhite");
    });

    $("#gameboard td").on("dragover", function (ev) {
        if (ev.originalEvent.target.classList.contains("gamesquare")) {
            if (IsFree(ev.originalEvent.target)) {
                ev.originalEvent.target.classList.add("dragsquare");
                ev.originalEvent.preventDefault();
            }
        }
    });

    $("#gameboard td").on("dragleave", function (ev) {
        ev.originalEvent.target.classList.remove("dragsquare");
    });

    $(".blackball, .whiteball").on("dragstart", function (ev) {
        ev.originalEvent.dataTransfer.setData("text", ev.originalEvent.target.id);
    });

});

function ResetBoard() {
    window.location.reload(true);
}

function PrintBoard() {
    var row = "";
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            row += BOF.board[i][j] + " ";
        }
        console.log(row);
        row = "";
    }
}

function IsFree(square, r, c) {
    if (square === -1) {
        return (BOF.board[r][c] === ".");
    }
    console.log(square.dataset.row + ", " + square.dataset.col);
    return (BOF.board[square.dataset.row][square.dataset.col] === ".");
}

function WinCheck(player) {
    if (BOF.moves < 5) {
        return 0;
    }
    var b1 = GetRowCol( player === "black" ? "bb1" : "wb1" );
    var b2 = GetRowCol( player === "black" ? "bb2" : "wb2" );
    var b3 = GetRowCol( player === "black" ? "bb3" : "wb3" );

    if (b1[0] === b2[0] && b1[0] === b3[0]) {
        return 1; // Same row
    }
    if (b1[1] === b2[1] && b1[1] === b3[1]) {
        return 1; // Same column
    }
    if (IsInArray(["0", "0"], [b1, b2, b3]) &&
        IsInArray(["1", "1"], [b1, b2, b3]) &&
        IsInArray(["2", "2"], [b1, b2, b3])) {
        return 1; // Diagonal 1
    }
    if (IsInArray(["0", "2"], [b1, b2, b3]) &&
        IsInArray(["1", "1"], [b1, b2, b3]) &&
        IsInArray(["2", "0"], [b1, b2, b3])) {
        return 1; // Diagonal 2
    }
    return 0;
}

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

function IsInArray(loc, locarr) {
    for (var i = 0; i < 3; i++) {
        if (locarr[i][0] === loc[0] && locarr[i][1] === loc[1]) {
            return true;
        }
    }
    return false;   // Not found
}

function ChooseMove() {
    var b1 = GetRowCol(BOF.toPlay === "black" ? "bb1" : "wb1");
    var b2 = GetRowCol(BOF.toPlay === "black" ? "bb2" : "wb2");
    var b3 = GetRowCol(BOF.toPlay === "black" ? "bb3" : "wb3");
    var ballToMove = (BOF.toPlay === "black" ? "b" : "w");

    if ((b1[0] === b2[0] || b1[0] === b3[0]) && (IsFree(-1, b1[0], 0) || IsFree(-1, b1[0], 1) || IsFree(-1, b1[0], 2))) {
        if (b1[0] === b2[0]) {
            ballToMove += "b3"; // Move b3
        }
        else {
            ballToMove += "b2"; // Move b2
        }
        if (IsFree(-1, b1[0], 0)) {
            // Move to b1[0], 0
        }
        else if (IsFree(-1, b1[0], 0)) {
            // Move to b1[0], 1
        }
        else {
            // Move to b1[0], 2
        }
        return 1;
    }
    if (b2[0] === b3[0] && (IsFree(-1, b2[0], 0) || IsFree(-1, b2[0], 1) || IsFree(-1, b2[0], 2))) {
        ballToMove += "b1"; // Move b1
        if (IsFree(-1, b2[0], 0)) {
            // Move to b2[0], 0
        }
        else if (IsFree(-1, b2[0], 1)) {
            // Move to b2[0], 1
        }
        else {
            // Move to b2[0], 2
        }
        return 1;
    }
    if ((b1[1] === b2[1] || b1[1] === b3[1]) && (IsFree(-1, 0, b1[1]) || IsFree(-1, 1, b1[1]) || IsFree(-1, 2, b1[1]))) {
        if (b1[1] === b2[1]) {
            ballToMove += "b3"; // Move b3
        }
        else {
            ballToMove += "b2"; // Move b2
        }
        if (IsFree(-1, 0, b1[1])) {
            // Move to 0, b1[1]
        }
        else if (IsFree(-1, 1, b1[1])) {
            // Move to 1, b1[1]
        }
        else {
            // Move to 2, b1[1]
        }
        return 1;
    }
    if (b2[1] === b3[1] && (IsFree(-1, 0, b2[1]) || IsFree(-1, 1, b2[1]) || IsFree(-1, 2, b2[1]))) {
        ballToMove += "b1"; // Move b1
        if (IsFree(-1, 0, b2[1])) {
            // Move to 0, b2[1]
        }
        else if (IsFree(-1, 1, b2[1])) {
            // Move to 1, b2[1]
        }
        else {
            // Move to 2, b2[1]
        }
        return 1;
    }
    if (((IsInArray(["0", "0"], [b1, b2, b3]) && IsInArray(["1", "1"], [b1, b2, b3])) ||
        (IsInArray(["0", "0"], [b1, b2, b3]) && IsInArray(["2", "2"], [b1, b2, b3])) ||
        (IsInArray(["1", "1"], [b1, b2, b3]) && IsInArray(["2", "2"], [b1, b2, b3]))) && 
        (IsFree(-1, 0, 0) || IsFree(-1, 1, 1) || IsFree(-1, 2, 2))) {
        return 1; // Two balls in the same diagonal with an empty spot; move for a win
    }
    if (((IsInArray(["0", "2"], [b1, b2, b3]) && IsInArray(["1", "1"], [b1, b2, b3])) ||
        (IsInArray(["0", "2"], [b1, b2, b3]) && IsInArray(["2", "0"], [b1, b2, b3])) ||
        (IsInArray(["2", "0"], [b1, b2, b3]) && IsInArray(["1", "1"], [b1, b2, b3]))) && 
        (IsFree(-1, 0, 2) || IsFree(-1, 1, 1) || IsFree(-1, 2, 0))) {
        return 1; // Two balls in the same diagonal with an empty spot; move for a win
    }

    // TODO: better logic; for now just random
    ballToMove += ("b" + Math.floor((Math.random() * 3) + 1));
    var i = 0;
    var j = 0;
    do {
        i = Math.floor((Math.random() * 3) + 1);
        j = Math.floor((Math.random() * 3) + 1);
    } while (!IsFree(-1, i, j));
    // Move to i, j

}