module.exports = {
  refactorFinalData: async (data) => {
    let newList = [];
    if (data.count === 0) {
      return newList;
    }
    const list = data.rows;
    if (list.length === 0) {
      return newList;
    }
    list.map((item) => {
      let obj;
      const { expoAvgData, exchangeName, interval, duration } = item;
      const avgData = JSON.parse(expoAvgData);
      obj = {
        ...avgData,
        exchangeName,
        interval,
        duration,
      };
      newList.push(obj)
    });
    return newList;
  },
};
