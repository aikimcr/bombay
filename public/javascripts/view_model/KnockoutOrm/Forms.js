orm.form = function(form_url, form_columns, opt_validate, opt_prepareData) {
  this.message = ko.observable();
  this.row = {};
  this.button_text = ko.observable('Submit');

  this.form_url = form_url;
  this.form_columns = form_columns;
  this.validate = opt_validate || function() { return true; }.bind(this);
  this.prepareData = opt_prepareData || this.defaultPrepareData_;

  this.listeners = {
    show: [],
    update: [],
    dispose: [],
    error: []
  }
};

orm.form.build_update_url = function(url_base, form_element) {
  var url_params = [];

  if (form_element) {
    url_params = Array.prototype.map.call(
      form_element.querySelectorAll('[url_param]'),
      function(target) {
        var value = target.value;
        if (target.type === 'checkbox') value = target.checked;
        return value;
      }
    );
  }

  return url_base + '/' + url_params.join('/');
}

orm.form.prototype.on = function(eventType, eventHandler) {
  if (this.listeners[eventType]) {
    this.listeners[eventType].push(eventHandler);
  }
};

orm.form.prototype.dispatch = function(eventType) {
  if (this.listeners[eventType]) {
    var args = Array.prototype.slice.call(arguments, 1);
    this.listeners[eventType].forEach(function(eventHandler) {
      eventHandler.apply(this, args);
    }.bind(this));
  }
};

orm.form.prototype.show = function(update_url_base, opt_button_text, opt_row) {
  this.update_url_base = update_url_base;
  this.row = {};
  if (opt_button_text) this.button_text(opt_button_text);

  var column_names = Object.keys(this.form_columns);

  if (opt_row) {
    this.row['id'] = ko.observable(opt_row['id']());
    column_names.forEach(function(column_name) {
      this.row[column_name] = ko.observable(opt_row[column_name]());
    }.bind(this));
  } else {
    this.row['id'] = ko.observable();
    column_names.forEach(function(column_name) {
      this.row[column_name] = ko.observable();
    }.bind(this));
  }

  var request = Ajax.getInstance().getRequest(this.form_url, 'document');
  request.get().then(function(form_html) {
    try {
      this.form_element = form_html.body.removeChild(form_html.body.firstChild);
      document.body.appendChild(this.form_element);
      ko.applyBindings(this, this.form_element);
      this.dispatch('show', this.form_element);
    } catch(err) {
      console.log(err);
      throw(err);
    };
  }.bind(this)).fail(function(err) {
    throw err;
  });
};

orm.form.prototype.defaultPrepareData_ = function(data, column_names, callback) {
  var svc_data = {};

  if (data['id']) {
    if (ko.isObservable(data['id'])) {
      if (data['id']()) svc_data['id'] = data['id']();
    } else {
      svc_data['id'] = data['id'];
    }
  }

  column_names.forEach(function(column_name) {
    if (column_name in data) {
      var value;
      if (ko.isObservable(data[column_name])) {
        value = data[column_name]();
      } else {
        value = data[column_name];
      }

      if (value != null) svc_data[column_name] = value;
    }
  });

  callback(svc_data);
};

orm.form.prototype.submit = function(form) {
  this.clearMessage();
  if (!this.validate(this.form_element, this.form_columns, this.row)) {
    this.dispatch('error');
    return false;
  };

  var update_url = orm.form.build_update_url(this.update_url_base, this.form_element);

  this.prepareData(this.row, Object.keys(this.form_columns), function(svc_data) {
    var request = Ajax.getInstance().getRequest(update_url, 'json');
    var response;

    if (svc_data.id) {
      response = request.put(svc_data);
    } else {
      response = request.post(svc_data);
    }

    response.then(function(result) {
      this.dispatch('update', result);
      this.dispose();
    }.bind(this)).fail(function(err) {
      this.message(err.toString());
    }.bind(this));
  }.bind(this));
};

orm.form.prototype.clearMessage = function() {
  this.message('');
};

orm.form.prototype.setMessage = function() {
  this.message(Array.prototype.slice.call(arguments, 0).join(''));
};

orm.form.prototype.dispose = function() {
  document.body.removeChild(this.form_element);
  this.dispatch('dispose');
};
