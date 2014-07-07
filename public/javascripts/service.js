service = function() {
  this.requests_ = {};
};

service.instance_ = null;

service.getInstance = function() {
  if (service.instance_ == null) {
    service.instance_ = new service();
  }

  return service.instance_;
};

service.prototype.removeRequestByKey = function(key) {
  delete this.requests_[key];
}

service.prototype.cancelAllRequests = function() {
  Object.keys(this.requests_).forEach(function(key) {
    this.requests_[key].abort();
    delete this.requests_[key];
  }, this);
};

service.prototype.getRequest_= function(url, callback) {
  var request = new service.generic(url, callback);
  this.requests_[request.key] = request;
  return request;
};

service.prototype.get = function(url, callback) {
  this.getRequest_(url, callback).get();
};

service.prototype.put = function(url, callback, data) {
  this.getRequest_(url, callback).put(data);
};

service.prototype.post = function(url, callback, data) {
  this.getRequest_(url, callback).post(data);
};

service.prototype.delete = function(url, callback) {
  this.getRequest_(url, callback).delete();
};
