const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')
const githubOAuth2Data = require('./github_key.json')
const axios = require('axios')
var access_token = "";

const app = express()

app.set('view engine', 'ejs');

const GITHUB_CLIENT_ID = githubOAuth2Data.client_id
const GITHUB_CLIENT_SECRET = githubOAuth2Data.client_secret
const GITHUB_REDIRECT_URL = "https://pki-cloud-backend-ufl3.onrender.com/github/callback"

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;

app.get('/', (req, res) => {
  res.send('<a href="/login">Login with Google</a></br><a href="/github/login">Login with Github</a>');
})

app.get('/login', (req, res) => {
    if (!authed) {
        // Generate an OAuth URL and redirect there
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        console.log(url)
        res.redirect(url);
    } else {
        var oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' })
        oauth2.userinfo.v2.me.get(function(err, result) {
          if (err){
            console.log("Niestety BLAD!!")
            console.log(err)
          } else {
            loggedUser = result.data.name
            console.log(loggedUser)
          }
          res.send('Logged in: '.
            concat(loggedUser, ' <img src"', result.data.picture,
                '"height="23" width="23">', '<br/><a href="/logout">Logout</a>'))
        })
    }
})

app.get('/logout', (req, res) => {
  if (authed){
    oAuth2Client.revokeCredentials(function(err, response) {
      if (err){
        console.error("Błąd podczas wylogowywania:", err);
      } else {
        console.log('Użytkownik został wylogowany.');
      }
    });

    authed = false;
    
  } 
  res.redirect('/');
})

app.get('/auth/google/callback', function (req, res) {
    const code = req.query.code
    if (code) {
      
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/')
            }
        });
    }
});

app.get('/github/login', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URL}`;
  res.redirect(url);
});

app.get('/github/callback', (req, res) => {
  const requestToken = req.query.code
  
  axios({
    method: 'post',
    url: `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${requestToken}`,
    headers: {
         accept: 'application/json'
    }
  }).then((response) => {
    access_token = response.data.access_token
    res.redirect('/success');
  })
})

app.get('/success', function(req, res) {

  axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      Authorization: 'token ' + access_token
    }
  }).then((response) => {
    res.send('Logged in: '.
            concat(response.data, '<br/><a href="/logout">Logout</a>'))
  })
});

const port = process.env.port || 5000
app.listen(port, () => console.log(`Server running at ${port}`));
