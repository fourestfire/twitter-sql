'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db');

// router.get('/', function(req, res){
//
//     res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
//     console.log(tweets)
// });

function respondWithAllTweets (req, res, next){
  client.query('SELECT *, tweets.id AS tweet_id FROM tweets INNER JOIN users ON tweets.user_id = users.id', function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;

    res.render('index', {
      title: 'Twitter.js',
      tweets: tweets,
      showForm: true
    });
  });
}

// here we basically treat the root view and tweets view as identical
router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);

// single-user page
router.get('/users/:username', function(req, res, next){
  client.query('SELECT content FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE name = $1', [req.params.username], function(err,data){
    if (err) throw err;
    var userTweets = data.rows
    res.render('index', {
      title: 'Twitter.js',
      tweets: userTweets,
      showForm: true,
      username: req.params.username
    });
  });
});

// single-tweet page
router.get('/tweets/:id', function(req, res, next){
  client.query('SELECT content FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE tweets.id = $1', [req.params.id], function(err,data){
    if (err) throw err;
    var tweetsWithThatId = data.rows
    res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsWithThatId // an array of only one element ;-)
    });
  });
});


// create a new tweet
router.post('/tweets', function(req, res, next){

client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function(err, data) {
  if (err) throw err;
  var userID = data.rows[0];
  if (userID) {
    client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [userID.id, req.body.text], function (err, data) {
      if(err) throw err;
    });
  } else {
    client.query('INSERT INTO users (name, picture_url) VALUES ($1, $2)', [req.body.name, 'http://lorempixel.com/48/48'] )
    client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function(err, data) {
      if (err) throw err;
      var userID = data.rows[0];
      console.log(userID)
      client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [userID.id, req.body.text])
    });
  }
});
  res.redirect('/');
});

// // replaced this hard-coded route with general static routing in app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });

module.exports = router;
