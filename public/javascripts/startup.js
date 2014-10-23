function app_start() {
  var app_container = document.querySelector('.app_container');

  if (app_container) {
    var view_manager = new Manager();
    ko.applyBindings(view_manager);
    view_manager.loadTables();
  } else {
    var login_form = document.querySelector('form[action="./login"]');

    if (login_form) {
      login_form.addEventListener('submit', validateLogin);
    }
  }
}
