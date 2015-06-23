// Client-side call functions
(function() {
  'use strict';

  // Note that collection is client only
  LookBusy.Saves = new Mongo.Collection(null); 

  // Validates a save insert
  LookBusy.validateSave = function(doc) {
    check(doc, {
      _id: Match.Optional(String),
      call: String,
      params: Match.Optional(Object),
      failedOn: Match.Optional(Date),
      createdOn: Match.Optional(Date)
    });
    if (! doc.createdOn) {
      doc.createdOn = new Date();
    }
  };

  // Wrapper around Meteor.call that triggers Saves
  LookBusy.call = function(/* varargs */) {
    var args = [null].concat(_.toArray(arguments));
    return this.callWithId.apply(this, args);
  };

  // Base funciton for LookBusy.call -- use this instead of call if you want
  // to explicitly identify a busy transaction
  LookBusy.callWithId = function(_id) { /* Additional varargs */

    // Extract arguments for call separately from callName
    var callName = arguments[1];
    var callArgs = _.toArray(arguments).slice(2);
    var callback;

    // Check if last argument is a function to extract callback
    var lastArgument = arguments[arguments.length - 1];
    if (typeof(lastArgument) === 'function') {
      callArgs = callArgs.slice(0, arguments.length-1);
      callback = lastArgument;
    }
    callback = callback || this.config.defaultCallback;

    // Note request in collection
    var createdOn = new Date();
    var _save = {
      _id: _id || Random.id(17),
      call: callName,
      params: {args: callArgs}, // Wrap in Object to pass validation for now
      createdOn: createdOn
    };
    this.validateSave(_save);

    // Remove prior _id first if it exists
    if (_id) {
      this.Saves.remove(_id);
    }
    var _saveId = this.Saves.insert(_save);

    // Remove old failures when making a new call
    var rmTime = new Date(createdOn.getTime() - this.config.minFailure);
    this.Saves.remove({
      failedOn: {$lt: rmTime}
    });

    // Run hooks to pre-process arguments -- hoosk can throw exception to
    // fail a call
    var newArgs;
    try {
      // Note that callback is not passed
      newArgs = processHooks([callName].concat(callArgs));
      if (!newArgs || !newArgs.length) {
        throw new Meteor.Error(400, "bad-hook");
      }
    } catch (err) {
      handleError(_saveId, err);
      return;
    }

    var callbackWrapper = function(error, result) {
      // Call original callback (if it exists) and give it a chance to handle
      // any errors or throw new errors
      try {
        if (callback) {
          callback(error, result);
        } else if (error) {
          throw error; // Go to catch block
        }
        
        // Post-callback, set a timeout to de-register saves from collection
        Meteor.setTimeout(function() {
          LookBusy.Saves.remove(_saveId);
        }, LookBusy.config.delay);  
      }
      catch (err) { // Error => mark 
        // Error => log and mark object as failed
        console.error(err);
        if (err.stack) {
          console.error(err.stack);
        }
        LookBusy.Saves.update(_saveId, {$set: {failedOn: new Date()}});
      }
    };

    // Reconstruct call args to pass to Meteor.call
    newArgs = _.toArray(newArgs);
    newArgs.push(callbackWrapper);
    return Meteor.call.apply(Meteor, newArgs);
  };

  // Helper for error handling
  var handleError = function(saveId, err) {
    console.error(err);
    if (err.stack) {
      console.error(err.stack);
    }
    LookBusy.Saves.update(saveId, {$set: {failedOn: new Date()}});
  };


  // HOOK-RELATED FUNCTIONS ////////////////////

  // Store hooks here
  var preCallHooks = [];

  // Registers a hook to call before a call. Hook gets exact same arguments as 
  // the call itself. Hook should return modified arguments. If no arguments
  // are returned, call is aborted.
  LookBusy.beforeCall = function(hook) {
    check(hook, Function);
    preCallHooks.push(hook);
  };

  // Helper function to run through all hooks
  var processHooks = function(args) {
    _.each(preCallHooks, function(hook) {
      if (args) {
        args = hook.apply(null, args);
      }
    });
    return args;
  };


  // HELPERS TO ASSESS WHETHER CALL IS IN PROGRESS

  // If call with _id is busy, returns call object. If no _id, returns 
  // first call object for any method call. Returns nothing if not
  // busy. Does not consider failed calls.
  LookBusy.isBusy = function(_id) {
    var selector = {
      failedOn: {$exists: false}
    };
    if (_id) {
      selector._id = _id;
    }
    return LookBusy.Saves.findOne(selector);
  };


})();