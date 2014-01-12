// Third Party modules
var email = require('emailjs');

// Bombay modules
var util = require('lib/util');

exports.send_report = function(report_info, report_file) {
  var mail_info_string = util.get_mail_file();
  var mail_info = JSON.parse(mail_info_string);
  var private_pem = util.get_private_pem();

  var server  = email.server.connect({
    user: mail_info.user, 
    password: util.decrypt(private_pem, mail_info.password), 
    host: mail_info.server, 
    port: 465,
    tls: true,
  });

  var report_attachment = {
    path: report_file,
    type: "text/html",
    name: report_info.report_name,
    alternative: true
  };

  var message = {
    text: mail_info.url + '/' + report_file, 
    from: mail_info.sender, 
    to: report_info.to_address,
    subject: report_info.report_subject,
    attachment: report_attachment
  };

  console.log(message);

  // send the message and get a callback with an error or details of the message that was sent
  server.send(message, function(err, message) { console.log(err || message); });
};
