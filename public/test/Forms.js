describe.only('Forms module testing', function() {
  var template_err;
  var update_err;
  var template_stub;

  before(function() {
    var stub_p = {
      getRequest: function(url, response_type) {
        return {
          get: function() {
            url.should.equal('/forms/test_template.html');
            response_type.should.equal('document');
            return Q.promise(function(resolve, reject, notify) {
              if (template_err) return reject(template_err);
              var parser = new DOMParser();
              return resolve(parser.parseFromString([
                '<div class="test_form" style="position: absolute; top: 10; left: 50;">',
                '  <div class="message" data-bind="text: message"></div>',
                '  <form data-bind="submit: submit">',
                '    <input type="text" data-bind="value: row.name"></input>',
                '    <input type="submit" data-bind="attr: {value: button_text}"></input>',
                '  </form>',
                '</div>'
              ].join('\n'), 'text/html'));
            });
          },
          post: function(svc_data) {
            url.should.equal('/row/');
            response_type.should.equal('json');
            return Q.promise(function(resolve, reject, notify) {
              if (update_err) return reject(update_err);
              svc_data.id = 1;
              return resolve(svc_data);
            });
          },
          put: function(svc_data) {
            url.should.equal('/row/');
            response_type.should.equal('json');
            return Q.promise(function(resolve, reject, notify) {
              if (update_err) return reject(update_err);
              return resolve(svc_data);
            });
          }
        };
      }
    };

    template_stub = sinon.stub(Ajax, 'getInstance', function() { return stub_p; });
  });

  it('should instantiate, show, hide and dispose the form.', function(done) {
    var form = new orm.form('/forms/test_template.html', {name: {type: 'string'}});

    should.exist(form);
    form.should.be.instanceOf(orm.form);

    form.should.have.property('form_url');
    ko.isObservable(form.form_url).should.be.false;
    form.form_url.should.equal('/forms/test_template.html');

    form.should.have.property('button_text');
    ko.isObservable(form.button_text).should.be.true;
    form.button_text().should.equal('Submit');

    form.should.have.property('message');
    ko.isObservable(form.message).should.be.true;
    should.not.exist(form.message());

    form.should.have.property('row');
    ko.isObservable(form.row).should.be.false;
    form.row.should.eql({});

    form.should.not.have.property('disposeOwner');

    form.should.have.property('validate');
    should.exist(form.validate);

    form.should.have.property('prepareData');
    should.exist(form.prepareData);

    form.on('show', function(form_element) {
      try {
        should.exist(form_element);
        var message = form_element.querySelector('div:first-child');
        should.exist(message);
        message.innerHTML.should.equal('');

        var submit_button = form_element.querySelector('input[type="submit"]');
        should.exist(submit_button);
        submit_button.value.should.equal('Submit');
        form.button_text('foobar');
        submit_button = form_element.querySelector('input[type="submit"]');
        submit_button.value.should.equal('foobar');

        form.dispose();
      } catch(e) {
        done(e);
      };
    });

    form.on('dispose', function() {
      try {
        var form_element = document.body.querySelector('.test_form');
        should.not.exist(form_element);
        form = null;
        done();
      } catch(e) {
        done(e);
      };
    });

    form.show('/row');
  });

  it('should handle the update', function(done) {
    var form = new orm.form('/forms/test_template.html', {name: {type: 'string'}});

    should.exist(form);
    form.should.be.instanceOf(orm.form);

    form.on('show', function() {
      try {
        form.row.name('Plover');
        var name_field = document.body.querySelector('.test_form input[type="text"]');
        name_field.value.should.equal('Plover');
        var submit_button = document.body.querySelector('.test_form input[type="submit"]');
        submit_button.dispatchEvent(new Event('click'));
      } catch(e) {
        done(e);
      };
    });

    form.on('update', function(result) {
      try {
        should.exist(result);

        result.should.have.property('id');
        result.id.should.equal(1);

        result.should.have.property('name');
        result.name.should.equal('Plover');
      } catch(e) {
        done(e);
      };
    });

    form.on('dispose', function(result) {
      try {
        var form_element = document.body.querySelector('.test_form');
        should.not.exist(form_element);
        form = null;
        done();
      } catch(e) {
        done(e);
      };
    });

    form.show('/row');
  });

  it('should show an error when validate fails, then clear it', function(done) {
    var validate_ok = false;
    var form = new orm.form('/forms/test_template.html', {name: {type: 'string'}}, function(element, columns, row) {
      should.exist(element);
      should.exist(columns);
      columns.should.eql({name: {type: 'string'}});
      should.exist(row);
      row.should.have.property('name');
      ko.isObservable(row.name).should.be.true;
      row.name().should.equal('Plover');
      if (!validate_ok) form.setMessage('Validate Error');
      return validate_ok;
    });

    should.exist(form);
    form.should.be.instanceOf(orm.form);

    form.on('show', function() {
      try {
        form.row.name('Plover');
        var submit_button = document.body.querySelector('.test_form input[type="submit"]');
        submit_button.dispatchEvent(new Event('click'));
      } catch(e) {
        done(e);
      };
    });

    form.on('error', function(error) {
      try {
        var message = document.body.querySelector('.test_form div.message');
        should.exist(message);
        message.innerHTML.should.equal('Validate Error');
        validate_ok = true;

        setTimeout(function() {
          var submit_button = document.body.querySelector('.test_form input[type="submit"]');
          submit_button.dispatchEvent(new Event('click'));
        }, 0);
      } catch(e) {
        done(e);
      };
    });

    form.on('update', function(result) {
      try {
        var message = document.body.querySelector('.test_form div.message');
        should.exist(message);
        message.innerHTML.should.equal('');

        should.exist(result);

        result.should.have.property('id');
        result.id.should.equal(1);

        result.should.have.property('name');
        result.name.should.equal('Plover');
      } catch(e) {
        done(e);
      };
    });

    form.on('dispose', function(result) {
      try {
        var form_element = document.body.querySelector('.test_form');
        should.not.exist(form_element);
        form = null;
        done();
      } catch(e) {
        done(e);
      }
    });

    form.show('/row');
  });

  it('should use transformed data', function(done) {
    var form = new orm.form(
      '/forms/test_template.html',
      {name: {type: 'string'}},
      null,
      function(row, column_names, callback) {
        should.exist(row);
        row.should.have.property('name');
        ko.isObservable(row.name).should.be.true;
        row.name().should.equal('Plover');
        should.exist(column_names);
        column_names.should.eql(['name']);
        should.exist(callback);
        callback.should.be.instanceOf(Function);
        callback({id: 2, token: 'xyzzy'});
      });

    should.exist(form);
    form.should.be.instanceOf(orm.form);

    form.on('show', function() {
      try {
        form.row.name('Plover');
        var submit_button = document.body.querySelector('.test_form input[type="submit"]');
        submit_button.dispatchEvent(new Event('click'));
      } catch(e) {
        done(e);
      };
    });

    form.on('update', function(result) {
      try {
        var message = document.body.querySelector('.test_form div.message');
        should.exist(message);
        message.innerHTML.should.equal('');

        should.exist(result);

        result.should.have.property('id');
        result.id.should.equal(2);

        result.should.have.property('token');
        result.token.should.equal('xyzzy');
      } catch(e) {
        done(e);
      };
    });

    form.on('dispose', function(result) {
      try {
        var form_element = document.body.querySelector('.test_form');
        should.not.exist(form_element);
        form = null;
        done();
      } catch(e) {
        done(e);
      }
    });

    form.show('/row');
  });

  it('should instantiate and form with data', function(done) {
    var form = new orm.form('/forms/test_template.html', {name: {type: 'string'}});

    should.exist(form);
    form.should.be.instanceOf(orm.form);

    form.on('show', function() {
      try {
        var name_field = document.body.querySelector('.test_form input[type="text"]');
        name_field.value.should.equal('Plover');
        (function() { form.dispose(); }).should.not.throw();
      } catch(e) {
        done(e);
      };
    });

    form.on('dispose', function() {
      done();
    });

    form.show('/row', 'Plugh', {
      id: ko.observable(4),
      name: ko.observable('Plover')
    });
  });
});
