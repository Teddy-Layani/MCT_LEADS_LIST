sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "zcrmleadslist/utilities/moment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, ValueState) {
        "use strict";

        return Controller.extend("zcrmleadslist.controller.Main", {
            onInit: function () {
                var self = this;
                
                this._interval = window.setInterval(self.slaRefresh, 600000, self);

                //  Set HE to momentjs
                moment.locale('he');
            },

            mainLeadUpdateFinished: function(oEvent) {
                let oStatus     = {},
                    aStatus     = [];

                this.getOwnerComponent().getModel("mainView").setProperty("/leadCount",
                    oEvent.getParameter("total")
                );

                oEvent.getSource().getItems().forEach( element => {
                    const oLead     = element.getBindingContext().getObject();

                    oStatus     = aStatus.find(function(el) {
                        return el.key === oLead.Status;
                    });

                    if (!oStatus) {
                        aStatus.push({
                            key: oLead.Status,
                            text: oLead.StatusDesc
                        });                            
                    }
                });

                this.getOwnerComponent().getModel("mainView").setProperty("/statusValues", aStatus);
                this.getOwnerComponent().getModel("mainView").setProperty("/busy", false);

                // Update SLA Column
                this.slaRefresh(this);
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

            onFilterChange: function(oEvent) {
                let oModelView      = this.getOwnerComponent().getModel("mainView").getData(),
                    oTableBinding   = this.getView().byId("mainLead-table").getBinding("items"),
                    aFilter     = [];

                if (oModelView.selectedStatus) {
                    aFilter.push(new Filter( "Status", FilterOperator.EQ, oModelView.selectedStatus));                    
                }
                if (oModelView.selectedCampaign) {
                    aFilter.push(new Filter( "CampaignId", FilterOperator.EQ, oModelView.selectedCampaign));                    
                }
                if (oModelView.selectedPriority) {
                    aFilter.push(new Filter( "Priority", FilterOperator.EQ, oModelView.selectedPriority));                    
                }
                if (oModelView.selectedBrand) {
                    aFilter.push(new Filter( "Brand", FilterOperator.EQ, oModelView.selectedBrand));                    
                }
                if (oModelView.date) {
                    aFilter.push(new Filter( {
                        path: "FromDate",
                        operator: FilterOperator.LE,
                        value1: oModelView.date
                      }));                    
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

                //  Date
                oModelView.setProperty("/date", new Date());
                
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
            },
            
            slaRefresh: function(that) {
                var aItems  = that.getView().byId("mainLead-table").getItems();
                
                aItems.forEach(oItem => {
                    var slaCell = oItem.getCells().find(oCell => oCell instanceof sap.m.ObjectStatus );

                    if (slaCell) {
                        let dZleadCallBack = oItem.getBindingContext().getObject().ZleadCallBack;

                        if (dZleadCallBack) {
                            slaCell.setText( moment(dZleadCallBack).from(new Date()) );                            
                        }

                        if (moment(dZleadCallBack).isAfter(new Date())) {
                            slaCell.setState(ValueState.Information);
                        }

                        if (moment(dZleadCallBack).isBefore(new Date())) {
                            slaCell.setState(ValueState.Error);
                        }

                    }
                });
            },

            onExit: function() {
                window.clearInterval( this._interval );
            }

        });
    });
