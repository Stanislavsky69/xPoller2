xPoller2.grid.Options = function(config) {
    config = config || {};
    this.sm = new Ext.grid.CheckboxSelectionModel();
    Ext.applyIf(config,{
        id: 'xpoller2-grid-option'
		,url: xPoller2.config.connector_url
		,baseParams: {
			action: 'mgr/question/option/getlist'
            ,qid: config.record.id
		}
		,fields: ['id','option','right']
		,autoHeight: true
		,paging: true
		,remoteSort: true
        ,sm: this.sm
		,columns: [
			{header: _('id'),dataIndex: 'id',width: 70}
			,{header: _('xpoller2_option'),dataIndex: 'option',width: 350}
			//,{header: _('xpoller2_option_right'),dataIndex: 'right',width: 130,renderer: this.renderBoolean}
		]
		,tbar: [{
			text: _('xpoller2_option_create')
			,handler: this.createItem
			,scope: this
		}]
		,listeners: {
			rowDblClick: function(grid, rowIndex, e) {
				var row = grid.store.getAt(rowIndex);
				this.updateItem(grid, e, row);
			}
		}
	});
	xPoller2.grid.Options.superclass.constructor.call(this,config);
};
Ext.extend(xPoller2.grid.Options,MODx.grid.Grid,{
	windows: {}
    
    ,renderBoolean: function(val,cell,row) {
    	return val == '' || val == 0
			? '<span style="color:red">' + _('no') + '<span>'
			: '<span style="color:green">' + _('yes') + '<span>';
	}

	,renderImage: function(val,cell,row) {
		return val != ''
			? '<img src="' + val + '" alt="" height="50" />'
			: '';
	}
    
	,getMenu: function() {
        var cs = this.getSelectedAsList();
        var m = [];
        if (cs.split(',').length > 1) {
            m.push({
    			text: _('xpoller2_options_remove')
    			,handler: this.removeSelected
    		});
        } else {
    		m.push({
    			text: _('xpoller2_option_update')
    			,handler: this.updateItem
    		});
    		m.push('-');
    		m.push({
    			text: _('xpoller2_option_remove')
    			,handler: this.removeItem
    		});
        }
		this.addContextMenuItem(m);
	}
	
	,createItem: function(btn,e) {
		this.windows.createItem = MODx.load({
			xtype: 'xpoller2-window-option-create'
            ,qid: this.config.record.id
			,listeners: {
				'success': {fn:function() { this.refresh(); },scope:this}
			}
		});
		this.windows.createItem.fp.getForm().reset();
		this.windows.createItem.show(e.target);
	}

	,updateItem: function(btn,e,row) {
		if (typeof(row) != 'undefined') {this.menu.record = row.data;}
		var id = this.menu.record.id;

		MODx.Ajax.request({
			url: xPoller2.config.connector_url
			,params: {
				action: 'mgr/question/option/get'
				,id: id
			}
			,listeners: {
				success: {fn:function(r) {
					this.windows.updateItem = MODx.load({
						xtype: 'xpoller2-window-option-update'
						,record: r
						,listeners: {
							'success': {fn:function() { this.refresh(); },scope:this}
						}
					});
					this.windows.updateItem.fp.getForm().reset();
					this.windows.updateItem.fp.getForm().setValues(r.object);
					this.windows.updateItem.show(e.target);
				},scope:this}
			}
		});
	}

	,removeItem: function(btn,e) {
		if (!this.menu.record) return false;
		
		MODx.msg.confirm({
			title: _('xpoller2_option_remove')
			,text: _('xpoller2_option_remove_confirm')
			,url: this.config.url
			,params: {
				action: 'mgr/question/option/remove'
				,id: this.menu.record.id
			}
			,listeners: {
				'success': {fn:function(r) { this.refresh(); },scope:this}
			}
		});
	}

    ,getSelectedAsList: function() {
        var sels = this.getSelectionModel().getSelections();
        if (sels.length <= 0) return false;

        var cs = '';
        for (var i=0;i<sels.length;i++) {
            cs += ','+sels[i].data.id;
        }
        cs = cs.substr(1);
        return cs;
    }

    ,removeSelected: function(act,btn,e) {
        var cs = this.getSelectedAsList();
        if (cs === false) return false;

        MODx.msg.confirm({
			title: _('xpoller2_options_remove')
			,text: _('xpoller2_options_remove_confirm')
			,url: this.config.url
			,params: {
                action: 'mgr/question/options/remove'
                ,items: cs
            }
            ,listeners: {
                'success': {fn:function(r) {
                    this.getSelectionModel().clearSelections(true);
                    this.refresh();
                       var t = Ext.getCmp('modx-resource-tree');
                       if (t) { t.refresh(); }
                },scope:this}
            }
        });
        return true;
    }
});
Ext.reg('xpoller2-grid-options',xPoller2.grid.Options);



