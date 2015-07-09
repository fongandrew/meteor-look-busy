Package.describe({
  name: 'fongandrew:look-busy',
  summary: 'Indicator that shows Meteor method activity',
  version: '1.0.0',
  git: 'https://github.com/fongandrew/meteor-look-busy.git'
});

Package.onUse(function(api) {
  'use strict';

  api.versionsFrom('METEOR@1.1.0.2');
  api.use('reactive-var', ['client', 'server']);
  api.use('underscore', ['client', 'server']);
  api.use('templating', 'client');
  api.use(['minimongo', 'mongo-livedata', 'templating'], 'client');
  api.addFiles(['look_busy.js'], ['client', 'server']);
  api.addFiles(['call.js'], ['client']);
  api.addFiles(['save_status.html','save_status.js'], 'client');
  api.export(['LookBusy'], ['client', 'server']);
});

Package.onTest(function(api) {
  'use strict';

  api.use('tinytest');
  api.use('fongandrew:look-busy');
  api.addFiles('look_busy_tests.js');
});
