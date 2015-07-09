# fongandrew:look-busy
A quick-and-dirty busy indicator for Meteor method calls

Installation
------------
`meteor add fongandrew:look-busy`

Usage
-----
Use `LookBusy.call(...)` instead of `Meteor.call(...)`. Arguments to both
are identical and can include callbacks.

Then insert `{{> saveStatus}}` somewhere in your layout. When a 
LookBusy method call is pending, the `saveStatus` template will display a 
message inside a `#save-status` div indicating that there are pending actions.
If you have fontawesome installed, this will include a spinner as well.
If the LookBusy call fails, the `saveStatus` template will display an error
message.

Config
------
See the [look_busy.js](look_busy.js) file for available config options.
