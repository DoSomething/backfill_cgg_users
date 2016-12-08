require('dotenv').config();

const csv = require('fast-csv');
const csvPath = `${__dirname}/users.csv`;
const fs = require('fs')

const request = require('superagent');
const northstar = require('./northstar');

const users = {};

function logMsg(msg) {
  fs.appendFileSync('./brokenUsers.txt', `${msg} \n`);
}

function getNorthstarUser() {
  const length = Object.keys(users).length;
  console.log(length);

  if (length == 0) process.exit();

  const key = Object.keys(users)[0];
  const user = users[key];

  northstar.findUserByMobile(user.mobile)
  .then((nsUser) => {
    let msg = undefined;

    if (!nsUser.hasOwnProperty('drupal_id')) {
      msg = `Missing NS account for ${user.mobile}`;

    }
    else if (!nsUser.drupal_id) {
      msg = `Missing Phoenix account for ${user.mobile}`;
    }

    if (msg) {
      logMsg(msg);
    }

    delete users[user.mobile];
    getNorthstarUser();
  })
  .catch((err) => {
    console.error(err);
    logMsg(`Missing NS account for ${user.mobile}`);
    delete users[user.mobile];
    getNorthstarUser();
  })
}

function loadUsers() {
  csv
   .fromPath(csvPath)
   .on('data', function(data){
       const mobile = data[1];
       const email = data[8];

       if (mobile === 'phone') return;

       if (!users[mobile]) users[mobile] = { mobile, email };
   })
   .on('end', getNorthstarUser);
}

loadUsers();
