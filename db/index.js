const pg = require('pg');
const dbURL = 'postgress://localhost/twitterdb';
const client = new pg.Client(dbURL);
client.connect();

module.exports = client;
