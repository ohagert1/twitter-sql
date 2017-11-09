'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    // var allTheTweets = tweetBank.list();
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: allTheTweets,
    //   showForm: true
    // });
    client.query('SELECT users.name, users.picture_url, tweets.content, tweets.id FROM tweets JOIN users ON users.id=tweets.user_id', function(err, result ) {
      if(err) return next(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true});
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    // var tweetsForName = tweetBank.find({ name: req.params.username });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsForName,
    //   showForm: true,
    //   username: req.params.username
    // });
    client.query('SELECT users.name, users.picture_url, tweets.content, tweets.id FROM users JOIN tweets ON users.id = tweets.user_id WHERE users.name=$1 ', [req.params.username], function(err, result ) {
      if(err) return next(err);
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true});
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    // res.render('index', {
    //   title: 'Twitter.js',
    //   tweets: tweetsWithThatId // an array of only one element ;-)
    client.query('SELECT * FROM tweets JOIN users ON users.id = tweets.user_id WHERE tweets.id = $1', [req.params.id],
    function(err, result ) {
      if(err) return next(err);
      var tweets = result.rows;
      console.log(tweets);
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true});
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    var name = req.body.name;
    var content = req.body.content;
    // io.sockets.emit('new_tweet', newTweet);
    client.query('SELECT users.id FROM users WHERE users.name = $1', [name], function(err, result ) {
      if(err) return next(err);
      if (result.rows.length === 0){
        client.query('INSERT INTO users (name, picture_url) VALUES ($1, $2)', [name, 'http://i.imgur.com/MItGWVS.jpg']);
      }
      client.query('INSERT INTO tweets (user_id, content) VALUES ((SELECT id from users where name=$1), $2)', [name, content])
      res.redirect('/');
    });

  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
};


