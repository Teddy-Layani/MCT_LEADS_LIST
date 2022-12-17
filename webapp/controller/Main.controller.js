sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("zcrmleadslist.controller.Main", {
            onInit: function () {

            },

            mainLeadUpdateFinished: function(oEvent) {
                this.getOwnerComponent().getModel("mainView").setProperty("/leadCount",
                    oEvent.getParameter("total")
                );
            }
        });
    });
