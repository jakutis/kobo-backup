#!/usr/bin/env node

var sqlite3 = require('sqlite3');
var path = require('path');
var fs = require('fs');

var koboDirectory = process.argv[2];
var outputDirectory = process.argv[3];
var db = new sqlite3.Database(path.join(koboDirectory, '.kobo', 'KoboReader.sqlite'));

db.all('SELECT VolumeID, DateCreated, Text FROM Bookmark ORDER BY VolumeID', function (err, rows) {
  if (err) {
    console.log(err.stack);
    process.exit(1);
    return;
  }
  var filename = path.join(outputDirectory, 'bookmarks.json');
  var contents = JSON.stringify(rows, null, 2);
  fs.writeFile(filename, contents, function (err) {
    if (err) {
      console.log(err.stack);
      process.exit(1);
      return;
    }
  });
});