function ReportList() {
  this.list = ko.observableArray([]);
}

ReportList.prototype.load = function() {
  var svc = service.getInstance();
  svc.get('/reports', function(result_code, result) {
    if (result_code != 200 && result_code != 304) {
      throw new Error("Unexpected result " + result_code);
    }

    var result_list = {};

    Object.keys(result).forEach(function(band_id) {
      var band_result = [];

      result[band_id].forEach(function(report) {
        var report_result = {};
        Object.keys(report).forEach(function(field) {
          report_result[field] = ko.observable(report[field]);
        });
        report_result.url = ko.observable('./reports/' + band_id + '/' + report.name);
        report_result.date = ko.observable(
          report.epoch == 'latest' ? 'Latest' : new Date(report.epoch).toString()
        );
        band_result.push(report_result);
      });

      result_list[band_id] = ko.observableArray(band_result);
    });

    this.list(result_list);
  }.bind(this));
  return this;
};
