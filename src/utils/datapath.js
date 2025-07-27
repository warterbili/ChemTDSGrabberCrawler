const path = require('path');

module.exports = {
    readpath: path.join(__dirname, '../../data/工厂数据源.csv'), //读取的csv文件数据路径
    savepath: path.join(__dirname, '../../data/data.json'), //json数据保存路径
    outputrootpath: path.join(__dirname, '../../data'), //保存爬取中断的文件配置
    output_data: path.join(__dirname, '../../data/other_data'), //输出数据目录
};