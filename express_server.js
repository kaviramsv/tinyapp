const check_email_db = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
//Set ejs as the view engine.
app.set("view engine", "ejs");

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
    password: "$2a$10$.wVYgYHuucd9D3DelnONjORll80Ow6ZYvPll/FxTv5iZsIBmjzcJO"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$3WLgJQQI/jXfRPBcrPX1.eYrNH3hXSU7jZ3Z46tU5R9NbwLba4yyq"
  }

}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

//generate a random string of 6 alphanumeric characters
const generateRandomString = (length) => {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
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

  const user = users[req.session.user_id];
  const templateVars = { user: user };
  if(user){
    res.redirect("/urls");
  }

  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const form_email = req.body.email;
  const form_password = req.body.password;
  if (!form_password || !form_email) {
    res.status(404).send("<h2>Password or email, or both is empty</h2>");
  } else {
    let db_check = check_email_db(form_email,users);
    //if new user resgister
    //elseif already exists = show "Already Registered'
    if (!db_check.mail) {
      const user_id = generateRandomString(6);
      const hashed = bcrypt.hashSync(form_password, 10);
      users[user_id] = {
        id: user_id,
        email: form_email,
        password: hashed
      };
      req.session.user_id = user_id;
      res.redirect("/urls");
    } else {
      res.status(404).send("<h2>Already Registered,Please go to login screen</h2>");
    }
  }
});
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: user };
  if(user){
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});
//assign value to cookie when logging in
app.post("/login", (req, res) => {
  const form_email = req.body.email;
  const form_password = req.body.password;
  let db_obj = check_email_db(form_email,users);
  
  //mail doesnt exist
  if (!db_obj.mail) {
    res.status(403).send("<h3>Invalid email ,Please use a valid mail or register!!</h3>");
  } else {
    //if mail exists:compare the passwords db_obj.pwd === form_password 
    if (bcrypt.compareSync(form_password, db_obj.pwd)) {
      req.session.user_id = db_obj.id;
      res.redirect("/urls");
    } else {
      //if mail exist but pwd doesnt match
      res.status(403).send("<h3>The password doesnt match</h3>");
    }
  }
});
//clear cookie when logged out
app.post("/logout", (req, res) => {
  //res.clearCookie('user_id');
  req.session = null
  res.redirect("/login");
});


app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: user };
  if(!user){
    res.redirect("/login");
  }
  res.redirect("/urls");
  
});


//route for listing all entries in db
app.get("/urls", (req, res) => {
  //Lookup the user object in the users object using the user_id cookie value
  const user = users[req.session.user_id];
  if(!user){
    res.status(403).send("<h3>Cannot view urls unless logged in</h3>");
  }  
  //pass only data relevant to ct obj id in cookie
  const temp_db={};
  for (key in urlDatabase){
      if(urlDatabase[key].userID === req.session.user_id ){
        temp_db[key] = urlDatabase[key];
        
      }
  }//for

// Pass this user object to your templates via templateVars.
  const templateVars = { urls: temp_db, user: user };
  res.render("urls_index", templateVars);
});
//route for creating new entries 
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: user };
  if(!user){
    res.render("urls_login", templateVars);
  }
  res.render("urls_new", templateVars);
});
//updating db via parsing the form details in the post method 
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if(!user){
    res.status(403).send("canot create a new url without loging in");
  }
  let short_url = generateRandomString(6);
  // urlDatabase[short_url] = req.body.longURL;
  urlDatabase[short_url] = {
             longURL: req.body.longURL,
             userID: req.session.user_id
        }  
  res.redirect(`/urls/${short_url}`);
});

//render short url using params
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if(!user){
    res.status(403).send("<h3>Cannot view a short url without logging in</h3>");
  }
  const  urls_list_belong=urlsForUser(req.session.user_id);
  if(!urls_list_belong.includes(req.params.shortURL)){
    res.status(403).send(`<h3>This ${req.params.shortURL} url does not belong to you or does not exist!!</h3>`);
  }  
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
  res.render("urls_show", templateVars);
});
//redirect to long url via href in anchor tags in short_url(urls_show)
app.get("/u/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const sht_url_list=Object.keys(urlDatabase);
  if(!sht_url_list.includes(req.params.shortURL)){
    res.status(403).send(`<h3>This url:'${req.params.shortURL}' does not exist !</h3>`);
  }  
  // if(!user){
  //   res.status(403).send(`<h1>Please log in to view the short url ${req.params.shortURL}</h1>`);
  // }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//Add route for deleting entries in db object
app.post("/urls/:shortURL/delete", (req, res) => {
  
  const user = users[req.session.user_id];
  console.log("user",user,req.session.user_id);
  const  urls_list_belong=urlsForUser(req.session.user_id);
   console.log("list",urls_list_belong);
  if(!user){
    res.status(403).send("<h3>Cannot delete a short url without logging in</h3>");
  }
  
  if(!urls_list_belong.includes(req.params.shortURL)){
    res.status(403).send(`u cant delete this url :${req.params.shortURL} ,since this do not belong to you`);
  } 
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//Add route to update entries in db object
app.post("/urls/:id", (req, res) => {
  // urlDatabase[req.params.id] = req.body.newURL;
  const  urls_list_belong=urlsForUser(req.session.user_id);
  if(!urls_list_belong.includes(req.params.id)){
    res.status(403).send(`u cant edit this url :${req.params.id},since it does not belong to you`);
  }
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});