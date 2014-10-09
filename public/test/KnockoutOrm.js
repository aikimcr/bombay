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

  describe('basic operations', function() {
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
        row = list.get(3);
      }).should.not.throw();

      should.not.exist(row);
      done();
    });

    it('should find the rows using field match', function(done) {
      var rows;

      (function() {
        rows = list.find({name: 'danio'});
      }).should.not.throw();

      should.exist(rows);
      rows.length.should.equal(1);
      rows[0].id().should.equal(2);
      rows[0].name().should.equal('danio');

      done();
    });

    it('should find the rows using a filter', function(done) {
      var rows;

      (function() {
        rows = list.find(function(row) {
          return row.name().match(/an/);
        });
      }).should.not.throw();

      should.exist(rows);
      rows.length.should.equal(2);

      rows[0].id().should.equal(1);
      rows[0].name().should.equal('angel');

      rows[1].id().should.equal(2);
      rows[1].name().should.equal('danio');

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

  describe('sorting', function() {
    var sort;

    before(function(done) {
      list = new orm.table.list('Oxbow');
      done();
    });

    before(function(done) {
      start_list = [];
      for(var i=1;i<=5;i++) {
        start_list.push({
          id: ko.observable(i),
          name: ko.observable(list_names[i])
        });
      }
      var error = list.set(start_list);
      done();
    });

    after(function(done) {
      list = null;
      done();
    });

    it('should create a sort', function(done) {
      sort = new orm.table.list.sort(list);
      should.exist(sort);
      done();
    });

    it('should add a field compare', function(done) {
      sort.addCompare('name_asc', 'Name Ascending', 'name');
      sort.sort_type().should.equal('name_asc');
      sort.labels().should.eql([{
        value: 'name_asc', label: 'Name Ascending'
      }]);
      var sorted = sort.getList();
      sorted.length.should.eql(list.length());
      var indexes = [[0, 0], [1, 1], [2, 2], [3, 4], [4, 3]];
      
      indexes.forEach(function(index) {
        sorted[index[0]].id().should.equal(list.list()[index[1]].id());
        sorted[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });

    it('should add an object compare', function(done) {
      sort.addCompare('name_desc', 'Name Descending', {name: 'desc'});
      sort.sort_type().should.equal('name_asc');
      sort.labels().should.eql([{
        value: 'name_asc', label: 'Name Ascending'
      }, {
        value: 'name_desc', label: 'Name Descending'
      }]);
      var sorted = sort.getList();
      sorted.length.should.eql(list.length());
      var indexes = [[0, 0], [1, 1], [2, 2], [3, 4], [4, 3]];
      
      indexes.forEach(function(index) {
        sorted[index[0]].id().should.equal(list.list()[index[1]].id());
        sorted[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });

    it('should set the sort_type', function(done) {
      sort.setType('name_desc');
      var sorted = sort.getList();
      sorted.length.should.eql(list.length());
      var indexes = [[0, 3], [1, 4], [2, 2], [3, 1], [4, 0]];
      
      indexes.forEach(function(index) {
        sorted[index[0]].id().should.equal(list.list()[index[1]].id());
        sorted[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });
  });

  describe('filters', function() {
    var filter;

    before(function(done) {
      list = new orm.table.list('Oxbow');
      done();
    });

    before(function(done) {
      start_list = [];
      for(var i=1;i<=5;i++) {
        start_list.push({
          id: ko.observable(i),
          name: ko.observable(list_names[i])
        });
      }
      var error = list.set(start_list);
      done();
    });

    after(function(done) {
      list = null;
      done();
    });

    it('should create a filter', function(done) {
      filter = new orm.table.list.filter(list);
      should.exist(filter);
      done();
    });

    it('should return the original list', function(done) {
      var filtered = filter.getList();
      filtered.length.should.eql(list.list().length);

      var indexes = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]];
      
      indexes.forEach(function(index) {
        filtered[index[0]].id().should.equal(list.list()[index[1]].id());
        filtered[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });

    it('should still get the original list', function(done) {
      filter.setActive(true);
      var filtered = filter.getList();
      filtered.length.should.eql(list.list().length);

      var indexes = [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]];
      
      indexes.forEach(function(index) {
        filtered[index[0]].id().should.equal(list.list()[index[1]].id());
        filtered[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });

    it('should get only get the first two rows', function(done) {
      filter.setCompare(function(row) {
        return row.id() === 1 || row.id() === 2;
      }.bind(filter));

      filter.setActive(true);
      var filtered = filter.getList();
      filtered.length.should.eql(2);

      var indexes = [[0, 0], [1, 1]];
      
      indexes.forEach(function(index) {
        filtered[index[0]].id().should.equal(list.list()[index[1]].id());
        filtered[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });

    it('should create a match filter', function(done) {
      filter = null;
      filter = orm.table.list.filter.columnFilterFactory(list, 'match', 'name');
      should.exist(filter);
      filter.setFilterValue('an');

      var filtered = filter.getList();
      filtered.length.should.eql(2);

      var indexes = [[0, 0], [1, 1]];
      
      indexes.forEach(function(index) {
        filtered[index[0]].id().should.equal(list.list()[index[1]].id());
        filtered[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });
  });

  describe('chains', function() {
    var sort;
    var filter;

    before(function(done) {
      list = new orm.table.list('Oxbow');
      done();
    });

    before(function(done) {
      start_list = [];
      for(var i=1;i<=5;i++) {
        start_list.push({
          id: ko.observable(i),
          name: ko.observable(list_names[i])
        });
      }
      var error = list.set(start_list);
      done();
    });

    before(function(done) {
      filter = orm.table.list.filter.columnFilterFactory(list, 'match', 'name');
      filter.setFilterValue('e');
      done();
    });

    after(function(done) {
      list = null;
      sort = null;
      filter = null;
      done();
    });

    it('should chain the sort', function(done) {
      sort = new orm.table.list.sort(filter.getList);
      sort.addCompare('name_desc', 'Name Descending', {name: 'desc'});
      sort.setType('name_desc');
      done();
    });

    it('should get the sorted, filtered rows', function(done) {
      var filtered = sort.getList();
      filtered.length.should.eql(3);

      var indexes = [[0, 3], [1, 4], [2, 0]];
      
      indexes.forEach(function(index) {
        filtered[index[0]].id().should.equal(list.list()[index[1]].id());
        filtered[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });

    it('should get them again', function(done) {
      list.insert({id: ko.observable(30), name: ko.observable('tropheus')});
      var filtered = sort.getList();
      filtered.length.should.eql(4);

      var indexes = [[0, 3], [1, 5], [2, 4], [3, 0]];
      
      indexes.forEach(function(index) {
        filtered[index[0]].id().should.equal(list.list()[index[1]].id());
        filtered[index[0]].name().should.equal(list.list()[index[1]].name());
      });

      done();
    });
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
    instance_stub.restore();
    instance_stub = null;
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

describe('Joins', function() {
  var instance_stub;
  var test_context;
  var master_table;
  var detail_table;

  before(function(done) {
    var model_list = {
      genus: [
        { id: 1, name: 'pseudotropheus' },
        { id: 2, name: 'labidochromis' },
        { id: 3, name: 'haplochromis' }
      ],
      species: [
        { id: 1, genus_id: 1, name: 'zebra' },
        { id: 2, genus_id: 1, name: 'ater' }
      ]
    };

    var stub_service = {
      post: function(url, callback, data) {
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        var req_body = {};
        var req_model = {};
        Object.keys(data).forEach(function(column_name) {
          req_body[column_name] = data[column_name];
        });
        req_body.id = 4;
        req_model[table_name] = req_body;
        model_list[table_name][3] = req_body;
        callback(200, req_model);
      },
      delete: function(url, callback) {
        var id = url.match(/id=(\d+)/)[1];
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        model_list[table_name][id - 1] = null;
        callback(200, {id: id});
      },
      get: function(url, callback) {
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        var req_model = {};
        if (url == './' + table_name) {
          req_model['all_' + table_name + 's'] = model_list[table_name];
        } else {
          var id = url.match(/id=(\d+)/)[1];
          req_model[table_name] = model_list[table_name][id - 1];
        }

        callback(200, req_model);
      }
    };

    instance_stub = sinon.stub(service, 'getInstance', function() { return stub_service; });
    done();
  });

  before(function(done) {
    test_context = new TestContext();
    master_table = orm.define(test_context, 'genus', {name: {type: 'string'}});

    master_table.load(function(result_code, result) {
      if (result_code) {
        done(result_code);
      } else {
        done();
      }
    });
  });

  after(function(done) {
    test_context = null;
    master_table = null;
    detail_table = null;
    instance_stub.restore();
    instance_stub = null;
    done();
  });

  it('should define a table with a reference to master', function(done) {
    detail_table = orm.define(test_context, 'species', {
      genus_id: {type: 'reference', reference_table: master_table},
      name: {type: 'string'}
    });

    should.exist(detail_table);
    master_table.joins.length.should.equal(1);
    master_table.joins[0].should.have.property('table');
    master_table.joins[0].should.have.property('column_name');
    master_table.joins[0].column_name.should.equal('genus_id');

    detail_table.load(function(result_code, result) {
      should.not.exist(result_code);
      should.exist(result);
      result.length.should.be.greaterThan(0);
      done();
    });
  });

  it('should get the master record', function(done) {
    var detail_row = detail_table.list.get(1);
    should.exist(detail_row);
    detail_row.should.have.property('genus_id');
    ko.isObservable(detail_row.genus_id).should.be.true;

    var master_row = detail_row.genus();
    should.exist(master_row);
    master_row.id().should.equal(detail_row.genus_id());

    done();
  });

  it('should get all the detail records', function(done) {
    var master_row = master_table.list.get(1);
    var detail_rows = master_row.speciesList();
    should.exist(detail_rows);
    detail_rows.length.should.be.greaterThan(0);

    detail_rows.forEach(function(row) {
      row.should.have.property('id');
      ko.isObservable(row.id).should.be.true;
      row.id().should.be.greaterThan(0);

      row.should.have.property('genus_id');
      ko.isObservable(row.genus_id).should.be.true;
      row.genus_id().should.equal(master_row.id());
      
      row.should.have.property('name');
      ko.isObservable(row.name).should.be.true;
    });

    done();
  });
});

describe('Views', function() {
  var instance_stub;
  var test_context;
  var table;
  var view_one;
  var view_two;

  before(function() {
    test_context = new TestContext();

    var model_list = {
      genus: [
        { id: 1, name: 'pseudotropheus' },
        { id: 2, name: 'labidochromis' },
        { id: 3, name: 'haplochromis' },
        { id: 4, name: 'labeotropheus' }
      ],
    };

    var stub_service = {
      post: function(url, callback, data) {
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        var req_body = {};
        var req_model = {};
        Object.keys(data).forEach(function(column_name) {
          req_body[column_name] = data[column_name];
        });
        req_body.id = 4;
        req_model[table_name] = req_body;
        model_list[table_name][3] = req_body;
        callback(200, req_model);
      },
      delete: function(url, callback) {
        var id = url.match(/id=(\d+)/)[1];
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        model_list[table_name][id - 1] = null;
        callback(200, {id: id});
      },
      get: function(url, callback) {
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        var req_model = {};
        if (url == './' + table_name) {
          req_model['all_' + table_name + 's'] = model_list[table_name];
        } else {
          var id = url.match(/id=(\d+)/)[1];
          req_model[table_name] = model_list[table_name][id - 1];
        }

        callback(200, req_model);
      }
    };

    instance_stub = sinon.stub(service, 'getInstance', function() { return stub_service; });
  });

  before(function(done) {
    table = orm.define(
      test_context,
      'genus',
      {name: {type: 'string'}}
    );

    table.load(function(result_code, result) {
      if (result_code) {
        done(result_code);
      } else {
        done();
      }
    });
  });

  after(function() {
    test_context = null;
    table = null;
    instance_stub.restore();
    instance_stub = null;
  });

  it('should define the first table view', function() {
    view_one = new orm.table.view(
      table,
      [{
        name: 'name',
        type: 'match',
        column_name: 'name'
      }],
      [{
        name: 'name_asc',
        label: 'Name (Lo-Hi)',
        definition: {name: 'asc'}
      }, {
        name: 'name_desc',
        label: 'Name (Lo-Hi)',
        definition: {name: 'desc'}
      }]
    );

    should.exist(view_one);
    view_one.should.have.property('filters');
    view_one.filters.should.have.property('name');

    view_one.should.have.property('sort');
    view_one.sort.should.be.instanceof(orm.table.list.sort);
  });

  it('should define the second table view', function() {
    view_two = new orm.table.view(
      table,
      [{
        name: 'name',
        type: 'match',
        column_name: 'name'
      }],
      [{
        name: 'name_asc',
        label: 'Name (Lo-Hi)',
        definition: {name: 'asc'}
      }, {
        name: 'name_desc',
        label: 'Name (Lo-Hi)',
        definition: {name: 'desc'}
      }]
    );

    should.exist(view_two);
    view_two.should.have.property('filters');
    view_two.filters.should.have.property('name');

    view_two.should.have.property('sort');
    view_two.sort.should.be.instanceof(orm.table.list.sort);
  });

  it('should get the "chromis" list, sorted by name ascending', function() {
    view_one.filters.name.setFilterValue('chromis');
    view_one.sort.setType('name_asc');
    var chromis_list = view_one.getList();

    should.exist(chromis_list);
    chromis_list.length.should.equal(2);

    chromis_list[0].name().should.equal('haplochromis');
    chromis_list[1].name().should.equal('labidochromis');
  });

  it('should get the "tropheus" list, sorted by name ascending', function() {
    view_two.filters.name.setFilterValue('tropheus');
    view_two.sort.setType('name_asc');
    var tropheus_list = view_two.getList();

    should.exist(tropheus_list);
    tropheus_list.length.should.equal(2);

    tropheus_list[0].name().should.equal('labeotropheus');
    tropheus_list[1].name().should.equal('pseudotropheus');
  });

  it('should get different lists for each view', function() {
    var chromis_list = view_one.getList();
    var tropheus_list = view_two.getList();

    should.exist(chromis_list);
    should.exist(tropheus_list);
    chromis_list.should.not.eql(tropheus_list);
  });
});

describe('Advanced table definitions', function() {
  var instance_stub;
  var test_context;
  var master_table;
  var detail_table;

  before(function(done) {
    test_context = new TestContext();

    var model_list = {
      genus: [
        { id: 1, name: 'pseudotropheus' },
        { id: 2, name: 'labidochromis' },
        { id: 3, name: 'haplochromis' }
      ],
      species: [
        { id: 1, genus_id: 1, name: 'zebra' },
        { id: 2, genus_id: 1, name: 'ater' },
        { id: 3, genus_id: 1, name: 'elongotus' },
        { id: 4, genus_id: 1, name: 'crabro' },

        { id: 5, genus_id: 2, name: 'caeruleus' },
        { id: 6, genus_id: 2, name: 'gigas' },
        { id: 7, genus_id: 2, name: 'mbenjii' },

        { id: 8, genus_id: 3, name: 'labiatus' },
        { id: 9, genus_id: 3, name: 'gigas' }
      ]
    };

    var stub_service = {
      post: function(url, callback, data) {
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        var req_body = {};
        var req_model = {};
        Object.keys(data).forEach(function(column_name) {
          req_body[column_name] = data[column_name];
        });
        req_body.id = 4;
        req_model[table_name] = req_body;
        model_list[table_name][3] = req_body;
        callback(200, req_model);
      },
      delete: function(url, callback) {
        var id = url.match(/id=(\d+)/)[1];
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        model_list[table_name][id - 1] = null;
        callback(200, {id: id});
      },
      get: function(url, callback) {
        var table_name = url.match(/\.\/(\w+)(\?)*/)[1];
        var req_model = {};
        if (url == './' + table_name) {
          req_model['all_' + table_name + 's'] = model_list[table_name];
        } else {
          var id = url.match(/id=(\d+)/)[1];
          req_model[table_name] = model_list[table_name][id - 1];
        }

        callback(200, req_model);
      }
    };

    instance_stub = sinon.stub(service, 'getInstance', function() { return stub_service; });
    done();
  });

  after(function(done) {
    test_context = null;
    master_table = null;
    detail_table = null;
    instance_stub.restore();
    instance_stub = null;
    done();
  });

  it('should define a table with filters', function() {
    master_table = orm.define(
      test_context,
      'genus',
      {name: {type: 'string'}},
      {
        filters: [{
          name: 'maxSpecies',
          type: 'max',
          column_name: 'speciesCount'
        }, {
          name: 'minSpecies',
          type: 'min',
          column_name: 'speciesCount'
        }, {
          name: 'name',
          type: 'match',
          column_name: 'name'
        }],
        sort: [{
          name: 'name_asc',
          label: 'Name (Lo-Hi)',
          definition: {name: 'asc'}
        }, {
          name: 'name_desc',
          label: 'Name (Hi-Lo)',
          definition: {name: 'desc'}
        }, {
          name: 'species_count_asc',
          label: 'Species Count (Lo-Hi)',
          definition: {speciesCount: 'asc'}
        }, {
          name: 'species_count_desc',
          label: 'Species Count (Hi-Lo)',
          definition: {speciesCount: 'desc'}
        }]
      }
    );

    should.exist(master_table);
    master_table.should.have.property('filters');
    master_table.filters.should.have.property('maxSpecies');
    master_table.filters.should.have.property('minSpecies');
    master_table.filters.should.have.property('name');

    master_table.should.have.property('sort');
    master_table.sort.should.be.instanceof(orm.table.list.sort);

    master_table.should.have.property('views');
    master_table.views.should.have.property('default');
    master_table.views.default.should.be.instanceof(orm.table.view);

    master_table.views.default.should.have.property('filters');
    master_table.views.default.filters.should.have.property('maxSpecies');
    master_table.views.default.filters.should.have.property('minSpecies');
    master_table.views.default.filters.should.have.property('name');

    master_table.views.default.should.have.property('sort');
    master_table.views.default.sort.should.be.instanceof(orm.table.list.sort);
  });

  it('should define the detail table', function() {
    var filter_defines = [{
      name: 'name',
      type: 'match',
      column_name: 'name'
    }, {
      name: 'genus_id',
      type: 'id',
      select_list: {
        row_list: master_table.list,
        label_column: 'name'
      },
      column_name: 'genus_id'
    }];

    var sort_defines = [{
      name: 'name_asc',
      label: 'Name (Lo-Hi)',
      definition: {name: 'asc'}
    }, {
      name: 'name_desc',
      label: 'Name (Hi-Lo)',
      definition: {name: 'desc'}
    }, {
      name: 'genus_name_asc',
      label: 'Genus Name (Lo-Hi)',
      definition: {genus_name: 'asc'}
    }, {
      name: 'genus_name_desc',
      label: 'Genus Name (Hi-Lo)',
      definition: {genus_name: 'desc'}
    }];

    detail_table = orm.define(
      test_context, 
      'species', {
        genus_id: {type: 'reference', reference_table: master_table},
        name: {type: 'string'}
      },
      {
        filters: filter_defines,
        sort: sort_defines,
        computes: [{
          name: 'genus_name',
          parent: 'genus',
          column_name: 'name'
        }],
        views: [{
          name: 'alternate',
          filters: filter_defines,
          sort: sort_defines,
        }]
      }
    );

    should.exist(detail_table);
    detail_table.should.have.property('filters');
    detail_table.filters.should.have.property('name');

    detail_table.should.have.property('sort');
    detail_table.sort.should.be.instanceof(orm.table.list.sort);

    detail_table.should.have.property('views');
    detail_table.views.should.have.property('default');
    detail_table.views.default.should.be.instanceof(orm.table.view);

    detail_table.views.default.should.have.property('filters');
    detail_table.views.default.filters.should.have.property('name');

    detail_table.views.default.should.have.property('sort');
    detail_table.views.default.sort.should.be.instanceof(orm.table.list.sort);

    detail_table.views.should.have.property('alternate');
    detail_table.views.alternate.should.be.instanceof(orm.table.view);

    detail_table.views.alternate.should.have.property('filters');
    detail_table.views.alternate.filters.should.have.property('name');

    detail_table.views.alternate.should.have.property('sort');
    detail_table.views.alternate.sort.should.be.instanceof(orm.table.list.sort);
  });

  it('should load the records', function(done) {
    master_table.load(function(result_code, result) {
      if (result_code) {
        done(result_code);
      } else {
        detail_table.load(function(result_code, result) {
          if (result_code) {
            done(result_code);
          } else {
            done();
          }
        });
      }
    });
  });

  it('should get all the master_rows sorted by name, ascending', function() {
    master_table.sort.setType('name_asc');
    var genus_list = master_table.sort.getList();

    should.exist(genus_list);
    genus_list.length.should.equal(3);

    genus_list[0].name().should.equal('haplochromis');
    genus_list[1].name().should.equal('labidochromis');
    genus_list[2].name().should.equal('pseudotropheus');
  });

  it('should get all the master rows with at least three species', function() {
    master_table.sort.setType('name_asc');
    master_table.filters['minSpecies'].setFilterValue(3);
    var genus_list = master_table.sort.getList();
    
    should.exist(genus_list);
    genus_list.length.should.equal(2);

    genus_list[0].name().should.equal('labidochromis');
    genus_list[1].name().should.equal('pseudotropheus');
  });

  it('should get all the master rows with at exactly three species', function() {
    master_table.sort.setType('name_asc');
    master_table.filters['minSpecies'].setFilterValue(3);
    master_table.filters['maxSpecies'].setFilterValue(3);
    var genus_list = master_table.sort.getList();
    
    should.exist(genus_list);
    genus_list.length.should.equal(1);

    genus_list[0].name().should.equal('labidochromis');
  });

  it('should get the master rows with a name matching "chromis" sorted by name, descending', function() {
    master_table.sort.setType('name_desc');
    master_table.filters['minSpecies'].clearFilterValue();
    master_table.filters['maxSpecies'].clearFilterValue();
    master_table.filters['name'].setFilterValue('chromis');
    var genus_list = master_table.sort.getList();
    
    should.exist(genus_list);
    genus_list.length.should.equal(2);

    genus_list[0].name().should.equal('labidochromis');
    genus_list[1].name().should.equal('haplochromis');
  });

  it('should get all the master_rows sorted by species count, descending', function() {
    master_table.sort.setType('species_count_desc');
    master_table.filters['name'].clearFilterValue();
    var genus_list = master_table.sort.getList();

    should.exist(genus_list);
    genus_list.length.should.equal(3);

    genus_list[0].name().should.equal('pseudotropheus');
    genus_list[1].name().should.equal('labidochromis');
    genus_list[2].name().should.equal('haplochromis');
  });

  it('should get all the detail_rows sorted by genus name, ascending', function() {
    detail_table.sort.setType('genus_name_asc');
    var species_list = detail_table.sort.getList();

    should.exist(species_list);
    species_list.length.should.equal(9);

    species_list[0].genus_name().should.equal('haplochromis');
    species_list[1].genus_name().should.equal('haplochromis');
    species_list[2].genus_name().should.equal('labidochromis');
    species_list[3].genus_name().should.equal('labidochromis');
    species_list[4].genus_name().should.equal('labidochromis');
    species_list[5].genus_name().should.equal('pseudotropheus');
    species_list[6].genus_name().should.equal('pseudotropheus');
    species_list[7].genus_name().should.equal('pseudotropheus');
    species_list[8].genus_name().should.equal('pseudotropheus');
  });

  it('should get the detail_rows for genus_id one, sorted by name, ascending', function() {
    detail_table.sort.setType('name_asc');
    detail_table.filters['genus_id'].setFilterValue(1);
    var species_list = detail_table.sort.getList();

    should.exist(species_list);
    species_list.length.should.equal(4);

    species_list[0].name().should.equal('ater');
    species_list[1].name().should.equal('crabro');
    species_list[2].name().should.equal('elongotus');
    species_list[3].name().should.equal('zebra');
  });

  it('should get the select list, sorted by label', function() {
    var select_list = detail_table.filters['genus_id'].select_list();

    should.exist(select_list);
    select_list.length.should.equal(3);

    select_list.should.eql([{
      value: 3, label: 'haplochromis'
    }, {
      value: 2, label: 'labidochromis'
    }, {
      value: 1, label: 'pseudotropheus'
    }]);
  });
});
