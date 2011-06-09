// create namespace
Ext.namespace('Ext.ux.alvand.tree');


/**
 * Ext.ux.alvand.HelpPanel Extension Class for Ext 3.3 Library
 *
 * @author  Nick Tackes
 *
 * @class Ext.ux.alvand.HelpPanel
 * @extends Ext.Panel
 */
Ext.ux.alvand.HelpPanel = Ext.extend(Ext.Panel, {
   // title: 'Help',
    layout: 'border',
    region: 'east',
    split: true,
    width: 400,
    collapsible: true,
    collapsed: true,
    margins: '3 0 3 3',
    cmargins: '3 3 3 3',
    initComponent: function(){
        var helpDetails = new Ext.Panel({
            region: 'center',
            layout: 'card',
			layoutConfig:{
				layoutOnCardChange: true,
				deferredRender: true
			},
            activeItem: 0,
            title: 'Topic Details',
            id: this.id + '_helpDetailsPanel',
            collapsible: false,
            split: true,
            margins: '0 2 2 2',
            cmargins: '2 2 2 2',
            items: [{
                xtype: 'alviframe',
                url: '/splash/tm/index.html'
            }]
        });
        
        this.items = [];
        this.items.push({
            xtype: 'treepanel',
			title: 'Topics',
			height: 200,
            collapsible: true,
            helpDetailsPanelId: helpDetails.id,
            id: this.id + '_helpTreePanel',
            region: 'north',
            margins: '2 2 0 2',
            autoScroll: true,
            rootVisible: false,
            root: new Ext.tree.AsyncTreeNode(),
            // Our custom TreeLoader:
            loader: new Ext.tree.TreeLoader({
                helpDetailsPanelId: helpDetails.id,
                dataUrl: this.environ.staticUrl + 'help_topics.txt',
                createNode: function(attr){
                    //  add a card to the details panel
                    var detailsPanel = Ext.getCmp(this.helpDetailsPanelId);
                    if (detailsPanel) {
                        detailsPanel.add({
                            id: this.helpDetailsPanelId + '_' + attr.id,
                            xtype: 'alviframe',
                            url: attr.url
                        
                        });
                    }
                    return Ext.tree.TreeLoader.prototype.createNode.call(this, attr);
                },
                listeners: {
                    'load': function(loader, node, response){
                        var tree = node.ownerTree;
                        if (tree) {
                            var selModel = tree.getSelectionModel();
                            if (selModel && tree.root && tree.root.childNodes && tree.root.childNodes.length > 0) {
                                if (!selModel.getSelectedNode()) 
                                    selModel.select(tree.root.childNodes[0]);
                            }
                        }
                    },
                    'loadexception': function(loader, node, response){
                        //debugger;
                    }
                    
                }
            }),
            
            listeners: {
                'render': function(tp){
                    tp.getSelectionModel().on('selectionchange', function(selectionModel, node){
                        var detailsPanel = Ext.getCmp(node.ownerTree.helpDetailsPanelId);
                        if (detailsPanel) {
                            detailsPanel.getLayout().setActiveItem(node.ownerTree.helpDetailsPanelId + '_' + node.id);
                        }
                    })
                }
            }
        });
        this.items.push(helpDetails);
        // call parent initComponent
        Ext.ux.alvand.HelpPanel.superclass.initComponent.call(this);
        
    }
});

// register xtype
Ext.reg('alvhelp', Ext.ux.alvand.HelpPanel);

// end of file
