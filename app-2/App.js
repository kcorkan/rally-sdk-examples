Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
        var myContainer = this.add({
           xtype: "container",
           //html: "this is my new app",
           margin: 25,
           padding: 10,
           border: 2,
           style: {
              borderColor: "red",
              borderStyle: 'solid'
           },
           layout: 'hbox'
        });
        //API Docs: https://help.rallydev.com/apps/2.1/doc/

        myContainer.add({
           xtype: 'rallyiterationcombobox',
           margin: 10,
           itemId: 'cbIteration'
        });

        myContainer.add({
           xtype: 'rallybutton',
           text: 'Update Me',
           margin: 10,
           listeners: {
             click: this.onButtonClicked,
             scope: this
           }
        });

        console.log('project context', this.getContext().getProject());
        console.log('user context', this.getContext().getUser());

        this.add({
          xtype: 'rallygrid',
          columnCfgs: [
            'FormattedID',
            'Name',
            'Owner'
          ],
          storeConfig: {
            model: 'hierarchicalrequirement',
            fetch: true,
            context: {
                project: null 
            }
          }
        });

    },
    onButtonClicked: function(){
       var iterationCombobBox = this.down('#cbIteration');
       console.log('iteration value', iterationCombobBox.getRecord());
    }
});
