<?php
$col = $_REQUEST["col"];
$plr = $_REQUEST["plr"];

$con = mysqli_connect("localhost", "ollimkn", "cotw11", "webgame_stats");
if (!$con) {
    die("Could not connect: " . $con->connect_error);
}

if ($col == "stats") {
	$result = $con->query("SELECT id FROM stats");
	$total = $result->num_rows;
	$result = $con->query("SELECT id FROM stats WHERE wonby = \"black\"");
	$totalblack = $result->num_rows;
	$totalwhite = $total - $totalblack;
	echo "{ \"total\": " . $total . ", \"black\": " . $totalblack . ", \"white\": " . $totalwhite . " }";
} elseif ($col == "black" || $col == "white") {
	if ($con->query("INSERT INTO stats (wonby, players) VALUES (\"" . $col . "\", \"" . $plr . "\")") === TRUE) {
		echo "New record created successfully";
	} else {
		echo "Error: " . $con->error;
	}
} else {
	// Unknown command, no action
}

$con->close();

?>
