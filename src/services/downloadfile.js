const fs = require('fs');
const path = require('path');
const axios = require("axios");

async function download_axios(key, value, tdsDir,index) {
    try {
        const pdf = path.join(tdsDir, 'pdf_tds_data');
        await fs.promises.mkdir(pdf).catch(() => {});

        const fileName = `document_${index}.pdf`;
        const filePath = path.join(pdf, fileName);

        const response = await axios({
            url: key,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const valueToSerializable = (value) => ({
            sources: Array.from(value.sources), // 转换Set为数组
            firstFound: value.firstFound,      // 保留ISO日期字符串
            pdfFileName: value.pdfFileName,     // 保留文件名
            end: value.end ? {
                url: value.end.url,
                content: value.end.content
            } : null
        });
        const jsonString = JSON.stringify(
            valueToSerializable(value), 
            null, 2  // 缩进2空格美化格式
        );

        await Promise.all([
            fs.promises.writeFile(filePath, response.data),
        ]);
        
        console.log('成功下载pdf和文本数据');
        return true;
    } catch (error) {
        console.error(`下载失败[${key}]:`, error.message);
        return false;
    }
}

module.exports = download_axios;
