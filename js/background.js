// Global accessor that the popup uses.
var curMonthBalance = null;
var selectedId = null;
var cacheTimer = 0;
var cacheDelay = 1000 * 60;
var reportTitle = "";
var totalMonthBalance = null;
var eatToday = null;

function getData() {
	console.log("Getting the monthly balance...");
	var d = new Date();
	if (d.getTime() > cacheTimer) {
		var xhr = new XMLHttpRequest();
		var username = localStorage["username"];
		var password = localStorage["password"];
		if (username != null && username != '' && password != null && password != '') {
			curMonthBalance = null;
			eatToday = null;
			console.log("Trying to login...");
			var serviceUrl = "https://www.10bis.co.il/Account/LogonAjax";
			var UserLogOnModel = new Object();
			UserLogOnModel.UserName = username;
			UserLogOnModel.Password = password;
			if (serviceUrl) {
				$.ajax({
					type: "POST",
					dataType: "json",
					contentType: "application/json; charset=utf-8",
					traditional: true,
					url: serviceUrl,
					data: JSON.stringify({
						timestamp: $.now(),
						model: UserLogOnModel
					}),
					success: function (result) {
						// open the report page
						xhr.open("GET", "https://www.10bis.co.il/Account/UserReport", true);
						xhr.onreadystatechange = function () {
							if (xhr.readyState == 4) {
								console.log("Success");
								// find  how much money left this month
								var response = xhr.responseText;
								var nitzul = response.indexOf("יתרה חודשית");
								var yitraStart = response.indexOf("totalsFieldValueTh currency", nitzul);
								var yitraEnd = response.indexOf("</th>", yitraStart);
								var yitra = response.slice(yitraStart + "totalsFieldValueTh currency".length + 4, yitraEnd).trim();
								console.log("Monthly balance: " + yitra);
								curMonthBalance = yitra.replace("₪", "").trim();
								reportTitle = parseReportTitle(response);
								totalMonthBalance = parseTotalMonthBalance(response);
								console.log("Report title: " + reportTitle);
									
								// find if 10bis used today
								var currentTime = new Date();
								var month = (currentTime.getMonth() < 10 ? "0" + (currentTime.getMonth() + 1) : currentTime.getMonth() + 1);
								var day = (currentTime.getDate() < 10 ? "0" + currentTime.getDate() : currentTime.getDate());
								var year = currentTime.getFullYear();
								var today = day + "/" + month + "/" + year;                            
									
								// report always has today's date in it - find it
								var reportDate = response.indexOf(today);                             
								// now try finding today's date again which means we have eaten today!
								eatToday = (response.indexOf(today, reportDate + 5) != -1);
								updateBadge();
							}
						}
						xhr.send();
					},
					failure: function (result) {
						console.log("error login. " + result);
					}
				});
			}

		} else {
			console.log("Can not login: the username/password is missing from options page.");
		}
		cacheTimer = d.getTime() + cacheDelay;
	}
	//chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});		
	updateBadge();
}

function updateBadge() {
	if (curMonthBalance != null) {
		var curBalance = (curMonthBalance / 1).toFixed(0);
		chrome.browserAction.setBadgeText({ text: curBalance });
	} else
		chrome.browserAction.setBadgeText({ text: "?" });
}

String.prototype.trim = function () {
	return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

function parseReportTitle(response) {
	var titleIdentifier = response.indexOf("reportHeaderTr");
	var titleStart = response.indexOf("<span>", titleIdentifier);
	var end = response.indexOf("</span>", titleStart);
	return response.substring(titleStart + 6, end);
}

function parseTotalMonthBalance(response) {
	var misgeretStart = response.indexOf("totalsFieldValueTh currency");
	var end = response.indexOf("</th>", misgeretStart);
	return response.substring(misgeretStart + "totalsFieldValueTh currency".length + 4, end).replace("₪", "").trim();
}

function getMonthlyBalance() {
	return curMonthBalance;
}

function getReportTitle() {
	getData();
	return reportTitle;
}

function getTotalMonthBalance() {
	getData();
	return totalMonthBalance;
}

function getEatToday() {
	getData();
	return eatToday;
}

function updateData(tabId) {
	getData();
}

function reset() {
	cacheTimer = 0;
}

function updateSelected(tabId) {
	if (getMonthlyBalance() == null || getMonthlyBalance() == '') {
		chrome.browserAction.setBadgeText({ text: "?" });
	}
}

window.onload = getData();

setInterval(function () {
	getData();
}, cacheDelay * 60);