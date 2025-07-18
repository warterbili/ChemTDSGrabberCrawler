module.exports = {
    // edge浏览器可执行文件地址
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    // 设置为 true 以启用无头模式
    headless: false, 
    // 用户数据目录
    userDataDir: "C:\\Users\\XRH-009\\AppData\\Local\\Microsoft\\Edge\\User Data",
    // 启动参数
    args: [
        '--no-sandbox', // 禁用沙盒模式
        '--disable-setuid-sandbox', // 禁用 setuid 沙盒
        '--disable-dev-shm-usage', // 禁用 /dev/shm 使用
        '--disable-accelerated-2d-canvas', // 禁用 GPU 加速
        '--disable-gpu', // 禁用 GPU 加速 
    ],
    ignoreHTTPSErrors: true, // 忽略 HTTPS 错误
    DEFAULT_VIEWPORT:null, // 使用默认视口
    experimental_options: {
        "excludeSwitches": ["enable-automation"], // 禁用自动化标志
        "useAutomationExtension": false // 禁用自动化扩展
    }
};
