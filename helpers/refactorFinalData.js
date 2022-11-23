module.exports = {
  refactorFinalData: async (data, type) => {
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
      if(type === "expo") {
        const { expoAvgData, exchangeName, interval, duration } = item;
        const avgData = JSON.parse(expoAvgData);
        obj = {
          ...avgData,
          exchangeName,
          interval,
          duration,
        };
      }else {
        const { volumeData, exchangeName, interval } = item;
        const volData = JSON.parse(volumeData);
        obj = {
          ...volData,
          exchangeName,
          interval,
        };
      }
      newList.push(obj)
    });
    return newList;
  },
};
