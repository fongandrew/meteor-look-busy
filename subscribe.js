// Subscription functions -- client AND server
(function() {
  'use strict';
  
  // Base helper function for LookBusy.subscribe and LookBusy.routerSubscribe
  var _subscribe = function(errorVar, args) {
    var args = _.toArray(args);

    // Extract arguments for call separately from callName
    var readyCallback, errorCallback;
    // Check if last argument is a function to extract callback
    var lastArgument = args[args.length - 1];
    if (typeof(lastArgument) === 'function') {
      readyCallback = lastArgument;
    }

    else if (typeof(lastArgument) === 'object') {
      if (typeof(lastArgument.onReady) === 'function') {
        readyCallback = lastArgument.readyCallback;
      }
      if (typeof(lastArgument.onError) === 'function') {
        errorCallback = lastArgument.onError;
      }
    }

    if (errorCallback || readyCallback) {
      args = args.slice(0, args.length-1);
    }

    var errorCallbackWrapper = function(err) {
      errorVar.set(err);
      console.error(err);
      if (errorCallback) {
        errorCallback(err);
      }
    };
    args.push({
      onError: errorCallbackWrapper,
      onReady: readyCallback
    });
    var ret = Meteor.subscribe.apply(Meteor, args);
    return {
      sub: ret,
      error: function() { return errorVar.get() },
      ready: ret.ready
    };
  };

  // Wrapper around subscribe that returns an object with the following
  // properties:
  //  * sub - Actual subscription
  //  * error - Reactive var representing failure
  //  * ready - Reactive var representing success (or ready) 
  LookBusy.subscribe = function() {
    var errorVar = new ReactiveVar(false);
    return _subscribe(errorVar, arguments);
  };

  // Like LookBusy.subscribe -- but uses a variable that ties into the loading
  // hook
  LookBusy.routerSubscribe = function() {
    var errorVar = {
      get: function() {
        return Router.current().state.get('lookBusySubError') || false;
      },
      set: function(value) {
        return Router.current().state.set('lookBusySubError', true);
      }
    };
    return _subscribe(errorVar, arguments);
  };

  /** Iron:Router hook for use in lieu of the standard loading hook. It allows
   *  us to show an error page when a subscription fails instead of just a
   *  perpetual loading screen.
   * 
   *  Initialize with: Router.onBeforeAction(LookBusy.loadingHook);
   *  Use LookBusy.routerSubscribe instead of Meteor.subscribe. Also don't call
   *  waitOn (use subscribe function instead), so as not to conflict with
   *  built-in loading function.
   */
  LookBusy.loadingHook = function() {
    // If we're ready just pass through. Also pass through if this is called 
    // on a server route for whatever reason.
    if (Meteor.isServer || this.ready()) {
      this.next();
      return;
    }

    // Pick error or loading template based on state
    var template;
    if (this.state.get('lookBusySubError')) {
      template = this.lookupOption('errorTemplate') || 'subError'
    } else {
      template = this.lookupOption('loadingTemplate') || 'subLoading';
    }
    this.render(template); 
    this.renderRegions();
  };
})();