var should = require('should');

var util = require('lib/util');

describe('util', function() {
  it("should return a new object from two objects", function (done) {
    var new_obj = util.obj_merge({thing1: 'lamp', thing2: 'table'}, {thing3: 'chair'});
    should.exist(new_obj);
    new_obj.should.eql({thing1: 'lamp', thing2: 'table', thing3: 'chair'});
    done();
  });
  
  it('should take the last value for a key', function(done) {
    var new_obj = util.obj_merge({thing1: 'sedan'}, {thing1: 'pickup'});
    should.exist(new_obj);
    new_obj.should.eql({thing1: 'pickup'});
    done();
  });
   
  it('should recursively merge objects', function(done) {
    var new_obj = util.obj_merge({
      thing1: {sub_thing1: 'bulb', sub_thing2: 'flower'},
      thing2: {sub_thing1: 'bush', sub_thing3: 'tree'}
    }, {
      thing1: {sub_thing3: 'weed'},
      thing2: {sub_thing1: 'rock'},
      thing3: {sub_thing1: 'grass'}
    });
    should.exist(new_obj);
    new_obj.should.eql({
      thing1: {sub_thing1: 'bulb', sub_thing2: 'flower', sub_thing3: 'weed'},
      thing2: {sub_thing1: 'rock', sub_thing3: 'tree'},
      thing3: {sub_thing1: 'grass'}
    });
    done();
  });
});
