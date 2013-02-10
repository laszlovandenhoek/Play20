function connectChat(websocketUrl, username) {

	var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket
	var chatSocket = new WS(websocketUrl)

	function sendMessage () {
		chatSocket.send(JSON.stringify(
				{"kind": "talk", "text": $("#talk").val()}
		))
		$("#talk").val('')
	}
	
	function sendMove(x, y) {
		chatSocket.send(JSON.stringify(
				{"kind" : "move", "x" : x, "y" : y}
		))
	}
	
	
	// / box ////////////////////////////////

	function writeMessage(messageLayer, message) {
		var context = messageLayer.getContext();
		messageLayer.clear();
		context.font = '18pt Calibri';
		context.fillStyle = 'black';
		context.fillText(message, 10, 25);
	}
	var stage = new Kinetic.Stage({
		container: 'container',
		width: 578,
		height: 200
	});
	var boxLayer = new Kinetic.Layer();
	var messageLayer = new Kinetic.Layer();
	var rectX = stage.getWidth() / 2 - 50;
	var rectY = stage.getHeight() / 2 - 25;

	var box = new Kinetic.Rect({
		x: rectX,
		y: rectY,
		width: 100,
		height: 50,
		fill: '#00D2FF',
		stroke: 'black',
		strokeWidth: 4,
		draggable: true
	});

	// write out drag and drop events
	box.on('dragstart', function() {
		writeMessage(messageLayer, 'dragstart');
	});

	box.on('dragmove', function() {
		writeMessage(messageLayer, 'dragmove (' + box.getX() + ',' + box.getY() + ')');
		sendMove(box.getX(), box.getY())
		//$("#talk").val(box.getX() + ',' + box.getY())
		//sendMessage()
	});

	box.on('dragend', function() {
		writeMessage(messageLayer, 'dragend');
	});

	boxLayer.add(box);

	stage.add(messageLayer);
	stage.add(boxLayer);
	
	
	/// end box stuff /////////////////////////////

	function receiveEvent(event) {
		var data = JSON.parse(event.data)

		// Handle errors
		if(data.error) {
			chatSocket.close()
			$("#onError span").text(data.error)
			$("#onError").show()
			return
		} else {
			$("#onChat").show()
		}
		
		switch (data.kind) {
			case "talk" : 
				
				// Create the message element
				var el = $('<div class="message"><span></span><p></p></div>')
				$("span", el).text(data.user + '@' + data.clock)
				$("p", el).text(data.message)
				$(el).addClass(data.kind)
				if(data.user == username) $(el).addClass('me')
				$('#messages').append(el)

				
			case "join" :
			case "quit" :
				// Update the members list
				$("#members").html('') 
				$(data.members).each(function() {
					$("#members").append('<li>' + this + '</li>')
				})

				
			break
			

			case "move" :
				if (data.user != username) {
					box.setAbsolutePosition(data.x, data.y)
					stage.draw()
					writeMessage(messageLayer, 'received (' + data.x + ',' + data.y + ')');
				}
				break
				
			default : alert("unknown event type received: " + data.kind)
		}
		


	}

	function handleReturnKey(e) {
		if(e.charCode == 13 || e.keyCode == 13) {
			e.preventDefault()
			sendMessage()
		} 
	}

	$("#talk").keypress(handleReturnKey)  

	chatSocket.onmessage = receiveEvent










}

