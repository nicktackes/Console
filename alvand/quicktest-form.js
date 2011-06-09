// create namespace
Ext.namespace('Ext.ux.alvand.form');

/**
 * Ext.ux.alvand.form.CreateToken Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.form.CreateToken
 * @extends Ext.extend(Ext.ux.alvand.form.BaseToken
 */
Ext.ux.alvand.form.QuickTestForm = Ext.extend(Ext.ux.alvand.form.BaseToken, {
	// this arrays is a single use array to collect the output from the web test that is being processed.
	jobBatchGroupResult: [],
	jobBatchGroupRequest:[],
	jobBatchGroupIndex: 0,
	jobBatchResult: [],
	jobBatchRequest:[],
	jobBatchIndex: 0,
	serviceProvider: 'SafenetTokenTests',
	actionButtonText: 'Run Test',
	defaultActionParam: {},
	requestType: 'quickTest',
	staticResponseFile: 'quicktestresults',
	iconCls: 'x-icon-tickets',
	listeners:{
		'render': function(panel) {
			// if the sample data has not yet loaded, instruct user to close and reopen form
			if(!Ext.ux.alvand.UserTokenTableStores.isSampleLoaded()) {
				Ext.Msg.show({
					title: 'Performance Testing Not Ready to Execute',
					msg: 'There seems to be a problem with the loading of sample data to conduct this performance test.  Try closing this form and reopening it.  If the problem persists, please contact your system administrator for futher assistance.',
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.INFO
				});
			}
		}
	},
	getItemDefinitionArray: function() {
		return [this.dbUserField, this.tableNameField, this.naeUserField,this.maskTypeField, this.quickTestSummaryGrid];
	},
	clearTheForm: function() {
		Ext.ux.alvand.form.QuickTestForm.superclass.clearTheForm.call(this);
	},
	getLoadingPanel: function() {
		return Ext.getCmp( this.id + '_loadingPanel');
	},
	getSummaryGrid: function() {
		return Ext.getCmp( this.id + '_quicktestsummarygrid');
	},
	initFieldDefinitions: function() {
		this.quickTestSummaryGrid = {
			id: this.id + '_quicktestsummarygrid',
			xtype: 'alvgridquicktestsummary',
			environ: this.environ,
			anchor:'100%'
		};
		// call parent initComponent
		Ext.ux.alvand.form.QuickTestForm.superclass.initFieldDefinitions.call(this);
	},
	initComponent: function() {

		this.quickTestStore = new Ext.data.JsonStore({
			fields: ['testName', 'throughputTokensPerSecond', 'totalElapsedTimeMillis', 'testDescription'],
			data: []
		});

		this.buttons = [{
			id: this.id + '_runtestbtn',
			text: this.actionButtonText,
			//formBind: true,
			handler: function(btn, event) {
				var frm = this.getForm();
				if (frm) {
					var formVals = frm.getValues();
					if(formVals.dbUser)
						formVals.dbPassword = this.getDBLoginValue(formVals.dbUser);
					if(formVals.naeUser)
						formVals.naePassword = this.getHSMLoginValue(formVals.naeUser);

					var jsonVals = Ext.encode(formVals);
					this.runServerSideTest();
				}

			},
			scope: this
		}];
		// call parent initComponent
		Ext.ux.alvand.form.QuickTestForm.superclass.initComponent.call(this);
	},
	setRunTestButtonState: function(disable) {
		if(this.buttons && this.buttons.length > 0)
			(disable?this.buttons[0].disable():this.buttons[0].enable());
	},
	runServerSideTest: function() {
		// insert a test case into the grid and run the test
		var grid = this.getSummaryGrid();
		if(grid) {
			var requestType = this.getRequestType();
			var isStatic = this.environ.staticContent;
			var staticResponseFile = this.environ.communicator.getStaticResultFile(this.getStaticResponseFile(), this.environ.validContent);
			var serviceProvider = this.serviceProvider;

			// build params collection
			var frm = this.getForm();
			var formVals = frm.getValues();

			var TestRecord = Ext.data.Record.create([{
				name: 'id'
			}, {
				name: 'testDate'
			}, {
				name: 'dbUser'
			}, {
				name: 'tableName'
			}, {
				name: 'naeUser'
			}, {
				name: 'masktype'
			}, {
				name: 'serverSideApiTest'
			}, {
				name: 'webServerTest'
			}]);

			var p = new TestRecord({
				id: this.environ.communicator.guid(),
				testDate: new Date(),
				dbUser: formVals.dbUser,
				tableName: formVals.tableName,
				naeUser: formVals.naeUser,
				masktype: this.getMaskField().getRawValue(),
				serverSideApiTest: -1,
				webServerTest: -99
			});

			grid.store.add(p);
			grid.getView().refresh();
			grid.getSelectionModel().selectRow(grid.store.getCount() - 1);
			formVals.id = p.data.id;
			formVals.testType = 'serverSideApiTest';
			if(formVals.dbUser)
				formVals.dbPassword = this.getDBLoginValue(formVals.dbUser);
			if(formVals.naeUser)
				formVals.naePassword = this.getHSMLoginValue(formVals.naeUser);
			// TODO: we have an inconsistent naming convention for these fields.  we need to correct them in this context.
			if(formVals.format) {
				formVals.maskType = formVals.format;
				delete formVals.format;
			}
			if(formVals.tableName) {
				formVals.tokenTable = formVals.tableName;
				delete formVals.tableName;
			}

			var jsonVals = Ext.encode(formVals);
			this.setRunTestButtonState(true);
			Ext.Ajax.request({
				url: this.environ.rootUrl + (isStatic?staticResponseFile: serviceProvider + '/' + requestType) + '?response=application/json/badgerfish',
				method: 'POST',
				success: this.dataLoadSuccess,
				failure: this.dataLoadFailure,
				params: formVals,
				scope: this
			});
		}

	},
	runWebServerTest: function(params) {
		params.testType = 'webServerTest';
		// hack - not a good location
		this.jobBatchGroupParams = params;

		// construct a batch of jobs to run.  then submit the batch of jobs.  block on each job running
		var jobBatch = [];
		var jobBatchGroup = [];
		var sampleValues = Ext.ux.alvand.UserTokenTableStores.getSampleValues();
		if(sampleValues && sampleValues.length ==300) {
			var serviceProvider = 'SafenetTokenService';
			var inputChunk = new Array();
			// first 3 batch groups are 100 individually processed jobs
			var batchSize = 1;
			var chunkBlock = sampleValues.slice(0,100);
			jobBatch = [];
			// conduct 100 individual token creates
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'insertBatch', 'valueArray', serviceProvider, 'createtokenresults', {luhnCheck: 1}));
			}
			jobBatchGroup.push(this.buildJobBatch('T Ind 100', 'Tokenized 100 values individually', jobBatch));

			// conduct 100 individual retoken creates
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'insertBatch', 'valueArray', serviceProvider, 'createtokenresults', {luhnCheck: 1}));
			}
			jobBatchGroup.push(this.buildJobBatch('RT Ind 100', 'Re-Tokenized 100 values individually', jobBatch));

			// conduct 100 individual token redeems
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'getBatch', 'tokenArray', serviceProvider, 'redeemtokenresults', {}));
			}
			jobBatchGroup.push(this.buildJobBatch('G Ind 100', 'De-Tokenized 100 values individually', jobBatch));

			chunkBlock = sampleValues.slice(100,200);
			batchSize = 10;
			// conduct 10 batches of 10 token creates
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'insertBatch', 'valueArray', serviceProvider, 'createtokenresults', {luhnCheck: 1}));
			}
			jobBatchGroup.push(this.buildJobBatch('T 10x10', 'Tokenized 100 values in 10 batches of 10', jobBatch));

			// conduct 10 batches of 10 retoken creates
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'insertBatch', 'valueArray', serviceProvider, 'createtokenresults', {luhnCheck: 1}));
			}
			jobBatchGroup.push(this.buildJobBatch('RT 10x10', 'Re-Tokenized 100 values in 10 batches of 10', jobBatch));

			// conduct 10 batches of 10 token redeems
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'getBatch', 'tokenArray', serviceProvider, 'redeemtokenresults', {}));
			}
			jobBatchGroup.push(this.buildJobBatch('G 10x10', 'De-Tokenized 100 values in 10 batches of 10', jobBatch));

			chunkBlock = sampleValues.slice(200,300);
			batchSize = 100;

			// conduct 1 batch of 100 token creates
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'insertBatch', 'valueArray', serviceProvider, 'createtokenresults', {luhnCheck: 1}));
			}
			jobBatchGroup.push(this.buildJobBatch('T 1x100', 'Tokenized 100 values in one batch', jobBatch));

			// conduct 1 batch of 100 retoken creates
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'insertBatch', 'valueArray', serviceProvider, 'createtokenresults', {luhnCheck: 1}));
			}
			jobBatchGroup.push(this.buildJobBatch('RT 1x100', 'Re-Tokenized 100 values in one batch', jobBatch));

			// conduct 1 batch of 100 token redeems
			jobBatch = [];
			for(var i = 0; i < chunkBlock.length; i+=batchSize) {
				inputChunk = chunkBlock.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'getBatch', 'tokenArray', serviceProvider, 'redeemtokenresults', {}));
			}
			jobBatchGroup.push(this.buildJobBatch('G 1x100', 'De-Tokenized 100 values in one batch', jobBatch));

			jobBatch = [];
			for(var i = 0; i < sampleValues.length; i+=batchSize) {
				inputChunk = sampleValues.slice(i, i+batchSize);
				jobBatch.push(this.buildJob(inputChunk, 'deleteValueBatch', 'valueArray', serviceProvider, 'deletevalueresults', {}));
			}
			jobBatchGroup.push(this.buildJobBatch('D 1x100', 'Deleted 100 values in one batch', jobBatch));
		}
		this.startJobBatchGroup(jobBatchGroup);
	},
	buildJobBatch: function(name, description, batch) {
		return {
			testName: name,
			testDescription: description,
			totalElapsedTimeMillis: 0,
			throughputTokensPerSecond: 0,
			batch: batch
		};
	},
	buildJob: function(inputChunk, requestType, paramName, serviceProvider, staticResponseFile, defaultParam ) {
		return {
			input: inputChunk,
			defaultParam: defaultParam,
			requestType: requestType,
			isStatic:  this.environ.staticContent,
			staticResponseFile: this.environ.communicator.getStaticResultFile(staticResponseFile, this.environ.validContent),
			paramName:paramName,
			serviceProvider: serviceProvider
		};
	},
	startJobBatchGroup: function(jobBatchGroup ) {
		// store the job batch being processed.  single threaded.  blocked by ui.
		this.jobBatchGroupRequest = jobBatchGroup;
		// reset job batch result
		this.jobBatchGroupResult = [];
		// reset job index
		this.jobBatchGroupIndex = 0;
		if(this.jobBatchGroupRequest.length > 0) {
			var jobBatch = this.jobBatchGroupRequest[0];
			this.runJobBatch(jobBatch, 0);
		}
	},
	runJobBatch: function(jobBatch, jobBatchGroupIndex ) {
		var curDate = new Date();
		this.jobBatchStartTime = curDate.getTime();
		this.jobBatchGroupIndex = jobBatchGroupIndex;
		// store the job batch being processed.  single threaded.  blocked by ui.
		this.jobBatchRequest = jobBatch;
		// reset job batch result
		this.jobBatchResult = [];
		// reset job index
		this.jobBatchIndex = 0;
		if(this.jobBatchRequest.batch.length > 0) {

			var job = this.jobBatchRequest.batch[0];
			this.runJob(job, 0);

		}
	},
	runJob: function(job, jobBatchIndex ) {
		// store the current index we are processing
		this.jobBatchIndex = jobBatchIndex;
		//retain the request type in the default param so that we can access it in the callback handler
		if(!job.defaultParam)
			job.defaultParam = {};
		if(!job.defaultParam.requestType)
			job.defaultParam.requestType = job.requestType;
		if(!job.defaultParam.paramName)
			job.defaultParam.paramName = job.paramName;

		job.defaultParam.testType = this.jobBatchGroupParams.testType;
		job.defaultParam.id = this.jobBatchGroupParams.id;

		var payload = this.preparePayload(job.input, job.paramName);
		Ext.ux.alvand.UserTokenTableStores.requestTokens(payload, job.defaultParam, job.requestType, job.isStatic, job.staticResponseFile, job.paramName, job.serviceProvider, this, this.webTestDataLoadSuccess, this.dataLoadFailure);
	},
	normalizeStaticResponse: function(length, responseArray) {
		if(length > responseArray.length) {
			responseArray.push(responseArray[0]);
			this.normalizeStaticResponse(length, responseArray);
		} else if(length < responseArray.length) {
			responseArray.pop();
			this.normalizeStaticResponse(length, responseArray);
		}

		return responseArray;
	},
	webTestDataLoadSuccess: function(result, request) {
		// inspect the json response container to verify that the result was successful and no errors were present
		try {
			if (result && result.responseText) {
				var rObj = Ext.decode(result.responseText);
				if (this.environ.communicator.responseCheck2(rObj, request, request.params.requestType+'Response')) {
					// TODO: adapt response batch to grid loadable data
					var resultData = new Array();
					var resultObj = rObj['ns:'+request.params.requestType+'Response']['ns:return'];
					if(resultObj) {
						if(Ext.isArray(resultObj)) {
							for(var i = 0; i < resultObj.length; i++) {
								Ext.ux.alvand.UserTokenTableStores.processTrxResultObject(resultData, resultObj[i]);
							}
						} else {
							Ext.ux.alvand.UserTokenTableStores.processTrxResultObject(resultData, resultObj);
						}
					}

					// if this is static content, we need to make sure the result quantity matches the request. determine the
					// request length and chop down the result to match
					if(this.environ.staticContent && resultData.length > 0 && request.url) {
						var requestUrl = Ext.urlDecode(request.url);
						if(requestUrl[request.params.paramName]) {
							var rLength = (Ext.isArray(requestUrl[request.params.paramName])?requestUrl[request.params.paramName].length:1);

							resultData = this.normalizeStaticResponse(rLength, resultData);
						}
					}
					this.jobBatchResult = this.jobBatchResult.concat(resultData);
					// if there are additional jobs in the batch, process the next, otherwise handle the complete response
					if(this.jobBatchIndex+1 < this.jobBatchRequest.batch.length) {
						this.runJob(this.jobBatchRequest.batch[this.jobBatchIndex+1], this.jobBatchIndex+1);
					} else {
						var endDate = new Date();
						var jobBatchElaspedTime = endDate.getTime() - this.jobStartTime;
						// bundle up the results of the batch and store into the jobBatchGroupResult
						var jobBatchResult = {
							testName: this.jobBatchGroupRequest[this.jobBatchGroupIndex].testName,
							testDescription: this.jobBatchGroupRequest[this.jobBatchGroupIndex].testdescrption,
							totalElapsedTimeMillis: (endDate.getTime() - this.jobBatchStartTime)/1000,

							throughputTokensPerSecond: this.jobBatchResult.length/((endDate.getTime() - this.jobBatchStartTime)/1000)
						};

						if(this.jobBatchResult) {
						}
						this.jobBatchGroupResult = this.jobBatchGroupResult.concat(jobBatchResult);

						// if there are more job batch groups, kick them off
						if(this.jobBatchGroupIndex+1 < this.jobBatchGroupRequest.length) {

							this.runJobBatch(this.jobBatchGroupRequest[this.jobBatchGroupIndex+1], this.jobBatchGroupIndex +1);
						} else {
							// we are finished will all job batch groups, update the test result
							var summaryGrid = this.getSummaryGrid();
							if(summaryGrid) {
								summaryGrid.updateTestStatus(request.params.id, request.params.testType, 1, this.jobBatchGroupResult);
								this.setRunTestButtonState(false);
							}
						}
					}
				}
			} else {
				var summaryGrid = this.getSummaryGrid();
				if(summaryGrid) {
					summaryGrid.updateTestStatus(request.params.id, request.params.testType, 1);
				}
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
	preparePayload: function(inputChunk, paramName) {
		var objParam = (paramName=='valueArray'?'value':'token');
		var arrayParam = (paramName=='valueArray'?'values':'tokens');
		var frm = this.getForm();
		if (frm) {
			var formVals = frm.getValues();
			// if the grid has modified records, then add those values in
			if (inputChunk) {
				var gridArray = new Array();
				for (var i = 0; i < inputChunk.length; i++) {
					var obj = {};
					if(objParam == 'value')
						obj.value = inputChunk[i];
					else
						obj.token = inputChunk[i];
					gridArray.push(obj);
				}
			}
			if(formVals.dbUser)
				formVals.dbPassword = this.getDBLoginValue(formVals.dbUser);
			if(formVals.naeUser)
				formVals.naePassword = this.getHSMLoginValue(formVals.naeUser);
			formVals[arrayParam] = gridArray;

			return Ext.encode(formVals);
		}

	},
	processResultObject: function(resultData, resultObj) {
		if(resultObj['ax25:testName'] &&  resultObj['ax25:testName']['$']) {
			var testName = resultObj['ax25:testName']['$'];
			var testDescription = '';
			if(resultObj['ax25:testDescription'] &&  resultObj['ax25:testDescription']['$']) {
				var testDescription = resultObj['ax25:testDescription']['$'];
			}

			var throughputTokensPerSecond = 0;
			if(resultObj['ax25:throughputTokensPerSecond'] &&  resultObj['ax25:throughputTokensPerSecond']['$']) {
				var throughputTokensPerSecond = resultObj['ax25:throughputTokensPerSecond']['$'];
			}

			var totalElapsedTimeMillis = 0;
			if(resultObj['ax25:totalElapsedTimeMillis'] &&  resultObj['ax25:totalElapsedTimeMillis']['$']) {
				var totalElapsedTimeMillis = resultObj['ax25:totalElapsedTimeMillis']['$'];
				if(!isNaN(totalElapsedTimeMillis))
					totalElapsedTimeMillis = totalElapsedTimeMillis/1000;

			}

			var totalTokens = 0;
			if(resultObj['ax25:totalTokens'] &&  resultObj['ax25:totalTokens']['$']) {
				var totalTokens = resultObj['ax25:totalTokens']['$'];
			}

			resultData.push({testName: testName, testDescription: testDescription, throughputTokensPerSecond: throughputTokensPerSecond, totalElapsedTimeMillis: totalElapsedTimeMillis, totalTokens:totalTokens});
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
	dataLoadFailure: function(result, request) {
		this.setRunTestButtonState(false);
		this.setChartState(true, true);
		this.environ.communicator.dataLoadFailure(result, request);
	},
	dataLoadSuccess: function(result, request) {
		// inspect the json response container to verify that the result was successful and no errors were present
		try {
			if (result && result.responseText) {
				var rObj = Ext.decode(result.responseText);
				if (this.environ.communicator.responseCheck2(rObj, request, this.requestType+'Response')) {
					// TODO: adapt response batch to grid loadable data
					var resultData = new Array();
					var resultObj = rObj['ns:'+this.requestType+'Response']['ns:return'];
					if(resultObj) {
						if(Ext.isArray(resultObj)) {
							for(var i = 0; i < resultObj.length; i++) {
								this.processResultObject(resultData, resultObj[i]);
							}
						} else {
							this.processResultObject(resultData, resultObj);
						}
					}
					// mark the test as complete
					var summaryGrid = this.getSummaryGrid();
					if(summaryGrid) {
						// if this is static content, slow down the update so it appears to take a little while
						var deferInterval = (request.params.testType=='serverSideApiTest'?6000:12000);
						if(this.environ.staticContent) {
							summaryGrid.updateTestStatus.defer(deferInterval, summaryGrid, [request.params.id, request.params.testType, 1, resultData]);
							if(request.params.testType == 'serverSideApiTest') {
								// update the status of the next test
								summaryGrid.updateTestStatus.defer(deferInterval, summaryGrid, [request.params.id,'webServerTest', -1, []]);
							}
						} else {
							summaryGrid.updateTestStatus(request.params.id, request.params.testType, 1, resultData);
							if(request.params.testType == 'serverSideApiTest') {
								// update the status of the next test
								summaryGrid.updateTestStatus(request.params.id, 'webServerTest', -1, resultData);
							}
						}
						if(request.params.testType == 'webServerTest') {
							// second test complete, so we can allow another test to be created
							if(this.environ.staticContent)
								this.setRunTestButtonState.defer(deferInterval, this, [false]);
							else
								this.setRunTestButtonState(false);
						}
						if(request.params.testType == 'serverSideApiTest') {
							this.runWebServerTest(request.params);
						}
					}
				}
			} else {
				this.setRunTestButtonState(false);
				var summaryGrid = this.getSummaryGrid();
				if(summaryGrid) {
					summaryGrid.updateTestStatus(request.params.id, request.params.testType, 0, []);
				}
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
			this.setRunTestButtonState(false);
			var summaryGrid = this.getSummaryGrid();
			if(summaryGrid) {
				summaryGrid.updateTestStatus(request.params.id, request.params.testType, 0, []);
			}
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
	}
});

// register xtype
Ext.reg('alvformquicktest', Ext.ux.alvand.form.QuickTestForm);

// end of file
