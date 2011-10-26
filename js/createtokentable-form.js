// create namespace
Ext.namespace('ext.ux.lc.form');

/**
 * ext.ux.lc.form.CreateTokenTable Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.form.CreateTokenTable
 * @extends Ext.form.FormPanel
 */
ext.ux.lc.form.CreateTokenTable = Ext.extend(ext.ux.lc.form.BaseToken, {
	serviceProvider: 'SafenetTokenManagement',
	allowClearForm: false,
	// IE wraps this title if not in a div with nowrap
	//title: '<div style="white-space:nowrap;">Create a Token</div>',
	iconCls: 'x-icon-tickets',
	staticResponseFile: 'savetokenizedtables',
	getItemDefinitionArray: function() {
		return [ this.dbUserField, this.tableNameTextField, this.naeUserField, this.hmacKeyNameField, this.encryptionKeyNameField, this.isSequentialField, this.dataLengthField];
	},
	initFieldDefinitions: function() {
		this.tableNameTextField = {
			fieldLabel: 'Table Name',
			id: this.id + '_tableName',
			name: 'tableName',
			tabIndex: 2,
			environ: this.environ,
			allowBlank: false
		};
		this.hmacKeyNameField = {
			fieldLabel: 'HMAC Key',
			name: 'hmacKeyName',
			tabIndex: 4,
			allowBlank: false
		};
		this.encryptionKeyNameField = {
			fieldLabel: 'Encryption Key',
			name: 'encryptionKeyName',
			tabIndex: 5,
			allowBlank: false
		};
		this.isSequentialField = {
			fieldLabel: 'Sequential?',
			name: 'isSequential',
			tabIndex: 6,
			xtype: 'checkbox',
			listeners:{
				'check': function(checkbox, checked) {
					var formPanel = this.ownerCt.ownerCt;
					// obtain the data length field and hide it if sequential is unchecked.
					var dataLengthFld = formPanel.getForm().findField(formPanel.id + '_dataLengthFld');
					if(dataLengthFld) {
						if(checked) {
							dataLengthFld.show();
						} else {
							dataLengthFld.hide();
						}
					}
				}
			}
		};
		this.dataLengthField = {
			id: this.id + '_dataLengthFld',
			tabIndex: 7,
			fieldLabel: 'Data Length',
			name: 'dataLength',
			hidden: true,
			xtype: 'numberfield',
			decimalPrecision: 0,
			allowDecimals: false,
			allowNegative: false,
			minValue: 1,
			maxValue: 32
		};
		// call parent initComponent
		ext.ux.lc.form.CreateTokenTable.superclass.initFieldDefinitions.call(this);

	},
	buttons: [{
		text: 'Save',
		handler: function() {
			var formPanel = this.ownerCt.ownerCt;
			if(formPanel) {
				var frm = formPanel.getForm();
				var formVals = frm.getValues();
				if(formVals.dbUser)
					formVals.dbPassword = formPanel.getDBLoginValue(formVals.dbUser);
				if(formVals.naeUser)
					formVals.naePassword = formPanel.getHSMLoginValue(formVals.naeUser);

				if(formVals.isSequential) {
					formVals.isSequential = (formVals.isSequential=='on'?true:false);
				} else
					formVals.isSequential = false;

				if(!formVals.dataLength || isNaN(formVals.dataLength))
					formVals.dataLength = 0;

				// we will use the render event to initiate data load of the tokenized tables as well
				// as partial information (usernames) to populate the dbUser table with
				Ext.Ajax.request({
					url: (formPanel.environ.staticContent?formPanel.environ.staticUrl + formPanel.environ.communicator.getStaticResultFile(formPanel.staticResponseFile, formPanel.environ.validContent):formPanel.environ.rootUrl + formPanel.serviceProvider + '/createTokenVaultTable?response=application/json/badgerfish'),
					success: formPanel.addTableSuccess,
					failure: formPanel.environ.communicator.dataLoadFailure,
					params: formVals,
					//params: Ext.encode(formVals),
					method: 'GET',
					scope: formPanel
				});

			}
		}
	},{
		text: 'Cancel',
		handler: function() {
			var formPanel = this.ownerCt.ownerCt;
			//reset the form
			formPanel.getForm().reset();
			// hide the window
			formPanel.ownerCt.hide();
		}
	}],
	processResultObject: function(resultData, resultObj, request) {
		if(resultObj['ax23:status'] && resultObj['ax23:status']['ax23:statusCode'] && resultObj['ax23:status']['ax23:statusCode']['$']) {
			var statusCode = resultObj['ax23:status']['ax23:statusCode']['$'];
			if(statusCode == 'SUCCESS') {
				// check to see if we have the submitted value
				var tableKeyArray = resultObj['ax23:tableKeyArray'];
				if(tableKeyArray) {
					var tableKeyRecord = {dbUser: request.params.dbUser};

					if(tableKeyArray['ax23:tableName'] && tableKeyArray['ax23:tableName']['$']) {
						tableKeyRecord.tableName = tableKeyArray['ax23:tableName']['$'];
					}
					if(tableKeyArray['ax23:hmacKey'] && tableKeyArray['ax23:hmacKey']['$']) {
						tableKeyRecord.hmacKey = tableKeyArray['ax23:hmacKey']['$'];
					}
					if(tableKeyArray['ax23:encryptionKey'] && tableKeyArray['ax23:encryptionKey']['$']) {
						tableKeyRecord.encryptionKey = tableKeyArray['ax23:encryptionKey']['$'];
					}
					if(tableKeyArray['ax23:queryDurationMillis'] && tableKeyArray['ax23:queryDurationMillis']['$']) {
						tableKeyRecord.queryDurationMillis = tableKeyArray['ax23:queryDurationMillis']['$'];
					}
					if(tableKeyArray['ax23:recordCount'] && tableKeyArray['ax23:recordCount']['$']) {
						tableKeyRecord.recordCount = tableKeyArray['ax23:recordCount']['$'];
					}
					resultData.push(tableKeyRecord);
				}
			} else {
				var statusDescription = 'An error occurred on the server, but no message was provided.  Please consult a technical representative.';
				if(resultObj['ax23:status'] && resultObj['ax23:status']['ax23:statusDescription'] && resultObj['ax23:status']['ax23:statusDescription']['$']) {
					var statusDescription = resultObj['ax23:status']['ax23:statusDescription']['$'];
				}
				// result was retrieved successfully but the server reported failure
				Ext.Msg.show({
					title: 'An Error has occurred.',
					msg: statusDescription,
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.ERROR
				});
			}
		} else {
			// result was retrieved successfully but the server reported failure
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
	addTableSuccess: function(result, request) {
		try {
			var success = true;
			var rObj = this.environ.communicator.getResponseObject(result);
			if (this.environ.communicator.responseCheck2(rObj, request, 'createTokenVaultTableResponse')) {
				//TODO: even though we get response data, if successful, simply save to grid
				var resultObj = rObj['ns:'+'createTokenVaultTable'+'Response']['ns:return'];

				var resultData = new Array();
				this.processResultObject(resultData, resultObj, request);
				if(resultData.length > 0) {
					var grid = Ext.getCmp(this.gridId);
					if(grid) {
						grid.addTokenTableRecord(resultData[0]);
					}
					//reset the form
					this.getForm().reset();
					// hide the window
					this.ownerCt.hide();
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
	}
});

// register xtype
Ext.reg('alvformcreatetokentable', ext.ux.lc.form.CreateTokenTable);

// end of file
