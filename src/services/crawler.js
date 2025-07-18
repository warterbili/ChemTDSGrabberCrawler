const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const config = require("../utils/config.js");
// const browserConfig = require('../utils/browserconfig.js');
const waitpage = require("../utils/pagewait.js");
const isValidUrl = require("./isValidUrl.js");
const wordsdata = require("../utils/wordsdata.js");
const fs = require("fs");
const path = require("path");
const datapath = require("../utils/datapath.js");
const { time } = require("console");

// 1. 启用Stealth插件
puppeteer.use(StealthPlugin());

// function mapToObj(map) {
//   const obj = {};
//   for (const [key, value] of map) {
//     obj[key] = {
//       sources: Array.from(value.sources), // Set转数组
//       firstFound: value.firstFound
//     };
//   }
//   return obj;
// }

function generateTextPath(textPath) {
  return textPath
    .map((node) =>
      String(node.text || "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .join(" → ");
}

async function startCrawler(url, browser, item) {
  // 网页爬虫主要参数记录
  const visited = new Set(); // 已访问URL集合
  const pdfLinks = new Set(); // 发现的PDF链接
  const tdsLinks = new Set(); // 发现的TDS链接
  const pdfRecords = [];
  const uniqueUrls = new Set(); // 用于存储唯一的PDF链接

  console.log(url);
  const queue = [{ url: url, depth: 0, textPath: [] }]; // 待处理的URL队列
  // const pagepool = []; // 页面池
  let visitCount = 0; // 访问计数器

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(10000); // 设置默认超时时间为10秒
    page.setDefaultNavigationTimeout(10000); // 设置默认导航超时时间为10秒

    const pages = await browser.pages();
    // 如果页面数量超过5个，关闭最早的两个页面
    console.log(pages.length, "当前页面数量");

    if (pages.length >= 3) {
      // 按打开顺序关闭最早的两个页面
      await pages[0].close();
      // await pages[1].close();
      console.log("已关闭最早的两个页面");
    }
    // 获取反爬ua
    const defaultUA = await browser.userAgent();
    const cleanUA = defaultUA
      .replace("HeadlessEdg", "Edg")
      .replace("HeadlessChrome", "Chrome");
    // 设置标准反爬参数
    await page.setUserAgent(cleanUA);
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "document",
      "Upgrade-Insecure-Requests": "1",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
    });

    const response = await page.goto(url, waitpage);

    if (response && response.status() < 400) {
      console.log(`✅ ${item.供应商名称} 官网可访问: ${url}`);

      const output_data = path.join(datapath.outputrootpath, "output_data_txt");
      if (!fs.existsSync(output_data)) {
        fs.mkdirSync(output_data, { recursive: true });
      }
      const data_jilu = path.join(output_data, "data_jilu.txt");
      try {
        fs.writeFileSync(data_jilu, url, "utf8");
        console.log(`[爬虫状态保存] 当前主网站: ${url}`);
      } catch (err) {
        console.error("写入失败:", err);
      }

      while (queue.length > 0 && visitCount < config.maxScope) {
        const { url: currentUrl, depth, textPath } = queue.shift();
        if (depth > config.maxDepth || visited.has(currentUrl)) continue; // 跳过已访问或超出深度的链接

        visited.add(currentUrl); // 标记为已访问

        try {
          console.log(currentUrl);

          // const delay = ms => new Promise(res => setTimeout(res, ms));
          // await delay(5000 + Math.random() * 2000); // 随机延迟1-3秒
          // 若在导航前调用，会导致浏览器上下文失去活性，中断页面跳转的初始化流程
          // 正确顺序应该放在导航之后并且使用puppeteer的标准等待函数，避免使用settimeout阻塞后续操作

          // await page.waitForTimeout(1000 + Math.random() * 2000); // 等待1-3秒
          await page.goto(currentUrl, waitpage);
          await page.waitForTimeout(1000 + Math.random() * 2000); // 等待1-3秒
        //   await page.waitForNavigation({ timeout: 10000, waitUntil: 'domcontentloaded' });

          visitCount++;
          console.log(`Processing: ${currentUrl}`);

          // const allLinksHandle = await page.$$('a[href]');

          // 这里promise.all返回的是一个数组，包含所有链接的href和text
          const links = await page.evaluate(() =>
            Array.from(document.querySelectorAll("a[href]")).map((a) => ({
              href: a.href,
              text: a.textContent.trim(),
            }))
          );

          for (const { href, text } of links) {
            if (isValidUrl(href, currentUrl)) {
              const absoluteUrl = new URL(href, currentUrl).href;

              if (absoluteUrl.toLowerCase().endsWith(".pdf")) {
                const pdf_fileName = absoluteUrl.split("/").pop().split("?")[0];

                const targetMap =
                  text &&
                  wordsdata.some((keyword) =>
                    text.toLowerCase().includes(keyword.toLowerCase())
                  )
                    ? tdsLinks
                    : pdfLinks;

                targetMap.add(absoluteUrl);

                console.log(tdsLinks.size, pdfLinks.size);

                if (!uniqueUrls.has(absoluteUrl)) {
                  pdfRecords.push({
                    name: item.供应商名称,
                    pdfname: pdf_fileName,
                    pdfUrl: absoluteUrl,
                    fullTextPath: generateTextPath([...textPath, { text }]),
                  });
                  uniqueUrls.add(absoluteUrl);
                }
              } else if (!visited.has(href)) {
                queue.push({
                  url: href,
                  depth: depth + 1,
                  textPath: [...textPath, { text }],
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error processing ${currentUrl}:`, error.message);
          await page.close();
          continue; // 跳过当前链接，继续处理下一个
        }
      }
    } else {
      throw new Error(`HTTP状态码: ${response ? response.status() : "无响应"}`);
    }
    await page.close();

    console.log("PDF Links Found:", pdfLinks.size);
    console.log("TDS Links Found:", tdsLinks.size);

    // console.log( pdfRecords);
    return [Array.from(pdfLinks), Array.from(tdsLinks), Array.from(pdfRecords)];
  } catch (error) {
    console.error(
      `❌ ${item.供应商名称} 官网不可访问: ${url} - 错误: ${error.message}`
    );
    return [Array.from(pdfLinks), Array.from(tdsLinks), Array.from(pdfRecords)];
  }
}

module.exports = startCrawler;
