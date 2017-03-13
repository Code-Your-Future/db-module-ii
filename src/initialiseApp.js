'use strict';

const express = require('express');
const db = require('sqlite');
const organisationsRoutes = require('./routes/organisations');
const app = express();

app.get('/organisations', organisationsRoutes.get);
app.post('/organisations', organisationsRoutes.add);
app.put('/organisations/:id', organisationsRoutes.update);
app['delete']('/organisations/:id', organisationsRoutes.remove);

const initialiseApp = (dbname) => db.open(dbname, { Promise })
    .then(() => app);

module.exports = initialiseApp;