xPoller2.window.CreateItem = function(config) {
	config = config || {};
	this.ident = config.ident || 'mecitem'+Ext.id();
	Ext.applyIf(config,{
		title: _('xpoller2_option_create')
		,id: this.ident
		,height: 200
		,width: 475
		,url: xPoller2.config.connector_url
        ,baseParams: {
            action: 'mgr/question/option/create'
            ,qid: config.qid
        }
		,fields: [{
            	layout:'column'
        		,border: false
        		,anchor: '100%'
        		,items: [{
        			columnWidth: 1
        			,layout: 'form'
        			,defaults: { msgTarget: 'under' }
        			,border:false
        			,items: [
        				{xtype: 'textfield',fieldLabel: _('xpoller2_option'),name: 'option',id: 'xpoller2-'+this.ident+'-option',anchor: '99%'}
        			]
        		/*},{
        			columnWidth: .3
        			,layout: 'form'
        			,defaults: { msgTarget: 'under' }
        			,border:false
        			,items: [
        				{xtype: 'combo-boolean',fieldLabel: _('xpoller2_option_right'),name: 'right',hiddenName: 'right',id: 'xpoller2-'+this.ident+'-right',anchor: '99%'}
        			]*/
        		}]
        	}]
		,keys: [{key: Ext.EventObject.ENTER,shift: true,fn: function() {this.submit() },scope: this}]
	});
	xPoller2.window.CreateItem.superclass.constructor.call(this,config);
};
Ext.extend(xPoller2.window.CreateItem,MODx.Window);
Ext.reg('xpoller2-window-option-create',xPoller2.window.CreateItem);


xPoller2.window.UpdateItem = function(config) {
	config = config || {};
	this.ident = config.ident || 'meuitem'+Ext.id();
	Ext.applyIf(config,{
		title: _('xpoller2_option_update')
		,id: this.ident
		,height: 200
		,width: 475
		,url: xPoller2.config.connector_url
        ,action: 'mgr/question/option/update'
		,fields: [
			{xtype: 'hidden',name: 'id',id: 'xpoller2-'+this.ident+'-id'}
			,{
                layout:'column'
        		,border: false
        		,anchor: '100%'
        		,items: [{
        			columnWidth: 1
        			,layout: 'form'
        			,defaults: { msgTarget: 'under' }
        			,border:false
        			,items: [
        				{xtype: 'textfield',fieldLabel: _('xpoller2_option'),name: 'option',id: 'xpoller2-'+this.ident+'-option',anchor: '99%'}
        			]
        		/*},{
        			columnWidth: .3
        			,layout: 'form'
        			,defaults: { msgTarget: 'under' }
        			,border:false
        			,items: [
        				{xtype: 'combo-boolean',fieldLabel: _('xpoller2_option_right'),name: 'right',hiddenName: 'right',id: 'xpoller2-'+this.ident+'-right',anchor: '99%'}
        			]*/
        		}]
        	}
		]
		,keys: [{key: Ext.EventObject.ENTER,shift: true,fn: function() {this.submit() },scope: this}]
	});
	xPoller2.window.UpdateItem.superclass.constructor.call(this,config);
};
Ext.extend(xPoller2.window.UpdateItem,MODx.Window);
Ext.reg('xpoller2-window-option-update',xPoller2.window.UpdateItem);