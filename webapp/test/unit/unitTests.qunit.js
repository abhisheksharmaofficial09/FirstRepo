/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/infy/PWAOfflineBackend/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});