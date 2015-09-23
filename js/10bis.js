var popup = (function () {
	'use strict';

	function populateData(data) {
		if (data) {
			setMonthBalance(data.curMonthBalance);
			$('#outReportTitle').html(data.reportTitle);
			$('#outTotalMonthBalance').html('מסגרת החודש:  ' + '<b>' + data.totalMonthBalance + '</b> ₪');

			if (Number.isInteger(parseInt(localStorage.offDays))) {
				$('#offDays').val(localStorage.offDays);
			}

			setDaysLeft(common.getNumOfDaysLeft(data));

			var daysMinusVacation = data.daysLeft - (localStorage.offDays || 0);
			if (daysMinusVacation < 1) {
				daysMinusVacation = 1;
			}
			setPerDayBalance(data.curMonthBalance / daysMinusVacation);

			if (data.totalMonthBalance) {
				$('.outStatus').html('');
				$('#mainTable').show();
				$('#loginTable').hide();
			}
		}
	}

	function main() {
		if (localStorage.username && localStorage.password) {
			$('.outStatus').html('אנא המתן למידע מתן-ביס...<br/><img class="loading" src="../img/loading.gif" />');
			chrome.extension.getBackgroundPage().bg.getData(populateData, true);
		} else {
			$('.outStatus').html('הזן פרטי חשבון תן-ביס:');
			$('#loginTable').show();
			$('#mainTable').hide();
		}
	}

	function setMonthBalance(monthBalance) {
		$('#divMonthBalance').html(monthBalance);
	}

	function setPerDayBalance(perDayBalance) {
		$('#divPerDay').html((perDayBalance / 1).toFixed(2));
	}

	function setDaysLeft(daysLeft) {
		$('#divDaysLeft').html((daysLeft / 1).toFixed(0));
	}

	function saveOffDays() {
		let offDays = parseInt($('#offDays').val());
		if (Number.isInteger(offDays)) {
			localStorage.offDays = offDays;
			var daysMinusVacation = chrome.extension.getBackgroundPage().bg.data.daysLeft - offDays;

			if (daysMinusVacation < 1) {
				daysMinusVacation = 1;
			}
			setPerDayBalance(chrome.extension.getBackgroundPage().bg.data.curMonthBalance / daysMinusVacation);
		}
	}

	window.onload = main;

	document.addEventListener('DOMContentLoaded', function () {
		document.getElementById('offDays').addEventListener('change', saveOffDays);
		document.getElementById('saveBtn').addEventListener('click', main);
	});

})();