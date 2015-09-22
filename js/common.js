function checkConnection(username, password) {
    var xhr = new XMLHttpRequest();
    var status = document.getElementById("status");

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
						document.getElementById("saveBtn").disabled = false;
					}
					else {
						status.innerHTML = "שגיאה באימות דואר אלקטרוני וסיסמה";
						status.className = "status_failed";
						setTimeout(function () {
							status.innerHTML = "";
						}, 2750);
					}
				},
				failure: function (result) {
					status.innerHTML = "שגיאה באימות דואר אלקטרוני וסיסמה";
					status.className = "status_failed";
					setTimeout(function () {
						status.innerHTML = "";
					}, 2750);
				}
			});
		}
    }
    else {
        status.innerHTML = "אנא הזן דואר אלקטרוני וסיסמה"
		status.className = "status_failed";
        setTimeout(function () {
			status.innerHTML = "";
        }, 2750);
    }
}

function post_to_url(path, params, method) {
    method = method || "post"; // Set method to post by default, if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
		}
    }

    document.body.appendChild(form);
    form.submit();
}

// Saves options to localStorage.
function save_options() {
	var txtUsername = document.getElementById("txtUsername");
	var username = txtUsername.value;

	var txtPassword = document.getElementById("txtPassword");
	var password = txtPassword.value;

	localStorage["username"] = username;
	localStorage["password"] = password;
	
	// Update status to let user know options were saved.
	
	var status = document.getElementById("status");
	status.innerHTML = "השינויים נשמרו בהצלחה";
	status.className = "status";
	setTimeout(function () {
		status.innerHTML = "";
	}, 2750);

	chrome.extension.getBackgroundPage().reset();
	chrome.extension.getBackgroundPage().getData();
}

// Check user and password.
function check_options() {
	var txtUsername = document.getElementById("txtUsername");
	var username = txtUsername.value;

	var txtPassword = document.getElementById("txtPassword");
	var password = txtPassword.value;
		
	// Update status to let user know options were saved.
	checkConnection(username, password);
}


// Restores select box state to saved value from localStorage.
function restore_options() {
	var username = localStorage["username"];
	var txtUsername = document.getElementById("txtUsername");
	if (username != null && username != '' && username != 'undefined')
		txtUsername.value = username;

	var password = localStorage["password"];
	var txtPassword = document.getElementById("txtPassword");
	if (password != null && password != '' && password != 'undefined')
		txtPassword.value = password;
}

window.onload = restore_options;

document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('body').addEventListener('onload', restore_options);
	document.getElementById('chkConn').addEventListener('click', check_options);
	document.getElementById('saveBtn').addEventListener('click', save_options);
});