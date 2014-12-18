
/*
 * Get report links
 */
var fs = require('fs');
var url = require('url');
var path = require('path');

var db_orm = require('../lib/db_orm');
var util = require('../lib/util');
var path_util = require('../lib/path_util');

exports.getReports = function(req, res) {
  var user = util.getUser(req);

  db_orm.BandMember.find({person_id: user.id}, function(err, rows) {
    if (err) {
      res.json(500, err);
    } else {
      var report_id = 1;
      var report_list = [];

      rows.forEach(function(member) {
        var reports_dir = path_util.reports_path(member.band_id);
        report_list = report_list.concat(fs.readdirSync(reports_dir).map(function(report_name) {
          var report_path = path.join(reports_dir, report_name);
          var report_stat = fs.statSync(report_path);
          var epoch = report_stat.mtime;
          var match = report_name.match(/(.*)_[0-9]/);

          if (!match) {
            match = report_name.match(/(.*)\.html$/);
          }

          return {
            id: report_id++,
            band_id: member.band_id,
            report_type: match[1] || '<unknown>',
            name: report_name,
            timestamp: epoch
          };
        }));
      });

      res.json(200, {all_reports: report_list});
    }
  });
};

exports.sendReport = function(req, res) {
  var reports_dir = path_util.reports_path(req.params.band_id);
  var report_path = path.join(reports_dir, req.params.report);
  res.sendfile(report_path);
};
