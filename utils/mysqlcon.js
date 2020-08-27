const mysql = require('mysql');
const {nodeEnv, dbhost, dbUser, dbPass, db, dbTest} = require('./config');
const env = nodeEnv;
const multipleStatements = (nodeEnv === 'test');

// Define mysql configs
const dbConfig = {
  // for localhost development
  development: {
    connectionLimit: 20,
    host: dbhost,
    user: dbUser,
    password: dbPass,
    database: db,
  },
  // for automation testing
  test: {
    connectionLimit: 20,
    host: dbhost,
    user: dbUser,
    password: dbPass,
    database: dbTest,
  },
};

// Create connection to mysql
const dbPool = mysql.createPool(dbConfig[env], {multipleStatements});

const dbQuery = (...sqlArgs) => {
  return new Promise((resolve, reject) => {
    if (sqlArgs[1]) {
      dbPool.query(sqlArgs[0], sqlArgs[1], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    } else {
      dbPool.query(sqlArgs[0], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    }
  });
};

const dbPoolConnection = () => {
  return new Promise((resolve, reject) => {
    dbPool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};

const dbTransaction = (connection) => {
  return new Promise((resolve, reject) => {
    connection.query('START TRANSACTION', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const dbCommit = (connection) => {
  return new Promise((resolve, reject) => {
    connection.query('COMMIT', (err, results) => {
      if (err) {
        connection.query('ROLLBACK');
        console.log('Error when Commiting');
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const dbRollback = (connection) => {
  return new Promise((resolve, reject) => {
    connection.query('ROLLBACK', (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const dbConnectionQuery = (connection, query, sqlArgs) => {
  return new Promise((resolve, reject) => {
    if (!sqlArgs) {
      connection.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    } else {
      connection.query(query, sqlArgs, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    }
  });
};

module.exports = {
  connection: dbPoolConnection,
  query: dbQuery,
  connectionQuery: dbConnectionQuery,
  transaction: dbTransaction,
  commit: dbCommit,
  rollback: dbRollback,
};

