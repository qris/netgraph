<?php
$mtr_output = shell_exec('mtr -c 1 -p --raw 4.2.2.2');
// $mtr_output = shell_exec('ssh root@localhost -p 4444 mtr -c 1 -p --raw 4.2.2.2');
$hops = array();
$prev_hop = NULL;

// print "<pre>$mtr_output</pre>\n";

$lines = explode("\n", $mtr_output);
array_pop($lines);

foreach($lines as $line)
{
	/*
	# mtr -c 1 -p --raw 4.2.2.2
	h 0 10.252.225.77
	p 0 69362
	h 1 10.252.224.238
	p 1 69314
	h 2 172.26.1.237
	p 2 69099
	h 3 10.205.64.182
	p 3 69861
	*/

	$fields = explode(" ", $line);
	$hop = $fields[1];

	// Index from 1 instead of 0, to force json_encode to output
	// a hash instead of (either a hash or an array, depending on
	// whether any indexes are missing: very annoying to deal with!)
	// see for example:
	// print json_encode(array(0=>"a", 1=>"b"));
	// print json_encode(array(0=>"a", 2=>"c"));
	$hop++;
	
	if (!is_null($prev_hop) and $hop == $prev_hop)
	{
		$details = $hops[$hop];
	}
	else
	{
		$details = array();
		$prev_hop = $hop;
	}

	$type = $fields[0];
    
	if ($type == "h")
	{
		$details['host'] = $fields[2];
	}
	elseif ($type == "p")
	{
		$details['rtt'] = $fields[2];
	}

	$hops[$hop] = $details;
}

$output = array(
	"protocol" => "NetGraph-traceroute",
	"doc" => "http://github.com/qris/netgraph",
	"version" => array(1, 1),
	"hops" => $hops
	);

header("Content-type: application/json");
print json_encode($output);
?>
