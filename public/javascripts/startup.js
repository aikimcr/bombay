function app_start() {
  var app_container = document.querySelector('.app_container');

  if (app_container) {
    ko.applyBindings(new Manager());
  }
}
