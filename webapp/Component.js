/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "zcrmleadslist/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("zcrmleadslist.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();


                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                //  Models Initialization
                this.initModels();
            },
            
            getText: function (sKey, aParameters=[]) {
                return this.getModel("i18n").getResourceBundle().getText(sKey, aParameters);
            },

            initModels: function() {
                this.setModel(models.viewModel("main"), "mainView");
                this.setModel(models.viewModel("UserBpData"), "UserBpData");
                this.setModel(models.viewModel("elementSelected"), "elementSelected");
                // models.checkOtherFilter(this.getModel("crossUtil"),this.getModel("mainView"));
            }
        });
    }
);