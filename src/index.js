require('dotenv').config();
const puppeteer = require('puppeteer-core');
const config = require('./utils/config.js'); 
const datapath = require('./utils/datapath.js');
const browserConfig = require('./utils/browserconfig.js');
const crawler = require('./services/crawler.js');
const download_axios = require('./services/downloadfile.js');
const fs = require('fs');
const path = require('path');
const axios = require("axios");

const data = JSON.parse(fs.readFileSync(datapath.savepath, 'utf8'));

(async ()=>{
    const browser = await puppeteer.launch(browserConfig);

    for (const item of data) {

        const url = item['官网首页网址'];

        (async () => {
            const output_data = path.join(datapath.outputrootpath, 'output_data_txt');
            if (!fs.existsSync(output_data)) {
                fs.mkdirSync(output_data, { recursive: true });
            }
            const data_jilu = path.join(output_data, 'data_jilu.txt');
            
            // 修正1：移除对文件的mkdir操作（文件不需要创建目录）
            // 修正2：添加writeFile的await和错误处理
            await fs.promises.writeFile(data_jilu, url, 'utf8')
                .catch(err => console.error('写入失败:', err));
            
            console.log(`[爬虫状态保存] 当前主网站: ${url}`);
        })();

        // 如果链接不存在跳过
        if (!url) continue;

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

        async function downloadPdf(pdfUrl, index, outputDir) {
            try {
                const fileName = `document_${index + 1}.pdf`; // 生成文件名
                const filePath = path.join(outputDir, fileName);
                
                const response = await axios({
                url: pdfUrl,
                method: 'GET',
                responseType: 'arraybuffer'
                });
            
                fs.writeFileSync(filePath, response.data);
                console.log(`成功下载: ${fileName}`);
                
                return true;
            } catch (error) {
                console.error(`下载失败[${pdfUrl}]:`, error.message);
                return false;
            }
        }

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
async function ensureAndWriteJSON(outputDir, pdfRecords) {
    try {
        // 检查目录是否存在（使用Promise版本）
        try {
            await fs.promises.access(outputDir);
        } catch {
            await fs.promises.mkdir(outputDir, { recursive: true });
        }

        // 写入JSON文件（使用await确保完成）
        const filePath = path.join(outputDir, 'output.json');
        await fs.promises.writeFile(
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

        const filepath = await ensureAndWriteJSON(outputDir,pdfRecords);

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
        // 检查目录是否存在（使用Promise版本）
        try {
            await fs.promises.access(outputDir);
        } catch {
            await fs.promises.mkdir(outputDir, { recursive: true });
        }

        // 读取JSON文件
        const jsonPath = path.join(outputDir, 'output.json');
        const jsonData = JSON.parse(await fs.promises.readFile(jsonPath, 'utf8'));
        
        // 转换并写入CSV
        const csvPath = path.join(outputDir, 'output.csv');
        const csvData = await jsonToCsv(jsonData);
        await fs.promises.writeFile(csvPath, csvData);
        
        console.log(`CSV文件已生成: ${csvPath}`);
        return csvPath;
    } catch (err) {
        console.error('转换失败:', err);
        return false;
    }
}

        ensureAndWriteCSV(outputDir);
        };
        
    }
})();

