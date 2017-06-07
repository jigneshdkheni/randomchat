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

    /*$getuser = mysql_query("select * from users where name ='$request->firstname'");
    $get = mysql_fetch_array($getuser);*/

    $getroom = mysql_query("select * from room where send_from = '$request->userid' or send_to = '$request->userid'");
    $msg = array();
    while($getrooms = mysql_fetch_array($getroom))
    {
    	$temp="";
		$temp['room_id'] = intval($getrooms['id']);
		$temp['socketid']=NULL;
		if($getrooms['send_from']!=$request->userid)
		{
			$userinfo = mysql_query("select * from users where id=$getrooms[send_from]");
			$user = mysql_fetch_array($userinfo);
			$temp['id'] = intval($user['id']);
			$temp['nickname'] = $user['name'];
		}
		else if($getrooms['send_to']!=$request->userid) {
			$userinfo = mysql_query("select * from users where id=$getrooms[send_to]");
			$user = mysql_fetch_array($userinfo);
			$temp['id'] = intval($user['id']);
			$temp['nickname'] = $user['name'];
		}
		array_push($msg,$temp);
    }

    if($msg)
	{
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