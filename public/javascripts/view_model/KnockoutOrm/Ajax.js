function Ajax() {
  this.requests_ = {};
}

Ajax.instance_ = null;

Ajax.getInstance = function() {
  if (Ajax.instance_ == null) {
    Ajax.instance_ = new Ajax();
  }

  return Ajax.instance_;
}

Ajax.get = function(url, callback) {
  return Ajax.getInstance().getRequest(url).get(callback);
};

Ajax.put = function(url, data, callback) {
  return Ajax.getInstance().getRequest(url).put(data, callback);
};

Ajax.post = function(url, data, callback) {
  return Ajax.getInstance().getRequest(url).post(data, callback);
};

Ajax.delete = function(url, callback) {
  return Ajax.getInstance().getRequest(url).delete(callback);
};

Ajax.prototype.removeRequestByKey = function(key) {
  delete this.requests_[key];
}

Ajax.prototype.cancelAllRequests = function() {
  Object.keys(this.requests_).forEach(function(key) {
    this.requests_[key].abort();
    delete this.requests_[key];
  }, this);
};

Ajax.prototype.getRequest = function(url, response_type) {
  var request = new Ajax.Request(url, response_type);
  this.requests_[request.key] = request;
  return request;
};

Ajax.Request = function(url, response_type) {
  this.key = Date.now() + url.substr(0, 10);
  this.url = url;
  this.response_type = response_type || '';
  this.service_ = new XMLHttpRequest();
};

Ajax.Request.prototype.handleReadyStateChange = function(callback) {
  var service = this.service_;
  if (service.readyState === 4) {
    Ajax.getInstance().removeRequestByKey(this.key);
    if (service.status === 200 || service.status === 304) {
      callback(null, service.response);
    } else {
      window.console.log(service.status + service.statusText + ' error on ' + this.url);
      callback(service.status, service.statusText);
    }
  }
};

Ajax.Request.prototype.abort = function() {
  this.service_.abort();
};

Ajax.Request.prototype.sendRequest_ = function(sender, callback) {
  if (Q) {
    var p = Q.promise(function(resolve, reject, notify) {
      this.service_.onreadystatechange = this.handleReadyStateChange.bind(this, function(err, result) {
        if (err) return reject(new Error(err + ': ' + result));
        return resolve(result);
      });
      this.service_.responseType = this.response_type;
      sender();
    }.bind(this));

    if (callback) {
      p.then(function(result) {
        callback(null, result);
      }, function(err) {
        callback(err);
      }).done();
      return null;
    } else {
      return p;
    }
  } else if (callback) {
    this.service_.onreadystatechange = this.handleReadyStateChange.bind(this, callback);
    sender();
    return null;
  } else {
    throw new Error('Either Q promises must be available or callback must be specified');
  }
};

Ajax.Request.prototype.get = function(callback) {
  return this.sendRequest_(function() {
    this.service_.open('GET', this.url);
    this.service_.send();
  }.bind(this), callback);
};

Ajax.Request.prototype.post = function(data, callback) {
  return this.sendRequest_(function() {
    this.service_.open('POST', this.url);
    this.service_.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    var buffer = [];
    Object.keys(data).forEach(function(key) {
      buffer.push(key + '=' + encodeURIComponent(data[key]));
    });
    this.service_.send(buffer.join('&'));
  }.bind(this), callback);
};

Ajax.Request.prototype.put = function(data, callback) {
  return this.sendRequest_(function() {
    var query_args = [];
    Object.keys(data).forEach(function(key) {
      query_args.push(key + '=' + encodeURIComponent(data[key]));
    });
    this.service_.open('PUT', this.url + '?' + query_args.join('&'));
    this.service_.send();
  }.bind(this), callback);
};

Ajax.Request.prototype.delete = function(callback) {
  return this.sendRequest_(function() {
    this.service_.open('DELETE', this.url);
    this.service_.send();
  }.bind(this), callback);
};
