module.exports = (db) => {

    return {

        /**
         *
         * @param startLat
         * @param startLong
         * @param endLat
         * @param endLong
         * @param riderName
         * @param driverName
         * @param driverVehicle
         * @return {Promise}
         */
        createRide(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) {

            let _this = this;
            return new Promise((resolve, reject) => {

                db.run("INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle],
                    function (err) {
                        if(err) {
                            return reject(err);
                        }

                        resolve(_this.getRide(this.lastID));
                    });

            });
        },

        /**
         * Get single Ride
         *
         * @param id
         * @return {Promise}
         */
        getRide(id) {
            return new Promise((resolve, reject) => {
                db.all(`SELECT * FROM Rides WHERE rideID='${id}'`, function (err, rows) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(rows);
                });

            });
        },
        /**
         * Get list of Ride
         *
         * @param offset
         * @param limit
         * @return {Promise}
         */
        getRides(offset, limit) {
            return new Promise((resolve, reject) => {
                db.all("SELECT * FROM Rides LIMIT ?,?", [offset, limit], function (err, rows) {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(rows);
                });
            });
        }
    };
};