//Checking for an email in the users_db
const check_email_db = (form_mail,users_db) => {

  const mail_pwd = {
    mail: false,
    pwd: null,
    id: null
  }
  for (let user in users_db) {
    if (users_db[user].email === form_mail) {
      mail_pwd["mail"] = true;
      mail_pwd["pwd"] = users_db[user].password;
      mail_pwd["id"] = users_db[user].id;     
    }
  }
  return mail_pwd; 
}


 module.exports = check_email_db;