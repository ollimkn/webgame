<?php
$cmd = $_REQUEST["cmd"];

$con = mysqli_connect('localhost','ollimkn','cotw11','webgame_stats');
if (!$con) {
    die('Could not connect: ' . mysqli_error($con));
}

if ($cmd == "stats") {
	$sql = "SELECT id FROM stats";
	$result = $con->query($sql);
	$total = $result->num_rows;
	$sql = "SELECT id FROM stats WHERE wonby = 'black'";
	$result = $con->query($sql);
	$totalblack = $result->num_rows;
	$totalwhite = $total - $totalblack;
	echo "{ total: " . $total . ", black: " . $totalblack . ", white: " . $totalwhite . " }";
} elseif ($cmd == "black" || $cmd == "white") {
	$sql = "INSERT INTO stats (time, wonby) VALUES ('" . $cmd . "', '" . getdate() . "')";
	$con->query($sql);
} else {
	// Unknown command, no action
}

$conn->close();

?>
