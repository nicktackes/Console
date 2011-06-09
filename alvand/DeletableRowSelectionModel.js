Ext.ns('Ext.ux.alvand.grid');

Ext.ux.alvand.grid.DeletableRowSelectionModel = Ext.extend(Ext.grid.RowSelectionModel, {

    width: 30,
    
    sortable: false,
    dataIndex: 0,
    
    menuDisabled: true,
    fixed: true,
    id: 'deleter',
    
    initEvents: function(){
        Ext.ux.alvand.grid.DeletableRowSelectionModel.superclass.initEvents.call(this);
        this.grid.on('cellclick', function(grid, rowIndex, columnIndex, e){
            if(columnIndex==grid.getColumnModel().getIndexById('deleter')) {
                var record = grid.getStore().getAt(rowIndex);
				if(record){
					record.set('record_deleted',true);
					grid.getStore().remove(record);
					grid.getView().refresh();
				}
           }
        });
    },
    
    renderer: function(v, p, record, rowIndex){
        return '<div class="row-remove" style="width: 15px; height: 16px;"></div>';
    }
});
