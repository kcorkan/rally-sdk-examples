Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
        this.add({
           xtype: 'rallytextfield',
           fieldLabel: "Latitude",
           itemId: 'latitude'
        });
        this.add({
           xtype: 'rallytextfield',
           fieldLabel: "Longitude",
           itemId: 'longitude'
        });
        this.add({
           xtype: 'rallybutton',
           text: 'Get Weather',
           handler: this.getWeather,
           scope: this
        });
        this.add({
           xtype: 'container',
           itemId: 'weather',
           html: ""
        });

        //API Docs: https://help.rallydev.com/apps/2.1/doc/
    },
    getWeather: function(){
      var url = Ext.String.format("https://api.weather.gov/points/{0},{1}",this.down('#latitude').getValue(), this.down("#longitude").getValue());
      console.log('url', url);
      this.getData(url, "").then({
         success: function(response){
            console.log('response',response);
            console.log('resonse', response.properties && response.properties.forecast)
            var city = response.properties && response.properties.relativeLocation && response.properties.relativeLocation.properties.city,
                state = response.properties && response.properties.relativeLocation && response.properties.relativeLocation.properties.state;
            var forcastUrl = response.properties && response.properties.forecast;
            this.getData(forcastUrl).then({
                success: function(forecastResult){
                    var rightNow = forecastResult.properties && forecastResult.properties.periods && forecastResult.properties.periods[0];
                    console.log('rightNow',rightNow);
                    var weatherString = Ext.String.format("<br><br>Weather for {0},{1}:<br>{2} {3} with {4}",city, state, rightNow.temperature, rightNow.temperatureUnit, rightNow.shortForecast)
                    this.down('#weather').update(weatherString)
                },
                scope: this
            });

         },
         scope: this
      });
    },
    getData: function(url,myAuthToken){
        var me = this;
        var deferred = Ext.create('Deft.Deferred');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        // xhr.setRequestHeader("Authorization", myAuthToken);
        xhr.onreadystatechange = function () {
          if (this.status == 200 && this.readyState == 4) {
            console.log('GET response: ', this.responseText);
            var response = Ext.JSON.decode(this.responseText);
            deferred.resolve(response);
          }
        };
        xhr.send();
        return deferred.promise;
    }
});
