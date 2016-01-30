var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 5000;

//var listOfSockets = [];
//listOfUsers = [];

// Serve our index.html page at the root url
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/newClientUI.html');
})
// Have express serve all of our files in the public directory
app.use(express.static('public'));
// Starts the web server at the given port
http.listen(port, function(){
  console.log('Listening on ' + port); // TODO: remove this line for privacy
})


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

    for( var i=0; i < len; i++ ){
    	text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
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
	// remove from the global invitation code list
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
	// returns an invitation code that is not used. The code will be added to listOfInvitationCodes
	// if not successful, return -1
	var isAssigned = false;
	var numTrial = 0;
	while(!isAssigned && numTrial < 1000){
		numTrial++;
		var newInvitationCode = makeRandomString(100);
		if(isInvitationCodeUsed(newInvitationCode) == -1){ // if the code is available
			addToUsedInvitationCode(newInvitationCode);
			isAssigned = true;
			return newInvitationCode;
		} else {
			isAssigned = false;
		}
	}
	return -1;
}

listOfChatRooms = [];
function ChatRoom(){
	var chatroomID = -1; // chatroomID is always an integer
	var listOfInvitationCodes = [];
	var verificationCode = ""; // verification code is a String of length 30 or more
	
	this.getID = function(){return chatroomID;}
	this.setID = function(newID){chatroomID = newID;}
	
	this.getInvitationCodeIndex = function(codeLookFor){
		// returns the index of the invitation code for this chatrooom
		// returns -1 if not found
		var theIndex = listOfInvitationCodes.indexOf(codeLookFor);
		return theIndex
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
}
listOfChatRooms.sort(function(chatroom1,chatroom2){
	return chatroom1.chatroomID - chatroom2.chatroomID;
})

function getChatroomInd(targetID){
	// returns the index of the chatroom on the list (0 to inf)
	// if not found, return -1
	for(var ind=0; ind < listOfChatRooms.length; ind++){
		if(listOfChatRooms[ind].getID() == targetID){
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
	// return the instance of the new chatroom if successfully assigned. The newChatRoom will be added to the listOfChatRooms. The newChatRoom still need more information; in this function, only the id is set
	// return -1 if not successful
	var targetID = findAppropriateChatroomID();
	if(targetID > -1){ // if successfully found an appropriate ID for the chatroom
		var newChatRoom = new ChatRoom();
		newChatRoom.setID(targetID);
		var verificationCode = makeRandomString(50);
		newChatRoom.setVerificationCode(verificationCode);
		listOfChatRooms.push(newChatRoom);
		return newChatRoom;
	} else {
		return -1;
	}
	
	function findAppropriateChatroomID(){
		listOfChatRooms.sort();
		var assignID = -1;
		
		for(var ind=0; ind < listOfChatRooms.length; ind++){
			if(listOfChatRooms[ind].getID() != ind){
				assignID = ind;
				return assignID;
			}
		}
		return listOfChatRooms.length;
	}
}
function getChatroomInstanceWithInvitationCode(theInvitationCode){
	// returns the instance if found
	// if not found, return -1
	var codeInd = usedInvitationCode.indexOf(theInvitationCode);
	if(codeInd > -1){ // if the invitation code is found
		for(var ind=0; ind < listOfChatRooms.length; ind++){
			var currentChatroom = listOfChatRooms[ind];
			if(currentChatroom.getInvitationCodeIndex(theInvitationCode) > -1){ // if this chatroom has this invitation code
				return currentChatroom;
			}
		}
	}
	return -1;
}


io.on('connection', function (socket) {
	// when a new connection is made
	// // print to condole
	console.log(socket.id + " connected") // TODO: will remove this line for privacy
	// // create a private chatroom between the server and the user. The chatroomID is the socket.id. Such id is always String
	socket.join(socket.id); // TODO: think again. Should the chatroomID simply be the socket.id? would this affect the privacy?
	
	io.to(socket.id).emit("connectionSuccess",{"message":"connection successful"})
	
	// request create new chatroom
	socket.on('requestCreateChatroom',function(){
		var newChatRoom = registerNewChatroom();
		if(newChatRoom instanceof ChatRoom){ // if chatroom was successfully created
			socket.join(newChatRoom.getID())
			io.to(socket.id).emit("chatroomCreationSuccessful",{
										'chatroomID':newChatRoom.getID(),
										'verificationCode':newChatRoom.getVerificationCode()
									})
		} else { // the chatroom was not successfully created
			io.to(socket.id).emit("chatroomCreationFail",{'message':'Chat Room creation was unsuccessful. Please try again later'}) // TODO: say why the creation failed
		}
	})

	// request join an existing chatroom
	socket.on('requestJoinChatroom',function(invitationCode){
		// get chatroom instance from the invitation code
		var theChatroom = getChatroomInstanceWithInvitationCode(invitationCode);
		if(theChatroom instanceof ChatRoom){ // if chatroom found
			socket.join(theChatroom.getID())
			// tell the user about the chatroom
			io.to(socket.id).emit("chatroomJoinedSuccessful",{"chatroomID":theChatroom.getID(),"chatroomVerificationCode":theChatroom.getVerificationCode()});
		} else { // chatroom not found
			// tell the user the invitation code does not work
			io.to(socket.id).emit("chatroomJoinFailed",{"message":"Joining chatroom was not successful"});
		}
	})
	
	// message to the chatroom
	socket.on('userMessage',function(chatroomID, chatroomVerificationCode, theMessage){
		// check room exists and verification code correct
		var roomInd = getChatroomInd(chatroomID);
		if(roomInd > -1){ // if the chatroom is found
			var theChatroom = listOfChatRooms[roomInd];
			if(theChatroom.getVerificationCode() == chatroomVerificationCode){ // verification code is correct
				io.to(chatroomID).emit("newMessage",{"chatroomID":chatroomID,"theMessage":theMessage})
			} else {
				io.to(socket.id).emit("messageFail",{"chatroomID":chatroomID,"theMessage":"Chatroom no longer active"});
			}
		} else { // chatroom not found
			io.to(socket.id).emit("messageFail",{"chatroomID":chatroomID,"theMessage":"Chatroom not found"});
		}
	})
	
	// request (new) invitationCode
	socket.on('requestNewInvitationCode',function(chatroomID, chatroomVerificationCode, originalInvitationCode){
		// note: If there's no originalInvitationCode, just leave it as empty string "". The purpose is to release the old invitationCode. Removing old invitation code could help improving the client's privacy
		var roomInd = getChatroomInd(chatroomID);
		if(roomInd > -1){ // if the chatroom is found
			var theChatroom = listOfChatRooms[roomInd];
			if(theChatroom.getVerificationCode() == chatroomVerificationCode){ // verification code is correct
				var newInvitationCode = assignNewInvitationCode();
				usedInvitationCode.push(newInvitationCode);
				theChatroom.addInvitationCode(newInvitationCode)
				if(originalInvitationCode != ""){
					// remove from global
					removeFromUsedInvitationCodeList(originalInvitationCode)
					
					// remove from the chatroom
					theChatroom.removeInvitationCode(originalInvitationCode)
				}
				
				io.to(socket.id).emit("newInvitationCode",{"chatroomID":chatroomID,"invitationCode":newInvitationCode})
			} else {
				io.to(socket.id).emit("newInvitationCodeRequestFail",{"chatroomID":chatroomID})
			}
		} else {
			io.to(socket.id).emit("newInvitationCodeRequestFail",{"chatroomID":chatroomID})
		}
	})
})


