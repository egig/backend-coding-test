'use strict';

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const packageJson = require('./package.json');
const path = require('path');

const express = require('express');
const app = express();
const port = 8010;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const winston = require("winston");
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');


const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        info: {
            title: packageJson.name,
            description: "This is Rides API server. This API handles request to get the Ride list, create, and get a Ride record",
            version: packageJson.version
        }
    },
    apis: [
        path.resolve(__dirname + '/src/*')
    ]
});


db.serialize(() => {
    buildSchemas(db);

    const app = require('./src/app')(db);

    const showExplorer = false;
    const options = {};
    const customCss = '';
    const customFavicon = '';
    const swaggerUrl = '';

    app.use(
        '/explorer',
        swaggerUi.serve,
        swaggerUi.setup(
            swaggerSpec,
            showExplorer,
            options,
            customCss,
            customFavicon,
            swaggerUrl,
            packageJson.name,
            (req, res, next) => {
                next();
            }
        )
    );

    app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});