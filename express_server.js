const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
//Set ejs as the view engine.
app.set("view engine", "ejs");

//Db data={short url:long url}
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "user2RandomID"
  },
  c6UTxQ: {
    longURL: "https://www.ccc.ca",
    userID: "user2RandomID"
},
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "userRandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "a"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "b"
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
    }
  }
  return mail_pwd;
 
}
//list of urls for a particular id
const urlsForUser=(id)=>{
  const list_shtUrl_for_id=[];
  for(let key in urlDatabase){
    if(urlDatabase[key].userID===id){
      list_shtUrl_for_id.push(key);
    }
  }
  return list_shtUrl_for_id;
  };
  
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
  res.redirect("/login");
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
  if(!user){
    res.status(403).send("<h1>Cannot view urls unless logged in</h1>");
  }  
  //pass only data relevant to ct obj id in cookie
  const temp_db={};
  for (key in urlDatabase){
      if(urlDatabase[key].userID === req.cookies["user_id"] ){
        temp_db[key] = urlDatabase[key];
        
      }

  }//for

// Pass this user object to your templates via templateVars.
  const templateVars = { urls: temp_db, user: user };
  res.render("urls_index", templateVars);
});
//route for creating new entries 
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user };
  if(!user){
    res.render("urls_login", templateVars);
  }
  res.render("urls_new", templateVars);
});
//updating db via parsing the form details in the post method 
app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if(!user){
    res.status(403).send("canot create a new url without loging in");
  }
  let short_url = generateRandomString(6);
  // urlDatabase[short_url] = req.body.longURL;
  urlDatabase[short_url] = {
             longURL: req.body.longURL,
             userID: req.cookies["user_id"]
        }  
  res.redirect(`/urls/${short_url}`);
});

//render short url using params
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if(!user){
    res.status(403).send("<h1>Cannot view a short url without logging in</h1>");
  }
  const  urls_list_belong=urlsForUser(req.cookies["user_id"]);
  if(!urls_list_belong.includes(req.params.shortURL)){
    res.status(403).send(`<h1>This ${req.params.shortURL} url do not belong to you!!</h1>`);
  }  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
  res.render("urls_show", templateVars);
});
//redirect to long url via href in anchor tags in short_url(urls_show)
app.get("/u/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const sht_url_list=Object.keys(urlDatabase);
  if(!sht_url_list.includes(req.params.shortURL)){
    res.status(403).send(`<h1>This url:'${req.params.shortURL}' does not exist !</h1>`);
  }  
  // if(!user){
  //   res.status(403).send(`<h1>Please log in to view the short url ${req.params.shortURL}</h1>`);
  // }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//Add route for deleting entries in db object
app.post("/urls/:shortURL/delete", (req, res) => {
  const  urls_list_belong=urlsForUser(req.cookies["user_id"]);
  if(!urls_list_belong.includes(req.params.shortURL)){
    res.status(403).send(`u cant delete this url :${req.params.shortURL} ,since this do not belong to you`);
  } 
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//Add route to update entries in db object
app.post("/urls/:id", (req, res) => {
  // urlDatabase[req.params.id] = req.body.newURL;
  const  urls_list_belong=urlsForUser(req.cookies["user_id"]);
  if(!urls_list_belong.includes(req.params.id)){
    res.status(403).send(`u cant edit this url :${req.params.id},since it does not belong to you`);
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});