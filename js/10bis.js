
function setMonthBalance(monthBalance) {
	document.getElementById('divMonthBalance').innerText = monthBalance;
}

function setPerDayBalance(perDayBalance) {
	document.getElementById('divPerDay').innerText = (perDayBalance / 1).toFixed(2);
}

function setDaysLeft(daysLeft) {
	document.getElementById('divDaysLeft').innerText = (daysLeft / 1).toFixed(0);
}


function getNumOfDaysLeft() {
	var monthDaysArray = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
	var now = new Date();
	var nowDay = now.getDay();
	var nowDate = now.getDate();
	var nowMonth = now.getMonth();
	var monthDays = monthDaysArray[nowMonth];
	var workDays = 0;
	var avragePerDay = 0;

	if (nowDate >= 21) {  // month not over yet
		while (nowDate <= monthDays) {
			if (nowDay != 5 && nowDay != 6)
				workDays++;
			if (nowDay == 6)
				nowDay = 0;
			else
				nowDay++;
			nowDate++;
		}
		nowDate = 1;
		if (nowMonth == 12)
			nowMonth = 1;
		else
			nowMonth++;
	}

	while (nowDate <= 20) {
		if (nowDay != 5 && nowDay != 6)
			workDays++;
		if (nowDay == 6)
			nowDay = 0;
		else
			nowDay++;

		nowDate++;
	}

	if (chrome.extension.getBackgroundPage().getEatToday()) {
		workDays--;
	}

	return workDays;
}

function IsNumeric(strString) {
	var strValidChars = "0123456789.-";
	var strChar;
	var blnResult = true;

	if (strString == null || strString.length == 0) return false;
	//  test strString consists of valid characters listed above
	for (i = 0; i < strString.length && blnResult == true; i++) {
		strChar = strString.charAt(i);
		if (strValidChars.indexOf(strChar) == -1) {
			blnResult = false;
		}
	}

	return blnResult;
}

function save_days_off() {
	var offDays = document.getElementById("offDays").value;

	if (IsNumeric(offDays) == false) {
		offDays = 0;
	}
	localStorage["offDays"] = offDays;
	var monthBalance = chrome.extension.getBackgroundPage().getMonthlyBalance();
	var daysLeft = getNumOfDaysLeft();
	if (daysLeft == 0) {
		localStorage["offDays"] = 0;
		document.getElementById('offDays').innerText = 0;
		offDays = 0;
	}
	var daysMinusVacation = daysLeft - offDays;

	if (daysMinusVacation < 1) {
		daysMinusVacation = 1;
	}
	setPerDayBalance(monthBalance / daysMinusVacation);
}

function main() {
	var username = localStorage["username"];
	var password = localStorage["password"];
	if (username != null && username != '' && password != null && password != '') {
		document.getElementById('outStatus').innerHTML = "<img class='loading' src='loading.gif' />אנא המתן למידע מתן-ביס...";
		var monthBalance = chrome.extension.getBackgroundPage().getMonthlyBalance();
		var sleepTime = 0;
		if (monthBalance == null)
			sleepTime = 2;
		sleep(sleepTime, function () {
			var monthBalance = chrome.extension.getBackgroundPage().getMonthlyBalance();
			setMonthBalance(monthBalance);
			var reportTitle = chrome.extension.getBackgroundPage().getReportTitle();
			document.getElementById('outReportTitle').innerText = reportTitle;
			var totalMonthBalance = chrome.extension.getBackgroundPage().getTotalMonthBalance();
			document.getElementById('outTotalMonthBalance').innerHTML = "מסגרת החודש:  " + "<b>" + totalMonthBalance + "</b> ₪";
			var offDays = localStorage["offDays"];

			if (IsNumeric(offDays) == false) {
				offDays = 0;
			}

			if (offDays) {
				document.getElementById('offDays').value = offDays;
			}
			else {
				offDays = 0;
			}
                
                
                    
			// calculate number of days left until new misgeret            
			var daysLeft = getNumOfDaysLeft();
			setDaysLeft(daysLeft);

			var daysMinusVacation = daysLeft - offDays;
			if (daysMinusVacation < 1) {
				daysMinusVacation = 1;
			}
			setPerDayBalance(monthBalance / daysMinusVacation);

			if (totalMonthBalance != null) {
				document.getElementById('outStatus').innerText = "";
				$('#mainTable').removeClass('hidden');
				$('#mainTable2').removeClass('hidden');
				$('#mainTable3').removeClass('hidden');
				$('#mainTable4').removeClass('hidden');
				$('#loginTable').addClass('hidden');
				$('#loginTableInner').addClass('hidden');
			}
		});
	} else {
		$('.outStatus').html("הזן פרטי חשבון תן-ביס:");
		$('#loginTable').removeClass('hidden');
		$('#loginTableInner').removeClass('hidden');
		$('#mainTable').addClass('hidden');
		$('#mainTable').addClass('hidden');
		$('#mainTable2').addClass('hidden');
		$('#mainTable3').addClass('hidden');
		$('#mainTable4').addClass('hidden');
	}
}

function sleep(secs, callback) {
	// sleep returns by calling a�s callback
	setTimeout(callback, secs * 1000);
}

function checkConnection(username, password) {
	var xhr = new XMLHttpRequest();
	var status = document.getElementById("outStatus2");
	status.innerHTML = '<img class="loading" src="loading.gif" />';

	if (username != null && username != '' && password != null && password != '') {
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
					if (result.LogingSuccess) {
						status.innerHTML = "כתובת דואר אלקטרוני וסיסמה אושרו";
						status.className = "status";
						$("#saveBtn").removeAttr('disabled');;
					}
					else {
						status.innerHTML = "שגיאה באימות דואר אלקטרוני וסיסמה";
						status.className = "status_failed";
					}
				},
				failure: function (result) {
					status.innerHTML = "שגיאה באימות דואר אלקטרוני וסיסמה";
					status.className = "status_failed";
				}
			});
		}
	}
	else {
		status.innerHTML = "הזן שם משתמש וסיסמא"
		status.className = "status_failed";
	}
}
	
// Saves options to localStorage.
function save_login() {
	var txtUsername = document.getElementById("txtUsername");
	var username = txtUsername.value;

	var txtPassword = document.getElementById("txtPassword");
	var password = txtPassword.value;

	localStorage["username"] = username;
	localStorage["password"] = password;
		
	// Update status to let user know options were saved.
		
	var status = document.getElementById("outStatus2");
	status.innerHTML = "ההגדרות נשמרו בהצלחה";
	status.className = "status";

	chrome.extension.getBackgroundPage().reset();
	chrome.extension.getBackgroundPage().getData();

	$('#loginTable').addClass('hidden');
	$('#loginTableInner').addClass('hidden');
	main();
}

// Check user and password.
function check_login() {
	var txtUsername = document.getElementById("txtUsername");
	var username = txtUsername.value;

	var txtPassword = document.getElementById("txtPassword");
	var password = txtPassword.value;
			
	// Update status to let user know options were saved.
	checkConnection(username, password);
}

window.onload = main;

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('chkConn').addEventListener('click', check_login);
	document.getElementById('saveBtn').addEventListener('click', save_login);
	document.getElementById('offDays').addEventListener('change', save_days_off);
});