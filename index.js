#!/usr/bin/env node

var sqlite3 = require('sqlite3');
var path = require('path');
var fs = require('fs');

var koboDirectory = process.argv[2];
var outputDirectory = process.argv[3];
var db = new sqlite3.Database(path.join(koboDirectory, '.kobo', 'KoboReader.sqlite'));
var getFileNameFromVolumeId = function (volumeId) {
  var prefix = 'file:///mnt/onboard/';
  if (volumeId.substr(0, prefix.length) !== prefix) {
    throw new Error('Volume ID "' + volumeId + '" is not prefixed with "' + prefix + '"');
  }
  return volumeId.substr(prefix.length);
};
var getDateStringFromDateCreated = function (dateCreated) {
  dateCreated += 'Z';
  if (isNaN(Date.parse(dateCreated))) {
    throw new Error('DateCreated "' + dateCreated + '" cannot be parsed');
  }
  return dateCreated;
}

db.all('SELECT VolumeID, DateCreated, Text FROM Bookmark ORDER BY VolumeID', function (err, rows) {
  if (err) {
    console.log(err.stack);
    process.exit(1);
    return;
  }
  rows = rows.map(r => ({
    createdAt: new Date(getDateStringFromDateCreated(r.DateCreated)),
    filename: getFileNameFromVolumeId(r.VolumeID),
    text: r.Text
  }));
  var contents = JSON.stringify(rows, null, 2);
  var filename = path.join(outputDirectory, 'bookmarks.json');
  fs.writeFile(filename, contents, function (err) {
    if (err) {
      console.log(err.stack);
      process.exit(1);
      return;
    }
  });
});