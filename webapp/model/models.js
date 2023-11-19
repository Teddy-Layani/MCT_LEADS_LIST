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
                            selectedSegmentButton: "4"
                        };

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
                var DataLoaded = oDataModel.read("/UserParamsSet",
                    {success: function(oData){
                        filters:[new Filter("Parid", FilterOperator.EQ, "ZIS_SLS_SRV_MANGER")]
               // this.getOwnerComponent().getModel("mainView").setProperty("/isManagerSwitchVisible",false);
                        if(oData && oData.length > 0){
                            if(oData[0].Parva == "X")
                                oViewModel.setProperty("/isManagerSwitchVisible",true);
                        }
                    }, error: function(e){
                        oViewModel.setProperty("/isManagerSwitchVisible",false);
                    }});

            }
        };
    });