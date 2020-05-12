Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
        this.subscribe(this,'app2Message',this.app2Called, this);
        this.add({
           xtype: 'rallytextfield',
           itemId: 'messageRecieved',
           fieldLabel: 'Recieved Message'
        });
        this.add({
           xtype: 'rallytextfield',
           itemId: 'messageSent',
           fieldLabel: 'Send Message'
        });
        this.add({
           xtype: 'rallybutton',
           handler: this.sendMessage,
           scope: this,
           text: 'Send Message'
        });
        //API Docs: https://help.rallydev.com/apps/2.1/doc/
    },

    app2Called: function(message){
        console.log('this is from the other app: ' + message);
        this.down("#messageRecieved").setValue(message);
    },
    sendMessage: function(){
       this.publish("app1Message",this.down('#messageSent').getValue());
    }
});
