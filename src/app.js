"use strict";

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const model = require("./model");
const util = require("./util");

/**
 * @swagger
 *
 * definitions:
 *   Error:
 *      type: object
 *      properties:
 *        error_code:
 *          type: string
 *        message:
 *          type: string
 *
 *   Ride:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        startLat:
 *          type: number
 *        startLong:
 *          type: number
 *        endLat:
 *          type: number
 *        endLong:
 *          type: number
 *        riderName:
 *          type: string
 *        driverName:
 *          type: string
 *        driverVehicle:
 *          type: string
 */
module.exports = (db) => {

    /**
     * @swagger
     *
     * /health:
     *   get:
     *     summary: "Check the health of the service"
     *     responses:
     *       200:
     *         description: OK
     */
    app.get("/health", (req, res) => res.send("Healthy"));

    /**
     * @swagger
     * /rides:
     *   post:
     *     summary: "Create a new ride record"
     *     parameters:
     *       - in: body
     *         name: payload
     *         schema:
     *           type: object
     *           properties:
     *              start_lat:
     *                  type: number
     *              start_long:
     *                  type: number
     *              end_lat:
     *                  type: number
     *              end_long:
     *                  type: number
     *              rider_name:
     *                  type: string
     *              driver_name:
     *                  type: string
     *              driver_vehicle:
     *                  type: string
     *     responses:
     *       201:
     *         description: Created
     *         schema:
     *           $ref: '#/definitions/Ride'
     *       400:
     *         description: Bad Request
     *         schema:
     *           $ref: '#/definitions/Error'
     *       500:
     *         description: Internal Server Error
     *         schema:
     *           $ref: '#/definitions/Error'
     *
     */
    app.post("/rides", jsonParser, (req, res) => {

        (async () => {

            try {

                const startLatitude = Number(req.body.start_lat);
                const startLongitude = Number(req.body.start_long);
                const endLatitude = Number(req.body.end_lat);
                const endLongitude = Number(req.body.end_long);
                const riderName = req.body.rider_name;
                const driverName = req.body.driver_name;
                const driverVehicle = req.body.driver_vehicle;

                let validationErorr = util.validateCreateRideRequest(startLatitude, startLongitude, endLatitude,
                    endLongitude, riderName, driverName, driverVehicle);
                if(validationErorr != "") {
                    return res.send({
                        error_code: "VALIDATION_ERROR",
                        message: validationErorr
                    });
                }

                let rows = await model(db).createRide(startLatitude, startLongitude, endLatitude,
                    endLongitude, riderName, driverName, driverVehicle);
                res.send(rows);

            } catch (e) {
                return res.send({
                    error_code: "SERVER_ERROR",
                    message: "Unknown error"
                });
            }

        })();

    });

    /**
     * @swagger
     * /rides:
     *   get:
     *     summary: "Get ride record list"
     *     parameters:
     *      - in: query
     *        name: page
     *        type: number
     *        description: Get certain page for a record list. Return 10 items Per Page.
     *        default: 1
     *     responses:
     *       200:
     *         description: List Of Ride
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/Ride'
     *       404:
     *         description: Not Found
     *         schema:
     *           $ref: '#/definitions/Error'
     */
    app.get("/rides", (req, res) => {
        (async () => {

            const LIMIT = 10;
            let page = req.query.page || 1;
            let offset = (page * LIMIT) - LIMIT;

            try {
                let rows = await model(db).getRides(offset, LIMIT);

                if (rows.length === 0) {
                    return res.send({
                        error_code: "RIDES_NOT_FOUND_ERROR",
                        message: "Could not find any rides"
                    });
                }

                res.send(rows);
            } catch (e) {
                res.send({
                    error_code: "SERVER_ERROR",
                    message: "Unknown error"
                });
            }

        })();
    });

    /**
     * @swagger
     * /rides/{id}:
     *   get:
     *     summary: Get a ride record by ID
     *     parameters:
     *       - in: path
     *         name: id
     *         description: The Ride ID
     *     responses:
     *       200:
     *         description: OK
     *         schema:
     *           $ref: '#/definitions/Ride'
     *       404:
     *         description: Not Found
     *         schema:
     *           $ref: '#/definitions/Error'
     *       500:
     *         description: Internal Server Error
     *         schema:
     *           $ref: '#/definitions/Error'
     */
    app.get("/rides/:id", (req, res) => {

        (async () => {

            try {

                let rows = await model(db).getRide(req.params["id"]);

                if (rows.length === 0) {
                    return res.send({
                        error_code: "RIDES_NOT_FOUND_ERROR",
                        message: "Could not find any rides"
                    });
                }

                res.send(rows);

            } catch (e) {
                res.send({
                    error_code: "SERVER_ERROR",
                    message: "Unknown error"
                });
            }

        })();

    });

    return app;
};
