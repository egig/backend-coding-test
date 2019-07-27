module.exports = {

    ERROR_MSG_INVALID_START_LAT_LON: "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
    ERROR_MSG_INVALID_END_LAT_LON: "End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
    ERROR_MSG_INVALID_RIDER: "Rider name must be a non empty string",
    ERROR_MSG_INVALID_DRIVER: "Driver name must be a non empty string",
    ERROR_MSG_INVALID_VEHICLE: "Driver Vehicle must be a non empty string",

    /**
     *
     * @param startLatitude
     * @param startLongitude
     * @param endLatitude
     * @param endLongitude
     * @param riderName
     * @param driverName
     * @param driverVehicle
     * @return {*} string
     */
    validateCreateRideRequest(startLatitude, startLongitude, endLatitude,
        endLongitude, riderName, driverName, driverVehicle) {

        if (startLatitude < -90 || startLatitude > 90 ||
            startLongitude < -180 || startLongitude > 180) {
            return this.ERROR_MSG_INVALID_START_LAT_LON;
        }

        if (endLatitude < -90 || endLatitude > 90 ||
            endLongitude < -180 || endLongitude > 180) {
            return this.ERROR_MSG_INVALID_END_LAT_LON;
        }

        if (typeof riderName !== "string" || riderName.length < 1) {
            return this.ERROR_MSG_INVALID_RIDER;
        }

        if (typeof driverName !== "string" || driverName.length < 1) {
            return this.ERROR_MSG_INVALID_DRIVER;
        }

        if (typeof driverVehicle !== "string" || driverVehicle.length < 1) {
            return this.ERROR_MSG_INVALID_VEHICLE;
        }

        return "";
    }
};