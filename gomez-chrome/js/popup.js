var DYNATRACE_PORTAL_URL = 'https://portal.dynatrace.com';
var GPN_PORTAL_URL = 'https://www.gomeznetworks.com';

$(document).ready(function() {
	getList();
	/*
	$('#blankLogin').click(function() {
		logoutLogin("http://www.gomeznetworks.com/login.asp");	
	});
	*/
	$('#optionsPage').click(function() {
		chrome.tabs.create({url: 'options.html'});
	});
	
	$('#userList').on('mouseover', 'li', function() {
		$(this).find('.portal-links').removeClass('hidden');
		$(this).find('.portal-links').addClass('show');
	});
	
	$('#userList').on('mouseout', 'li', function() {
		$(this).find('.portal-links').removeClass('show');
		$(this).find('.portal-links').addClass('hidden');
	});
	
	$('#userList').on('click', 'li .portal-links a', function() {
		var portal = $(this).data('portal');
		var nickname = $(this).data('nickname');
		
		findAccount(nickname, function(account) {
			login(portal, account.username, account.password);
		});
	});
	
});

function findAccount(nickname, callback) {
	chrome.storage.local.get(null, function(items) {
		if (accounts = items.logins) {	
				
			accounts.every(function(account) {
				if (nickname == account.nickname) {
					callback(account);
					
					return false;
				}
				
				return true;
			});
			
		}
	});
}

function getList() {
	chrome.storage.local.get(null, function(items) {
		if (logins = items.logins) {		
			for (i=0;i<logins.length;i++) {
				addLine(logins[i]); 
			}
		} else {
			$("#userList").html('<li><p>Add logins to list from the options page.</p></li>');
		}
	});
}

function login(portal, username, password) {
		
	portal = portal || 'dynatrace';

	if (portal === 'gpn') {
		
		var loginUrl = GPN_PORTAL_URL + "/login.asp?login.x=1&username=" + encodeURIComponent(username) + "&pwd=" + encodeURIComponent(password) + "&gmz=1";

		updateCurrentTab(loginUrl);
	
	} else {
		
		var loginUrl = DYNATRACE_PORTAL_URL + '/login.htm';
		var postData = 'username=' + encodeURIComponent(username) + '&pw=' + encodeURIComponent(password) + '&signIn=Login';
		var xhr = new XMLHttpRequest();
		
		xhr.open('POST', loginUrl, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 2) {
				console.log(xhr.responseURL);
				var redirectURL = xhr.responseURL;
				xhr.abort();
				updateCurrentTab(redirectURL);
			}
		}
		xhr.send(postData);
		
	}
	
}

function logout(portal) {
	
	portal = portal || 'dynatrace';

	if (portal === 'gpn') {
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://www.gomeznetworks.com/closesession.asp', true);
		xhr.send();
		
		xhr.open('GET', 'http://www.gomeznetworks.com/setsession.asmx/abandonSession', true);
		xhr.send();
	
	} else {
	
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://cr02.dynatrace.com/c/portal/logout', true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 2) xhr.abort();
		};
		xhr.send();
		
		xhr.open('GET', 'http://cr01.dynatrace.com/closesession.asp', true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 2) xhr.abort();
		};
		xhr.send();
	}
	
};

function updateCurrentTab(url) {
	
	chrome.tabs.getSelected(null, function (tab) {
		chrome.tabs.update(tab.id, { url: url });
	});

}

function addLine(account) {
	var userList = $("#userList");
	var li = $('<li class="list-item">' + account.nickname + '<div class="portal-links hidden"><a href="#" data-portal="gpn" data-nickname="' + account.nickname + '">GPN</a><span>&nbsp;|&nbsp;</span><a href="#" data-portal="dynatrace" data-nickname="' + account.nickname + '">DYN</a></div></li>');

	userList.append(li);

}