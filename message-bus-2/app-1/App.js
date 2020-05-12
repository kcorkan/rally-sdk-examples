Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
        this.add({
           xtype:'rallyreleasecombobox',
           listeners: {
              select: function(cb,records){
                  console.log("select",records);
                  this.publish("messageFromApp1",records);
              },
              scope: this
           }
        });
        this.add({
            xtype: 'container',
            itemId: 'messagesRecieved'
        });
    //    this.subscribe(this,"messageFromApp1",this.messageRecievedFromApp1, this);
        //API Docs: https://help.rallydev.com/apps/2.1/doc/
    },
    messageRecievedFromApp1: function(message){
       console.log("message received",message);
    }
});
