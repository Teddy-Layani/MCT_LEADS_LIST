/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"zcrm_leads_list/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
