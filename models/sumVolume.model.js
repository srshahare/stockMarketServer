module.exports = (sequelize, Sequelize) => {
    const SumVolume = sequelize.define("sumVolume", {
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
        volumeData: {
            type: Sequelize.TEXT,
            get: function () {
              return JSON.parse(this.getDataValue("volumeData"));
            },
            set: function (val) {
              return this.setDataValue("volumeData", JSON.stringify(val));
            },
            required: true
        }
    })

    return SumVolume;
}