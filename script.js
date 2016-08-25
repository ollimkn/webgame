// TODO:
// - 1 tai 2 pelaajan valinta
// - tekoäly yhden pelaajan pelissä
// - pallojen siirtely yhden pelaajan pelissä

var BOF = {
    toPlay: "black",
    moves: 0
};

$(function () {
    $(".blackball").attr("draggable", "true");
    $(".whiteball").attr("draggable", "false");
    $("#gameboard td").addClass("gamesquare");
    $("#txtRound").attr("value", "0");
    $("#winner").hide();

    $("#gameboard td").on("drop", function(ev) {
        ev.originalEvent.preventDefault();
        var data = ev.originalEvent.dataTransfer.getData("text");
        ev.originalEvent.target.appendChild(document.getElementById(data));
        ev.originalEvent.target.classList.remove("dragsquare");

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
            if (!BallCheck(ev.originalEvent.target)) {
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

function BallCheck(square) {
    var row = square.dataset.row;
    var col = square.dataset.col;
    var b1 = GetRowCol($("#bb1"));
    var b2 = GetRowCol($("#bb2"));
    var b3 = GetRowCol($("#bb3"));
    var w1 = GetRowCol($("#wb1"));
    var w2 = GetRowCol($("#wb2"));
    var w3 = GetRowCol($("#wb3"));

    if (IsInArray([row, col], [b1, b2, b3]) || IsInArray([row, col], [w1, w2, w3])) {
        return true;
    }
    return false;
}

function WinCheck(player) {
    if (BOF.moves < 5) {
        return 0;
    }
    var b1 = GetRowCol( player === "black" ? $("#bb1") : $("#wb1") );
    var b2 = GetRowCol( player === "black" ? $("#bb2") : $("#wb2") );
    var b3 = GetRowCol( player === "black" ? $("#bb3") : $("#wb3") );

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

function GetRowCol(ball) {
    if (ball.parent().hasClass("gamesquare")) {
        return [ball.parent().attr("data-row"), ball.parent().attr("data-col")];
    }
    return [-1, -1]; // Not in play yet
}

function IsInArray(loc, arr) {
    for (var i = 0; i < 3; i++) {
        if (arr[i][0] === loc[0] && arr[i][1] === loc[1]) {
            return true;
        }
    }
    return false;   // Not found
}