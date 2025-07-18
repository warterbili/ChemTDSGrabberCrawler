const iconv = require('iconv-lite');
const fs = require('fs');
const csv = require('csv-parser');
const datapath = require('../utils/datapath.js')

async function readCSVStream(filePath) {
    return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream('gb2312'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        try {
          const jsonData = JSON.stringify(results, null, 2);

          fs.writeFile(
            datapath.savepath, 
            jsonData,
            'utf8',
            (err) => {
              if (err) reject(err);
              console.log(`文件已保存为:${datapath.savepath}`);
              resolve(results);
            }
          );
        } catch (err) {
          reject(err);
        }
      });
  });
};

readCSVStream(datapath.readpath)
