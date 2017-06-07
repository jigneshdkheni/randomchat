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
    $url = "http://192.168.0.106/pc/upload/";

	$getroom = mysql_query("select * from room where send_from = '$request->from' AND send_to = '$request->to' or send_from = '$request->to' AND send_to = '$request->from'");

	$get = mysql_fetch_array($getroom);
	
	$page = $_GET['page'];
	if($page==1)
	{
		$start = 0;
	}
	else
	{
		$start = ($page - 1) * 15;
	}

	if($get['id'])
	{
		mysql_query("update room set msgread=0 where id = $get[id]");
		$msg = array();
		$getmessages = mysql_query("select m.*,u.name from message as m,users u where u.id=m.isfrom And m.room_id = $get[id] ORDER BY m.id desc LIMIT $start, 15");
		while($messages = mysql_fetch_array($getmessages))
		{  
			$temp="";
			$temp['id'] = intval($messages['id']);
			$temp['message'] = $messages['message'];
			$temp['isfrom'] = intval($messages['isfrom']);
			$temp['created_at'] = date($messages['created_at']);
			$temp['room_id'] = intval($messages['room_id']);
			$temp['from'] = $messages['name'];
			if($messages['file_url'])
			{
				$temp['file'] = $url.$messages['file_url'];
				$temp['filetype'] = $messages['filetype'];
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
	}
?>