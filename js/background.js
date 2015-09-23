var bg = (function () {
	'use strict';

	/** 
	* Saves the 10bis data and business logic in memory
	*/
	let mainApp = { curMonthBalance: null, cacheTimer: 0, cacheInterval: 1000 * 60 * 10, reportTitle: '', totalMonthBalance: null, eatToday: null };

	/** 
	* Reset the cache timer, and forcely refresh the data from 10bis servers
	*/
	function reset() {
		mainApp.cacheTimer = 0;
	}

	/** 
	* Get the data from 10bis servers using web scraping
	*/
	function getData() {
		console.log('Getting your current month 10bis credit usage');
		let d = new Date();
		if (d.getTime() > mainApp.cacheTimer) {
			if (localStorage.username && localStorage.password) {
				mainApp.curMonthBalance = null;
				mainApp.eatToday = null;
				let bis = new common.TenBis(localStorage.username, localStorage.password);
				bis.connect(function () {
					bis.usage(mainApp);
				}, function (result) {
					console.error('Login failed. ' + result);
				});
			}
			mainApp.cacheTimer = d.getTime() + mainApp.cacheInterval;
		}
		updateBadge();
	}

	/** 
	* Update Google Chrome badge with the current 10bis credit
	*/
	function updateBadge() {
		if (mainApp.curMonthBalance != null) {
			let curBalance = (mainApp.curMonthBalance / 1).toFixed(0);
			chrome.browserAction.setBadgeText({ text: curBalance });
		} else {
			chrome.browserAction.setBadgeText({ text: '?' });
		}
	}
	
	/** 
	* Getters
	*/
	function getMonthlyBalance() {
		return mainApp.curMonthBalance;
	}

	function getReportTitle() {
		getData();
		return mainApp.reportTitle;
	}

	function getTotalMonthBalance() {
		getData();
		return mainApp.totalMonthBalance;
	}

	function getEatToday() {
		getData();
		return mainApp.eatToday;
	}

	function updateData(tabId) {
		getData();
	}

	function updateSelected(tabId) {
		if (getMonthlyBalance() == null || getMonthlyBalance() == '') {
			chrome.browserAction.setBadgeText({ text: "?" });
		}
	}

	window.onload = getData();

	setInterval(function () {
		getData();
	}, mainApp.cacheInterval);

	return { mainApp, reset, getData, updateBadge };

})();