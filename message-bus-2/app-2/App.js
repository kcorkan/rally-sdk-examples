Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
        this.subscribe(this, 'messageFromApp1', this.messageReceived, this);
        // this.add({
        //     xtype: 'container',
        //     html: "",
        //     itemId: "messageRecieved"
        // });
        //API Docs: https://help.rallydev.com/apps/2.1/doc/
    },
    messageReceived: function(message){
        console.log("message from app 1 in app 2", message);
        var releaseSelected = message && message.length && message[0].get("Name");
        console.log("releaseSelected ", releaseSelected);
    }
});
