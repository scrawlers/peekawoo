var socket = io.connect();
var user = $("#user").val();
socket.emit('member',user);
