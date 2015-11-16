var socket = io();
var chatID = 1234;
var encKey = 0;

function joinchatroom() {
var x,y;
x=document.getElementById("chatRmIDToJoin") ;
y=$("#chatRmIDToJoin").val();

console.log('the chatroom id to join is:' + y);

socket.emit('joinChatRoom',y);
}

function createchatroom() {
//var randdate = Date.now() % 500000; var rando = Math.random() * 500000; var rando2 = Math.ceil(rando); var chatID = randdate + rando2;
	socket.emit('createChatRoom');
}


$("#chatID").text(chatID);

// When the user clicks on send button
$('#msg-click').click(function(){
  sendMessage();
});

// Or the user presses enter from the text box
$('#msg').keydown(function(event) {
  if (event.keyCode == 13) {
    sendMessage();
  }
});

var sendMessage = function() {
  socket.emit('message', enc($('#msg').val()),chatID);

  $('#msg').val('');
};
/*
var sendMessage = function() {
  socket.emit('messagee', $('#msg').val());

  $('#msg').val('');
};
*/
socket.on('user-newID',function(newChatID){
	chatID = newChatID;
	console.log('chatID: ' + chatID);
  $("#chatID").html(chatID);
});

// When we receive a user message, add to html list
socket.on('user-message', function(msg) {
  //decrypt the message
  msg = dec(msg);

  var new_msg = $('<li>').text(msg);
  $('#messages').append(new_msg);
  $('body,html').animate({scrollTop: $('#messages li:last-child').offset().top + 5 + 'px'}, 5);
});

socket.on('user-newID', function(msg) {
  console.log('new id is: ' + msg);
});

function setEncryptionKey(){
  encKey = Number($('#encKey').val());
  console.log('set encryption key to ' + encKey);
}

function dec(cryptText){
  var toReturn = '';
  for(ind=0; ind < cryptText.length; ind++){
    var currentCryptChar = cryptText.charAt(ind);
    var charCode = getCodeFromChar(currentCryptChar);

    // decrypt
    var plainCharCode = charCode - encKey;
    var plainChar = getCharFromCode(plainCharCode);

    toReturn += plainChar;
  }
  return toReturn;
}
function enc(plainText){
  var toReturn = '';
  for(ind=0; ind < plainText.length; ind++){
    var currentPlainChar = plainText.charAt(ind);
    var charCode = getCodeFromChar(currentPlainChar);

    // decrypt
    var cryptCharCode = charCode + encKey;
    var cryptChar = getCharFromCode(cryptCharCode);

    toReturn += cryptChar;
  }
  return toReturn;
}

function getCodeFromChar(vS){
  // input: vS:string (only the first character is used)
  // output: integer 0~65535 (decimal form)
  return vS.charCodeAt(0);
}

function getCharFromCode(vI){
  // input: vI:integer (decimal form)
  // output: string (an unicode character)
  return String.fromCharCode(vI);
}
