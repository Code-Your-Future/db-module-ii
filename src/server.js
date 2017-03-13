'use strict';

const PORT = 8000;

const initialiseApp = require('./initialiseApp');

initialiseApp('data/database.sqlite')
	.then(app => {
		app.listen(PORT, () => console.log(`Listening on ${PORT}`));
	});