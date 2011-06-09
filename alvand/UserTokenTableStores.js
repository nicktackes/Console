Ext.namespace('Ext.ux.alvand');
/**
 * UserTokenTableStores is a holder of stores for each user that has been authenticated.
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.UserTokenTableStores
 */
Ext.ux.alvand.UserTokenTableStores = function() {
	var stores = {};
	var environ;
	var staticResponseFile = 'tokenizedtables';
	var requestType ='getTokenTableList';
	var connectUrl='';
	// indicator if the sample data to support quicktest has completed loading.
	var sampleDataLoaded = false;
	var sampleValues = [];
	var me = Ext.ux.alvand.UserTokenTableStores;
	return {
		setEnvironment: function(environment) {
			environ = environment;
			connectUrl = (environ.staticContent?environ.staticUrl + environ.communicator.getStaticResultFile(staticResponseFile, environ.validContent):environ.rootUrl+'SafenetTokenManagement/getTokenTableList?response=application/json/badgerfish');
		},
		register: function(username, password, overwrite) {
			// if the username is not already registered in the store,
			// then create and load the store
			if(!stores[username] || overwrite) {
				if(!stores[username])
					stores[username] = Ext.ux.alvand.UserTokenTableStores.createStore();
				else if(overwrite) {
					// not needed
					//stores[username].removeAll(false);
				}
				// now load the store we just created
				Ext.ux.alvand.UserTokenTableStores.loadTokenTables(username, password);
				Ext.ux.alvand.UserTokenTableStores.loadTokenSamples();
			}
		},
		isSampleLoaded: function() {
			return Ext.ux.alvand.UserTokenTableStores.sampleDataLoaded;
		},
		getSampleValues: function() {
			return Ext.ux.alvand.UserTokenTableStores.sampleValues;
		},
		getStore: function(username) {
			return stores[username];
		},
		createStore: function() {
			return new Ext.data.JsonStore({
				// store configs
				//autoDestroy: true,
				url: connectUrl,
				//storeId: this.id + '_ttStore',
				// reader configs
				root: 'data',
				idProperty: 'tableName',
				fields: [{
					name: 'tableName'
				}, {
					name: 'hmacKey'
				}, {
					name: 'encryptionKey'
				}, {
					name: 'dbUser'
				}, {
					name: 'queryDurationMillis',
					type: 'int'
				}, {
					name: 'recordCount',
					type: 'int'
				}, {
					name: 'sequential',
					type: 'boolean'
				}, {
					name: 'datalength',
					type: 'int'
				}, {
					name: 'record_deleted',
					type: 'boolean'
				}, {
					name: 'record_new',
					type: 'boolean'
				}]
			});
		},
		loadTokenTables: function(username, password) {
			var authUser = {
				dbUser: username,
				dbPassword: password
			};

			// we will use the render event to initiate data load of the tokenized tables as well
			// as partial information (usernames) to populate the dbUser table with
			Ext.Ajax.request({
				url: connectUrl,
				success: Ext.ux.alvand.UserTokenTableStores.dataLoadSuccess,
				failure: environ.communicator.dataLoadFailure,
				params: authUser,
				method: 'POST'
			});
		},
		// sample data to support performance testing.  we will store this data with the singleton.
		loadTokenSamples: function() {
			if(!Ext.ux.alvand.UserTokenTableStores.isSampleLoaded()) {
				// we will use the render event to initiate data load of the tokenized tables as well
				// as partial information (usernames) to populate the dbUser table with
				Ext.Ajax.request({
					url: environ.staticUrl + 'quicktestinputdata_valid.txt',
					success: Ext.ux.alvand.UserTokenTableStores.sampleDataLoadSuccess,
					failure: environ.communicator.dataLoadFailure,
					method: 'POST'
				});
			}
		},
		processResultObject: function(resultData, resultObj, request) {
			if(resultObj['ax23:status'] && resultObj['ax23:status']['ax23:statusCode'] && resultObj['ax23:status']['ax23:statusCode']['$']) {
				var statusCode = resultObj['ax23:status']['ax23:statusCode']['$'];
				if(statusCode == 'SUCCESS') {
					// check to see if we have the submitted value
					var tableKeyArray = resultObj['ax23:tableKeyArray'];
					if(tableKeyArray) {
						for(var i = 0; i < tableKeyArray.length; i++) {
							var tableKeyRecord = {dbUser: request.params.dbUser};

							if(tableKeyArray[i]['ax23:tableName'] && tableKeyArray[i]['ax23:tableName']['$']) {
								tableKeyRecord.tableName = tableKeyArray[i]['ax23:tableName']['$'];
							}
							if(tableKeyArray[i]['ax23:hmacKey'] && tableKeyArray[i]['ax23:hmacKey']['$']) {
								tableKeyRecord.hmacKey = tableKeyArray[i]['ax23:hmacKey']['$'];
							}
							if(tableKeyArray[i]['ax23:encryptionKey'] && tableKeyArray[i]['ax23:encryptionKey']['$']) {
								tableKeyRecord.encryptionKey = tableKeyArray[i]['ax23:encryptionKey']['$'];
							}
							if(tableKeyArray[i]['ax23:queryDurationMillis'] && tableKeyArray[i]['ax23:queryDurationMillis']['$']) {
								tableKeyRecord.queryDurationMillis = tableKeyArray[i]['ax23:queryDurationMillis']['$'];
							}
							if(tableKeyArray[i]['ax23:recordCount'] && tableKeyArray[i]['ax23:recordCount']['$']) {
								tableKeyRecord.recordCount = tableKeyArray[i]['ax23:recordCount']['$'];
							}
							resultData.push(tableKeyRecord);
						}
					}
				} else {
					var statusDescription = 'An error occurred on the server, but no message was provided.  Please consult a technical representative.';
					if(resultObj['ax23:status'] && resultObj['ax23:status']['ax23:statusDescription'] && resultObj['ax23:status']['ax23:statusDescription']['$']) {
						var statusDescription = resultObj['ax23:status']['ax23:statusDescription']['$'];
					}
					// result was retrieved successfully but the server report failure
					Ext.Msg.show({
						title: 'An Error has occurred.',
						msg: statusDescription,
						buttons: Ext.Msg.OK,
						animEl: 'elId',
						icon: Ext.MessageBox.ERROR
					});
				}

			} else {
				// result was retrieved successfully but the server report failure
				Ext.Msg.show({
					title: 'No Status in response',
					msg: 'There is no status object in the return structure.',
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.ERROR
				});
			}
			return resultData;
		},
		dataLoadSuccess: function(result, request) {
			// inspect the json response container to verify that the result was successful and no errors were present
			try {
				if (result && result.responseText) {
					var rObj = Ext.decode(result.responseText);
					if (environ.communicator.responseCheck2(rObj, request, requestType+'Response')) {
						// TODO: adapt response batch to grid loadable data
						var resultData = new Array();
						var resultObj = rObj['ns:'+ requestType+'Response']['ns:return'];
						if(resultObj) {
							if(Ext.isArray(resultObj)) {
								for(var i = 0; i < resultObj.length; i++) {
									Ext.ux.alvand.UserTokenTableStores.processResultObject(resultData, resultObj[i], request);
								}
							} else {
								Ext.ux.alvand.UserTokenTableStores.processResultObject(resultData, resultObj, request);
							}
						}
						Ext.ux.alvand.UserTokenTableStores.getStore(request.params.dbUser).loadData({data:resultData});
					}
				} else {
					// result was retrieved successfully but the server report failure
					Ext.Msg.show({
						title: 'Server Error',
						msg: 'An error occurred attempting to ajax load data from the server.  No result was obtained',
						buttons: Ext.Msg.OK,
						animEl: 'elId',
						icon: Ext.MessageBox.ERROR
					});
				}
			} catch (exc) {
				// if an exception occurred, then raise it and fail the response check
				Ext.Msg.show({
					title: 'Critical Error',
					msg: exc,
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.ERROR
				});
				return false;
			}
		},
		sampleDataLoadSuccess: function(result, request) {
			// inspect the json response container to verify that the result was successful and no errors were present
			try {
				if (result && result.responseText) {
					Ext.ux.alvand.UserTokenTableStores.sampleValues = Ext.decode(result.responseText);
					Ext.ux.alvand.UserTokenTableStores.sampleDataLoaded = true;
				} else {
					// result was retrieved successfully but the server report failure
					Ext.Msg.show({
						title: 'Server Error',
						msg: 'An error occurred attempting to ajax load data from the server.  No result was obtained',
						buttons: Ext.Msg.OK,
						animEl: 'elId',
						icon: Ext.MessageBox.ERROR
					});
				}
			} catch (exc) {
				// if an exception occurred, then raise it and fail the response check
				Ext.Msg.show({
					title: 'Critical Error',
					msg: exc,
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.ERROR
				});
				return false;
			}
		},
		// Transaction Token Brokering logic (create, redeem, delete)
		requestTokens: function(payload, defaultParam, requestType, isStatic, staticResponseFile, paramName, serviceProvider, scope, successCallback, failureCallback) {
			// build params collection
			var dRequest = Ext.decode(payload);
			var params = (defaultParam?defaultParam:{});
			// workaround: encoding the array of values or tokens is applying quotations.  add to the url as get params
			var sb = new alvStringBuffer();

			for(var key in dRequest) {
				if(key != 'values')
					params[key] = dRequest[key];
				else {
					if(Ext.isArray(dRequest[key])) {
						var arrs = new Array();
						for(var i = 0; i < dRequest[key].length; i++) {
							arrs.push(dRequest[key][i].value);
						}
						if(params[paramName] == undefined) {
							for (var i = 0; i < arrs.length; i++) {
								sb.append("&");
								sb.append(paramName);
								sb.append("=");
								sb.append(arrs[i]);
							}
						}
					}
				}
			}

			Ext.Ajax.request({
				url: environ.rootUrl + (isStatic?staticResponseFile: serviceProvider + '/' + requestType) + '?response=application/json/badgerfish'+sb.toString(),
				method: 'POST',
				success: (successCallback?successCallback:Ext.ux.alvand.UserTokenTableStores.trxResultLoadSuccess),
				failure: (failureCallback?failureCallback:environ.communicator.dataLoadFailure),
				params: params,
				scope: scope
			});

		},
		processTrxResultObject: function(resultData, resultObj) {
			if(resultObj['ax21:status'] && resultObj['ax21:status']['ax21:statusCode'] && resultObj['ax21:status']['ax21:statusCode']['$']) {
				var statusCode = resultObj['ax21:status']['ax21:statusCode']['$'];
				var statusDescription
				if(resultObj['ax21:status'] && resultObj['ax21:status']['ax21:statusDescription'] && resultObj['ax21:status']['ax21:statusDescription']['$']) {
					var statusDescription = resultObj['ax21:status']['ax21:statusDescription']['$'];
				}

				// check to see if we have the submitted value
				var submittedValue = '';
				if(resultObj['ax21:sensitiveValue'] && resultObj['ax21:sensitiveValue']['$']) {
					submittedValue = resultObj['ax21:sensitiveValue']['$'];
				}
				// check to see if we have a received token
				var receivedToken = '';
				if(resultObj['ax21:tokenValue'] && resultObj['ax21:tokenValue']['$']) {
					receivedToken = resultObj['ax21:tokenValue']['$'];
				}

				var executionTimeMillis = 0;
				if(resultObj['ax21:executionTimeMillis'] && resultObj['ax21:executionTimeMillis']['$']) {
					executionTimeMillis = resultObj['ax21:executionTimeMillis']['$'];
				}

				resultData.push({value: submittedValue, token: receivedToken, statusCode: statusCode, statusDescription: statusDescription, executionTimeMillis:executionTimeMillis});
			} else {
				// result was retrieved successfully but the server report failure
				Ext.Msg.show({
					title: 'No Status in response',
					msg: 'There is no status object in the return structure.',
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.ERROR
				});
			}
			return resultData;
		},
		trxResultLoadSuccess: function(result, request) {
			// default impl for transaction does nothing.  must be implemented in caller class.
		}
	};
}();

