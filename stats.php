// Handle access to MySQL database
// database: webgame_stats
// table: stats
// columns:
//	id - INT, automatic, key
//	time - TIMESTAMP, default CURRENT_TIME
//	wonby - CHAR(5), either "black" or "white"
//	players - INT, either 1 or 2

<?php
// Parameters from query string
$col = $_REQUEST["col"];
$plr = $_REQUEST["plr"];

// Connect to MySQL
$con = mysqli_connect("localhost", "ollimkn", "cotw11", "webgame_stats");
if (!$con) {
    die("Could not connect: " . $con->connect_error);
}

if ($col == "stats") {
	// Get statistics
	$result = $con->query("SELECT id FROM stats");
	$total = $result->num_rows;
	$result = $con->query("SELECT id FROM stats WHERE wonby = \"black\"");
	$totalblack = $result->num_rows;
	$totalwhite = $total - $totalblack;
	echo "{ \"total\": " . $total . ", \"black\": " . $totalblack . ", \"white\": " . $totalwhite . " }";
} elseif ($col == "black" || $col == "white") {
	// Create a new entry
	if ($con->query("INSERT INTO stats (wonby, players) VALUES (\"" . $col . "\", \"" . $plr . "\")") === TRUE) {
		// echo "New record created successfully";
	} else {
		// echo "Error: " . $con->error;
	}
} else {
	// Unknown command, no action
}

// Close MySQL connection
$con->close();

?>
