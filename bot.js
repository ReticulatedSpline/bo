var HTTPS = require('https');
const fs = require('fs');

var botID = process.env.BOT_ID;

function parseResponse() {
  var request = JSON.parse(this.req.chunks[0]),
  //callback trigger probably shouldn't be in the response...
      botRegex = /\@Bo/;

  if(request.text && botRegex.test(request.text)) {
    console.log("Trigger detected: ");
    let botResponse = "";

    switch (true) {
      case (/about|help|who are/.test(request.text)):
        botResponse = buildAbout();
        break;
      case (/weather/.test(request.text)):
        botResponse = buildWeather();
        break;
    }

    this.res.writeHead(200);
    postMessage(botResponse);
    this.res.end();
  } else {
    console.log("No trigger detected.");
    this.res.writeHead(200);
    this.res.end();
  }
}

function buildAbout() {
  console.log("about")
  return fs.readFileSync(__dirname + '\\README.md');
}

function buildWeather(request) {
  let arr = request.split(" ");
}

function postMessage(botResponse) {
  var botResponse, options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('Response code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('Error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('Timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = parseResponse;
