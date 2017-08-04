var HTTPS = require('https');
var weather = require('weather-js');
var quote = require('forismatic-node')();
var cron = require('cron').CronJob;
var moment = require('moment');
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
    var botResponse = "Something went wrong!";

    switch (true) {
      case (/source/i.test(request.text)):
        console.log(e + "sourcecode");
        postMessage(sourceLink);
        break;
      case (/about|help|(who are)/i.test(request.text)):
        postMessage(buildAbout());
        break;
      case (/flip.*coin/i.test(request.text)):
        postMessage(buildCoinFlip());
        break;
      case (/.*number.*between|from/i.test(request.text)):
        postMessage(buildNumPick(request.text));
        break;
      case (/weather/i.test(request.text)):
        buildWeather(request.text);
        break;
      case (/quote/i.test(request.text)):
        buildQuote();
        break;
      case (/remind\sme/i.test(request.text)):
        buildReminder(request.text);
        break;
      default:
        postMessage("My responses are limited. You can see a list of valid" +
          " queries with `@Bo help`.");
    }
    this.res.end();
  }
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
    console.log("no|invalid arguments. defaulting...")
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
   weather.find({search: city + ', ' + state, degreeType: 'F'},
   function(err, res){
     if (err) {
       console.log(err);
       return "Sorry, the request could not be completed";
     }
     else {
       if (req.indexOf('forecast') > -1) {
         postMessage("It is " + res[0].current.skytext.toLowerCase() + " and " +
                     res[0].current.temperature + " degrees." +
                     " Tomorrow will be " +
                     res[0].forecast[2].skytextday.toLowerCase() +
                     " with a high of " +
                     res[0].forecast[2].high + " degrees. " +
                     res[0].forecast[3].day + " will be " +
                     res[0].forecast[3].skytextday.toLowerCase() + " and " +
                     res[0].forecast[3].high + " degrees.");
       } else {
         postMessage("It is " + res[0].current.skytext + " and " +
                     res[0].current.temperature + " degrees.");
       }
     }
  });
}

function buildQuote() {
  quote.getQuote(function (error, quote) {
    if (!error) {
      postMessage(quote.quoteText + " -" + quote.quoteAuthor);
    } else {
      postMessage("Sorry, but I couldn't fetch a quote.")
      console.error(error);
    }
  });
}

function buildReminder(req) {
  console.log(e + "reminder")
  req = req.toLowerCase().trim();
  req = req.replace("@bo", "");
  var quant = req.match(/\d(?=\s(minutes?|hours?|days?))/)[0];
  var unit = req.match(/minute|hour|day/)[0];
  if (quant && unit) {
    var res = /(?:me\s)(?:to)?(?:that)?(.*)(?=\sin)/g.exec(req)[1];
    res = "Reminder: " + res;

    console.log("setting cron job for " + quant + " " + unit + "(s) from now.");

    console.log("statement is \'" + res +"\'.");

    var date = moment();
    date.add(quant, unit);

    console.log(date);
    postMessage("Okay, I'll remind you on " + date.format("MMM Do, YYYY") +
                " at " + date.format("h:mma"));
    var reminder = new cron(date.toDate(), function() {
      postMessage(res);
      reminder.stop();
    }, function () {
      console.log("ending cron job")
    }, true, 'America/Chicago');
  } else {
    postMessage("Sorry, I couldn't understand that format.")
  }
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
