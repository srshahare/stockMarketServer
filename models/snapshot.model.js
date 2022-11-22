module.exports = (sequelize, Sequelize) => {
    const Snapshot = sequelize.define("snapshot", {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        timeStamp: {
            type: Sequelize.STRING,
            required: true
        },
        exchangeName: {
            type: Sequelize.ENUM,
            values: ["NIFTY", "BANKNIFTY"],
            required: true
        },
        futureIndex: {
            type: Sequelize.STRING,
            required: true
        },
        interval: {
            type: Sequelize.ENUM,
            values: ["30", "60"],
            required: true
        },
        snapshotData: {
            type: Sequelize.TEXT,
            get: function () {
              return JSON.parse(this.getDataValue("snapshotData"));
            },
            set: function (val) {
              return this.setDataValue("snapshotData", JSON.stringify(val));
            },
            required: true
        }
    })

    return Snapshot;
}