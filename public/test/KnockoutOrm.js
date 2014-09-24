function TestContext() {
}

describe('KnockoutOrm Object Definitions', function() {
  describe('define an orm.table.list', function() {
    it('should create the object without errors', function(done) {
      var list = new orm.table.list('Oxbow');
      should.exist(list);
      list.should.have.property('table_name');
      ko.isObservable(list.table_name).should.be.true;
      list.table_name().should.equal('Oxbow');
      list.should.have.property('list');
      ko.isObservable(list.list).should.be.true;
      list.list().should.eql([]);
      done();
    });
  });

  describe('define an orm.table directly', function() {
    var test_context;

    var table_name = 'Oxbow';
    var list_name = table_name + 's';
    var columns = {
      trout: { type: 'string' },
      cichlid: { type: 'integer' }
    };

    before(function(done) {
      test_context = new TestContext();
      test_context[list_name] = new orm.table.list(table_name);
      done();
    });

    after(function(done) {
      test_context = null;
      done();
    });

    it('should create the table object without error', function(done) {
      var table = new orm.table(
        test_context,
        table_name,
        'Lake',
        './amazon',
        columns
      );
      should.exist(table);
      table.should.have.property('table_name', table_name);
      table.should.have.property('model_key', 'Lake');
      table.should.have.property('url', './amazon');
      table.should.have.property('columns');
      table.columns.should.eql(columns);
      done();
    });
  });

  describe('define an orm.table.row directly', function() {
    var test_context;
    var table;

    var table_name = 'Oxbow';
    var list_name = table_name + 's';
    var columns = {
      trout: { type: 'string' },
      cichlid: { type: 'integer' }
    };

    before(function(done) {
      test_context = new TestContext();
      test_context[list_name] = new orm.table.list(table_name);
      done();
    });

    before(function(done) {
      table = new orm.table(
        test_context,
        table_name,
        table_name,
        './' + table_name,
        columns
      );
      done();
    });

    after(function(done) {
      test_context = null;
      table = null;
      done();
    });

    it('should create a valid table row without an error', function(done) {
      var row = new orm.table.row(table, {id: 1, trout: 'salmon', cichlid: 27});

      should.exist(row);

      row.should.have.property('id');
      ko.isObservable(row.id).should.be.true;
      row.id().should.equal(1);

      row.should.have.property('trout');
      ko.isObservable(row.trout).should.be.true;
      row.trout().should.equal('salmon');

      row.should.have.property('cichlid');
      ko.isObservable(row.cichlid).should.be.true;
      row.cichlid().should.equal(27);

      done();
    });
  });

  describe('define a table', function(done) {
    var test_context;

    var table_name = 'Oxbow';
    var columns = {
      trout: { type: 'string' },
      cichlid: { type: 'integer' }
    };

    before(function(done) {
      test_context = new TestContext();
      done();
    });

    it('should create a table object', function(done) {
      var table = orm.define(test_context, table_name, columns);
      should.exist(table);
      table.should.have.property('table_name', table_name);
      table.should.have.property('model_key', table_name);
      table.should.have.property('url', './' + table_name);
      table.should.have.property('columns');
      table.columns.should.eql(columns);
      done();
    });

    it('should create a table object with options', function(done) {
      var table = orm.define(test_context, table_name, columns, {
        model_key: 'Lake',
        url: './amazon'
      });
      should.exist(table);
      table.should.have.property('table_name', table_name);
      table.should.have.property('model_key', 'Lake');
      table.should.have.property('url', './amazon');
      table.should.have.property('columns');
      table.columns.should.eql(columns);
      done();
    });
  });
});

describe('KnockoutOrm list management', function() {
  var list;
  var start_list = [];
  var list_names = ['platypus', 'angel', 'danio', 'discus', 'wrasse', 'tetra'];

  before(function(done) {
    list = new orm.table.list('Oxbow');
    done();
  });

  before(function(done) {
    for(var i=1;i<=5;i++) {
      start_list.push({
        id: ko.observable(i),
        name: ko.observable(list_names[i])
      });
    }
    done();
  });

  after(function(done) {
    list = null;
    done();
  });

  it('should fill in the list', function(done) {
    list.length().should.equal(0);
    var error = list.set(start_list);

    should.not.exist(error);
    list.length().should.equal(5);

    list.list().forEach(function(row, index) {
      row.should.have.property('id');
      row.id().should.equal(index + 1);
    });

    done();
  });

  it('should get the row', function(done) {
    var row;
    
    (function() {
      row = list.get(2)
    }).should.not.throw();

    should.exist(row);
    row.id().should.equal(2);
    row.name().should.equal('danio');
    done();
  });

  it('should delete the row', function(done) {
    var row;

    (function() {
      row = list.delete(3);
    }).should.not.throw();

    should.exist(row);
    row.id().should.equal(3);
    row.name().should.equal('discus');

    list.length().should.equal(4);
    done();
  });

  it('should not get the row', function(done) {
    var row;
    
    (function() {
      row = list.get(3)
    }).should.not.throw();

    should.not.exist(row);
    done();
  });

  it('should insert a row', function(done) {
    var row = {
      id: ko.observable(20),
      name: ko.observable('loach')
    };

    (function() {
      list.insert(row, false);
    }).should.not.throw();

    var new_row = list.get(20);

    should.exist(new_row);
    new_row.id().should.equal(20);
    new_row.name().should.equal('loach');

    list.length().should.equal(5);
    done();
  });

  it('should clobber the row', function(done) {
    var row = {
      id: ko.observable(20),
      name: ko.observable('goby')
    };

    (function() {
      list.insert(row, true);
    }).should.not.throw();

    var new_row = list.get(20);

    should.exist(new_row);
    new_row.id().should.equal(20);
    new_row.name().should.equal('goby');

    list.length().should.equal(5);
    done();
  });

  it('should get an error', function(done) {
    var row = {
      id: ko.observable(20),
      name: ko.observable('loach')
    };

    (function() {
      list.insert(row, false);
    }).should.throw();

    var new_row = list.get(20);

    should.exist(new_row);
    new_row.id().should.equal(20);
    new_row.name().should.equal('goby');

    list.length().should.equal(5);
    done();
  });
});

