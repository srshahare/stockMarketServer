module.exports = (sequelize, Sequelize) => {
    const Option = sequelize.define("option", {
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
        optionSymbol: {
            type: Sequelize.STRING,
            required: true
        },
        interval: {
            type: Sequelize.ENUM,
            values: ["30", "60"],
            required: true
        },
        optionData: {
            type: Sequelize.TEXT,
            get: function () {
              return JSON.parse(this.getDataValue("optionData"));
            },
            set: function (val) {
              return this.setDataValue("optionData", JSON.stringify(val));
            },
            required: true
        }
    })

    return Option;
}