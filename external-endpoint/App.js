Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
      
        var weatherUrl = "https://api.weather.gov/points/40,-105";
        this.getData(weatherUrl).then({
            success: function(response){
               console.log("success",response);
            },
            failure: function(message){
               console.log("failure",message);
            },
            scope: this //don't forget to scope if you are going to reference functions or methods on this app
        });
    },
    getData: function(url){
        //Docs for using the XMLHttpRequest can be found here:
        //https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/XMLHttpRequest
        var deferred = Ext.create("Deft.Deferred");
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        //xhr.setHeader("Authorization",authToken);
        xhr.onreadystatechange = function(){
            if (this.status == 200 && this.readyState == 4){
               console.log("readyState", this.readyState);
               console.log("GET Response", this.responseText);
               deferred.resolve(this.responseText);
            }
        };
        xhr.send();
        return deferred.promise;
    },
    getRecords: function(){
        //Get Records using a promise
        var deferred = Ext.create("Deft.Deferred");

        Ext.create("Rally.data.wsapi.Store",{
            model: "Defect",
            listeners: {
               load: function(store, records, success){
                    console.log('store loaded', records);
                    if (success){
                          deferred.resolve(records);
                    } else {
                       deferred.reject("Error loading store! ");
                    }
               }
             }
        }).load();
        console.log("after store load");
        return deferred.promise;
    }
});
