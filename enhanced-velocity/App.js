Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    config: {
       defaultSettings: {
           migratedAcceptedDateField: "c_ExternalAcceptedDate",
           maxIterations: 16
       }
    },
    launch: function() {
        //loadIterations
        //loadArtifacts
        //buildGraphData
        //buildGraph
        console.log("migratedAcceptedDateField setting", this.getSetting('migratedAcceptedDateField'));
        this.loadIterations();
    },
    loadIterations: function(){
        var maxIterations = this.getSetting('maxIterations');
        Ext.create("Rally.data.wsapi.Store",{
            model: 'Iteration',
            fetch: ['Name','EndDate'],
            context: {
                project: this.getContext().getProject()._ref,
                projectScopeDown: false,
                projectScopeUp: false
            },
            filters: [{
                property: 'EndDate',
                operator: '<',
                value: "today"
            }],
            sorters: [{
                property: "EndDate",
                direction: "DESC"
            }],
            limit: maxIterations,
            pageSize: maxIterations,
            listeners: {
                load: function(store, records, success){
                    console.log("iterations loaded", records);
                    this.loadArtifacts(records);
                },
                scope: this
            }
        }).load();
    },
    loadArtifacts: function(iterations){
         Ext.create('Rally.data.wsapi.Store',{
           model: 'HierarchicalRequirement',
           fetch: ['Iteration','PlanEstimate',this.getSetting('migratedAcceptedDateField'),'AcceptedDate','ScheduleState','Name'],
           filters: this.getArtifactFilters(iterations),
           pageSize: 2000,
           limit: Infinity,
           listeners: {
               load: function(store, records, success){
                  console.log("artifacts loaded", records);
                  this.buildGraph(iterations, records);
               },
               scope: this
           }
         }).load();
    },
    getArtifactFilters: function(iterations){
        var iterationFilterArray = _.map(iterations, function(i){
           return {
               property: 'Iteration',
               operator: "=",
               value: i.get('_ref')
           };
        });

        var artifactFilter = Rally.data.wsapi.Filter.or(iterationFilterArray);
        return artifactFilter;
    },
    buildGraph: function(iterations, artifacts){
       var graphData = this.buildGraphData(iterations,artifacts);
       console.log('graphData',graphData);
       this.add({
           xtype: 'rallychart',
           chartConfig: {
               chart: {
                   type: 'column'
               },
               title: {
                   text: 'Enhanced Velocity'
               },
               xAxis: {},
               yAxis: {
                   title: {
                       text: 'Points'
                   }
               },
               plotOptions: {
                   column: {
                     stacking: 'normal'
                   }
               }
           },
           chartData: graphData
       });

    },
    buildGraphData: function(iterations, artifacts){
      console.log("buildGraphData",iterations,artifacts);
      //series: [{
      //     type: 'column',
      //     name: 'Accepted within the Iteration',
      //     data: [3, 2, 1, 3, 4]
      // }, {
      //     type: 'column',
      //     name: 'Accepted after the Iteration',
      //     data: [2, 3, 5, 7, 6]
      // }, {
      //     type: 'column',
      //     name: 'Unaccepted',
      //     data: [4, 3, 3, 9, 0]
      // }, {
      //     type: 'line',
      //     name: 'Accepted within Iteration Trend',
      //     data: [3, 2.67, 3, 6.33, 3.33]
      // }

      var iterationHash = {};
      for (var i=0; i<iterations.length; i++){
          var name = iterations[i].get('Name');
          iterationHash[name] = {};
          iterationHash[name].EndDate = iterations[i].get('EndDate');
          iterationHash[name].AcceptedDuringIteration = 0;
          iterationHash[name].AcceptedAfterIteration=0;
          iterationHash[name].Unaccepted = 0;
      }

      var migratedAcceptedDateField = this.getSetting('migratedAcceptedDateField');
      for (var i=0; i<artifacts.length; i++ ){
         console.log('migratedAcceptedDateField',migratedAcceptedDateField);
          var artifactValue = artifacts[i].get('PlanEstimate');
          var iterationName = artifacts[i].get('Iteration').Name,
              acceptedDate = artifacts[i].get(migratedAcceptedDateField) || artifacts[i].get('AcceptedDate') || null;

          console.log('migratedAcceptedDateField',migratedAcceptedDateField,artifacts[i].get(migratedAcceptedDateField),artifacts[i].get('AcceptedDate'));

          if (iterationHash[iterationName]){
              if (acceptedDate){
                  console.log('acceptedDate',acceptedDate, iterationHash[iterationName].EndDate);
                  if (acceptedDate < iterationHash[iterationName].EndDate){
                      iterationHash[iterationName].AcceptedDuringIteration += artifactValue;
                  } else {
                      iterationHash[iterationName].AcceptedAfterIteration += artifactValue;
                  }
              } else {
                  iterationHash[iterationName].Unaccepted += artifactValue;
              }
          }
      } //end for

      var categories = [];
      var series = [{
          type: 'column',
          name: 'Accepted within the Iteration',
          color: Rally.util.Colors.green,
          index: 2,
          data: []
      }, {
          type: 'column',
          name: 'Accepted after the Iteration',
          color: Rally.util.Colors.light_green,
          index: 1,
          data: []
      }, {
          type: 'column',
          name: 'Unaccepted',
          color: Rally.util.Colors.brick,
          index: 0,
          data: []
      }];

      var numberedIterations = [],
          idx =0;
      for (var iterationName in iterationHash){
          numberedIterations.unshift(idx++);
          categories.unshift(iterationName);
          series[2].data.unshift(iterationHash[iterationName].Unaccepted);
          series[1].data.unshift(iterationHash[iterationName].AcceptedAfterIteration);
          series[0].data.unshift(iterationHash[iterationName].AcceptedDuringIteration);
      }

      var trendLineData = this.calculateTrendLineData(series[0].data,numberedIterations);
      series.push({
          type: 'line',
          data: trendLineData,
          name: "Accepted during iteration trend",
          marker: {enabled: false}
      });

      return {
          categories: categories,
          series: series
      };

    },
    calculateTrendLineData:function(y,x){
        var lr = {};
        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;

        for (var i = 0; i < y.length; i++) {
            sum_x += x[i];
            sum_y += y[i];
            sum_xy += (x[i]*y[i]);
            sum_xx += (x[i]*x[i]);
            sum_yy += (y[i]*y[i]);
        }

        lr.slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr.intercept = (sum_y - lr.slope * sum_x)/n;
        lr.r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

        var trendY = [];
        for (var i=0; i< x.length; i++){
           var y1 = x[i]*lr.slope + lr.intercept;
           trendY.push(y1);
        }
        return trendY;
    },
    getSettingsFields: function(){
       return [{
           xtype: 'rallyfieldcombobox',
           model: 'HierarchicalRequirement',
           name: 'migratedAcceptedDateField',
           fieldLabel: "Migrated Accepted Date Field"
       },{
          xtype: 'rallynumberfield',
          fieldLabel: "Max Iterations",
          name: 'maxIterations',
          minValue: 3,
          maxValue:26
       }];
    }
});
