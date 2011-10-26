// create namespace
Ext.namespace('ext.ux.lc.grid');

/**
 * ext.ux.lc.grid.CreateToken Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class ext.ux.lc.grid.CreateToken
 * @extends Ext.grid.EditorGridPanel
 */
ext.ux.lc.grid.CreateToken = Ext.extend(Ext.grid.EditorGridPanel, {
    addText: '<span class="underline-shortcut">A</span>dd',
    autoExpandColumn: 'value',
    height: 250,
    // width: 320,
    clicksToEdit: 1,
	frame: true,
    addItem: function(){
        var tb = this.getTopToolbar();
        var firstItem = tb.items.items[0];
        if (firstItem) {
            firstItem.handler.call(firstItem.scope || firstItem, firstItem);
        }
    },
    deleteItem: function(){
        var tb = this.getTopToolbar();
        var firstItem = tb.items.items[1];
        if (firstItem) {
            firstItem.handler.call(firstItem.scope || firstItem, firstItem);
        }
    },
    initComponent: function(){
        this.tbar = [{
            text: this.addText,
            iconCls: 'x-icon-add',
            listeners: {
                "render": function(btn){
                    //alt-a shortcut support for adding a row
                    globalKeyMap.accessKey({
                        key: 'a',
                        alt: true
                    }, this.addItem, this);
                    //tab shortcut support for adding a row when tab occurs from last cell in a row
					// commented out because it messes up the tabbing of form fields.  we would need to know the grid is focused.
                    // globalKeyMap.accessKey({
                        // key: "\t",
                    // }, this.addItem, this);
                },
                scope: this
            },
            handler: function(){
                var grid = this.ownerCt.ownerCt;
                // access the Record constructor through the grid's store
                var Token = Ext.data.Record.create([{
                    name: 'value'
                },{
                    name: 'record_deleted'
                }]);
                
                var p = new Token({
                    value: ''
                });
                grid.stopEditing();
                // either insert to the top or add to the bottom.  chose to go with add to the bottom
                //                grid.store.insert(0, p);
                grid.store.add(p);
                grid.getView().refresh();
                grid.getSelectionModel().selectRow(grid.store.getCount() - 1);
                // highlight last row and focus on second column since first column is the delete row icon
                grid.startEditing(grid.store.getCount() - 1, 1);
            }
        }, {
            text: '<span class="underline-shortcut">D</span>elete',
            iconCls: 'x-icon-delete',
            listeners: {
                "render": function(btn){
                    //alt-a shortcut support for deleting a row
                    globalKeyMap.accessKey({
                        key: 'd',
                        alt: true
                    }, this.deleteItem, this);
                },
                scope: this
            },
            handler: function(){
                var grid = this.ownerCt.ownerCt;
                var record = grid.selModel.getSelected();
                if (record) {
					record.set('record_deleted',true);
                    grid.stopEditing();
                    grid.getStore().remove(record);
					grid.getView().refresh();
					// if there are any remaining rows, select the last row
					if(grid.store.getCount() > 0)
						grid.getSelectionModel().selectRow(grid.store.getCount() - 1);
                }
            }
        }];
        this.selModel = new ext.ux.lc.grid.DeletableRowSelectionModel();
        this.columns = [this.selModel, {
            id: 'value',
            header: "Value",
            width: 160,
            sortable: true,
            dataIndex: 'value',
            editor: {
                xtype: 'textfield',
                allowBlank: false
            }
        }, {
            hidden: true,
            xtype: 'booleancolumn',
            dataIndex: 'record_deleted'
        }];
        this.store = new Ext.data.Store({
            reader: new Ext.data.ArrayReader({}, [{
                name: 'value'
            },{
                name: 'record_deleted'
            }])
        });
        // call parent initComponent
        ext.ux.lc.grid.CreateToken.superclass.initComponent.call(this);
        
    }
});

// register xtype
Ext.reg('alvgridcreatetoken', ext.ux.lc.grid.CreateToken);

// end of file

