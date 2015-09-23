var common = (function () {
	'use strict';

	const config = {
		'loginUrl': 'https://www.10bis.co.il/Account/LogonAjax',
		'usageUrl': 'https://www.10bis.co.il/Account/UserReport'
	};

	class App {
		constructor() { }

		/** 
		* Display a general status message
		*/
		static showStatus(message, opts) {
			opts = opts || { msgClass: 'status' };
			let status = $('.status > span');
			if (status.length) {
				status.html(message);
				status.attr('class', opts.msgClass);
				setTimeout(function () {
					status.empty();
				}, 3000);
			}
		}
		
		/**
		 * Load the saved options from local storage
		 */
		static loadSavedOptions() {
			if (localStorage.username) {
				$('#txtUsername').val(localStorage.username);
			}

			if (localStorage.password) {
				$('#txtPassword').val(localStorage.password);
			}
		}
		
		/**
		 * Save the user options and 10bis credentials in local storage
		 */
		static saveOptions() {
			localStorage.username = $('#txtUsername').val();
			localStorage.password = $('#txtPassword').val();

			App.showStatus('השינויים נשמרו בהצלחה');

			chrome.extension.getBackgroundPage().bg.reset();
			chrome.extension.getBackgroundPage().bg.getData();
		}
		
		static updateBadge() {
			chrome.extension.getBackgroundPage().bg.updateBadge();
		}
	}

	class TenBis {

		constructor(username, password) {
			this.username = username;
			this.password = password;
		}

		/** 
		* Check the 10bis credentials and connect to 10bis login service
		*/
		connect(cbSuccess, cbFailure) {
			cbSuccess = cbSuccess || function () { };
			cbFailure = cbFailure || function () { };
			if (this.username && this.password) {
				$.ajax({
					type: 'POST',
					dataType: 'json',
					contentType: 'application/json; charset=utf-8',
					traditional: true,
					url: config.loginUrl,
					data: JSON.stringify({
						timestamp: $.now(),
						model: { UserName: this.username, Password: this.password }
					}),
					success: function (result) {
						if (result.LogingSuccess) {
							App.showStatus('חשבון התן ביס אומת בהצלחה');
							$('#saveBtn').removeAttr('disabled');
						} else {
							App.showStatus('שגיאה באימות דואר אלקטרוני וסיסמה', { msgClass: 'status_failed' });
						}
						cbSuccess();
					},
					failure: function (result) {
						App.showStatus('שגיאה באימות דואר אלקטרוני וסיסמה', { msgClass: 'status_failed' });
						cbFailure(result);
					}
				});
			} else {
				App.showStatus('אנא הזן דואר אלקטרוני וסיסמה', { msgClass: 'status_failed' });
			}
		}

		/** 
		* Retrieve the current 10bis usage data and calculate the important stuff using web scraping
		*/
		usage(mainApp) {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', config.usageUrl, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					// find monthly balance
					let response = xhr.responseText;
					let nitzul = response.indexOf('יתרה חודשית');
					let yitraStart = response.indexOf('totalsFieldValueTh currency', nitzul);
					let yitraEnd = response.indexOf('</th>', yitraStart);
					let yitra = response.slice(yitraStart + 'totalsFieldValueTh currency'.length + 4, yitraEnd).trim();
					console.log('Monthly balance: ' + yitra);
					mainApp.curMonthBalance = yitra.replace('₪', '').trim();
					mainApp.reportTitle = TenBis.parseReportTitle(response);
					mainApp.totalMonthBalance = TenBis.parseTotalMonthBalance(response);
					console.log('Report title: ' + mainApp.reportTitle);									
					// find if 10bis used today
					let currentTime = new Date();
					let month = (currentTime.getMonth() < 10 ? '0' + (currentTime.getMonth() + 1) : currentTime.getMonth() + 1);
					let day = (currentTime.getDate() < 10 ? '0' + currentTime.getDate() : currentTime.getDate());
					let year = currentTime.getFullYear();
					let today = day + '/' + month + '/' + year;									
					// report always has today's date in it - find it
					let reportDate = response.indexOf(today);                             
					// now try finding today's date again which means we ate today!
					mainApp.eatToday = (response.indexOf(today, reportDate + 5) !== -1);
					App.updateBadge();
				}
			}
			xhr.send();
		}
		
		/** 
		* Helper methods for parsing 10bis data
		*/
		static parseReportTitle(response) {
			let titleIdentifier = response.indexOf('reportHeaderTr');
			let titleStart = response.indexOf('<span>', titleIdentifier);
			let end = response.indexOf('</span>', titleStart);
			return response.substring(titleStart + 6, end);
		}

		static parseTotalMonthBalance(response) {
			let misgeretStart = response.indexOf('totalsFieldValueTh currency');
			let end = response.indexOf('</th>', misgeretStart);
			return response.substring(misgeretStart + 'totalsFieldValueTh currency'.length + 4, end).replace('₪', '').trim();
		}
	}

	String.prototype.trim = function () {
		return this.replace(/^\s*/, '').replace(/\s*$/, '');
	}

	function checkConnection() {
		let bis = new TenBis($('#txtUsername').val(), $('#txtPassword').val());
		bis.connect();
	}

	if (document.title !== 'background') {
		window.onload = App.loadSavedOptions;

		document.addEventListener('DOMContentLoaded', function () {
			document.querySelector('body').addEventListener('onload', App.loadSavedOptions);
			document.getElementById('chkConn').addEventListener('click', checkConnection);
			document.getElementById('saveBtn').addEventListener('click', App.saveOptions);
		});
	}

	return { App, TenBis };

})();