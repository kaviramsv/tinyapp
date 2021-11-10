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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//generate a random string of 6 alphanumeric characters
function generateRandomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["name"],};
  res.render("urls_register", templateVars);
});
//assign value to cookie when logging in
app.post("/login", (req, res) => {
  res.cookie('name', req.body.username);
  //console.log(req.cookies["name"]); 
  res.redirect("/urls");
});
//clear cookie when logged out
app.post("/logout", (req, res) => {
  res.clearCookie('name');
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
  const templateVars = { urls: urlDatabase  , username: req.cookies["name"],};
  res.render("urls_index", templateVars);
});
//route for creating new entries 
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["name"]}
  res.render("urls_new", templateVars);
});
//updating db via parsing the form details in the post method 
app.post("/urls", (req, res) => {
  let short_url=generateRandomString(6);
  urlDatabase[short_url]=req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${short_url}`);
});
//render short url using params
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] ,username: req.cookies["name"]};
  res.render("urls_show", templateVars);
});
//redirect to long url via href in anchor tags in short_url(urls_show)
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//Add route for deleting entries in db object
app.post("/urls/:shortURL/delete",(req,res)=>{
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//Add route to update entries in db object
app.post("/urls/:id",(req,res)=>{
  urlDatabase[req.params.id]=req.body.newURL;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});