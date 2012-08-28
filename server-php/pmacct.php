<?php
$flows = array();

if ($_GET['clear'])
{
	shell_exec('pmacct -e');
}
else
{	
	$pmacct_output = shell_exec('pmacct -s -O');

	// print "<pre>$pmacct_output</pre>\n";

	$lines = explode("\n", $pmacct_output);
	array_pop($lines);

	/*
	$ pmacct -s -O
	SRC_IP,DST_IP,SRC_PORT,DST_PORT,PROTOCOL,PACKETS,BYTES
	10.252.224.214,10.91.58.105,0,0,icmp,26,1456
	*/

	$first_line = array_shift($lines);
	$field_names = explode(",", $first_line);

	foreach($lines as $line)
	{
		$fields = explode(",", $line);
		$flow = array();
	
		foreach ($fields as $i => $value)
		{
			$name = strtolower($field_names[$i]);
			$flow[$name] = $value;
		}

		$flows[] = $flow;
	}
}

$output = array(
	"protocol" => "NetGraph-pmacct",
	"doc" => "http://github.com/qris/netgraph",
	"version" => array(1, 1),
	"flows" => $flows
	);

header("Content-type: application/json");
print json_encode($output);
?>
