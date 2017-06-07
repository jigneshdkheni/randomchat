<?php
	$con = mysql_connect('localhost','root','');
	if(!$con)
	{
		die('not connect');
		exit;
	}
	$db = mysql_select_db('chat',$con);	

	$postdata = file_get_contents("php://input");
    $request = json_decode($postdata);

    $getuser = mysql_query("select * from users where name ='$request->firstname'");
    $get = mysql_fetch_array($getuser);

    if($get)
	{
		$msg = array(
			'id'=>$get['id'],
			'name' => $get['name']
		);

		$response = array(
			'status'=>'1',
			'data' => $msg
		);
	}
	else
	{
		$response = array(
			'status'=>'0',
			'data' => 'not found'
		);
	}
	echo json_encode($response);

?>