var socket = io();

/* Server reply */
// connection made
socket.on('connectionSuccess',function(serverReply){
	mkLog(serverReply.message)
})

// chatroom creation
socket.on('chatroomCreationSuccessful',function(serverReply){
	mkLog("chatroomID is: " + serverReply.chatroomID)
	mkLog("verification code is: " + serverReply.verificationCode)
})
socket.on('chatroomCreationFail',function(serverReply){
	mkLog("Failed chatroom creation. Server replied:" + serverReply.message)
})

// chatroom join
socket.on('chatroomJoinedSuccessful',function(serverReply){
	mkLog("Successfully Joined chatroom of ID " + serverReply.chatroomID + "and verification code of: " + serverReply.chatroomVerificationCode)
})
socket.on('chatroomJoinFailed',function(serverReply){
	mkLog("Failed joining chatroom. Server replied:" + serverReply.message)
})

// message
socket.on('newMessage',function(serverReply){
	mkLog("Message from chatroomID " + serverReply.chatroomID + ". Message: " + serverReply.theMessage)
})
socket.on('messageFail',function(serverReply){
	mkLog("Failed to message to chatroomID " + serverReply.chatroomID + ". Message: " + serverReply.theMessage)
})

// invitation code
socket.on('newInvitationCode',function(serverReply){
	mkLog("New invitation code for chatroomID " + serverReply.chatroomID + " is now " + serverReply.invitationCode)
})
socket.on('newInvitationCodeRequestFail',function(serverReply){
	mkLog("Fail to acquire new invitation code for chatroomID " + serverReply.chatroomID)
})

/* client send request */
function requestCreateChatroom(){
	socket.emit("requestCreateChatroom");
	mkLog("requested chatroom creation")
}
function requestJoinChatroom(theInvitationCode){
	socket.emit("requestJoinChatroom",theInvitationCode)
}
function sendUserMessage(chatroomID, chatroomVerificationCode, theMessage){
	socket.emit("userMessage",chatroomID, chatroomVerificationCode, theMessage)
}
function requestInvitationCode(chatroomID, chatroomVerificationCode, origInvitationCode){
	socket.emit("requestNewInvitationCode",chatroomID, chatroomVerificationCode, origInvitationCode)
}