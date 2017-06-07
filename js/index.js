var app = angular.module('chatApp', ['ngRoute']);
var socket, nickname, ownerid;
var userdata,roomlist;
var url = 'http://52.221.229.17';
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'login.html',
        controller: 'AuthController'
      }).
      when('/chat', {
        templateUrl: 'chat.html',
        controller: 'ChatController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }
]);

app.controller('AuthController', function ($scope,$location,$http) {

  $scope.login = function(){
      $scope.connect();
  }

  $scope.connect = function(){
      // socket = io.connect(url+':8890');
      socket = io.connect(url);

      socket.emit('request_rooms',{user_id: $scope.nickname},function(data){
          nickname = $scope.nickname;
          console.log(data);
          roomlist = data.room;
          $scope.$apply(function(){
             $location.path('/chat');
          });
      });
  }

});

app.controller('ChatController', function ($scope,$location,$timeout,$http) {
    /*if(nickname == ''){
      $location.path('/');
      return false;
    }*/
    $scope.messages = [];
    $scope.mynickname = nickname;
    
    
    if(roomlist)
    {
        $scope.roomlist = roomlist;
    }

    /*socket.emit('getrandom_user',{deviceid: nickname},function(data){
      console.log(data);
      $scope.$apply(function(){
        $scope.connected_user = data;
      });
    });

    socket.on('receive_random_user',function(data){
      console.log(data);
      $scope.$apply(function(){
        $scope.connected_user = data;
      });
    });*/
   
    $scope.sendMessage = function(msg,send_to){
      $scope.msg='';
      socket.emit('sendmessage',{message:msg,send_from:nickname,send_to:send_to},function(callback){
        console.log(callback);
      });
      temp={};
      temp['message']=msg;
      temp['isfrom']=nickname;
      $scope.messages.push(temp);
    }

    socket.on('receivemessage',function(data){
      $scope.$apply(function(){
        temp={};
        temp['message']=data.message;
        temp['isfrom']=data.isfrom;
        $scope.messages.push(temp);
      });
    });

    socket.on('update_rooms',function(data){
      $scope.$apply(function(){
        $scope.roomlist = data;
      });
    });

    $scope.openroom = function(rid)
    {
        socket.emit('getroom_conversion',{roomid:rid},function(data){
            console.log(data);
        });
    }

    $scope.closechat = function(sid)
    {
       socket.emit('closechat',{'sid':sid});
       socket.emit('disconnect');
    }

    socket.on('close',function(){
        console.log('call disconnect');
    });

    $scope.scrollToBottom = function(){
      $timeout(function() {
        $('#chat-data').scrollTop($('#chat-data')[0].scrollHeight);
      }, 0, false);
    }
});