var HTTPS = require('https');
var yql = require('yqlp');
const fs = require('fs');

var botID = process.env.BOT_ID;
var sourceLink = "https://github.com/ReticulatedSpline/Groupme-Chatbot";
var e = "Trigger detected: ";

function parseResponse() {
  var request = JSON.parse(this.req.chunks[0]),
    //callback trigger probably shouldn't be in the response...
    botRegex = /\@Bo/;

  if (request.text &&
    botRegex.test(request.text) &&
    request.sender_type != "bot") {
    var botResponse = "@Ben something went wrong!";

    switch (true) {
      case (/source/i.test(request.text)):
        console.log(e + "sourcecode");
        botResponse = sourceLink;
        break;
      case (/about|help|(who are)/i.test(request.text)):
        botResponse = buildAbout();
        break;
      case (/flip.*coin/.test(request.text)):
        botResponse = buildCoinFlip();
        break;
      case (/.*number.*between/.test(request.text)):
        botResponse = buildNumPick(request.text);
        break;
      case (/weather/.test(request.text)):
        buildWeather(request.text).then(function(result) {
          console.log("Thenning...")
          botResponse = result;
        });
        break;
      default:
        console.log(e + "basecase");
        botResponse = "My responses are limited. You can see a list of valid" +
          " queries with `@Bo help`.";
    }

    this.res.writeHead(200);
    postMessage(botResponse);
    this.res.end();
  } /*else {
    this.res.writeHead(200);
    this.res.end();
  }*/
}

function buildAbout() {
  console.log(e + "about");
  return fs.readFileSync(__dirname + '/about.md', 'utf-8');
}

function buildCoinFlip() {
  console.log(e + "coinflip");
  var result = Math.floor(Math.random() * 2);
  return result > 0 ? "The coin was heads!" :
    "The coin was tails.";
}

function buildNumPick(req) {
  console.log(e + "randnum");
  var nums = req.match(/\d+/g);
  if (nums.length != 2) {
    return "You'll have to provide exactly two numbers.";
  }
  var max = Math.max.apply(null, nums);
  var min = Math.min.apply(null, nums);
  return "I choose " + (Math.floor(Math.random() * max) + min) + "!";
}

function buildWeather(req) {
  console.log(e + "weather");
  //@Bo weather in duluth, mn
  var city = req.match(/[a-z]+(?=\,)/);
  var state = req.match(/(?:,\s)(.*)/);
  if (!city || !state) {
    console.log("Invalid arguments. Defaulting...")
    city = "duluth";
    state = "mn";
  } else {
    city = city[0];
    state = state[1];
  }

  console.log("Querying " + city + ", " + state + "...");

  var query = 'select * from weather.forecast where ' +
    'woeid in (select woeid from geo.places(1) ' +
    'where text="' + city + ', ' + state + '")';

  return yql.execp(query, function(err, data) {
    if (err) {
      console.log("YQL Error");
      reject("Sorry, but the request failed.");
    } else {
      console.log("Data retrieved for " + location);
      var location = data.query.results.channel.location;
      var condition = data.query.results.channel.item.condition;
      resolve('It is ' + condition.text + ' in ' + location.city + ', ' +
        location.region + ' and ' + condition.temp + ' degrees.');
    }
  });
}

function postMessage(botResponse) {
  var botResponse, options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id": botID,
    "text": botResponse
  };

  console.log('Sending: \'' + botResponse + '\' to ' + botID + "...");

  botReq = HTTPS.request(options, function(res) {
    if (res.statusCode == 202) {
      console.log('Response code: ' + res.statusCode);
    } else {
      console.log('Response code: ' + res.statusCode);
    }
  });

  botReq.on('error', function(err) {
    console.log('Error posting message ' + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('Timeout posting message ' + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = parseResponse;
