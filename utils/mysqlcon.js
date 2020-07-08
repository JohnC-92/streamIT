require('dotenv').config();
const mysql = require('mysql');
const {promisify} = require('util');
const env = process.env.NODE_ENV || 'production';
const multipleStatements = (process.env.NODE_ENV === 'test');
const {HOST, dbUSERNAME, dbPASSWORD, DATABASE, DATABASE_TEST} = process.env;

const mysqlConfig = {
  // for EC2 machine
  production: {
    host: HOST,
    user: dbUSERNAME,
    password: dbPASSWORD,
    database: DATABASE,
  },
  // for localhost development
  development: {
    host: HOST,
    user: dbUSERNAME,
    password: dbPASSWORD,
    database: DATABASE,
  },
  // for automation testing
  test: {
    host: HOST,
    user: dbUSERNAME,
    password: dbPASSWORD,
    database: DATABASE_TEST,
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

