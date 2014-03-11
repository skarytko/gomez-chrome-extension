$(document).ready(function() {
	loadOptions();
	
	$('#modalDialog').dialog({
		autoOpen: false,
		buttons: {
			"Close": function() {
				$(this).dialog("close");
			},
			"Import/Update": function() {
				var self = $(this);
				
				try {
					var options = jQuery.parseJSON($('#txtOptionsJSON').val());
				} catch (err) {
					alert(err);
				}

				chrome.storage.local.set(options, function() {
					console.log('Options saved');
					$('#lines').html("");
					loadOptions();
					self.dialog("close");
				});
			}
		},
		draggable: false,
		modal: true,
		open: function() {
			chrome.storage.local.get(null, function(options) {
				$('#txtOptionsJSON').val(JSON.stringify(options));
			});
		},
		resizable: false,
		title: "Import/Export Options",
		width: 600,
	});
	
	$('#addLine').click(function() {
		addLine([]);
	});
	
	$('#btnSave').click(function() {
		saveOptions();
	});
	
	$('#btnShowOptionsJSON').click(function() {
		$('#modalDialog').dialog("open");
	});
});

function loadOptions() {	
	chrome.storage.local.get(null, function(options) {
		if (logins = options.logins) {
			for (i=0;i<logins.length;i++) {
				addLine(logins[i]); 
			}
			
			saveOptions();
		}
	});
}

function saveOptions() {
	var logins = [];
	
	$('#lines div.row').each(function(index) {
		var username = $(this).find('input[name="username"]').val();
		var password = $(this).find('input[name="password"]').val();
		var nickname = $(this).find('input[name="nickname"]').val();
		var isBeta = $(this).find('input[name="isBeta"]').is(':checked');
		
		if (username && password) {
			logins.push({
				"username": username,
				"password": password,
				"nickname": nickname,
				"isBeta": isBeta
			});
		}
	});
	
	// Save and close tab
	chrome.storage.local.set({"logins": logins}, function() {
		alert('Options Saved');
	});
}

function addLine(info) {
	var row = $('<div>');
	row.addClass('row span-17 last');
	
	var txtNickname = $('<input>');
	txtNickname.attr('type', 'text');
	txtNickname.attr('name', 'nickname');
	if (info.nickname) {
		txtNickname.val(info.nickname);
	}
	var txtUsername = $('<input>');
	txtUsername.attr('type', 'text');
	txtUsername.attr('name', 'username');
	if (info.username) {
		txtUsername.val(info.username);
	}
	var passPassword = $('<input>');
	passPassword.attr('type', 'password');
	passPassword.attr('name', 'password');
	if (info.password) {
		passPassword.val(info.password);
	}
	var chkBeta = $('<input>');
	chkBeta.attr('type', 'checkbox');
	chkBeta.attr('name', 'isBeta');
	if (info.isBeta) {
		chkBeta.attr('checked', info.isBeta);
	}
	
	var btnDelete = $('<button>');
	btnDelete.attr('name', 'deleteLine');
	btnDelete.text('X');
	btnDelete.click(function() {
		row.remove();
	});
	
	var col1 = $('<div>');
	col1.addClass('span-4');
	col1.append(txtNickname);
	
	var col2 = $('<div>');
	col2.addClass('span-4');
	col2.append(txtUsername);
	
	var col3 = $('<div>');
	col3.addClass('span-4');
	col3.append(passPassword);
	
	var col4 = $('<div>');
	col4.addClass('span-2');
	col4.append(chkBeta);
	
	var col5 = $('<div>');
	col5.addClass('span-2 append-1 last');
	col5.append(btnDelete);
	
	row.append(col1);
	row.append(col2);
	row.append(col3);
	row.append(col4);
	row.append(col5);
	$('#lines').append(row);
}