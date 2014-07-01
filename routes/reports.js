
/*
 * Get report links
 */
var fs = require('fs');
var url = require('url');
var path = require('path');
var db_orm = require('lib/db_orm');
var util = require('lib/util');
var path_util = require('lib/path_util');

exports.getReports = function(req, res) {
  var user = util.getUser(req);

  db_orm.Person.find({person_id: user.id}, function(err, rows) {
    if (err) {
      res.json(500, err);
    } else {
      var report_list = {};

      rows.forEach(function(member) {
        var reports_dir = path_util.reports_path(member.band_id);
        report_list[member.band_id]  = fs.readdirSync(reports_dir).map(function(report_name) {
          var match = report_name.match(/(.*)_([0-9]{4})_([0-9]{2})_([0-9]{2})_([0-9]{2})_([0-9]{2})_([0-9]{2})\.html$/);
          var epoch = 'latest';

          if (match) {
            var dt = new Date();
            dt.setUTCFullYear(match[2]);
            dt.setUTCMonth(parseInt(match[3], 10) - 1);
            dt.setUTCDate(match[4]);
            dt.setUTCHours(match[5]);
            dt.setUTCMinutes(match[6]);
            dt.setUTCSeconds(match[7]);
            epoch = dt.valueOf();
          } else {
            match = report_name.match(/(.*)\.html$/);
          }

          return {
            report_type: match[1] || '<unknown>',
            name: report_name,
            epoch: epoch
          };
        });
      });

      res.json(200, report_list);
    }
  });
};

exports.sendReport = function(req, res) {
  var reports_dir = path_util.reports_path(req.params.band_id);
  var report_path = path.join(reports_dir, req.params.report);
  res.sendfile(report_path);
};
