Ext.namespace('Ext.ux.alvand');
/**
 * WizardItinary Manager runs a list of wizardable traited classes and embeds them into a panel containing a next button.  It preceeds each with a
 * tooltip describing the next step.  The tooltip remains open pending click of an embedded button so tha the user can control the speed
 * of the overall wizard
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.WizardItinaryManager
 */
Ext.ux.alvand.WizardItinaryManager = function() {
	var wizards = {};
	var runningWizards = {};
	var tips = {};
	return {

		register: function(name, wizardItinary) {
			wizards[name] = wizardItinary;
		},
		get: function(name) {
			var wi = wizards[name];
			if(wi) {
				return wi;
			} else {
				Ext.Msg.show({
					title: 'Wizard Itinary Not Registered',
					msg: 'A Wizard Itinary named, ' + name +  ', has not been registered.',
					buttons: Ext.Msg.OK,
					animEl: 'elId',
					icon: Ext.MessageBox.ERROR
				});
			}
		},
		getTip: function(name, index) {
			return tips[name + '_' + index];
		},
		addTip: function(name, index, tip) {
			tips[name + '_' + index] = tip;
		},
		removeTip: function(name, index, tip) {
			var t = tips[name + '_' + index];
			if(t) {
				t.destroy();
				delete tips[name + '_' + index];
			}
		},
		start: function(name) {
			Ext.ux.alvand.WizardItinaryManager.next(name, 0);
		},
		next: function(name, index) {
			if(runningWizards[name]) {
				// if already started, then disregard
			} else if(Ext.ux.alvand.WizardItinaryManager.getTip(name, index)) {
				Ext.ux.alvand.WizardItinaryManager.getTip(name, index).show();
			} else {
				// kick off the wizard
				var wi = Ext.ux.alvand.WizardItinaryManager.get(name, index);
				var returns = {
					target : 'ux-taskbar-start'
				};
				if(wi && wi.length > index) {
					var uniqueId = MyDesktop.environ.communicator.guid();
					if(wi[index].attachConfig) {
						if(wi[index].attachConfig.shortcut) {
							returns.target =wi[index].attachConfig.shortcut;
						} else if(wi[index].attachConfig.desktopItem) {
							var base = MyDesktop;
							if(wi[index].attachConfig.subgroup) {
								// the module may have a subgroup.
								if(base.modules) {
									for(var y=0; y < base.modules.length; y++) {
										if(base.modules[y].launcher && base.modules[y].launcher.menu && base.modules[y].launcher.menu.items) {
											for(var x=0; x < base.modules[y].launcher.menu.items.length; x++) {
												if(base.modules[y].launcher.menu.items[x].code == wi[index].attachConfig.subgroup) {
													base.modules[y].createWindow(base.modules[y].launcher.menu.items[x], returns);
													break;
												}
											}
										}
									}
								}
							} else {
								MyDesktop[wi[index].attachConfig.desktopItem].prototype.createWindow(returns);
							}
						}
					}

					var ttConfig = {
						wizardName: name,
						wizardIndex: index,
						anchor: 'left',
						target: returns.target,
						items: [
						{
							xtype: 'label',
							text: wi[index].text
						},
						new Ext.Toolbar({
							items: [{
								wizardName: name,
								wizardIndex: index,
								windowId: returns.windowId,
								text: 'Cancel',
								handler: function(btn, event) {
									if(btn.wizardName) {
										var wi = Ext.ux.alvand.WizardItinaryManager.get(btn.wizardName);
										if(wi) {
											Ext.ux.alvand.WizardItinaryManager.removeTip(name, index);
										}
									}
								},
								scope: this
							},'->',{
								wizardName: name,
								wizardIndex: index,
								windowId: returns.windowId,
								text: 'Back',
								hidden: (index ==0),
								handler: function(btn, event) {
									if(btn.wizardName) {
										var wi = Ext.ux.alvand.WizardItinaryManager.get(btn.wizardName);
										if(wi) {
											if(btn.windowId) {
												var wn = MyDesktop.getDesktop().getWindow(btn.windowId);
												if(wn)
													wn.close();
												delete btn.windowId;
											}
											Ext.ux.alvand.WizardItinaryManager.removeTip(name, index);
											if(wi.length > btn.wizardIndex+1) {
												Ext.ux.alvand.WizardItinaryManager.next(name,btn.wizardIndex-1);
											}
										}
									}
								},
								scope: this
							},{
								wizardName: name,
								wizardIndex: index,
								windowId: returns.windowId,
								text: (index==wi.length-1?'Complete':(index==0?'Start':'Continue')),
								handler: function(btn, event) {
									if(btn.wizardName) {
										var wi = Ext.ux.alvand.WizardItinaryManager.get(btn.wizardName);
										if(wi) {
											if(btn.windowId) {
												var wn = MyDesktop.getDesktop().getWindow(btn.windowId);
												if(wn)
													wn.close();
												delete btn.windowId;
											}
											Ext.ux.alvand.WizardItinaryManager.removeTip(name, index);
											if(wi.length > btn.wizardIndex+1) {
												Ext.ux.alvand.WizardItinaryManager.next(name,btn.wizardIndex+1);
											}
										}
									}
								},
								scope: this
							}]
						})

						],
						title: 'Token Management Console Walk-through',
						autoHide: false,
						closable: true,
						draggable:true,
						listeners:{
							'hide': function(tooltip) {
								// fires when the x in the upper corner is clicked to close the wizard.  cancel remaining wizard steps
								if(tooltip.wizardName && tooltip.wizardIndex) {
									var wi = Ext.ux.alvand.WizardItinaryManager.get(tooltip.wizardName);
									if(wi) {
										Ext.ux.alvand.WizardItinaryManager.removeTip(tooltip.wizardName, tooltip.wizardIndex);
									}
								}
							}
						}
					};
					var tt = new Ext.ToolTip(ttConfig);
					Ext.ux.alvand.WizardItinaryManager.addTip(name, index, tt);

					tt.show.defer((Ext.isIE?500:300), tt);
				}
			}
		},
		stop: function(name) {
			var wi = Ext.ux.alvand.WizardItinaryManager.get(name);
		}
	};
}();
Ext.ux.alvand.WizardItinaryManager.register(
'overview',
[{
	text: 'Welcome to the Safenet Tokenization Management Console.  This console provides comprehensive facilities to manage your DataSecure data encryption and control solution.  This wizard will walk you through the features of this console.  Before we begin, a note on the general appearance and operation of this console.  This is a browser application, even though it may appear like a ' +(fisheye?'Mac':'Windows')+ ' OS desktop.  It operates in the major browsers, IE, Firefox, Safari, and Chrome.  We chose this user interface style for two reasons.  First, because it functions much like Windows OS, there is a broad familiarity with this general opererating style.  Secondly, this being a management console application, we are able to provide the user with "multi-tasking" capability by allowing the view of multiple windows simultaneously.  Lets now proceed with the walk-thru and setup.  When you are ready to begin, please click the Start button.',
	attachConfig:{
		//		shortcut: 'wizard-win-shortcut'
		shortcut: (fisheye?'fisheye-menu-0':'wizard-win-shortcut')
	}
},{
	text: 'Administration of your tokenization tables is easy with the Tokenization Management Console.  You can configure new tokenization tables and monitor performance statistics such as the number of tokens within each table, and the average query time associated with each table.  Also, you can efficiently create, redeem and delete batches of tokens.  Lets review each of these Token Management features now.  When you are ready to begin, please click the Continue button.',
	attachConfig:{
		//		shortcut: 'wizard-win-shortcut'
		shortcut: (fisheye?'fisheye-menu-0':'wizard-win-shortcut')
	}
},{
	text: 'In order to administer tokens, at least a single database login is required.  Your authentication credentials to this site form the first database login.  You can add additional database logins as needed.  Lets take a look at the database login screen.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		//		shortcut: 'dblogins-shortcut'
		shortcut: (fisheye?'fisheye-menu-2':'dblogins-shortcut')
	}
},{
	text: 'Notice that your authenticated user has been added to this list.  This allows you to manage tokenization tables that this user is authorized to manage.  You can add additional database logins by clicking the add button, providing a username and password and then clicking the authenticate button.  Success or failure of the authentication process is visually displayed by the Logged In icon (a green check indicates success and a warning sign indicates failure).  Hovering over the success or failure icon will provide further details of the authentication attempt.   When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'ConfigurationModule',
		subgroup: 'dblogins'
	}
},{
	text: 'In order to administer tokens, at least a single DataSecure appliance login is required.  Lets take a look at the DataSecure login screen.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		//		shortcut: 'dslogins-shortcut'
		shortcut: (fisheye?'fisheye-menu-3':'dslogins-shortcut')
	}
},{
	text: 'These logins provide the necessary credentials to connect to the DataSecure appliance.  Go ahead and add in a username and password that has authorization to connect to the DataSecure appliance.  When you have completed adding a username and password, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'ConfigurationModule',
		subgroup: 'dslogins'
	}
},{
	text: 'The "Tokenized Tables" form shows all of the tables that have been configured for tokenization support.  You can open multiple copies of this form by clicking on the desktop shortcut, or accessing the screen under the Start button.  This way you can manage tokenized tables for different database users simultaneously.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		//		shortcut: 'tokentables-shortcut'
		shortcut: (fisheye?'fisheye-menu-4':'tokentables-shortcut')
	}
},{
	text: 'This form displays the tokenization tables that each of your database login users have authorization to administer.  You can choose from the list of database users at the top of the form and the list of tokenization tables that user is authorized to administer will populate.  Notice that this table contains performance metrics indicating average query time and rowcount, in addition to the specifics regarding each configured tokenization table.  You can add a new tokenization table by clicking the Add button, and you can refresh the contents of the table list by clicking the Refresh button.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'ConfigurationModule',
		subgroup: 'tokentables'
	}
},{
	text: 'The create token feature lets you add new tokens for specific values in a designated tokenization table.  Lets review the create token screen.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		//		shortcut: 'createtoken-shortcut'
		shortcut: (fisheye?'fisheye-menu-5':'createtoken-shortcut')
	}
},{
	text: 'To create a token, choose a database user, which will give you a filtered list of tokenization tables that user has authorization to administer.  Choose a DataSecure user for appliance access, and a mask type.  You can then add a series of values to be tokenized.  After adding your list of values, click the create button.  You are presented with a results list showing the value and token pair, and the execution time to perform the tokenization.  Furthermore, you are shown a status indicating success or failure for this operation.  Hovering over that success or failure icon will yield a detailed message pertaining to the create token operation.  Before you close the results form, highlight one of the Token values for a successully created token.  Copy it into your clipboard (ctrl-V).  We will now attempt to redeem the value for that token.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'TokenManagementModule',
		subgroup: 'createtoken'
	}
},{
	text: 'The redeem token feature lets you redeem values for specific tokens in a designated tokenization table.  Lets review the redeem token screen.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		//		shortcut: 'redeemtoken-shortcut'
		shortcut: (fisheye?'fisheye-menu-6':'redeemtoken-shortcut')
	}
},{
	text: 'To redeem a token, choose a database user, which will give you a filtered list of tokenization tables that user has authorization to administer.  Choose a DataSecure user for appliance access, and a mask type.  You can then add a series of tokens to be redeemed.  Paste in the token that we copied to the clipboard on the create token result form, then click the redeem button.  Add another token to the list, but this time add in a value that has not been tokenized.  We will be able to see the failure message upon attempt to redeem a token that does not exist.  After clicking the Redeem button, you are presented with a results list showing the value and token pair, and the execution time to perform the redemption.  Furthermore, you are shown a status indicating success or failure for this operation.  Hovering over that success or failure icon will yield a detailed message pertaining to the redeem token operation.  Before you close the results form, highlight one of the Token values for a successully redeemed token.  Copy it into your clipboard (ctrl-V).  We will finally attempt to delete the token.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'TokenManagementModule',
		subgroup: 'redeemtoken'
	}
},{
	text: 'The delete token feature lets you delete tokens for specific token list or value list, in a designated tokenization table.  Lets review the delete token screen.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		//		shortcut: 'deletetoken-shortcut'
		shortcut: (fisheye?'fisheye-menu-7':'deletetoken-shortcut')
	}
},{
	text: 'To delete a token, choose a database user, which will give you a filtered list of tokenization tables that user has authorization to administer.  Choose a DataSecure user for appliance access, and a mask type.  Now, choose the option of either indicating a token list or a value list, with which to delete tokens with.  You can then add a series of values or tokens to result in deletion of tokens.  After adding your list of values or tokens, click the Delete button.  You are presented with a results list showing the value and token pair, and the execution time to perform the deletion.  Furthermore, you are shown a status indicating success or failure for this operation.  Hovering over that success or failure icon will yield a detailed message pertaining to the delete token operation.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'TokenManagementModule',
		subgroup: 'deletetoken'
	}
},{
	text: 'The Token Management console provides a facility to monitor logs within your DataSecure environment.  Lets take a look at the Log Viewer Screen.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		//		shortcut: 'log-win-shortcut'
		shortcut: (fisheye?'fisheye-menu-1':'log-win-shortcut')
	}
},{
	text: 'The Log Viewer allows you to choose a log source, such as the Web Server, Database Server or DataSecure Server.  You can also configure the refresh interval.  This indicates how often the log viewer will poll the server for new log messages.  Furthermore, you can specify the maximum number of new log messages that will be returned to the log viewer screen per refresh.  This is done so to keep your browser responding quickly.  The shorter the response, the less network delay will occur.  Play with these settings depending on the capacity of your environment.  Lastly, you can choose to filter based on log message severity.  For instance, you may wish to only monitor for FATAL log messages.  Much like the Tokenized tables form, you can open multiple log viewers simultaneously.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'LogWindow'
	}
},{
	text: 'This console provides the facility to test the performance of your DataSecure environment.  This information may be useful in identifying problems with the efficient operation of your environment.  Lets run a performance test.  When you are ready to proceed, please click the "Continue" button.'
},{
	text: 'To run a Performance QuickTest, enter a database user that you have configured, along with a tokenization table, DataSecure appliance user, and mask type.  You can now click the Run Test button.  This test will take approximately 1 minute to run.  Once the test has completed you will be presented with a chart indicating the throughput and elapsed time results from a series of token management operations.  Hovering over the chart data will reveal detailed information regarding the data points.  For reference, the Performance QuickTest is accessable by clicking on the Start Button in the lower left corner of the desktop.  Choose the Performance Menu Group and it will reveal the QuickTest.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'PerformanceModule',
		subgroup: 'perfquicktest'
	}
},{
	text: 'If you have further questions regarding particular features of this console, you can refer to the help library.  Lets take a look at the help library form.  When you are ready to proceed, please click the "Continue" button.'
},{
	text: 'The Help Library contains help pages for each feature within the Token Management Console.  For reference, the Help Library is accessable by clicking on the Start Button in the lower left corner of the desktop.  Choose the Help Library menu option.  When you are ready to proceed, please click the "Continue" button.',
	attachConfig:{
		desktopItem: 'HelpWindow'
	}
},{
	text: 'This completes the review of all of the features of the Safenet Tokenization Management Console.  We appreciate you using the Safenet Tokenization Management Console and look forward to any feedback that you may have so that we can make it more and more useful to you.'
}]
);

