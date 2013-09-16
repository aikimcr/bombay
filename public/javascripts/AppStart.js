var app = {};

function AppStart() {
  var window_hash = window.location.hash;

  if (window_hash) {
    var wlh = window_hash.match(/(.*)\?(.*)/);
    if (wlh && wlh.length > 2) {
      window.location.replace(window.location.origin + '?' + wlh[2] + wlh[1]);
    }
  }

  var band_selector = Util.getBandSelector();
  var search = document.location.search;
  var parsed_search = {};

  if (search) {
    var terms = search.match(/\?(.*)/)[1].split(/&/);
    terms.forEach(function(term) {
      var keyval = term.split(/=/);
      parsed_search[keyval[0]] = keyval[1];
    });
  }

  if (parsed_search.band_id) band_selector.value = parsed_search.band_id;

  app = new AppContext();
  app.render();

  var url_hash = document.location.hash;
  if (!url_hash) url_hash = "#person_profile";
  var target_link = document.querySelector('a[href="' + url_hash + '"]');
  if (target_link) target_link.click();

  if (band_selector) {
    band_selector.addEventListener('change', function(e) {
      app.redraw();
    });
  }

  var app_container = document.querySelector('.app_container');
  var ac_cb = function(e) {
   window.console.log(e);
  };

  if (app_container) {
    app_container.addEventListener('submit', ac_cb);
    app_container.addEventListener('change', ac_cb);
  }
};
