(function() {
  'use strict';

  Template.saveStatus.helpers({
    savesCount: function() {
      return LookBusy.Saves.find().count();
    },

    savesPlural: function() {
      return LookBusy.Saves.find().count() > 1;
    },

    failedSaves: function() {
      return LookBusy.Saves.find({failedOn: {$exists: true}}).count()
    }
  });
})();