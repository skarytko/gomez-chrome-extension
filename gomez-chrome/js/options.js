$(document).ready(function() {
	
	// load options
	loadOptions();
	
	$('#modal').on('show.bs.modal', function() {
		if (chrome.storage) {
			chrome.storage.local.get(null, function(options) {
				$('#txtOptionsJSON').val(JSON.stringify(options));
			});
		}
	});

	$('#btnNewAccount').click(function() {
		addAccount();
	});
	
	$('#accountsList tbody').on('click', 'tr .btn-delete-account', function() {
		$(this).parents('tr').detach();
	});
	
	$('#btnSave').click(function() {
		saveOptions();
	});
	
	$('.btn-import').click(function() {
		importOptions();
	});
	
});

function importOptions() {
	var options = jQuery.parseJSON($('#txtOptionsJSON').val()) || {};
	
	if (chrome.storage) {
		chrome.storage.local.set(options, function() {
			console.log('options saved');
			
			$('#modal').modal('hide');
			loadOptions();
		});
	}
};

function loadOptions() {
	
	if (chrome.storage) {
		chrome.storage.local.get(null, function(options) {
			resetOptions();
			
			if (logins = options.logins) {
				for (i=0;i<logins.length;i++) {
					addAccount(logins[i]); 
				}
			}
		});
	}

}

function resetOptions() {
	$('#accountsList tbody').html('');
}

function saveOptions() {
	var logins = [];
	
	$('#accountsList tbody tr').each(function(index) {
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

function addAccount(account) {
	account = account || {};
	
	var row = $('<tr>');
	
	row.append('<td><input id="txtNickname" type="text" name="nickname" value="' + (account.nickname || '') + '" /></td>');
	row.append('<td><input id="txtUsername" type="text" name="username" value="' + (account.username || '') + '" /></td>');
	row.append('<td><input id="txtPassword" type="password" name="password" value="' + (account.password || '') + '" /></td>');
	row.append('<td><button class="btn btn-default btn-delete-account"><span class="glyphicon glyphicon-remove"></span></button></td>')

	$('#accountsList tbody').append(row);
}