'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

// import the functions

var functs = require('./functs');

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

app.get('/', function (req, res)
{
    console.log("plain GET request");
    res.send('Hello World, I would like to be a chat bot')
})

// for Facebook verification
app.get('/webhook', function (req, res)
{
    console.log("/webhook Verify Token");

    // Facebook verification

    console.log("Verify Token sent");
    if (req.query['hub.mode'] === 'subscribe')
    {
        console.log("Subscribe Verify Token, check: " + req.query['hub.verify_token']);
        if (req.query['hub.verify_token'] === 'YOUR_TOKEN')
        {
            console.log("Validating webhook");
            res.send(req.query['hub.challenge'])
        }
        else
        {
            console.log("Oh No, invalid Verify Token: " + req.query['hub.verify_token']);
            res.send("Error, wrong token.");
        }
    }
    else
    {
        console.log("not subscribing");
        res.send('Hello world')
    }
});

// Process Facebook Messenger Requests

app.post('/webhook', function (req, res)
{
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object === 'page')
    {
        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry)
        {
        var pageID = entry.id;
        var timestamp = entry.time;

        // Iterate over each messaging event
        entry.messaging.forEach(function(event)
        {
            if (event.message) 
            {
                if (event.message.is_echo)
                      console.log("Bot received message written event");
                else
                      console.log("Bot received message " + event.message.text);
            }
            else  if (event.delivery)
              console.log("Bot received delivery event");
            else  if (event.read)
              console.log("Bot received message-was-read event");
            else  if (event.postback)
              functs.doPostback(event);
            else
              console.log("Bot received unknown EVENT: ");
          });
        });
    }
    else 
    {
      console.log("Bot received unknown OBJECT (not page): ", data.object);
    }

    // All good, sent response status 200

    res.sendStatus(200)
});

// Spin up the server
app.listen(app.get('port'), function()
{
    console.log('running on port', app.get('port'))
})
