# Database Module II

In this lesson, we'll write a Node.js and Express HTTP API that queries a relational database and exposes it as JSON.


## The Database

This is an SQLite database that is based upon the homework from the first database module. The design embraces various one-to-many and many-to-many relationships:

![ERD](http://i.imgur.com/e8No8Xt.png)

Note that **all of the IDs are auto-incrementing** - this means that when you add a new record to a table, SQLite will manage the primary key for you; there is no need to explicitly set this.

Perhaps the simplest means of understanding our database is to look at the [SQL query](https://github.com/Code-Your-Future/db-module-ii/blob/master/data/transactions/create-tables.sql) used to create our tables.

## Object-Relational Mapping (ORM)

Object-relational mapping is a language-specific abstraction for querying databases. There are numerous benefits, such as:

* Avoiding complicated SQL queries in favour of easy-to-use APIs
* Independence from the underlying database; our SQLite database could be replaced with a MySQL database without any code changes
* Enhanced security e.g. santising input to prevent [SQL injection attacks](https://www.owasp.org/index.php/SQL_Injection)

For this exercise, we'll be using an ORM called [Bookshelf](http://bookshelfjs.org/). The [database connection and initialisation](https://github.com/Code-Your-Future/db-module-ii/blob/master/src/database/initialisedBookshelf.js) has been taken care of, and the [models have already been defined](https://github.com/Code-Your-Future/db-module-ii/blob/master/src/database/models.js), which are then exported so that they can be used in our routes.

## The Server

This repository contains an [Express app](https://github.com/Code-Your-Future/db-module-ii/blob/master/src/index.js) that exposes a [series of routes](https://github.com/Code-Your-Future/db-module-ii/blob/master/src/routes) for interacting with the database.


## Local development

The most important step is to install SQLite itself, **if it isn't already available on your machine**.

It's recommended to install this via a package manager for simplicity's sake:

* [Homebrew](https://brew.sh/) (macOS): `brew install sqlite`
* APT (Ubuntu/Debian): `sudo apt install sqlite`

Make sure you install all of the project dependencies with `npm i` before you do anything else. Then you can run:

* `npm start` - runs the server via nodemon, restarting on changes to the `src` directory

Note that this project requires **Node.js 6 or above** due to the use of ES6. If you're using nvm, you can run `nvm use` to change to the required version.


## Getting Started

Run the above start script, and open [http://localhost:8001/organisations](http://localhost:8001/organisations) in your browser. You should see JSON array of the organisations stored in our database, but that we are missing any related data; we need to specify an option to tell Bookshelf to fetch any services and contact users related to each organisation.

Open the `getOrganisations.js` route and in the `fetchAll` method, pass an object with a property called `withRelated`, whose value is an array specifying `'services'` and `'contactUsers'`. The handler should now look like this:

```js
module.exports = function getOrganisations(req, res) {
    return Organisation.fetchAll({
        withRelated: ['services', 'contactUsers']
    }).then(organisations => res.json(organisations.serialize({ omitPivot: true })));
};
```

Refresh your browser; you should now see the related services and contact users for each organisation.

**Note that** we must do two additional steps before the data is sent back to the client:

* Invoke `serialize` on our model. This converts the instance to a _plain object_ that can be serialized as JSON, removing any functions and additional cruft
* Specify an options object for this model with an `omitPivot` property, which is set to `true`. Pivots are fields used by Bookshelf when it evaluates relationships, but provide no benefit to the users of our API; it's essentially an implementation detail


### Fetching Individual Organisations

Take a look at the `getOrganisation` route. This is similar to the previous route, only it fetches an individual organisation based upon the ID passed via the URL. Let's try this by navigating to [http://localhost:8001/organisations/1](http://localhost:8001/organisations/1) in the browser; you should see Amnesty International's record, but without neither the services nor contact users. As we did the for the getOrganisations route, specify the `withRelated` option with the appropriate relationship names.


### Updating an Organsation

The `updateOrganisation` route handler is invoked when a `PATCH` request is made to `/organisations/:id`. Like the `getOrganisation` route, we're using the `where` method to fetch a model by the specified ID. However, we need to use the `set` method to update any fields specified in the request body.

The properties accepted by our endpoint should match the database schema e.g.:

* `name` - the organisation's name
* `address` - the organisation's address

The body accepted by this endpoint should be JSON.

The easiest way to make a `PATCH` request is to use [Postman](https://www.getpostman.com/postman).

Once we've set the field, according to the existing code, we `save()` the organisation before returning it to the client as JSON.


### Adding a Service

Open the `addService` route handler. Follow these steps to support the addition of new services to our database:

1. Create a new instance of `Service` (i.e. `const service = new Service();`), passing the service name specified in the payload as a constructor parameter

2. Invoke the `save` method on the the `Service` instance (i.e. `service.save()`);

3. Register a resolution callback to the returned `Promise` (i.e. `service.save().then(...)`) that sends the serialised service to the client via `res.json`. Make a note of the `id` property, as we'll use it in the next step.


### Linking a Service to an Organisation

Take a look at the `linkService` route handler. This will receive a `serviceId` and an `organisationId` when one `PATCH`es `/services/:serviceId/link-to/:organisationId` (e.g. `/services/5/link-to/1`). The logic is the same as the `addService` link, only we need to the pass both the `serviceId` and `organisationId` request parameters to a new instance of `OrganisationService`, which we must then save, serialise, and send to the client in a similar manner.

Once implemented, take the service ID from the previous exercise, and link it to Amnesty International (ID 1). If you have implemented your route correctly, you'll see the new service appear in the `services` array when you request `/organisations/1`.


### Adding and Linking Users

Following the previous two exercises, create a directory called `users` under `routes`, which contains two respective handlers to:

1. Create a new user
2. Link a user to an organisation

Like the `services` handlers, you should expose a router which is then consumed by the application (app.js) using `app.use()`.


## Stretch Goals

1. Create `GET` endpoints for retrieving all, and individual services and users
2. Create `DELETE` endpoints for deleting organisations, services, and users
  * This **must** include the deletion of relational data!