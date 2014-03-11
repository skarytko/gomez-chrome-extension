$(document).ready(function() {
	getList();
	
	$('#blankLogin').click(function() {
		logoutLogin("http://www.gomeznetworks.com/login.asp");	
	});
	
	$('#optionsPage').click(function() {
		chrome.tabs.create({url: 'options.html'});
	})
});

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

function logoutLogin(actionURL) {
	var v = 0;
	
	// Logout of APM Portal
	chrome.cookies.getAll({domain: "gomezapm.com", path: "/"}, function(cookies) {
		$.ajax({
			url: "http://www.gomezapm.com/c/portal/logout",
			headers: {"Cookie": cookies.join(";")},
			complete: function() {
				v++;
				updateTab(actionURL);
			}
		});
	});

	// Logout of GPN Portal
	$.ajax({
		url: "http://www.gomeznetworks.com/closesession.asp",
		complete: function() {
			$.ajax({
				type: "post",
				url: "http://www.gomeznetworks.com/setsession.asmx/abandonSession",
				complete: function() {
					v++;
					updateTab(actionURL);
				}
			})
		}
	});
	
	function updateTab(actionURL) {
		if (v == 2) {
			// Update current tab
			chrome.tabs.getSelected(null, function (tab) {
				chrome.tabs.update(tab.id, {url: actionURL});
			});
		}
		
		return false;
	}
}

function addLine(info) {
	var domain = (info.isBeta) ? 'beta.gomeznetworks.com' : 'www.gomeznetworks.com';
	var actionURL = "http://" + domain + "/login.asp?login.x=1&username=" + encodeURIComponent(info.username) + "&pwd=" + encodeURIComponent(info.password) + "&gmz=1"; 
	var userList = $("#userList");
	var li = $('<li>');
	var anchor = $('<a>');
	var label = (info.nickname) ? info.nickname : info.username; 
	anchor.text(label);
	anchor.attr('href', '#');
	anchor.click(function() {
		logoutLogin(actionURL);
	});
	
	li.append(anchor);
	userList.append(li);
}