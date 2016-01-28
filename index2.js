var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 5000;

//var listOfSockets = [];
//listOfUsers = [];

// Serve our index.html page at the root url
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/newClient.html');
});
// Have express serve all of our files in the public directory
app.use(express.static('public'));
// Starts the web server at the given port
http.listen(port, function(){
  console.log('Listening on ' + port); // TODO: remove this line?
});

// some parameters
var administratorCodeLength = 50; // chatroom administrator's access code length (number of characters)

// Some useful tools
// // remove element form array at index
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
// generate a random string with length of len
function makeRandomString(len){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// invitation code
usedInvitationCode = [];
function addToUsedInvitationCode(newCode){
	usedInvitationCode.push(newCode);
}
function isInvitationCodeUsed(codeToCheck){
	// return -1 if not found
	// return 0 or larger integer as index if found
	for(var ind=0; ind < usedInvitationCode.length; ind++){
		if(usedInvitationCode[ind] == codeToCheck){
			return ind;
		}
	}
	return -1;
}
function removeFromUsedInvitationCodeList(codeToRemove){
	// return 1 if removed
	// return 0 if not found
	var removeInd = isInvitationCodeUsed(codeToRemove);
	if(removeInd > -1){
		usedInvitationCode.remove(removeInd);
		return 1;
	}
	return 0;
}
function assignNewInvitationCode(){
	// returns an invitation code that is not used. Note: This won't add the code to the list.
	// TODO Soon: implement this
}

listOfChatRooms = [];
function ChatRoom(){
	var chatroomID = -1; // chatroomID is always an integer
	var listOfInvitationCodes = [];
	var verificationCode = ""; // verification code is a String of length 30 or more
	var administratorCode = ""
	
	this.getID = function(){return chatroomID;}
	this.setID = function(newID){chatroomID = newID;}
	
	this.getInvitationCodeIndex = function(codeLookFor){
		// returns the index of the invitation code for this chatrooom
		// returns -1 if not found
		for(var ind=0; ind < listOfInvitationCodes.length; ind++){
			if(listOfInvitationCodes[ind] == codeLookFor){
				return ind;
			}
		}
		return -1;
	}
	this.addInvitationCode = function(newCode){listOfInvitationCodes.push(newCode);}
	this.removeInvitationCode = function(codeToRemove){
		// remove the invitation code from this chatroom
		// returns 1 if found and removed. returns 0 if not found
		var indToRemove = this.getInvitationCodeIndex(codeToRemove);
		if(indToRemove >= 0){ // if the code is found
			listOfInvitationCodes.remove(indToRemove);
			return 1;
		}
		return 0;
	}
	
	this.setVerificationCode = function(newVerificationCode){verificationCode = newVerificationCode;}
	this.getVerificationCode = function(){return verificationCode;}
	
	this.setAdministratorCode(newCode){
		administratorCode = newCode;
	}
	this.getAdministratorCode(){
		return administratorCode;
	}
	
}
listOfChatRooms.sort(function(chatroom1,chatroom2){
	return chatroom1.chatroomID - chatroom2.chatroomID;
});

function getChatroomInd(targetID){
	// returns the index of the chatroom on the list (0 to inf)
	// if not found, return -1
	
	for(var ind=0; ind < listOfChatRooms.length; ind++){
		if(listOfChatRooms[ind].getID() = targetID){
			return ind;
		}
	}
	return -1;
}
function getChatroomInstanceWithID(targetID){
	// returns the chatroom instance if found
	// returns -1 if not found
	var targetInd = getChatroomInd(targetID);
	if(targetInd > -1){ // if chatroom found
		return listOfChatRooms[targetInd];
	}
	return -1;
}
function registerNewChatroom(){
	// return the instance of the new chatroom if successfully assigned. The newChatRoom will be added to the listOfChatRooms. The newChatRoom still need more initiation; only the id is set
	// return -1 if not successful
	var targetID = findAppropriateChatroomID();
	if(targetID > -1){ // if successfully found an appropriate ID for the chatroom
		var newChatRoom = new ChatRoom();
		newChatRoom.setID(targetID);
		var administratorCode = makeRandomString(administratorCodeLength);
		newChatRoom.setAdministratorCode(administratorCode);
		listOfChatRooms.push(newChatRoom);
		return newChatRoom;
	} else {
		return -1;
	}
	
	function findAppropriateChatroomID(){
		listOfChatRooms.sort();
		var assignID = -1;
		for(var ind=0; ind < listOfChatRooms.length; ind++){
			if(listOfChatRooms[ind].getID != ind){
				assignID = ind;
				return assignID;
			}
		}
		return assignID;
	}
}



io.on('connection', function (socket) {
	
	// when a new connection is made
	// // print to condole
	console.log(socket.id + " connected") // TODO: will remove this for privacy
	// // create a private chatroom between the server and the user. The chatroomID is the socket.id. Such id is always String
	socket.join(socket.id); // TODO: think again. Should the chatroomID simply be the socket.id? would this affect the privacy?
	
	// request create new chatroom
	socket.on('requestCreateChatroom',function(){
		//updateUserChatroomID(socket.id, chatroomID);
		//socket.join(chatroomID);
		
		var newChatRoom = registerNewChatroom();
		if(newChatRoom instanceof ChatRoom){ // if chatroom was successfully created
			io.to(socket.id).emit("chatroomCreationSuccessful",{
										'chatroomID':newChatRoom.getID(),
										'administratorCode':newChatRoom.getAdministratorCode()
									})
		} else { // the chatroom was not successfully created
			
		}
		
	});

	// request join an existing chatroom
	
	// message to the chatroom
}

