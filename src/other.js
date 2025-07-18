require('dotenv').config();
const puppeteer = require('puppeteer-core');
const config = require('./utils/config.js'); 
const datapath = require('./utils/datapath.js');
const browserConfig = require('./utils/browserconfig.js');
const crawler = require('./services/crawler.js');
const fs = require('fs');
const path = require('path');
const axios = require("axios");

        async function downloadPdf(pdfUrl, index, outputDir) {
            try {
                const fileName = `document_${index + 1}.pdf`; // 生成文件名
                const filePath = path.join(outputDir, fileName);
                
                const response = await axios({
                url: pdfUrl,
                method: 'GET',
                responseType: 'arraybuffer',
                timeout: 60000 // 设置60秒超时
                });
            fs.writeFileSync(filePath, response.data);
            console.log(`成功下载: ${fileName}`);

                return true;
            } catch (error) {
                console.error(`下载失败[${pdfUrl}]:`, error.message);
                return false;
            }
        }

        async function ensureAndWriteJSON(outputDir, pdfRecords) {
            try {
                // 检查目录是否存在（使用Promise版本）
                try {
                    fs.accessSync(outputDir);
                } catch {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                const filePath = path.join(outputDir, 'output.json');
                fs.writeFileSync(
                    filePath,
                    JSON.stringify(pdfRecords, null, 2)
                );
                console.log(`JSON文件已写入: ${filePath}`);
                return filePath;
            } catch (err) {
                console.error('操作失败:', err);
                return false;
            }
        }

        async function jsonToCsv(jsonData) {
            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                throw new Error('JSON数据必须是非空数组');
            }

            const headers = Object.keys(jsonData[0]);

            const csvRows = [
                headers.join(','),
                ...jsonData.map(row => 
                    headers.map(field => {
                        const value = row[field];
                        return typeof value === 'string' && value.includes(',') 
                            ? `"${value}"` 
                            : value;
                    }).join(',')
                )
            ];

            return csvRows.join('\n');
    }

    async function ensureAndWriteCSV(outputDir) {
        try {
            // 检查目录是否存在
            try {
                fs.accessSync(outputDir);
            } catch {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // 读取JSON文件
            const jsonPath = path.join(outputDir, 'output.json');
            const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            
            // 转换并写入CSV
            const csvPath = path.join(outputDir, 'output.csv');
            const csvData = await jsonToCsv(jsonData);
            fs.writeFileSync(csvPath, csvData);
            console.log(`CSV文件已生成: ${csvPath}`);
            return csvPath;
        } catch (err) {
            console.error('转换失败:', err);
            return false;
        }
    }


// 读取要爬取的网站json文件
const data = JSON.parse(fs.readFileSync(datapath.savepath, 'utf8'));

(async ()=>{

    const browser = await puppeteer.launch(browserConfig);

    // let maxlive = 10; //最大的连续 爬取网站数量
    // let contlive = 0; // 当前连续爬取网站数量
    for (const item of data) {

    //   if(contlive >= maxlive) {
    //     if (browser) await browser.close();
    //     browser = await puppeteer.launch(browserConfig);
    //     contlive = 0;
    //   }else {
    //     contlive++;
    //   }
      // 当前主网页网址
      const url = item['官网首页网址'];
      // 记录当前主网站网址写入文件，设置断点

        // 如果链接不存在跳过
        if (!url) continue;
        // 在爬取前随机延迟1到3秒
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(5000 + Math.random() * 2000); // 随机延迟1-3秒
        // 主要爬取逻辑
        const [pdfLinks, tdsLinks, pdfRecords] = await crawler(url, browser, item);
        console.log(pdfRecords);
        
        // 如果没有PDF链接或TDS链接则跳过
        if (!pdfLinks || !tdsLinks) continue;

        // 输出PDF和TDS链接
        console.log(`PDF Links: ${pdfLinks}`);
        console.log(`TDS Links: ${tdsLinks}`);

        if (pdfLinks.length>0 || tdsLinks.length>0){
        const outputDir = path.join(datapath.output_data, `${item.供应商名称}_data`);
            // 确保目录存在
        if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        }

        const tdsPath = path.join(outputDir, 'tds');
        const errPath = path.join(outputDir, 'err');

        if (!fs.existsSync(tdsPath)) {
        fs.mkdirSync(tdsPath, { recursive: true });
        }

        if (!fs.existsSync(errPath)) {
        fs.mkdirSync(errPath, { recursive: true });
        }

        console.log(`目录创建完成:
        ${outputDir}
        ${tdsPath} 
        ${errPath}`);

        // 批量下载所有PDF
        (async () => {
        console.log('开始下载PDF文件...');
        for (let i = 0; i < pdfLinks.length; i++) {
            await downloadPdf(pdfLinks[i], i, errPath);
        }
        console.log('所有pdf文件处理完成');
        })();

        // 批量下载所有TDS
        (async () => {
        console.log('开始下载TDS文件...');
        for (let i = 0; i < tdsLinks.length; i++) {
            await downloadPdf(tdsLinks[i], i, tdsPath);
        }
        console.log('所有tds文件处理完成');
        })();

        // console.log(pdfRecords);
      ensureAndWriteJSON(outputDir, pdfRecords);
      ensureAndWriteCSV(outputDir);
    
    };
        
   }
})();

