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

// Create connection to mysql
const mysqlCon = mysql.createConnection(mysqlConfig[env], {multipleStatements});

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

