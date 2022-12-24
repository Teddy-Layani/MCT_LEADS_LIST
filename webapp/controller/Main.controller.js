sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter) {
        "use strict";

        return Controller.extend("zcrmleadslist.controller.Main", {
            onInit: function () {

            },

            mainLeadUpdateFinished: function(oEvent) {
                this.getOwnerComponent().getModel("mainView").setProperty("/leadCount",
                    oEvent.getParameter("total")
                );
            },

            onSelectedButtonChange: function(oEvent) {
                let oSelectedFilter = oEvent.getParameter("item").getBindingContext().getObject(),
                    oTableBinding   = this.getView().byId("mainLead-table").getBinding("items"),
                    oModel          = this.getOwnerComponent().getModel(),
                    aFilters        = [];
                
                for (let i = 0; i < oSelectedFilter.TabConditionSet.__list.length; i++) {
                    const oTabCondition = oModel.getProperty("/" + oSelectedFilter.TabConditionSet.__list[i] );
                    
                    aFilters.push( new Filter( "/" + oTabCondition.FieldName, oTabCondition.Operator, oTabCondition.ValueLow));
                }

                oTableBinding.filter(aFilters);
            }

        });
    });
