sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },

            viewModel: function(sViewName) {
                let oDefault = {};

                switch (sViewName) {
                    case "main":
                        oDefault    = {
                            busy: true,
                            date: new Date(),
                            beginDate: new Date(),
                            endDate: new Date(),
                            leadCount: 0,
                            selectedTeam: "false",
                            comboBoxTeam: [
                                // { key: true, text: this.getText("my") },
                                // { key: false, text: this.getText("myTeam") }                                
                                { key: "true", text: "של הצוות שלי" },
                                { key: "false", text:"שלי" }
                            ],   
                            selectedSegmentButton: "4"
                        };
                        
                        break;

                        case "UserBpData":
                            oDefault    = {
                                FullName:"",
                                IsManager: false,
                                NameFirst:"",
                                NameLast: "",
                                Partner: "",
                                PartnerGuid:"",
                                Username:""            
                            };
                            break;
                        case "elementSelected":
                            oDefault = {
                                AssignedTo:"0000",
                                Color:"",
                                Datefilter:null,
                                ElementType:"",
                                InternalText:"",
                                LeadCount:0,
                                SortOrder: 0,
                                TabConditionSet:{results: []},
                                UiText: "",
                                User:""
                            }

                            break;
                          
                    default:
                        break;
                }
                return new JSONModel(oDefault);    
            },
            checkOtherFilter: function (oDataModel,oViewModel){
                var DataLoaded = oDataModel.read("/ZUSER_PARAM_CHECKSet('ZMOKED_MNGR')",
                    {success: function(){
                        oViewModel.setProperty("/ShowNoFilter",true);
                    }, error: function(e){
                        oViewModel.setProperty("/ShowNoFilter",false)
                    }});

            },
            checkIsSlsManager: function (oDataModel,oViewModel){
            //     var DataLoaded = oDataModel.read("/UserParamsSet",
            //         {success: function(oData){
            //             filters:[new Filter("Parid", FilterOperator.EQ, "ZIS_SLS_SRV_MANGER")]
            //    // this.getOwnerComponent().getModel("mainView").setProperty("/isManagerSwitchVisible",false);
            //             if(oData && oData.length > 0){
            //                 if(oData[0].Parva == "X")
            //                     oViewModel.setProperty("/isManagerSwitchVisible",true);
            //             }
            //         }, error: function(e){
            //             oViewModel.setProperty("/isManagerSwitchVisible",false);
            //         }});

            }
        };
    });