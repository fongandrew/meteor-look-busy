(function() {
  'use strict';

  Template.ifReady.helpers({
    isReady: function() {
      if (typeof(this.ready) === 'function') {
        return this.ready();
      }

      else if (this instanceof Array) {
        for (var i in this) {
          var sub = this[i];
          if (typeof(sub.ready) !== 'function' || !sub.ready())
            return false;
        }
        return true;
      }
    },

    hasError: function() {
      if (typeof(this.error) === 'function') {
        return this.error();
      }

      else if (this instanceof Array) {
        for (var i in this) {
          var sub = this[i];
          if (typeof(sub.error) !== 'function' || sub.error())
            return true;
        }
        return false;
      }
    }
  });

})();