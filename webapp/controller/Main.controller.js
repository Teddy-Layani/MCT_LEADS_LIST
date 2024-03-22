sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/ValueState",
    "sap/ui/model/Sorter",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
    'sap/ui/model/odata/v2/ODataModel',
    "zcrmleadslist/utilities/moment",
    "zcrmleadslist/model/models"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, ValueState, Sorter,models) {
        "use strict";

        return Controller.extend("zcrmleadslist.controller.Main", {
            onInit: async function () {
                var self = this;
                var self2 = this;
                this.getView().byId("")
                this._interval = window.setInterval(self.slaRefresh, 600000, self);
                debugger;
                var oModel = this.getOwnerComponent().getModel("mainModel");    
                try {
                    this.UserBpData =  await this.loadUserBPData(oModel);
                    debugger;
                    // this.getOwnerComponent().getModel("UserBpDataView");
                    var oUserBpDataModel = this.getOwnerComponent().getModel("UserBpData");
                    oUserBpDataModel.setData(this.UserBpData);
                    // var oRespMultibox = this.byId("respMultiBox");
                
                    // if(oRespMultibox)
                    // {
                    //     oRespMultibox.setVisible(this.UserBpData.IsManager);
                    // }
                    debugger;

                } catch(error){
                    console.log(error.message);
                }

                var sSearch = window.location.search;
                if(sSearch){
                    const urlParams = new URLSearchParams(sSearch);
                    const leadIdParam = urlParams.get("LEADID");
                    if(leadIdParam){
                        const leadIdsArray = leadIdParam.split(",");
                        if(leadIdsArray.length > 0){
                            this.getOwnerComponent().getModel("mainView").setProperty("/objectIds", leadIdsArray);
                            //this.onFilterChange();
                        }
                    }
                }

                //  Set HE to momentjs
                moment.locale('he');

                this.getOwnerComponent().getModel("mainView").setProperty("/beginDate", null);
                this.getOwnerComponent().getModel("mainView").setProperty("/endDate",  null);
                this.getOwnerComponent().getModel("mainView").setProperty("/selectedSegmentButton", "4");
                this.getOwnerComponent().getModel("mainView").setProperty("/selectedSegmentButton", "4");

                let sSelectedTeam = this.UserBpData.IsManager?"true":"false";
                this.getOwnerComponent().getModel("mainView").setProperty("/selectedTeam", sSelectedTeam);

                this.getOwnerComponent().getModel("mainView").setProperty("/CUSTOMER_descending",  false);
                this.getOwnerComponent().getModel("mainView").setProperty("/CUSTOMER_ascending",  false);
                // let  oModelView = this.getOwnerComponent().getModel("mainView").getData(),
                //      oTableBinding = this.getView().byId("mainLead-table").getBinding("items");
                
                // oTableBinding.aFilters.push(new Filter("IsManager", FilterOperator.EQ, oModelView.selectedTeam));
                // oTableBinding.filter();
                this.onFilterChange();


            },
            
            loadUserBPData: async function(oModel) {
                return new Promise((resolve, reject) => {
                    oModel.read("/UserBPDataSet",{
                        success:function(data){
                            if (data && data.results && data.results.length){
                                resolve(data.results[0]);                          }
                            
                        },
                        error: function(error){
                            reject(error);
                        }
                    });
                });
            },   

            loadMainLeadSet: async function(oModel) {
                var that = this;
                return new Promise((resolve, reject) => {

                    let aFilter =  that.getFilters();

                    aFilter.push(new Filter("Excel", FilterOperator.EQ, true));
                   
                    oModel.read("/MainLeadSet",
                        {
                        filters: aFilter,

                        success:function(data){
                            if (data && data.results && data.results.length){
                                resolve(data.results);                         
                             }

                        },
                        error: function(error){
                            reject(error);

                        }
                    });
                });
            },   

            onBeforeRendering:function () {

            },

            onAfterRendering:function(){

            },
            onTabButtonDataRecieved:function(oEvent)
            {
                debugger;
                var oInvisibleButton = this.byId("tabsSegmentedButton").getButtons()[0];
                if(oInvisibleButton)
                {
                    oInvisibleButton.setVisible(false);
                }

            },
            mainLeadUpdateFinished: function (oEvent) {
                let oStatus = {},
                    aStatus = this.getOwnerComponent().getModel("mainView").getProperty("/statusValues")?this.getOwnerComponent().getModel("mainView").getProperty("/statusValues"):[],
                    oServiceEmplnum = {},
                    aServiceEmplnum = this.getOwnerComponent().getModel("mainView").getProperty("/serviceEmplMultiBox")?this.getOwnerComponent().getModel("mainView").getProperty("/serviceEmplMultiBox"):[],
                    oRespNum = {},
                    aRespNum = this.getOwnerComponent().getModel("mainView").getProperty("/respValues")?this.getOwnerComponent().getModel("mainView").getProperty("/respValues"):[],
                    oCampaign = {},
                    aCampaign = this.getOwnerComponent().getModel("mainView").getProperty("/campValues")?this.getOwnerComponent().getModel("mainView").getProperty("/campValues"):[];

                this.getOwnerComponent().getModel("mainView").setProperty("/leadCount",
                    this.getView().byId("mainLead-table").getBinding("items").iLength
                );

                
                oEvent.getSource().getItems().forEach(element => {
                    if (element.getBindingContext()) {
                        const oLead = element.getBindingContext().getObject();

                        // oStatus = aStatus.find(function (el) {
                        //     return el.key === oLead.Status;
                        // });

                        // if (!oStatus && oLead.StatusDesc) {
                        //     aStatus.push({
                        //         key: oLead.Status,
                        //         text: oLead.StatusDesc
                        //     });
                        // }

                        oServiceEmplnum = aServiceEmplnum.find(function (el) {
                            return el.key === oLead.ServiceEmpNum;
                        });

                        if (!oServiceEmplnum && oLead.ServiceEmpNum) {
                            aServiceEmplnum.push({
                                key: oLead.ServiceEmpNum,
                                text: oLead.ServiceEmpName
                            });
                        }    

                        oRespNum = aRespNum.find(function (el) {
                            return el.key === oLead.PartnerRespNum;
                        });

                        if (!oRespNum && oLead.PartnerRespName) {
                            aRespNum.push({
                                key: oLead.PartnerRespNum,
                                text: oLead.PartnerRespName
                            });
                        }        
                        
                        oCampaign = aCampaign.find(function (el) {
                            return el.key === oLead.CampaignId;
                        });

                        if (!oCampaign && oLead.CampaignDescription) {
                            aCampaign.push({
                                key: oLead.CampaignId,
                                text: oLead.CampaignDescription
                            });
                        }                            
                    }

                });

                this.getOwnerComponent().getModel("mainView").setProperty("/statusValues", aStatus);
                this.getOwnerComponent().getModel("mainView").setProperty("/serviceEmplValues", aServiceEmplnum);
                this.getOwnerComponent().getModel("mainView").setProperty("/respValues", aRespNum);
                this.getOwnerComponent().getModel("mainView").setProperty("/campValues", aCampaign);
                this.getOwnerComponent().getModel("mainView").setProperty("/busy", false);

                // Update SLA Column
                this.slaRefresh(this);
            },

            onDateChange: function (oEvent) {

            },

            onSelectedButtonChange: function (oEvent) {

                // let oModelView = this.getOwnerComponent().getModel("mainView").getData();
                this.getOwnerComponent().getModel("elementSelected").setData(oEvent.getParameter("item").getBindingContext().getObject());
                this.onFilterChange();

                // let elementSelected = this.getOwnerComponent().getModel("elementSelected").getData();
                    
                //     let headerName = elementSelected.InternalText;
                    // let oTableBinding = this.getView().byId("mainLead-table").getBinding("items"),
                    //     aFilter = [];
                        
                    // if(oModelView.selectedTeam === "true")
                    // {
                    //     aFilter.push(new Filter("Assignto", FilterOperator.EQ, '0002'));
                    // }
                    // else
                    // {
                    //     aFilter.push(new Filter("Assignto", FilterOperator.EQ, '0001'));
                    // }
                    
                    // if (headerName) {
                    //     aFilter.push(new Filter("Entityname", FilterOperator.EQ, headerName)); 
                    //     oTableBinding.filter(aFilter, "Application");
                    // }
    
                    // this.resetFilters();

            },

            onSort(oEvent){
                let sortProperty = oEvent.getSource().getFieldGroupIds()[0];
                let oTableBinding = this.getView().byId("mainLead-table").getBinding("items");
                let sort_value = this.getOwnerComponent().getModel("mainView").getProperty("/sortProperty");
                let that = this;
                let descending = true;
                
                switch(sort_value){
                    case 'A':
                        that.getOwnerComponent().getModel("mainView").setProperty("/sortProperty",false);
                        descending = false;
                    break;
                    case 'D':
                        that.getOwnerComponent().getModel("mainView").setProperty("/sortProperty",'A');
                        descending = true;
                    break;
                    default:
                        that.getOwnerComponent().getModel("mainView").setProperty("/sortProperty",'D');
                }
                var oSorter = new Sorter({
                    path: sortProperty, 
                    descending: descending});
                    
                oTableBinding.filter(oSorter, "Application");
            },

            getFilters: function (oEvent) {
                let oModelView = this.getOwnerComponent().getModel("mainView").getData(),
                    aFilter = [];
                    
                let elementSelected = this.getOwnerComponent().getModel("elementSelected").getData();

                let headerName = elementSelected.InternalText;
                if (headerName) {
                    aFilter.push(new Filter("Entityname", FilterOperator.EQ, headerName)); 
                }
                
                if(oModelView.selectedTeam === "true")
                {
                    aFilter.push(new Filter("Assignto", FilterOperator.EQ, '0002'));
                }
                else
                {
                    aFilter.push(new Filter("Assignto", FilterOperator.EQ, '0001'));
                }

                var aCampKeys = this.byId("campaignMultiBox").getSelectedKeys();

                for (var i = 0; i < aCampKeys.length; i++) {
                    aFilter.push(new Filter("CampaignId", FilterOperator.EQ, aCampKeys[i]));
                }

                var aBrandKeys = this.byId("brandMultiBox").getSelectedKeys();

                for (var i = 0; i < aBrandKeys.length; i++) {
                    aFilter.push(new Filter("Brand", FilterOperator.EQ, aBrandKeys[i]));
                }

                var aStatusKeys = this.byId("statusMultiBox").getSelectedKeys();

                for (var i = 0; i < aStatusKeys.length; i++) {
                    aFilter.push(new Filter("Status", FilterOperator.EQ, aStatusKeys[i]));
                }
    
                var aPriorityKeys = this.byId("importanceMultiBox").getSelectedKeys();

                for (var i = 0; i < aPriorityKeys.length; i++) {
                    aFilter.push(new Filter("Priority", FilterOperator.EQ, aPriorityKeys[i]));
                }
    
                var aRespKeys = this.byId("respMultiBox").getSelectedKeys();

                for (var i = 0; i < aRespKeys.length; i++) {
                    aFilter.push(new Filter("PartnerRespNum", FilterOperator.EQ, aRespKeys[i]));
                }        

                var aServiceEmplKeys = this.byId("serviceEmplMultiBox").getSelectedKeys();

                for (var i = 0; i < aServiceEmplKeys.length; i++) {
                    aFilter.push(new Filter("ServiceEmpNum", FilterOperator.EQ, aServiceEmplKeys[i]));
                }     

                var sIndex = 0;
                if (oModelView.objectIds) {
                    oModelView.objectIds.forEach((Id)=>{
                        if(sIndex <= 220)
                          {
                            aFilter.push(new Filter("ObjectId", FilterOperator.EQ, Id));
                            sIndex += 1;                            
                          }

                    });
                }
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
                    var dFromDate = moment(oModelView.beginDate).startOf('day').toDate();             
                    var dToDate = moment(oModelView.endDate).endOf('day').toDate();             
                    aFilter.push(new Filter({
                        path: "FromDate",
                        operator: FilterOperator.BT,
                        value1: dFromDate,
                        value2: dToDate
                    }));
                }
                return aFilter;
                // this.byId("tabsSegmentedButton").setSelectedKey("0");
            },
            onFilterChange: function (oEvent) {
                let aFilter = this.getFilters(),
                oTableBinding = this.getView().byId("mainLead-table").getBinding("items");

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
                this.onFilterChange();
            },

            resetFilters: function (bSegmentedButton) {
                let oModelView = this.getOwnerComponent().getModel("mainView"),
                    oTableBinding = this.getView().byId("mainLead-table").getBinding("items");

                if (bSegmentedButton) {
                    //  SegmentedButton Filters
                    this.getOwnerComponent().getModel("mainView").setProperty("/selectedSegmentButton", "0");
                }
                this.getOwnerComponent().getModel("elementSelected").setData({});

                //  Date
                oModelView.setProperty("/beginDate", "");
                oModelView.setProperty("/endDate", "");

                //  ComboBox Filters
                oModelView.setProperty("/selectedStatus", "");
                oModelView.setProperty("/selectedCampaign", "");
                oModelView.setProperty("/selectedPriority", "");
                oModelView.setProperty("/selectedBrand", "");
                // oModelView.setProperty("/objectIds", []);

                this.byId("campaignMultiBox").clearSelection();
                this.byId("importanceMultiBox").clearSelection();
                this.byId("statusMultiBox").clearSelection();
                this.byId("brandMultiBox").clearSelection();
                this.byId("respMultiBox").clearSelection();
                this.byId("serviceEmplMultiBox").clearSelection();
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

            onColumnHeader: function(oEvent) {
                let oTableBinding = this.getView().byId("mainLead-table").getBinding("items"),
                    oSource         = oEvent.getSource(),
                    sortProperty    = oSource.data().sortProperty,
                    oSort           = null;


                switch (oSource.getIcon()) {
                    case "sap-icon://sorting-ranking":
                        oSort       = new Sorter( sortProperty, false );

                        oSource.setIcon("sap-icon://sort-ascending");
                        break;
                    case "sap-icon://sort-ascending":
                        oSort       = new Sorter( sortProperty, true );
                        
                        oSource.setIcon("sap-icon://sort-descending");
                        break;
                    case "sap-icon://sort-descending":
                        oSource.setIcon("sap-icon://sorting-ranking");
                    
                        break;
                
                    default:
                        break;
                }
                
                oTableBinding.sort(oSort);
            },
            filterElementType: function(oEvent) {
            //    this.resetFilters();
            this.getOwnerComponent().getModel("mainView").setProperty("/selectedSegmentButton", "0");
            this.getOwnerComponent().getModel("elementSelected").setData(oEvent.getSource().getBindingContext().getObject());
            this.onFilterChange();

            //    let elementSelected = this.getOwnerComponent().getModel("elementSelected").getData();

            //    let headerName = elementSelected.InternalText;
            //    let oModelView = this.getOwnerComponent().getModel("mainView").getData(),
            //         oTableBinding = this.getView().byId("mainLead-table").getBinding("items"),
            //         aFilter = [];
                    
            //     if(oModelView.selectedTeam === "true")
            //     {
            //         aFilter.push(new Filter("Assignto", FilterOperator.EQ, '0002'));
            //     }
            //     else
            //     {
            //         aFilter.push(new Filter("Assignto", FilterOperator.EQ, '0001'));
            //     }

            //     if (headerName) {
            //         aFilter.push(new Filter("Entityname", FilterOperator.EQ, headerName)); 
            //         oTableBinding.filter(aFilter, "Application");
            //     }
                
            // //    this.byId("tabsSegmentedButton").setSelectedKey("0");

            // //    this.resetFilters();
            },
            onExit: function () {
                window.clearInterval(this._interval);
            },

            createColumnConfig: function() {
                var aCols = [];
    
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("CUSTOMER"),
                    property: ['ProspectName'],
                    type: sap.ui.export.EdmType.String
                });
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("CUSTOMER_NO"),
                    property: ['ProspectNumber'],
                    type: sap.ui.export.EdmType.String
                });
    
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("LEAD_NUMBER"),
                    type: sap.ui.export.EdmType.String,
                    property: 'ObjectId'
                });
  
    
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("BRAND"),
                    property: 'Brand',
                    type: sap.ui.export.EdmType.String
                });

                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("OPEN_DATE"),
                    property: 'StartDate',
                    type:'sap.ui.model.type.Date', 
                    formatOptions : { 
                        pattern: 'dd.MM.yyyy HH:mm'
                        }
                });

                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("CAMPAIGN"),
                    property: 'CampaignDescription',
                    type: sap.ui.export.EdmType.String
                });
    
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("CAMPAIGN"),
                    property: 'CampaignId',
                    type: sap.ui.export.EdmType.String
                });
    
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("PERSON_RESPONSIBLE"),
                    property: 'PartnerRespName',
                    type: sap.ui.export.EdmType.String 
                });
    
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("SERVICE_EMPLOYEE"),
                    property: 'ServiceEmpName',
                    type: sap.ui.export.EdmType.String
                });

                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("RANK"),
                    property: 'PriorityTxt',
                    type: sap.ui.export.EdmType.String
                });

                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("STATUS"),
                    property: 'StatusDesc',
                    type: sap.ui.export.EdmType.String
                });

                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("STATUS_REASON"),
                    property: 'StatusReasonText',
                    type: sap.ui.export.EdmType.String
                });
            
                aCols.push({
                    label: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("FU_DATE"),
                    property: 'StartDate',
                    type:'sap.ui.model.type.Date', 
                    formatOptions : { 
                        pattern: 'dd.MM.yyyy HH:mm'
                        }
                });

    
                return aCols;
            },
    
            onExport: async function() {
                var aCols, oBinding, oSettings, oSheet, oTable;

                aCols = this.createColumnConfig();
                oBinding = this.getView().byId("mainLead-table").getBinding("items");
                debugger;
                var oModel = this.getOwnerComponent().getModel("mainModel");
                this.getOwnerComponent().getModel("mainView").setProperty("/busy", true);
  
                try {
                    var oData =  await this.loadMainLeadSet(oModel);
                    this.getOwnerComponent().getModel("mainView").setProperty("/busy", false);
                    debugger;

                } catch(error){
                    this.getOwnerComponent().getModel("mainView").setProperty("/busy", false);
                    console.log(error.message);
                }

    
                oSettings = {
                    workbook: { columns: aCols },
                    dataSource: oData
                };
    
                oSheet = new sap.ui.export.Spreadsheet(oSettings);
                oSheet.build()
                    .then(function() {
                        MessageToast.show('Spreadsheet export has finished');
                    }).finally(function() {
                        oSheet.destroy();
                    });
            }            

        });
    });
