Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        this.addAGrid();

        //API Docs: https://help.rallydev.com/apps/2.1/doc/
    },
    updateClicked: function(){

    },
    addAGrid: function(){

      this.add({
         xtype: 'rallygrid',
         columnCfgs: [
             'FormattedID',
             'Name',
             'Owner'
         ],
         storeConfig: {
             model: 'userstory'
         }
     });
    }
});
