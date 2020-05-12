Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        //Write app code here
        this.add({
           xtype: 'container',
           html: "these are my assumptions here...",
           padding: 10,
           margin: 25
        });
        this.add({
           xtype: "rallyreleasecombobox",
           listeners: {
              select: this.onReleaseSelected,
              scope: this
           }
        });
        //API Docs: https://help.rallydev.com/apps/2.1/doc
    },
    onReleaseSelected: function(cb,releaseRecords){
       console.log('onReleaseSelected',cb,releaseRecords);

       //Clear out the existing chart, if there is one there
       if (this.down('rallychart')){
          this.down('rallychart').destroy();
       }

       //Todo: Check if releaseRecords has 1 element - warn if it has more than one, error if one is not selected.
       var selectedRelease = releaseRecords[0];

         Ext.create('Rally.data.wsapi.Store', {
           model: 'HierarchicalRequirement',
           autoLoad: true,
           pageSize: 2000,
           filters: [{
              property: 'Release.Name',
              operator: '=',
              value: selectedRelease.get('Name')
           }],
           limit: Infinity,
           listeners: {
               load: function(store, data, success) {
                   //process data
                   console.log('load',store,data,success);
                   this.buildGraph(data, selectedRelease);
               },
               scope: this
           },
           fetch: ['PlanEstimate', 'ScheduleState','CreationDate','InProgressDate','AcceptedDate','c_ExternalAcceptedDate','c_ExternalCreationDate','c_ExternalInProgressDate']
       });
    },
    buildGraph: function(records,selectedRelease){
      console.log('buildGraph', records, selectedRelease);
      var graphData = this.restructureData(records, selectedRelease);
      console.log('buildGraph - restructureData', graphData);
      this.addGraph(graphData);
    },
    addGraph: function(graphData){
        this.add({
          xtype: 'rallychart',
          chartData: graphData,
          chartConfig: {
            chart: {
                type: 'area'
            },
            title: {
                text: 'Cumulative Flow Chart'
            },
            xAxis: {
                tickInterval: 10,
                labels: {
                   formatter: function(){
                      return Rally.util.DateTime.format(this.value, 'Y-m-d');
                   }
                }
            },
            yAxis: {
                min: 0,
                    title: {
                    text: 'Points'
                }
            },
            plotOptions: {
              area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
              }
            } //end plotOptions
          } //end ChartConfig
        });
    },
    restructureData: function(records,selectedRelease){
      var startDate = new Date(selectedRelease.get('ReleaseStartDate')),
          endDate = new Date(selectedRelease.get('ReleaseDate'));

      var categories = [];
      var series = {
          "Defined": [],
          "InProgress": [],
          "Accepted": []
      };

      var dt = startDate;
      var dtIdx=0;

      while(dt < endDate){
         series.Accepted[dtIdx] = 0;
         series.InProgress[dtIdx]=0;
         series.Defined[dtIdx]=0;
         categories.push(dt);
         for(var i=0; i< records.length; i++){
             var rec = records[i];
             var creationDate = rec.get('c_ExternalCreationDate') || rec.get('CreationDate');
             var inProgressDate = rec.get('c_ExternalInProgressDate') || rec.get('InProgressDate');
             var acceptedDate = rec.get('c_ExternalAcceptedDate') || rec.get('AcceptedDate');
             //console.log('dates', dt, creationDate, inProgressDate, acceptedDate);

             var storyValue = rec.get('PlanEstimate');
            // console.log('storyValue',storyValue);

             if (acceptedDate < dt){
                series["Accepted"][dtIdx] += storyValue;
             } else {
                if (inProgressDate < dt){
                  series["InProgress"][dtIdx] += storyValue;
                } else {
                  if (creationDate < dt){
                      series["Defined"][dtIdx] += storyValue;
                  }
                }
             } //end if AcceptedDate
         } //end for
         dt = Rally.util.DateTime.add(dt,"day",1);
         dtIdx++ ;
      }
      console.log('series',series);
      console.log('categories',categories);

      var newSeries = _.map(series, function(val, key){
          return {
             "name": key,
             "data": val
          };
      });
      console.log('newSeries',newSeries);
      return {
          series: newSeries,
          categories: categories
      };


      // return { series: [{
      //         name: 'Asia',
      //         data: [502, 635, 809, 947, 1402, 3634, 5268]
      //     }, {
      //         name: 'Africa',
      //         data: [106, 107, 111, 133, 221, 767, 1766]
      //     }, {
      //         name: 'Europe',
      //         data: [163, 203, 276, 408, 547, 729, 628]
      //     }, {
      //         name: 'America',
      //         data: [18, 31, 54, 156, 339, 818, 1201]
      //     }, {
      //         name: 'Oceania',
      //         data: [2, 2, 2, 6, 13, 30, 46]
      //     }],
      //     categories: ['1750', '1800', '1850', '1900', '1950', '1999', '2050']
      // }
    }
});
