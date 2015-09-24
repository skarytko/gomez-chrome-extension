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
		$(this).find('.link-secondary').removeClass('hidden');
		$(this).find('.link-secondary').addClass('show');
	});
	
	$('#userList').on('mouseout', 'li', function() {
		$(this).find('.link-secondary').removeClass('show');
		$(this).find('.link-secondary').addClass('hidden');
	});
	
	$('#userList').on('click', 'a.link-primary, a.link-secondary', function() {
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
		
		logout(portal, function() {
		
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
		
		});
		
	}
	
}

function logout(portal, callback) {
	
	portal = portal || 'dynatrace';

	if (portal === 'gpn') {
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://www.gomeznetworks.com/closesession.asp', true);
		xhr.send();
		
		xhr.open('GET', 'http://www.gomeznetworks.com/setsession.asmx/abandonSession', true);
		xhr.send();
		
		if (callback) callback();
	
	} else {
		
		var getPortalCookies = getCookies({ domain: 'portal.dynatrace.com' });
		var getCR02Cookies = getCookies({ domain: 'cr02.dynatrace.com' });
		
		$.when(getPortalCookies, getCR02Cookies).done(function(portalCookies, cr02Cookies) {
			
			removeCookies(portalCookies);
			removeCookies(cr02Cookies);

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
			
			if (callback) callback();
			
		}).fail(function(err) {
			
			console.log(err);
			
		});
	}
	
};

function getCookies(options) {
	
	var defer = $.Deferred();
	var promise = defer.promise();
	
	chrome.cookies.getAll(options, function(cookies) {
	
		defer.resolve(cookies);
	
	});
	
	return promise;
	
}

function removeCookie(cookie) {
	
	var url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;
	
	chrome.cookies.remove({ url: url, name: cookie.name });
	
}

function removeCookies(cookies) {
	
	cookies.forEach(function(cookie) {

		removeCookie(cookie);

	});
	
}

function updateCurrentTab(url) {
	
	chrome.tabs.getSelected(null, function (tab) {
		chrome.tabs.update(tab.id, { url: url });
	});

}

function addLine(account) {
	var userList = $("#userList");
	var li = $('<li class="list-item"><a href="#" class="link-primary" data-portal="dynatrace" data-nickname="' + account.nickname + '">' + account.nickname + '<a href="#" class="link-secondary hidden" data-portal="gpn" data-nickname="' + account.nickname + '">GPN</a></a></li>');

	userList.append(li);

}