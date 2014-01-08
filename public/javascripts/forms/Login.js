function validateLogin(e) {
  window.console.log(e);
  var form = e.target;
  var pk = form.querySelector('input[name="pubkey"]');
  var pw = form.querySelector('input[name="password"]');
  var ev = util.encrypt(pk.value, pw.value);
  pw.value = ev;
  return true;
}
