var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var usr = require('./public/User');

var port = process.env.PORT || 5000;

//var listOfSockets = [];
listOfUsers = [];

// Serve our index.html page at the root url
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/originalClient.html');
});

// Have express serve all of our files in the public directory
app.use(express.static('public'));

// Code in this block is run every time a new socketIO connection is made
io.on('connection', function (socket) {

  // handle new connected user
  console.log(socket.id + ' connected');
  var newUser = usr();
  newUser.socketID = socket.id;

  // assign the user some id
  var randdate = Date.now() % 500000; var rando = Math.random() * 500000; var rando2 = Math.ceil(rando); var chatID = randdate + rando2;
  newUser.currentID = chatID;
  listOfUsers.push(newUser);
  console.log(listOfUsers);

  socket.join(socket.id);

  // tell the user about its new id
  //io.emit('user-newID', chatID);
  io.to(socket.id).emit('user-newID', chatID);
  io.to(socket.id).emit('user-message', "Welcome to UmbraChat! How to use: 1) Create Chat Room with Random ID.  2) Share your Current Chat ID with someone.  3) That person enters your chat ID and clicks Submit.  At any point, input a numerical value into the Encryption Key. Two people with the same encryption key can speak without others understanding their conversation.");



  socket.on('createChatRoom',function(){
    var randdate = Date.now() % 500000; var rando = Math.random() * 500000; var rando2 = Math.ceil(rando);
    var chatroomID = randdate + rando2;

    updateUserChatroomID(socket.id, chatroomID);

    socket.join(chatroomID);
  });

  socket.on('joinChatRoom',function(existingUserCurrentID){
    console.log('trying to join room with personID: '+existingUserCurrentID);

    for(var ind=0; ind < listOfUsers.length; ind++){
      if(listOfUsers[ind].currentID == existingUserCurrentID){
        var targetChatroomID = listOfUsers[ind].chatroomID;
        console.log('targetRoom: ' + targetChatroomID);
        updateUserChatroomID(socket.id, targetChatroomID);
        socket.join(targetChatroomID);
        return 0;
      }
    }
    console.log('join chatroom not successful');
  });
  // You can do something when the connection disconnects
  socket.on('disconnect', function(){
    console.log(socket.id + ' disconnected');

    // locate the user instance and remove it
    for(var ind=0; ind < listOfUsers.length; ind++){
      if(listOfUsers[ind].socketID == socket.id){ //found the user
        listOfUsers.splice(ind,1);
      }
    }
  });

  // message is our custom event, emit the message to everyone
  socket.on('message', function(msg, currentID) {
    var chatroomID = findUserChatRoomID(currentID);

    io.to(chatroomID).emit('user-message', msg);


    var randdate = Date.now() % 500000; var rando = Math.random() * 500000; var rando2 = Math.ceil(rando); var newChatID = randdate + rando2;
    io.to(socket.id).emit('user-newID', newChatID);

    updateUserID(currentID, newChatID);

    /*
    console.log("Message: " + msg);
    io.emit('user-message', socket.id + ": " + msg);
    */
  });
});

// Starts the web server at the given port
http.listen(port, function(){
  console.log('Listening on ' + port);
});

function updateUserChatroomID(userSocketID, newChatroomID){
  for(var ind=0; ind<listOfUsers.length; ind++){
    if(listOfUsers[ind].socketID == userSocketID){
      listOfUsers[ind].chatroomID = newChatroomID;
      console.log('chatroom id updated to ' + newChatroomID);
      return 0;
    }
  }
  console.log('could not update chatroomID');
}

function findUserChatRoomID(userCurrentID){
  for(var ind=0; ind<listOfUsers.length; ind++){
    if(userCurrentID == listOfUsers[ind].currentID){
      return listOfUsers[ind].chatroomID;
    }
  }
  console.log('cannot find the ChatRoom');
}

function updateUserID(oldID, newID){
  for(var ind=0; ind < listOfUsers.length; ind++){
    if(listOfUsers[ind].currentID == oldID){
      listOfUsers[ind].currentID = newID;

      console.log('id updated');
      console.log(listOfUsers);
      return 0;
    }
  }
}
/*
function findUserSocketFromCurrentID(currentID){
  for(var ind=0; ind<listOfUsers.length; ind++){
    if(listOfUsers[ind].currentID == currentID){
      return listOfUsers[ind].socketID;
    }
  }
  console.log('cannot find user with the currentID: ' + currentID);
}
*/

/*
function findUserCurrentIDFromSocketID(socketID){
  for(var ind=0; ind<listOfUsers.length; ind++){
    if(listOfUsers[ind].socketID == socketID){
      return listOfUsers[ind].currentID;
    }
  }
  console.log('cannot find');
}
*/

/*
function joinChatroom(socketID, chatroomID){
  for(var ind =0; ind < listOfUsers.length; ind++){
    if(listOfUsers[ind].socketID == socketID){
      listOfUsers[ind].chatroomID = chatroomID;
      break;
    }
  }
  console.log('cannot join');
}
*/


