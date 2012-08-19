<?php
/*
Output format looks like this (from sudo iptables -L -nv):

Chain FORWARD (policy ACCEPT 658 packets, 40911 bytes)
 pkts bytes target     prot opt in     out     source               destination         
    0     0 ACCEPT     all  --  *      virbr0  0.0.0.0/0            192.168.122.0/24    state RELATED,ESTABLISHED 
    0     0 ACCEPT     all  --  virbr0 *       192.168.122.0/24     0.0.0.0/0           
    0     0 ACCEPT     all  --  virbr0 virbr0  0.0.0.0/0            0.0.0.0/0           
    0     0 REJECT     all  --  *      virbr0  0.0.0.0/0            0.0.0.0/0           reject-with icmp-port-unreachable 
    0     0 REJECT     all  --  virbr0 *       0.0.0.0/0            0.0.0.0/0           reject-with icmp-port-unreachable 
*/

$cmd = 'sudo iptables -t mangle -L -nvx';
$cmd_output = shell_exec($cmd);
$chains = array();

// print "<pre>$mtr_output</pre>\n";

$lines = explode("\n", $cmd_output);
array_pop($lines);

$current_chain_name = NULL;

foreach($lines as $line)
{
	$fields = preg_split("/\\s+/", $line, 11);
	
	if (count($fields) == 1 && $fields[0] == '')
	{
		// skip blank lines
	}
	elseif ($fields[0] == "Chain")
	{
		$current_chain_name = $fields[1];
		$current_chain = array('policy' => $fields[3],
			'packets' => $fields[4],
			'bytes' => $fields[6],
			'rules' => array());
		$chains[$current_chain_name] = $current_chain;
	}
	elseif ($fields[0] == '' and $fields[1] == 'pkts')
	{
		// skip the header line
	}
	elseif ($fields[0] == '' and is_numeric($fields[1]))
	{
		$rule = array('packets' => $fields[1], 'bytes' => $fields[2],
			'target' => $fields[3], 'proto' => $fields[4],
			'opts' => $fields[5], 'inif' => $fields[6],
			'outif' => $fields[7], 'src' => $fields[8],
			'dst' => $fields[9], 'match_and_target_opts' => $fields[10]);
		array_push($chains[$current_chain_name]['rules'], $rule);
	}
	else
	{
		error_log("Unrecognised output from $cmd: $line");
	}
}

$output = array(
	"protocol" => "NetGraph-iptables",
	"doc" => "http://github.com/qris/netgraph",
	"version" => array(1, 1),
	"chains" => $chains
	);

header("Content-type: application/json");
print json_encode($output);
?>
