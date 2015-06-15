// Create global variable outside strict mode
/* global LookBusy: true */
LookBusy = {};

(function() {
  'use strict';

  // Settings
  LookBusy.config = {
    delay: 1000, // How long after completion to wait a completed Save -- in
                 // milliseconds
    
    // How long after failure should the failed save action persist until
    // a successful action remove it -- in millieconds
    minFailure: 1000,

    // If no callback is provided to LookBusy.call, use this one (if defined)
    defaultCallback: null
  };
})();