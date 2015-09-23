var bg = (function () {
	'use strict';

	/** 
	* Saves the 10bis data and business logic in memory
	*/
	let mainApp = { cacheTimer: 0, cacheInterval: 1000 * 60 * 10, dataLoaded: false };
	let data = {};

	/** 
	* Reset the cache timer, and forcely refresh the data from 10bis servers
	*/
	function reset() {
		mainApp.cacheTimer = 0;
	}

	/** 
	* Get the data from 10bis servers using web scraping
	*/
	function getData(cb, force) {
		cb = cb || function () { };
		console.log('Getting your current month 10bis credit usage');
		let d = new Date();
		if (force || d.getTime() > mainApp.cacheTimer) {
			if (localStorage.username && localStorage.password) {
				let bis = new common.TenBis(localStorage.username, localStorage.password);
				bis.connect(function () {
					bis.usage(data);
					mainApp.dataLoaded = true;
					cb(data);
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
		if (data.curMonthBalance != null) {
			let curBalance = (data.curMonthBalance / 1).toFixed(0);
			chrome.browserAction.setBadgeText({ text: curBalance });
		} else {
			chrome.browserAction.setBadgeText({ text: '?' });
		}
	}

	window.onload = getData();

	setInterval(function () {
		getData();
	}, mainApp.cacheInterval);

	return { mainApp, data, reset, getData, updateBadge };

})();