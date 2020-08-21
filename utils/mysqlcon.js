const mysql = require('mysql');
const {promisify} = require('util');
const {nodeEnv, dbhost, dbUser, dbPass, db, dbTest} = require('./config');
const env = nodeEnv;
const multipleStatements = (nodeEnv === 'test');

// Define mysql configs
const mysqlConfig = {
  // for localhost development
  development: {
    host: dbhost,
    user: dbUser,
    password: dbPass,
    database: db,
  },
  // for automation testing
  test: {
    host: dbhost,
    user: dbUser,
    password: dbPass,
    database: dbTest,
  },
};

// // Create connection to mysql
// const mysqlCon = mysql.createConnection(mysqlConfig[env], {multipleStatements});

/**
 * Function to connect MySQL and handle disconnection
 * Ref: https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
 */
function handleDisconnect() {
  mysqlCon = mysql.createConnection(mysqlConfig[env], {multipleStatements});
  mysqlCon.connect(function(err) {
    if (err) {
      console.log('Error when connecting to db:', err);

      // We introduce a delay before attempting to reconnect,
      // to avoid a hot loop, and to allow our node script to
      // process asynchronous requests in the meantime.
      setTimeout(handleDisconnect, 2000);
    }
  });

  // Connection to the MySQL server is usually
  // lost due to either server restart, or a
  // connnection idle timeout (the wait_timeout
  // server variable configures this)
  mysqlCon.on('error', function(err) {
    console.log('Db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Db connection lost and attempting to reconnect', err);
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

// Promisify all mysql queries and bind mysql connection (promisify will cause original parent lost)
const promiseQuery = (query, bindings) => {
  return promisify(mysqlCon.query).bind(mysqlCon)(query, bindings);
};

// Promisify mysql transaction queries
const promiseTransaction = promisify(mysqlCon.beginTransaction).bind(mysqlCon);
const promiseCommit = promisify(mysqlCon.commit).bind(mysqlCon);
const promiseRollBack = promisify(mysqlCon.rollback).bind(mysqlCon);
const promiseEnd = promisify(mysqlCon.end).bind(mysqlCon);

module.exports = {
  query: promiseQuery,
  transaction: promiseTransaction,
  commit: promiseCommit,
  rollback: promiseRollBack,
  end: promiseEnd,
};

