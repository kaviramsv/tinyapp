# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["register page"](https://github.com/kaviramsv/tinyapp/blob/06fbc24cc1e6f820370d13de120e7b7b6436e1ff/docs/Register.png)
!["create new url"](https://github.com/kaviramsv/tinyapp/blob/06fbc24cc1e6f820370d13de120e7b7b6436e1ff/docs/Create_new.png)
!["login page"](https://github.com/kaviramsv/tinyapp/blob/06fbc24cc1e6f820370d13de120e7b7b6436e1ff/docs/Login.png)
!["urls page"](https://github.com/kaviramsv/tinyapp/blob/06fbc24cc1e6f820370d13de120e7b7b6436e1ff/docs/URLS.png)
!["view edit page"](https://github.com/kaviramsv/tinyapp/blob/06fbc24cc1e6f820370d13de120e7b7b6436e1ff/docs/View_Edit_page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- You can run the development web server using npm start since it is defined in the test script.

## Functionalities of the App
- Start by registering in the Registeration page.
- Use valid credentials to login to the application.
- Once logged in ,you will be able to perform following actions for Urls that belong to you.
         1.Create new Tiny Urls 
         2.Update existing Long URL's
         3.Delete Urls 
- Log out once the requirements are done.

## What happens behind the scenes
- The application works by using a cookie to identify the logged in client 
- Once registered login id is saved along with the hashed pasword.
- For every login,app checks the database if that user is existent in database.
- Displays the details of valid users 
- Updates Reads and deletes information from database based on request of user.
- Clears the cookie once logged out

  
