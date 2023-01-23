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

            onDateChange: function(oEvent) {
                
            },

            onSelectedButtonChange: function(oEvent) {
                let oSelectedFilter = oEvent.getParameter("item").getBindingContext().getObject(),
                    oTableBinding   = this.getView().byId("mainLead-table").getBinding("items"),
                    oModel          = this.getOwnerComponent().getModel(),
                    aFilters        = [];
                
                this.resetFilters();

                for (let i = 0; i < oSelectedFilter.TabConditionSet.__list.length; i++) {
                    const oTabCondition = oModel.getProperty("/" + oSelectedFilter.TabConditionSet.__list[i] );
                    
                    if (oTabCondition.FieldName === "ZleadCallBack" && !( oTabCondition.ValueLow instanceof Date ) ) {
                        oTabCondition.ValueLow      = new Date( oTabCondition.ValueLow.slice(0, 4), 
                                                                oTabCondition.ValueLow.slice(4, 6) - 1, 
                                                                oTabCondition.ValueLow.slice(6, 8),
                                                                oTabCondition.ValueLow.slice(8, 10), 
                                                                oTabCondition.ValueLow.slice(10, 12), 
                                                                oTabCondition.ValueLow.slice(12, 14))
                        
                        
                    }
                    aFilters.push( new Filter( oTabCondition.FieldName, oTabCondition.Operator, oTabCondition.ValueLow));
                }

                oTableBinding.filter(aFilters, "Application");
            },

            onComboChange: function(oEvent) {
                let oModelView      = this.getOwnerComponent().getModel("mainView").getData(),
                    oTableBinding   = this.getView().byId("mainLead-table").getBinding("items"),
                    aFilter     = [];

                if (oModelView.selectedStatus) {
                    aFilter.push(new Filter( "Status", "EQ", oModelView.selectedStatus));                    
                }
                if (oModelView.selectedCampaign) {
                    aFilter.push(new Filter( "CampaignId", "EQ", oModelView.selectedCampaign));                    
                }
                if (oModelView.selectedPriority) {
                    aFilter.push(new Filter( "Priority", "EQ", oModelView.selectedPriority));                    
                }
                if (oModelView.selectedBrand) {
                    aFilter.push(new Filter( "Brand", "EQ", oModelView.selectedBrand));                    
                }

                oTableBinding.filter(aFilter, "Application");
            },

            onComboChangeOld: function(oEvent) {
                let oSelection  = oEvent.getParameter("selectedItem").getBindingContext().getObject(),
                    sKey        = "",
                    sField      = "",
                    sValue      = "",
                    oTableBinding   = this.getView().byId("mainLead-table").getBinding("items"),
                    aFilter     = oTableBinding.aApplicationFilters;

                switch (oEvent.getSource().getBindingPath("items")) {
                    case "/CampaignSet":
                        sField  = "Campaign_id";
                        sKey    = "CampaignId";

                        break;
                    case "/BrandSet":
                        sField  = "Brand_code";
                        sKey    = "Brand";

                        break;
                    case "/ImportanceSet":
                        sField  = "Importance_val";
                        sKey    = "Priority";

                        break;
                    case "/LeadStatusSet":
                        sField  = "Status";
                        sKey    = "Status";

                        break;                        
                    default:
                        break;
                }
                
                sValue      = oSelection[sField];

                aFilter.push(new Filter( sKey, "EQ", sValue));

                oTableBinding.filter(aFilter, "Application");
            },

            onFilterReset: function(oEvent) {
                this.resetFilters(true);                
            },

            resetFilters: function(bSegmentedButton) {
                let oModelView      = this.getOwnerComponent().getModel("mainView"),
                    oTableBinding   = this.getView().byId("mainLead-table").getBinding("items");

                if (bSegmentedButton) {
                    //  SegmentedButton Filters
                    this.getOwnerComponent().getModel("mainView").setProperty("/selectedSegmentButton", "4");                    
                }

                //  ComboBox Filters
                oModelView.setProperty("/selectedStatus", "");
                oModelView.setProperty("/selectedCampaign", "");
                oModelView.setProperty("/selectedPriority", "");
                oModelView.setProperty("/selectedBrand", "");
                // this.getView().byId("filters-id").getItems().forEach(element => {
                //     if (element instanceof sap.m.ComboBox) {
                //         element.setSelectedKey("");                        
                //     }
                // });

                oTableBinding.filter([], "Application");                
            }

        });
    });
