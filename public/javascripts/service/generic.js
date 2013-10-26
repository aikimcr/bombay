service.generic = function(url, callback) {
  var date = new Date();
  var service_key = date.getTime() + url.substr(0, 10);
  this.key = service_key;
  this.url = url;
  this.service_ = new XMLHttpRequest();
  this.service_.onreadystatechange = function() {
    if (this.readyState == 4) {
      service.getInstance().removeRequestByKey(service_key);
      if (this.status == 200 || this.status == 304) {
        try {
          var response = JSON.parse(this.responseText);
          callback(response);
        } catch(e) {
          window.console.log('Error parsing response text');
          window.console.log(e);
          service.getInstance().cancelAllRequests();
          window.location.reload();
        }
      } else {
        window.console.log("error on " + this.url);
      }
    }
  };
};

service.generic.prototype.abort = function() {
  this.service_.abort();
};

service.generic.prototype.get = function() {
  this.service_.open('GET', this.url);
  this.service_.send();
};

service.generic.prototype.set = function(data) {
  this.service_.open('POST', this.url);
  this.service_.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  var buffer = [];
  Object.keys(data).forEach(function(key) {
    buffer.push(key + '=' + data[key]);
  });
  this.service_.send(buffer.join('&'));
};

service.generic.prototype.put = function(data) {
  var query_args = [];
  Object.keys(data).forEach(function(key) {
    query_args.push(key + '=' + data[key]);
  });
  this.service_.open('PUT', this.url + '?' + query_args.join('&'));
  this.service_.send();
};

service.generic.prototype.delete = function() {
  this.service_.open('DELETE', this.url);
  this.service_.send();
};
