var socket  = require( './node_modules/socket.io' );
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql   = require('mysql');
var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

var users = [];

var connectiondb = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '12345',
  database : 'chat'
});

connectiondb.connect(function(err){
	if(!err) {
	    console.log("Database is connected ... nn");    
	} else {
	    console.log("Error connecting database ... nn");    
	}
});

io.on('connection', function(socket){
	socket.on('newuser', function(data,status){
		
  		socket.deviceid = data.deviceid;
  		var obj = {
  			deviceid: data.deviceid,
  			socketid: socket.id,
  			invite:'false'
  		};

  		users.push(obj);
  			
		connectiondb.query('SELECT * FROM room WHERE send_from = ? Union SELECT * FROM room WHERE send_to = ? ORDER by id DESC',[data.deviceid,data.deviceid],function(err,result){
			var r_device=[];
			if(result.length==0)
			{
				status({status:false});
			}else{
				for(var i=0;i<result.length;i++)
				{
					temp="";
			        temp=result[i];
			        temp['last_updated'] = changedate(result[i].last_updated);
			        r_device.push(temp);
				}
				status({status:true,room:r_device});
			}
		});
	});

	function changedate(dat)
    {
       var currentdate = new Date(dat); 

       var mm = currentdate.getMonth() + 1;
       var dd = currentdate.getDate();

       var datetime =  + currentdate.getFullYear()+ "/"
           + (mm>9 ? '' : '0') + mm + "/" 
           + (dd>9 ? '' : '0') + dd + " "  
           + currentdate.getHours() + ":"  
           + currentdate.getMinutes() + ":" 
           + currentdate.getSeconds();

       return datetime;
    }

	socket.on('getrandom_user',function(data,callback){
		connectiondb.query('SELECT * FROM room WHERE send_from = ? Union SELECT * FROM room WHERE send_to = ? ORDER by id DESC',[data.deviceid,data.deviceid],function(err,result){
			var r_device=[];
			
			for(var i=0;i<result.length;i++)
			{
				if(result[i].send_from!=data.deviceid)
				{
					r_device.push(result[i].send_from);
				}
				if(result[i].send_to!=data.deviceid)
				{
					r_device.push(result[i].send_to);
				}
			}
			for(var i=0;i<users.length;i++)
			{
				if(users[i].deviceid!=data.deviceid && users[i].invite=='false')
				{
					if (r_device.indexOf(users[i].deviceid) >= 0) {
					    
					}else{
						//users[i].invite='true';
						console.log(users[i]);
						// socket.emit('random_user', {status:true,sender:users[i].socketid,deviceid:users[i].deviceid});
						callback({status:true,sender:users[i].socketid,deviceid:users[i].deviceid});
						io.to(users[i].socketid).emit('receive_random_user', {status:true,sender:socket.id,deviceid:data.deviceid});
					}
				}
			}
		});
		//callback({status:false});
	});

	socket.on('openroom',function(data,callback){
		connectiondb.query('SELECT * FROM message WHERE room_id = ?',[data.rid],function(err,result){
			callback({'messages':result});
		});
	});

	socket.on('sendmessage',function(data,callback){
		connectiondb.query('SELECT * FROM room WHERE send_from = ? AND send_to = ? Union SELECT * FROM room WHERE send_from = ? AND send_to = ?',[data.send_from,data.send_to,data.send_to,data.send_from],function(err,result){
			
			if(result.length==0)
			{
				var roomsg  = {id: 0, send_from:data.send_from,send_to:data.send_to, last_msg:data.message,fromread:data.send_from,msgread:0,last_updated:new Date().toISOString()};
				var query = connectiondb.query('INSERT INTO room SET ?', roomsg, function(err, result1) 
				{
					var message  = {id: 0, message:data.message,isfrom:data.send_from,filetype:'',file_url:'',created_at:new Date().toISOString(),room_id:result1.insertId};
					var messag = connectiondb.query('INSERT INTO message SET ?',message,function(error,res){});
				});

				connectiondb.query('SELECT * FROM room WHERE send_from = ? Union SELECT * FROM room WHERE send_to = ? ORDER by id DESC',[data.send_from,data.send_from],function(err,result1){
					var r_device=[];
					for(var i=0;i<result1.length;i++)
					{
						temp="";
				        temp=result1[i];
				        temp['last_updated'] = changedate(result1[i].last_updated);
				        r_device.push(temp);
					}
					socket.emit('setroom',{'room':r_device});
				});
				connectiondb.query('SELECT * FROM room WHERE send_from = ? Union SELECT * FROM room WHERE send_to = ? ORDER by id DESC',[data.send_to,data.send_to],function(err,result1){
					var r_device=[];
					for(var i=0;i<result1.length;i++)
					{
						temp="";
				        temp=result1[i];
				        temp['last_updated'] = changedate(result1[i].last_updated);
				        r_device.push(temp);
					}
					io.to(getuser_socket(data.send_to)).emit('setroom',{'room':r_device});
				});
			}
			else
			{
				var query = connectiondb.query('UPDATE room SET last_msg = ? WHERE id = ?', [data.message,result[0].id], function(err, result4) 
				{
				});	

				var message  = {id: 0, message:data.message,isfrom:data.send_from,filetype:'',file_url:'',created_at:new Date().toISOString(),room_id:result[0].id};
				var messag = connectiondb.query('INSERT INTO message SET ?',message,function(error,res){});
			}
		});
		callback({'status':true});

		io.to(getuser_socket(data.send_to)).emit('receivemessage', {message:data.message,isfrom:data.send_from});
	});

	function getuser_socket(id)
	{
		for(var j=0;j<users.length;j++)
		{
			if(users[j].deviceid==id)
			{
				return users[j].socketid;
			}
		}
	}

	socket.on('disconnect', function(){
	    users = users.filter(function(item) { return item.deviceid !== socket.deviceid; });
	});

	socket.on('closechat', function(data) {
		
		for(var i=0;i<users.length;i++)
		{
			if(users[i].socketid==data.sid)
			{
				users[i].invite = 'false';
			}
		}
		console.log(users);
		io.to(data.sid).emit('close');
  	});

	function emitusers(){
		setTimeout(function(){
			io.emit('users',users);
		}, 1000);
	}
});

http.listen(8080);