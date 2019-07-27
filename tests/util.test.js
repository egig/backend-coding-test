const assert = require('assert');
const util = require('../src/util');

describe('util.validateCreateRideRequest', () => {

    it('should return empty string if no error', () => {

        let startLat= 0;
        let startLong = 0;
        let endLat = 0;
        let endLong = 0;
        let riderName = "Rider Name";
        let driverName = "Driver Name";
        let driverVehicle = "driver Vehicle";

        let e = util.validateCreateRideRequest(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle);

        assert.strictEqual(e, "");
    });

    it('should return proper error string if there is any', () => {

        let data = [
            [[-91, 0, 0, 0, "Rider Name", "Driver Name", "Driver Vehicle"],
                util.ERROR_MSG_INVALID_START_LAT_LON],
            [[0, 0, -91, 0, "Rider Name", "Driver Name", "Driver Vehicle"],
                util.ERROR_MSG_INVALID_END_LAT_LON],
            [[0, 0, 0, 0, "", "Driver Name", "Driver Vehicle"],
                util.ERROR_MSG_INVALID_RIDER],
            [[0, 0, 0, 0, "Rider Name", "", "Driver Vehicle"],
                util.ERROR_MSG_INVALID_DRIVER],
            [[0, 0, 0, 0, "Rider Name", "Driver Name", ""],
                util.ERROR_MSG_INVALID_VEHICLE]
        ];

        data.forEach(function (d) {
            let e = util.validateCreateRideRequest(...d[0]);
            assert.strictEqual(e, d[1]);
        })
    });

});