const knex = require('knex');
const configuration = require('../../knexfile'); //arquivo src/knexfile.js

const connection = knex(configuration.development);

module.exports = connection;