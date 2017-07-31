var HTTPS = require('https');

var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
  //callback trigger probably shouldn't be in the response...
      botRegex = /\@Bo/;

  if(request.text && botRegex.test(request.text)) {
    console.log("Trigger detected...");
    this.res.writeHead(200);
    postMessage(this.parseRequest(request.text));
    this.res.end();
  } else {
    console.log("Untriggered response detected!");
    this.res.writeHead(500);
    this.res.end();
  }
}

function parseRequest(String req) {
  req.includes('about') && return this.buildAbout();
}

buildAbout() {
  return new String(__dirname/README.md);
}

function postMessage() {
  var botResponse, options, body, botReq;

  botResponse = "Get out me swamp!";

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
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;
