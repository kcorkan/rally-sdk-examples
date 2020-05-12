Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    scopeType: 'iteration',
    onScopeChange: function(scope) {
        // render/refresh components
        console.log('scope', scope);
        console.log('filter for scope', scope.getQueryFilter().toString());
    },
    launch: function() {
      var timeboxScope = this.getContext().getTimeboxScope();
      if(timeboxScope) {
          var record = timeboxScope.getRecord();
          var name = record.get('Name');
          var startDate = timeboxScope.getType() === 'iteration' ?
              record.get('StartDate') : record.get('ReleaseStartDate');
      }
  }
});
