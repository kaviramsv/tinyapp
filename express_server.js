const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
//Set ejs as the view engine.
app.set("view engine", "ejs");

//Db data={short url:long url}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//generate a random string of 6 alphanumeric characters
const generateRandomString = (length) => {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

//Checking for an email in the users object
const check_email_db = (form_mail) => {
  const mail_pwd = {
    mail: false,
    pwd: '',
    id: ''
  }
  for (let user in users) {
    if (users[user].email === form_mail) {
      mail_pwd["mail"] = true;
      mail_pwd["pwd"] = users[user].password;
      mail_pwd["id"] = users[user].id;
      //return true;

    }
  }
  return mail_pwd;
  //return false;
}

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const form_email = req.body.email;
  const form_password = req.body.password;
  //console.log(req.body, form_email, form_password)
  if (!form_password || !form_email) {
    res.status(404).send("Pasword or email, or both is empty");
  } else {
    let db_check = check_email_db(form_email);
    console.log(db_check.mail)
    //if new user resgister
    //elseif already exists = show "Already Registered'
    if (!db_check.mail) {
      const user_id = generateRandomString(6);
      users[user_id] = {
        id: user_id,
        email: form_email,
        password: form_password
      };
      res.cookie('user_id', user_id);
      res.redirect("/urls");
    } else {
      res.status(404).send("Already Registered");
    }
  }
});
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  res.render("urls_login", templateVars);
});
//assign value to cookie when logging in
app.post("/login", (req, res) => {
  const form_email = req.body.email;
  const form_password = req.body.password;
  let db_obj = check_email_db(form_email);
  console.log(db_obj.pwd);
  console.log(form_email, form_password);
  //mail doesnt exist
  if (!db_obj.mail) {
    res.status(403).send("the email doesnt exist");
  } else {
    //if mail exists:compare the passwords 
    if (db_obj.pwd === form_password) {
      res.cookie('user_id', db_obj.id);
      res.redirect("/urls");
    } else {
      //if mail exist but pwd doesnt match
      res.status(403).send("the pasword doesnt match");
    }
  }
});
//clear cookie when logged out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//route for listing all entries in db
app.get("/urls", (req, res) => {
  //Lookup the user object in the users object using the user_id cookie value
  const user = users[req.cookies["user_id"]];
  // Pass this user object to your templates via templateVars.
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});
//route for creating new entries 
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});
//updating db via parsing the form details in the post method 
app.post("/urls", (req, res) => {
  let short_url = generateRandomString(6);
  urlDatabase[short_url] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${short_url}`);
});
//render short url using params
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user };
  res.render("urls_show", templateVars);
});
//redirect to long url via href in anchor tags in short_url(urls_show)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//Add route for deleting entries in db object
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//Add route to update entries in db object
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});