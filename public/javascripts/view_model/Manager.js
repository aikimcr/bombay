var manager;

function Manager() {
  manager = this;

}

function app_start() {
  ko.applyBindings(new Manager());
}
