(function(){
	// var
	var socket;
	var currentUser;
	var selectedUser;
	var allOtherUsers = {};

	// var init
	function handleSocketConnect(){
		currentUser = prompt("Name Please?");
		document.title = currentUser;

		socket.emit("custom-msg", {
			type: "new-user",
			info: {
				userName: currentUser
			}
		});
	}

	function msgReceived(msgData){
		if(msgData.type == 'new-user'){
			$('#left').append('<p user="' + 
				msgData.info.userName + '">' + 
				msgData.info.userName + '</p>');
			allOtherUsers[msgData.info.userName] = [];
		} else if(msgData.type == 'existing-users'){
			$('#left').empty();
			$('#left').append('<p user="All">All</p>');

			var i = 0;
			for(i = 0; i < msgData.info.length; i++){
				$('#left').append('<p user="' + 
				msgData.info[i] + '">' + 
				msgData.info[i]+ '</p>');
				allOtherUsers[msgData.info[i]] = [];
			}
		} 
		else if(msgData.type == 'new-msg'){
			allOtherUsers[msgData.info.from].push(msgData.info);
			$('#left p[user=' + msgData.info.from + ']').addClass('highlight');
			
			if(selectedUser == msgData.info.from){
				$('#left p[user=' + selectedUser + ']').trigger('click');
			}
		}
	}

	function handleUserSelected(){
		$(this).removeClass('highlight');

		selectedUser = $(this).html();
		$('#pUserName').html(selectedUser);
		$('#txtMsg').val('');
		$('#listMessages').empty();

		for(i = 0; i < allOtherUsers[selectedUser].length; i++){
			addMsgLi(allOtherUsers[selectedUser][i]);
		}

	}

	function addMsgLi(msgInfo){
		var $li = $('<li />');
		$li.html(msgInfo.body);

		if(msgInfo.from == selectedUser){
			$li.addClass('self');
		} else {
			$li.addClass('other');
		}

		$('#listMessages').append($li);
	}

	function handleMsgSend(){
		var msgData = {
			type: "new-msg",
			info: {
				to: selectedUser,
				from: currentUser,
				body: $('#txtMsg').val()
			}
		};
		socket.emit("custom-msg", msgData);

		allOtherUsers[msgData.info.to].push(msgData.info);
		addMsgLi(msgData.info);

		$('#txtMsg').val('');
	}

	// functions

	// init fn
	function init(){
		socket = io(); // requested connection to io server
	
		socket.on('connect', handleSocketConnect);
		socket.on('custom-msg', msgReceived);

		$('#left').on('click', 'p', handleUserSelected);
		$('#btnSend').on('click', handleMsgSend);
	}

	init();
})();