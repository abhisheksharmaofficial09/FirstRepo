function initModel() {
	var sUrl = "/northwind/V2/(S(s3hhnlzytjrgd3rhxn1z5l1q))/OData/OData.svc/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}