// create namespace
Ext.namespace('Ext.ux.alvand.form');

/**
 * Ext.ux.alvand.form.LoginComboBox Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 * @version $Id: Ext.ux.alvand.form.LoginComboBox.js
 *
 * @class Ext.ux.alvand.form.LoginComboBox
 * @extends Ext.form.ComboBox
 */
Ext.ux.alvand.form.LoginComboBox = Ext.extend(Ext.form.ComboBox, {
	requireAuthentication: true,
	displayField: 'username',
	typeAhead: true,
	mode: 'local',
	triggerAction: 'all',
	emptyText: 'Select a login...',
	selectOnFocus: true,
	forceSelection: true,
	listeners:{
		'afterrender': function(combo) {
			// load in the value if there is only one.
			if(combo.store && combo.store.getCount() == 1) {
				var rec = combo.store.getAt(0);
				if(rec) {
					combo.fireEvent.defer(100, this, ['change', combo, rec.get(combo.store.reader.meta.idProperty), '']);
					combo.setValue(rec.get(combo.store.reader.meta.idProperty));
				}
			}
		},
		'beforeselect': function(combo, record, index) {
			if(combo.requireAuthentication) {
				// if the selected user is not logged in, then fail the selection
				if(record.get('loggedin')!=1) {
					Ext.Msg.show({
						title: 'Selected User is not authenticated.',
						msg: 'The user you selected is not authenticated.  Please do so on the Database Logins Form.',
						buttons: Ext.Msg.OK,
						animEl: 'elId',
						icon: Ext.MessageBox.ERROR
					});
					return false;
				}
			}
		}
	},
	initComponent: function() {
		// call parent initComponent
		Ext.ux.alvand.form.LoginComboBox.superclass.initComponent.call(this);
	},
	onTriggerClick: function(e) {
		// if the store is empty, then raise a messagebox allowing them to enter a login
		if (this.store.getCount() == 0) {
			Ext.Msg.show({
				title: this.loginType + ' Login Registration Needed',
				msg: 'There are no ' + this.loginType + ' logins registered for this token management activity. Would you like to register a login?',
				buttons: Ext.Msg.YESNO,
				fn: function(sResp) {
					if (sResp == "yes") {
						// TODO: in order to support both UI strategies, we will explicitly
						// look for MyDesktop which is global in the desktop metaphor, otherwise
						// we will find the navigator.  todo: enable the desktop to function as the navigator.
						var nav = (MyDesktop?MyDesktop:Ext.getCmp(this.navigatorId));
						if(nav) {
							// indicate it is a referral (the true bool) so that history can be popped and user returned to original screen
							// when they are ready
							nav.displayLoginForm(this.loginType, true);
						}
					}
				},
				scope: this,
				animEl: 'elId',
				icon: Ext.MessageBox.QUESTION
			});
		} else
			Ext.ux.alvand.form.LoginComboBox.superclass.onTriggerClick.call(this,e);
	}
});

// register xtype
Ext.reg('alvlogincombo', Ext.ux.alvand.form.LoginComboBox);

// end of file
