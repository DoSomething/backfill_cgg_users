require('dotenv').config();

const csv = require('fast-csv');
const csvPath = `${__dirname}/users.csv`;

const request = require('superagent');
const northstar = require('./northstar');

const users = {};

function touchNorthstarUser(nsUser) {
  northstar.touchUser(nsUser.id).then((updatedUser) => {
    if (!updatedUser.drupal_id) console.error(`Drupal ID not set for user ${updatedUser._id}`);

    getNorthstarUser();
  });
}

function getNorthstarUser() {
  const length = Object.keys(users).length;
  console.log(length);

  if (length == 0) process.exit();

  const key = Object.keys(users)[0];
  const user = users[key];

  northstar.findUserByMobile(user.mobile)
  .then((nsUser) => {
    if (nsUser.drupal_id) {
       getNorthstarUser();
    }
    else if (!nsUser.hasOwnProperty('drupal_id')) {
      console.log(`Missing NS account for ${user.mobile}`);
      getNorthstarUser();
    }
    else {
      touchNorthstarUser(nsUser);
    }

    delete users[user.mobile];
  })
  .catch(console.error)
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