describe('Table Management', function() {
  var instance_stub;
  var test_context;
  var table;

  var table_name = 'oxbow';
  var list_name = table_name + 's';
  var columns = {
    species: { type: 'string' },
    count: { type: 'integer' }
  };

  before(function(done) {
    test_context = new TestContext();
    test_context[list_name] = new orm.table.list(table_name);
    done();
  });

  before(function(done) {
    table = new orm.table(
      test_context,
      table_name,
      table_name,
      './' + table_name,
      columns
    );
    done();
  });
  
  before(function(done) {
    var stub_service = {
      post: function(url, callback, data) {
        url.should.equal('./' + table_name);

        var req_body = {};
        Object.keys(data).forEach(function(column_name) {
          column_name.should.not.equal('description');
          ko.isObservable(data[column_name]).should.be.false;
          req_body[column_name] = data[column_name];
        });
        req_body.id = 1;
        var req_model = {};
        req_model[table_name] = req_body;
        callback(200, req_model);
      },
      delete: function(url, callback) {
        url.should.equal('./' + table_name + '?id=2');

        callback(200, {id: 2});
      },
      get: function(url, callback) {
        var req_model = {};
        if (url == './' + table_name) {
          req_model['all_' + table_name + 's'] = [{
            id: 4,
            species: 'salmon',
            count: 38
          }, {
            id: 5,
            species: 'mbuna',
            count: 2530
          }];
        } else {
          url.should.eql('./' + table_name + '?id=3')

          req_model[table_name] = {
            id: 3,
            species: 'bass',
            count: 5
          };
        }

        callback(200, req_model);
      }
    };
    instance_stub = sinon.stub(service, 'getInstance', function() { return stub_service; });
    done();
  });

  after(function(done) {
    test_context = null;
    table = null;
    done();
  });

  it('should call the create api', function(done) {
    table.create({
      id: ko.observable(1),
      species: ko.observable('trout'),
      count: ko.observable(540),
      description: ko.observable('Trout are plentiful')
    }, function(result_code, result) {
      should.not.exist(result_code);
      should.exist(result);

      result.should.have.property('id');
      ko.isObservable(result.id).should.be.true;
      result.id().should.equal(1);

      result.should.have.property('species');
      ko.isObservable(result.species).should.be.true;
      result.species().should.equal('trout');

      result.should.have.property('count');
      ko.isObservable(result.count).should.be.true;
      result.count().should.equal(540);

      var list_row = table.list.get(1);
      should.exist(list_row);

      done();
    });
  });

  it('should call the delete api', function(done) {
    table.list.insert({
      id: ko.observable(2),
      species: ko.observable('tilapia'),
      count: ko.observable(1000)
    });
    table.delete(2, function(result_code, result) {
      should.not.exist(result_code);
      should.exist(result);

      result.should.have.property('id');
      ko.isObservable(result.id).should.be.true;
      result.id().should.equal(2);

      result.should.have.property('species');
      ko.isObservable(result.species).should.be.true;
      result.species().should.equal('tilapia');

      result.should.have.property('count');
      ko.isObservable(result.count).should.be.true;
      result.count().should.equal(1000);

      var list_row = table.list.get(2);
      should.not.exist(list_row);

      done();
    });
  });

  it('should call the get api', function(done) {
    table.get(3, function(result_code, result) {
      should.not.exist(result_code);
      should.exist(result);

      result.should.have.property('id');
      ko.isObservable(result.id).should.be.true;
      result.id().should.equal(3);

      result.should.have.property('species');
      ko.isObservable(result.species).should.be.true;
      result.species().should.equal('bass');

      result.should.have.property('count');
      ko.isObservable(result.count).should.be.true;
      result.count().should.equal(5);

      var list_row = table.list.get(3);
      should.exist(list_row);

      done();
    });
  });

  it('should call the load api', function(done) {
    table.load(function(result_code, result) {
      should.not.exist(result_code);
      should.exist(result);

      result[0].should.have.property('id');
      ko.isObservable(result[0].id).should.be.true;
      result[0].id().should.equal(4);

      result[0].should.have.property('species');
      ko.isObservable(result[0].species).should.be.true;
      result[0].species().should.equal('salmon');

      result[0].should.have.property('count');
      ko.isObservable(result[0].count).should.be.true;
      result[0].count().should.equal(38);

      var list_row = table.list.get(4);
      should.exist(list_row);

      result[1].should.have.property('id');
      ko.isObservable(result[1].id).should.be.true;
      result[1].id().should.equal(5);

      result[1].should.have.property('species');
      ko.isObservable(result[1].species).should.be.true;
      result[1].species().should.equal('mbuna');

      result[1].should.have.property('count');
      ko.isObservable(result[1].count).should.be.true;
      result[1].count().should.equal(2530);

      list_row = table.list.get(5);
      should.exist(list_row);

      table.list.length().should.equal(2);

      done();
    });
  });
});
