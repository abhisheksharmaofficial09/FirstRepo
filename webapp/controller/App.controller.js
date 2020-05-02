sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/infy/PWAOfflineBackend/controller/offline"
], function (Controller, JSONModel, offline) {
	"use strict";

	return Controller.extend("com.infy.PWAOfflineBackend.controller.App", {
		onInit: function () {
			var ProductsModel = new JSONModel();
			this.getView().setModel(ProductsModel, "ProductsModel");
			var that = this;
			this.oDataModel = this.getOwnerComponent().getModel("oDataModel");
			this.oDataModel.setUseBatch(false);
			this.oDataModel.read("/Products", {
				async: false,
				success: function (odata) {
					that.getView().getModel("ProductsModel").setData(odata.results);

				},
				error: function (error) {

				}
			});
		},
		checkHostReachable: function () {
			var conn = Offline.check();
			if (Offline.state === "up") {
				return true;
			} else {
				return false;
			}

		},
		handleSave: function (evt) {
			var oPayload = {
				"Description": this.getView().byId("__input1").getValue(),
				"ID": this.getView().getModel("ProductsModel").getData().length - 2,
				"Name": this.getView().byId("__input0").getValue(),
				"Price": this.getView().byId("__input2").getValue(),
				"Rating": this.getView().byId("__input3").getValue()
			};
			if (this.checkHostReachable()) {
				var that = this;

				this.oDataModel.create("/Products", oPayload, {
					success: function (odata) {
						var aProducts = that.getView().getModel("ProductsModel").getData();
						aProducts.push(odata);
						that.getView().getModel("ProductsModel").setData(aProducts);
						that.getView().getModel("ProductsModel").refresh(true);
					},
					error: function (error) {

					}
				});
			} else {
				var oData = {
					"type": "create",
					"payload": oPayload
				}; //get data from Model
				var request = window.indexedDB.open("offline_db", 1); //Open DB
				request.onupgradeneeded = function (event) { //Object Stores don't exist
					var db = event.target.result;
					var objectStore = db.createObjectStore("mydata"); //create object store
				};
				request.onsuccess = function (event) { //Objet Stores exist
					this.myDB = event.target.result;
					// Write to local DB
					var oTransaction = this.myDB.transaction(["mydata"], "readwrite");
					var oDataStore = oTransaction.objectStore("mydata");
					oDataStore.delete(1);
					oDataStore.add(oData, 1); //1 is the key out-of-line
				};
			}
		},

		handleRead: function (evt) {
			var oJSONDataModel;
			var oView = this.getView();
			var request = window.indexedDB.open("offline_db", 1); //Open DB
			request.onsuccess = function (event) { //Objet Stores exist
				this.myDB = event.target.result;
				//Read from local DB
				var oTransaction = this.myDB.transaction(["mydata"], "readwrite");
				var oDataStore = oTransaction.objectStore("mydata");
				var items = [];
				oDataStore.openCursor().onsuccess = function (event) {
					var cursor = event.target.result;
					if (cursor) {
						items.push(cursor.value); //add value to items table
						cursor.continue();
					} else { //All data in items
						oJSONDataModel = new sap.ui.model.json.JSONModel();
						oJSONDataModel.setData(items[0]); //Create model with local DB data
						oView.setModel(oJSONDataModel, "indexeddbModel"); //Update model used by view
						oView.getModel("indexeddbModel").refresh(true);

						var indexedData = oView.getModel("indexeddbModel").getData();
						oView.byId("__text").setText(indexedData.type);
						oView.byId("__input1").setValue(indexedData.payload.Description);
						oView.byId("__input0").setValue(indexedData.payload.Name);
						oView.byId("__input2").setValue(indexedData.payload.Price);
						oView.byId("__input3").setValue(indexedData.payload.Rating);
					}
				};
			};
		},
		handleClear: function () {
			var oView = this.getView();
			oView.byId("__text").setText("");
			oView.byId("__input1").setValue("");
			oView.byId("__input0").setValue("");
			oView.byId("__input2").setValue("");
			oView.byId("__input3").setValue("");
		}
	});
});