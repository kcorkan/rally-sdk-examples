Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
        this.add({
            xtype: 'rallybutton',
            text: 'call app 1',
            handler: this.sendMessage,
            scope: this
        });
        this.subscribe(this,'app1Message',this.app1HeardMe, this);
        this.add({
           xtype: 'rallytextfield',
           itemId: 'messageRecieved',
           fieldLabel: 'Message Recieved'
        });
        //API Docs: https://help.rallydev.com/apps/2.1/doc/
    },
    sendMessage: function(){
        this.publish("app2Message",{messagetext: 'Can you hear me now??'});
    },
    app1HeardMe: function(message){
        console.log('this is from the other app: ' + message);
        this.down("#messageRecieved").setValue(message);
    }
});
