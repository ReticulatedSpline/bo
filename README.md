# Groupme Chatbot

## Introduction

Groupme recently released a chatbot called 'Zo', and it isn't very useful. I've decided to make my own with a fresh and creative name.

## Technical

Bo is build with [Node.js](https://nodejs.org/en/about/), a [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.8.5) server-side runtime. The setup is similar to the documentation on GroupMe's [development site.](https://dev.groupme.com/tutorials/bots) The bot is deployed on a cloud platform called [Heroku.](https://devcenter.heroku.com/)

## Accepted Queries

You can interact with Bo with the trigger phrase, `@Bo`.

Then, append any of the following words to your query and it will attempt to complete them:

`help | about`: This menu.

`flip a coin`: Heads or tails.

`source`: See me nude on github.

`number between from <x> <y>`: Random int of domain [x, y].

`weather`: Current conditions in Duluth, MN

`weather in <city>, <state>`: Comma required.

`weather forecast`: Future conditions.

`quote`: Some inspiration.

## Deployment

Bo is deployed to Heroku [here,](https://groupme-ratbot.herokuapp.com/) but to really interact you'd have to be in a GroupMe chat!
