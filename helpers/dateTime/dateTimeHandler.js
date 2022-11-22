const moment = require("moment")

module.exports = {
  getLastMonthsThursday: () => {
    let result = moment().endOf("month");
    while(result.day() !== 4) {
        result.subtract(1, 'day')
    }
    const currentTime = moment().unix()
    const nextThu = result.unix();
    if(currentTime > nextThu) {
        result = moment().add(1, 'M').endOf('month')
        while(result.day() !== 4) {
            result.subtract(1, 'day')
        }
    }
    return result;
  },
  getLastWeeksThursday: () => {
    let result = moment().endOf("week");
    while(result.day() !== 4) {
        result.subtract(1, 'day')
    }
    const currentTime = moment().unix()
    const nextThu = result.unix();
    if(currentTime > nextThu) {
        result = moment().add(1, "w").endOf('week')
        while(result.day() !== 4) {
            result.subtract(1, 'day')
        }
    }
    return result;
  }
};
