const mysql = require('mysql');
const {promisify} = require('util');
const {nodeEnv, dbhost, dbUser, dbPass, db, dbTest} = require('./config');
const env = nodeEnv || 'production';
const multipleStatements = (nodeEnv === 'test');

const mysqlConfig = {
  // for EC2 machine
  production: {
    host: dbhost,
    user: dbUser,
    password: dbPass,
    database: db,
  },
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

const mysqlCon = mysql.createConnection(mysqlConfig[env], {multipleStatements});

const promiseQuery = (query, bindings) => {
  return promisify(mysqlCon.query).bind(mysqlCon)(query, bindings);
};

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

