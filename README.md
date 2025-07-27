NEW_FILE_CODE
# ChemTDSGrabber/化工TDS采集器

这是一个tds和pdf文件爬虫项目，主要用于化工企业的tds文件收集。

## 目录结构

- `src/` - 源代码文件夹
  - `services/` - 服务相关代码
  - `utils/` - 工具函数
- `data/` - 数据文件夹
- `test/` - 测试文件
- `package.json` - 项目配置文件
- `README.md` - 项目文档

## 项目介绍

这是一个puppeteer爬虫项目，用于企业级的tds和pdf文件的爬取。
主要给化工企业网上搜集tds文件。

## 环境要求

- Node.js (版本 12.0 或更高)
- npm (通常随 Node.js 一起安装)

## 安装步骤

1. 确保已安装 Node.js，可以在终端中运行以下命令验证：
   ```bash
   node --version
   npm --version
   ```

2. 克隆或下载本项目到本地

3. 在项目根目录下打开终端，安装项目依赖：
   ```bash
   npm install
   ```

## 使用方法

1. 准备数据文件：
   - 将你的企业网站数据CSV文件放在 [data](file:///D:/ChemTDSGrabber_%E5%8C%96%E5%B7%A5TDS%E9%87%87%E9%9B%86%E5%99%A8/ChemTDSGrabber-TDS-/data) 文件夹下
   - 修改 [src/utils/datapath.js](file:///D:/ChemTDSGrabber_%E5%8C%96%E5%B7%A5TDS%E9%87%87%E9%9B%86%E5%99%A8/ChemTDSGrabber-TDS-/src/utils/datapath.js) 文件中的路径配置：
     - `readpath`: 你的CSV文件路径
     - `savepath`: 转换后JSON文件保存路径
     - `outputrootpath`: 爬取过程中断点保存路径
     - `output_data`: 输出数据目录

2. 将CSV文件转换为JSON格式：
   ```bash
   node src/utils/fileConversion.js
   ```

3. 运行爬虫：
   ```bash
   npm start
   ```
   或者直接运行：
   ```bash
   node src/index.js
   ```

## 配置说明

在 [src/utils/datapath.js](file:///D:/ChemTDSGrabber_%E5%8C%96%E5%B7%A5TDS%E9%87%87%E9%9B%86%E5%99%A8/ChemTDSGrabber-TDS-/src/utils/datapath.js) 文件中可以配置以下路径：
- `readpath`: 输入的CSV文件路径
- `savepath`: 转换后的JSON文件保存路径
- `outputrootpath`: 爬虫中断状态保存路径
- `output_data`: 爬取到的数据保存路径

## 项目各文件介绍

在使用前先需要将你的csv企业网站数据放在data文件夹下，文件名自己随意。在[datapath.js](file:///D:/ChemTDSGrabber_%E5%8C%96%E5%B7%A5TDS%E9%87%87%E9%9B%86%E5%99%A8/ChemTDSGrabber-TDS-/src/utils/datapath.js)中修改数据路径。
其中readpath参数就是你csv企业网站数据的文件路径，savepath参数是你转换完成后的json文件的保存路径。

在爬虫使用前，先要用`fileConversion.js`将csv文件转换成json文件。
- `fileConversion.js` - 文件转换相关代码
这个文件用于将csv文件转成json文件。
其中csv文件包含的是企业的网站数据
转换完成后类似

```
