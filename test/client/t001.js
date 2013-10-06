var should = chai.should();

describe('util', function() {
  describe('#removeAllChildren', function() {
    var parent;
    before(function (done) {
      parent = document.createElement('div');
      for(var i = 0; i < 5; i++) {
        var child = document.createElement('div');
        for(var j = 0; j < 5; j++) {
          var grand_child = document.createElement('div');
          child.appendChild(grand_child);
        }
        parent.appendChild(child);
      }
      done();
    });
    
    it('should remove all the children', function(done) {
      parent.children.length.should.equal(5);
      util.removeAllChildren(parent);
      parent.children.length.should.equal(0);
      done();
    });
  });
});