
$(function(){
	var socket = io.connect();
	var room = $("#room").val();
	socket.emit('join',{room:room});
	var user = $("#user").val();
	user = JSON.parse(user);
	socket.on(user.id,function(data){
		console.log(data);
		if(data){
			window.location = '/chat/'+data.name;
		}
		else{
			window.location = '/error';
		}

	});
	
	socket.on('new msg',function(data){
		alert(JSON.stringify(data));
		if(data.gender == "male"){
			$(" .messagewindow").append("<img class='leftp'></img><img class='imgleft' src='"+data.profileUrl+"'></img><p class='me-chat'><strong>"+data.codename+":</strong> <em>"+data.msg+"</em></p>");
		}
		else{
			$(" .messagewindow").append("<img class='rightp'></img><img class='imgright' src='"+data.profileUrl+"'></img><p class='you-chat'><strong>"+data.codename+":</strong> <em>"+data.msg+"</em></p>");
		}
		$(".messagewindow").prop({scrollTop: $(".messagewindow").prop("scrollHeight")});
	});
	
	$("#reply").click(function(){
		var inputText = $("#message").val().trim();
		if(inputText){
			var chunks = inputText.match(/.{1,1234}/g)
			, len = chunks.length;
			for(var i = 0; i<len; i++){
				user.msg = chunks[i];
				socket.emit('my msg',user);
			}
			$("#message").val('');
			
			return false;
		}
	});
	$("#message").keypress(function(e){
		var inputText = $(this).val().trim();
		if(e.which == 13 && inputText){
			var chunks = inputText.match(/.{1,1024}/g)
				, len = chunks.length;
			
			for(var i=0; i<len; i++) {
				user.msg = chunks[i];
				socket.emit('my msg',user);
				//socket.emit('my msg', {
					//msg: chuncks[i]
				//});
			}
			$(this).val('');
			return false;
		}
	});
});
