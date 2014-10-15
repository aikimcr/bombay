describe('Instantiate Manager', function() {
  it('should make a manager', function() {
    var new_manager = new Manager();

    should.exist(new_manager);
    should.exist(manager); // Global property.
    manager.should.eql(new_manager);

    var table_types = ['band', 'person', 'artist', 'song', 'band_member', 'band_song', 'song_rating', 'request'];

    table_types.forEach(function(table_type) {
      manager.should.have.property(table_type);
      manager[table_type].should.be.instanceof(orm.table);
    });
 
    should.exist(manager.current_person);
    ko.isObservable(manager.current_person).should.be.true;
    should.not.exist(manager.current_person());

    should.exist(manager.current_band);
    ko.isObservable(manager.current_band).should.be.true;
    should.not.exist(manager.current_band());
  });
});
