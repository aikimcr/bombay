describe('form_dialog', function() {
  describe('#show_and_hide', function() {
    var dlg;

    after(function(done) {
      if (dlg.dialogOpen()) {
        dlg.dismiss();
      }
      done();
    });

    it('should show the dialog', function(done) {
      dlg = new form_dialog('Test Dialog');
      dlg.show();

      var dlg_div = document.querySelector('div.dialog');
      should.exist(dlg_div);

      var title_bar = document.querySelector('div.dialog div.title_bar');
      should.exist(title_bar);

      var title_div = document.querySelector('div.dialog div.title_bar div.title');
      should.exist(title_div);
      title_div.innerHTML.should.eql('Test Dialog');

      var close_button = document.querySelector('div.dialog div.title_bar div.close_button');
      should.exist(close_button);
      close_button.innerHTML.should.eql('X');

      var body = document.querySelector('div.dialog div.dialog_body');
      should.exist(body);
      body.isSameNode(dlg.getElement()).should.be.true;

      dlg.dialogOpen().should.be.true;
      done();
    });

    it('should hide the dialog', function(done) {
      dlg.dismiss();
      var dlg_div = document.querySelector('div.dialog');
      should.not.exist(dlg_div);
      dlg.dialogOpen().should.be.false;
      done();
    });

    it('should dismiss the dialog on escape key', function(done) {
      dlg.show();
      var dlg_div = document.querySelector('div.dialog');
      dlg.dialogOpen().should.be.true;
      var key_event = new CustomEvent('keydown', {bubbles: true});
      key_event.keyCode = 27;
      dlg.getElement().dispatchEvent(key_event);
      dlg_div = document.querySelector('div.dialog');
      should.not.exist(dlg_div);
      dlg.dialogOpen().should.be.false;
      done();
    });

    it('should dismiss the dialog on close button', function(done) {
      dlg.show();
      var dlg_div = document.querySelector('div.dialog');
      dlg.dialogOpen().should.be.true;
      var close_button = document.querySelector('div.dialog div.title_bar div.close_button');
      fireClick(close_button);
      dlg_div = document.querySelector('div.dialog');
      should.not.exist(dlg_div);
      dlg.dialogOpen().should.be.false;
      done();
    });
  });

  describe('#events', function() {
    var dlg;
    var listener;

    before(function(done) {
      dlg = new form_dialog('Test Dialog');
      dlg.show();
      done();
    });

    after(function(done) {
      dlg.removeEventListener('dialog_dismissed', listener);
      done();
    });

    it('should fire the dialog dismissed action', function(done) {
      listener = function(e) {
        e.type.should.eql('dialog_dismissed');
        done();
      };

      dlg.addEventListener('dialog_dismissed', listener);
      dlg.dismiss();
    });
  });
});
