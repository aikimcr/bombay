var should = chai.should();

var model = {
  band_admin: null,
  band_id: null,
  other_bands: [{
    id: 5, name: 'Dexter\'s Laboratory'
  }, {
    id: 10, name: 'Samurai Jack'
  }],
  person_bands: [{
    id: 2, name: 'Phineas And Pherb'
  }, {
    id: 3, name: 'The Fairly Odd Parents'
  }],
  person_id: 1,
  system_admin: 1
};

describe('band', function() {
  var test_div;
  beforeEach(function(done) {
    test_div = document.createElement('div');
    document.body.appendChild(test_div);
    done();
  });

  afterEach(function(done) {
    util.removeAllChildren(document.body);
    done();
  });

  describe('#list', function() {
    it('should render the band list form including delete buttons', function(done) {
      var list_form = new app_form.List.Band(model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);
      var table = test_div.firstChild;
      table.tagName.should.eql('TABLE');
      var rows = table.children;
      rows.length.should.eql(3);
      rows[0].children.length.should.eql(2);
      rows[0].children[0].innerHTML.should.eql('<TH>Band Name</TH>');
      done();
    });
  });
});
