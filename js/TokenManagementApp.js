// create namespace
Ext.namespace('ext.ux.lc');

/**
 * ext.ux.lc.form.LoginComboBox Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: ext.ux.lc.form.LoginComboBox.js
 *
 * @class ext.ux.lc.form.LoginComboBox
 * @extends Ext.form.ComboBox
 */
ext.ux.lc.TokenManagementApp = Ext.extend(Ext.app.App, {
	requestType:'getTokenTableList',
	id: 'tokenManagementApp',
	staticResponseFile: 'tokenizedtables',
	loadAppDomain : function() {
		// construct a store for the db logins and hsm logins

		this.naeUserstore = new Ext.data.Store({
			reader: new Ext.data.ArrayReader({idProperty: 'username'}, [{
				name: 'username'
			}, {
				name: 'password'
			}, {
				name: 'loggedin'
			}])
		});

		this.tokentablestore = ext.ux.lc.UserTokenTableStores.createStore();

		this.dbUserStore = new Ext.data.Store({
			reader: new Ext.data.JsonReader({
				root: 'data',
				idProperty: 'username',
				storeId: this.id + '_dbStore'
			}, [{
				name: 'username'
			}, {
				name: 'password'
			}, {
				name: 'loggedin'
			}]),
			listeners:{
				'load': function(store, records, options) {
					// when the authenticated user is added to the store, obtain that user's token tables.
					if(records) {
						for(var i = 0; i < records.length; i++) {
							ext.ux.lc.UserTokenTableStores.register(records[i].get('username'), records[i].get('password'));
							//this.loadTokenTables({dbUser: records[i].get('username'), dbPassword: records[i].get('password')});
						}
					}
				},
				scope: this
			}
		});

		//obtain the authenticated User and load it into the dblogins datastore
		var loginUsername = Ext.util.Cookies.get('loginUsername');
		var loginPassword = Ext.util.Cookies.get('loginPassword');
		Ext.util.Cookies.clear('loginPassword');
		if(loginUsername && loginPassword) {
			this.dbLoginStore().loadData({
				data: [{username: loginUsername, password: loginPassword, loggedin: 1}]
			});
			// store the current username in environ
			this.environ.currentUser = loginUsername;
			this.environ.uiStyle = Ext.state.Manager.get(this.environ.currentUser + '_alvand_uistyle', 'windows');
		}

	},
	dbLoginStore: function() {
		return this.dbUserStore;
	},
	hsmLoginStore: function() {
		return this.naeUserstore;
	},
	tokenTableStore: function() {
		return this.tokentablestore;
	},
	/**
 	* Activate the link to load the login form.
 	* @param {String} loginType the type of login screen to load. This may be:
 	* @param {Boolean} referral bool to indicate if this request to route to another form is a referral that should allow for visual return button when finished
 	*
 	String : A value of DB or HSM
 	*
 	*/
	displayLoginForm: function(loginType, referral) {
		// TODO generic walker to locate needed
		var module = MyDesktop.modules[0].launcher.menu.items[0];
		//MyDesktop.ConfigurationModule.createWindow(module);
		//debugger;
		MyDesktop.modules[0].createWindow(MyDesktop.modules[0].launcher.menu.items[(loginType=='HSM'?1:0)]);
	},
	displayTokenTableForm: function() {
		// TODO generic walker to locate needed
		var module = MyDesktop.modules[0].launcher.menu.items[0];
		//MyDesktop.ConfigurationModule.createWindow(module);
		//debugger;
		MyDesktop.modules[0].createWindow(MyDesktop.modules[0].launcher.menu.items[2]);
	}
});

// end of file
