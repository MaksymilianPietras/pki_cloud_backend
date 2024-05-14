const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')
const githubOAuth2Data = require('./github_key.json')
const axios = require('axios')
const dotenv = require("dotenv");

const { getUsers, addUser } = require('./dbHandler');
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

app.get('/login', async (req, res) => {
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
        oauth2.userinfo.v2.me.get(async function(err, result) {
          if (err){
            console.log("Niestety BLAD!!")
            console.log(err)
          } else {
            loggedUser = result.data.name
            console.log(loggedUser)
          }
          await addUser(loggedUser)
          try{
            const users = await getUsers()
              let usersInHtml = createUsersHtml(users);
              const bootstrapLoggedInContent = `
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
              <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
                <div class="container">
                ${dbModal("Pomyślnie połączono się z bazą")}
                <nav class="navbar navbar-expand-lg">
                  <p class="lead">Logged in as: ${loggedUser}</p>
                  <img src="${result.data.picture}" alt="Profile Picture" height="23" width="23">
                </nav>  
                  <br/><br/>
                  <a href="/logout" class="btn btn-primary">Logout</a>
                  <br/><br/>
                  ${usersInHtml}
                </div>
            `;
            res.send(bootstrapLoggedInContent);
          } catch(error){
            res.send(dbModal(error))
          }
          
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
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URL}&prompt=consent`;
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

app.get('/github/logout', (req, res) => {
  access_token = ""
  res.redirect('/')
})

app.get('/success', async (req, res) => {

  axios({
    method: 'get',
    url: `https://api.github.com/user`,
    headers: {
      Authorization: 'token ' + access_token
    }
  }).then(async (response) => {
    await addUser(response.data.login)
    try{
      const users = await getUsers()
          let usersInHtml = createUsersHtml(users)
          const bootstrapLoginForm = `
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
            <div class="container">
            ${dbModal("Pomyślnie połączono się z bazą")}
            <nav class="navbar navbar-expand-lg">
              <p class="lead">Logged in as: ${response.data.login}</p>
              <a href="/github/logout" class="btn btn-primary">Logout</a>
            </nav>
              <br/><br/>
              ${usersInHtml}
            </div>
        `;

        res.send(bootstrapLoginForm)
    }catch (error){
      res.send(dbModal(error))
    }
    
  })
});

const port = process.env.port || 5000
app.listen(port, () => console.log(`Server running at ${port}`));

function dbModal(err) {
  return `
    <div class="modal fade" id='db-modal' tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${err}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Zamknij"></button>
          </div>
          <div class="modal-body">
            <p>${err}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
          </div>
        </div>
      </div>
    </div>

    <script>
        window.onload = function() {
            var myModal = new bootstrap.Modal(document.getElementById('db-modal'));
            myModal.show();
        };
    </script>

  `;
}

function createUsersHtml(users) {
  let usersInHtml = `
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
  <table class="table table-striped">
    <thead>
      <tr>
        <th scope="col">Osoba</th>
        <th scope="col">Dołączyła</th>
        <th scope="col">Ostatnia wizyta</th>
        <th scope="col">Counter</th>
      </tr>
    </thead>
    <tbody>
  `;

  users.forEach(user => {
    usersInHtml += `
      <tr>
        <td>${user["name"]}</td>
        <td>${user["joined"]}</td>
        <td>${user["lastvisit"]}</td>
        <td>${user["counter"]}</td>
      </tr>
    `;
  });

  usersInHtml += `
      </tbody>
    </table>
  `;
  return usersInHtml;
}

