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
                this.getView().byId("")
                this._interval = window.setInterval(self.slaRefresh, 600000, self);

                //  Set HE to momentjs
                moment.locale('he');

                this.getOwnerComponent().getModel("mainView").setProperty("/beginDate", null);
                this.getOwnerComponent().getModel("mainView").setProperty("/endDate",  null);
            },

            mainLeadUpdateFinished: function (oEvent) {
                let oStatus = {},
                    aStatus = [];

                this.getOwnerComponent().getModel("mainView").setProperty("/leadCount",
                    oEvent.getParameter("total")
                );

                oEvent.getSource().getItems().forEach(element => {
                    if (element.getBindingContext()) {
                        const oLead = element.getBindingContext().getObject();

                        oStatus = aStatus.find(function (el) {
                            return el.key === oLead.Status;
                        });

                        if (!oStatus) {
                            aStatus.push({
                                key: oLead.Status,
                                text: oLead.StatusDesc
                            });
                        }
                    }

                });

                this.getOwnerComponent().getModel("mainView").setProperty("/statusValues", aStatus);
                this.getOwnerComponent().getModel("mainView").setProperty("/busy", false);

                // Update SLA Column
                this.slaRefresh(this);
            },

            onDateChange: function (oEvent) {

            },

            onSelectedButtonChange: function (oEvent) {
                let oSelectedFilter = oEvent.getParameter("item").getBindingContext().getObject(),
                    oTableBinding = this.getView().byId("mainLead-table").getBinding("items"),
                    oModel = this.getOwnerComponent().getModel(),
                    aFilters = [];

                this.resetFilters();

                for (let i = 0; i < oSelectedFilter.TabConditionSet.__list.length; i++) {
                    const oTabCondition = oModel.getProperty("/" + oSelectedFilter.TabConditionSet.__list[i]);

                    if (oTabCondition.FieldName === "ZleadCallBack" && !(oTabCondition.ValueLow instanceof Date)) {
                        oTabCondition.ValueLow = new Date(oTabCondition.ValueLow.slice(0, 4),
                            oTabCondition.ValueLow.slice(4, 6) - 1,
                            oTabCondition.ValueLow.slice(6, 8),
                            oTabCondition.ValueLow.slice(8, 10),
                            oTabCondition.ValueLow.slice(10, 12),
                            oTabCondition.ValueLow.slice(12, 14))


                    }
                    aFilters.push(new Filter(oTabCondition.FieldName, oTabCondition.Operator, oTabCondition.ValueLow));
                }

                oTableBinding.filter(aFilters, "Application");
            },

            onFilterChange: function (oEvent) {
                let oModelView = this.getOwnerComponent().getModel("mainView").getData(),
                    oTableBinding = this.getView().byId("mainLead-table").getBinding("items"),
                    aFilter = [];

                if (oModelView.selectedStatus) {
                    aFilter.push(new Filter("Status", FilterOperator.EQ, oModelView.selectedStatus));
                }
                if (oModelView.selectedCampaign) {
                    aFilter.push(new Filter("CampaignId", FilterOperator.EQ, oModelView.selectedCampaign));
                }
                if (oModelView.selectedPriority) {
                    aFilter.push(new Filter("Priority", FilterOperator.EQ, oModelView.selectedPriority));
                }
                if (oModelView.selectedBrand) {
                    aFilter.push(new Filter("Brand", FilterOperator.EQ, oModelView.selectedBrand));
                }

                if (!oModelView.responsible || oModelView.responsible === "my") {
                    aFilter.push(new Filter("Assignto", FilterOperator.EQ, "0001"));
                } else if (oModelView.responsible === "NoFilter") {
                    aFilter.push(new Filter("Assignto", FilterOperator.EQ, "0002"));
                }

                if (oModelView.beginDate && oModelView.endDate) {                    
                    aFilter.push(new Filter({
                        path: "FromDate",
                        operator: FilterOperator.BT,
                        value1: moment(oModelView.beginDate).startOf('day').toDate(),
                        value2: moment(oModelView.endDate).endOf('day').toDate()
                    }));
                }

                oTableBinding.filter(aFilter, "Application");
        },

            onComboChangeOld: function (oEvent) {
                let oSelection = oEvent.getParameter("selectedItem").getBindingContext().getObject(),
                    sKey = "",
                    sField = "",
                    sValue = "",
                    oTableBinding = this.getView().byId("mainLead-table").getBinding("items"),
                    aFilter = oTableBinding.aApplicationFilters;

                switch (oEvent.getSource().getBindingPath("items")) {
                    case "/CampaignSet":
                        sField = "Campaign_id";
                        sKey = "CampaignId";

                        break;
                    case "/BrandSet":
                        sField = "Brand_code";
                        sKey = "Brand";

                        break;
                    case "/ImportanceSet":
                        sField = "Importance_val";
                        sKey = "Priority";

                        break;
                    case "/LeadStatusSet":
                        sField = "Status";
                        sKey = "Status";

                        break;
                    default:
                        break;
                }

                sValue = oSelection[sField];

                aFilter.push(new Filter(sKey, "EQ", sValue));

                oTableBinding.filter(aFilter, "Application");
            },

            onFilterReset: function (oEvent) {
                this.resetFilters(true);
            },

            resetFilters: function (bSegmentedButton) {
                let oModelView = this.getOwnerComponent().getModel("mainView"),
                    oTableBinding = this.getView().byId("mainLead-table").getBinding("items");

                if (bSegmentedButton) {
                    //  SegmentedButton Filters
                    this.getOwnerComponent().getModel("mainView").setProperty("/selectedSegmentButton", "4");
                }

                //  Date
                oModelView.setProperty("/beginDate", "");
                oModelView.setProperty("/endDate", "");

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
                // if(oTableBinding)//for init // Don't touch the Binding Here !!!!
                //     oTableBinding.filter([], "Application");
            },
            getZleadCallBack: function (oContext) {
                return oContext.getProperty('ZleadCallBack');
            },
            slaRefresh: function (that) {
                var aItems = that.getView().byId("mainLead-table").getItems();

                aItems.forEach(oItem => {
                    var slaCell = oItem.getCells().find(oCell => oCell instanceof sap.m.ObjectStatus);

                    if (slaCell) {
                        let dZleadCallBack = oItem.getBindingContext().getObject().ZleadCallBack;
                        var duration = moment.duration(moment(dZleadCallBack).diff(moment(new Date())));

                        if (dZleadCallBack) {
                            // slaCell.setText( moment(dZleadCallBack).from(new Date()) ); 
                            var oDate = new Date(dZleadCallBack);
                            var milsecPassed = new Date() - oDate;
                            milsecPassed = Math.abs(milsecPassed);
                            var hoursPassed = milsecPassed / (3600 * 1000);
                            var minutesPassed = milsecPassed % (3600 * 1000) / (60 * 1000);
                            var secondsPassed = milsecPassed % (60 * 1000) / 1000;
                            var sSign = duration.asHours() < 0 ? "-" : "";

                            var sDateText =
                                hoursPassed.toFixed(0).toString().padStart(2, "0") +
                                ":" +
                                minutesPassed.toFixed(0).toString().padStart(2, "0") +
                                ":" +
                                secondsPassed.toFixed(0).toString().padStart(2, "0") +
                                sSign;
                            slaCell.setText(sDateText);
                        }

                        // moment.utc(duration.asMilliseconds()).format('hh:mm');
                        if (duration.asHours() > -2 && duration.asHours() < 2) {
                            slaCell.setState(ValueState.Warning);
                        } else {
                            if (moment(dZleadCallBack).isBefore(new Date())) {
                                slaCell.setState(ValueState.Error);
                            }

                            if (moment(dZleadCallBack).isAfter(new Date())) {
                                slaCell.setState(ValueState.Success);
                            }
                        }

                    }
                });
            },

            onExit: function () {
                window.clearInterval(this._interval);
            }

        });
    });
