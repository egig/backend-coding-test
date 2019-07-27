'use strict';

const request = require('supertest');
const assert = require('assert');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
    before((done) => {
        db.serialize((err) => {
            if (err) {
                return done(err);
            }

            buildSchemas(db);

            done();
        });
    });

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('GET /rides', () => {
        it('should return not found any rides', () => {
            return request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .then(response => {
                    assert.strictEqual(response.body.error_code, 'RIDES_NOT_FOUND_ERROR');
                })
        });
    });

    describe('GET /rides/:id', () => {
        it('should return not found any rides with id 1', () => {
            return request(app)
                .get('/rides/1')
                .expect('Content-Type', /json/)
                .then(response => {
                    assert.strictEqual(response.body.error_code, 'RIDES_NOT_FOUND_ERROR');
                })
        });
    });

    describe('POST /rides', () => {
        it('should create a ride', () => {
            return request(app)
                .post('/rides')
                .send({
                    start_lat: 0,
                    start_long: 0,
                    end_lat: 0,
                    end_long: 0,
                    rider_name: "John Doe",
                    driver_name: "The Driver",
                    driver_vehicle: "The Vehicle"
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    assert.strictEqual(response.body.length, 1);
                })
        });

        it('should return validation error if given start latitude/longitude is not valid', () => {
            return request(app)
                .post('/rides')
                .send({
                    start_lat: -91,
                    start_long: 0,
                    end_lat: 0,
                    end_long: 0,
                    rider_name: "John Doe",
                    driver_name: "The Driver",
                    driver_vehicle: "The Vehicle"
                })
                .expect('Content-Type', /json/)
                .then(response => {
                    assert.strictEqual(response.body.error_code, "VALIDATION_ERROR");
                })
        });

        it('should return validation error if given end latitude/longitude is not valid', () => {
            return request(app)
                .post('/rides')
                .send({
                    start_lat: 0,
                    start_long: 0,
                    end_lat: -91,
                    end_long: 0,
                    rider_name: "John Doe",
                    driver_name: "The Driver",
                    driver_vehicle: "The Vehicle"
                })
                .expect('Content-Type', /json/)
                .then(response => {
                    assert.strictEqual(response.body.error_code, "VALIDATION_ERROR");
                })
        });

        it('should return validation error if given rider name is not valid', () => {
            return request(app)
                .post('/rides')
                .send({
                    start_lat: 0,
                    start_long: 0,
                    end_lat: 0,
                    end_long: 0,
                    rider_name: "",
                    driver_name: "The Driver",
                    driver_vehicle: "The Vehicle"
                })
                .expect('Content-Type', /json/)
                .then(response => {
                    assert.strictEqual(response.body.error_code, "VALIDATION_ERROR");
                    assert.strictEqual(response.body.message, "Rider name must be a non empty string");
                })
        });

        it('should return validation error if given drive name is not valid', () => {
            return request(app)
                .post('/rides')
                .send({
                    start_lat: 0,
                    start_long: 0,
                    end_lat: 0,
                    end_long: 0,
                    rider_name: "Rider Name",
                    driver_name: "",
                    driver_vehicle: "The Vehicle"
                })
                .expect('Content-Type', /json/)
                .then(response => {
                    assert.strictEqual(response.body.error_code, "VALIDATION_ERROR");
                })
        });

        it('should return validation error if given vehicle name is not valid', () => {
            return request(app)
                .post('/rides')
                .send({
                    start_lat: 0,
                    start_long: 0,
                    end_lat: 0,
                    end_long: 0,
                    rider_name: "Rider Name",
                    driver_name: "Driver Name",
                    driver_vehicle: ""
                })
                .expect('Content-Type', /json/)
                .then(response => {
                    assert.strictEqual(response.body.error_code, "VALIDATION_ERROR");
                })
        });
    });

    describe('GET /rides after a POST /rides', () => {
        it('should return list of rides', () => {
            return request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(response => {
                    assert(response.body.length > 0);
                })
        });
    });

    describe('GET /rides/:id after a POST /rides', () => {
        it('should return a ride with id 1', () => {
            return request(app)
                .get('/rides/1')
                .expect('Content-Type', /json/)
                .then(response => {
                    assert(response.body.length > 0);
                })
        });
    });

    describe('GET /rides?page=2', () => {
        it('should return correct pagination', () => {

            // We empty table first and we insert 11 records
            db.serialize(() => {
                db.run("DELETE FROM Rides");
                for (let i=0; i<11; i ++) {
                    db.run("INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (0,0,0,0,?,?,?)",
                        [`rider${i}`, `driver${i}`, `vehicle${i}`]
                    )
                }

            });

            // Because we have 11 records and item per page is 10
            // Page 2 should return 1 records
            return request(app)
                .get('/rides?page=2')
                .expect(200)
                .then(response => {
                    assert(response.body.length == 1);
                })
        });
    });
});