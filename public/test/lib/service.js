service = function() {
  this.type_list = ['get', 'put', 'set', 'delete'];

  this.type_list.forEach(function(type) {
    this[type] = function(url, callback, data) {
      this[type].calls++;

      var cb = typeof(callback) === 'function' ? 'function' : cb;
      if (type === 'get' || type === 'delete') {
        this[type].params.push([url, cb]);
      } else {
        this[type].params.push([url, cb, data]);
      }
    };
    this[type].calls = 0;
    this[type].params = [];
  }, this);
};

service.instance_ = null;

service.getInstance = function() {
  if (service.instance_ == null) {
    service.instance_ = new service();
  }

  return service.instance_;
};

service.prototype.resetCalls = function() {
  this.type_list.forEach(function(type) {
    this[type].calls = 0;
    this[type].params = [];
  }, this);
};
