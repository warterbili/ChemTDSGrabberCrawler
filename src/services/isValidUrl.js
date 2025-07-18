function isValidUrl(url, baseUrl) {
try {
    // 拼接完整的URL
    const fullUrl = new URL(url, baseUrl).href;
    // 将 baseUrl 和 fullUrl 转换为 URL 对象以便比较
    const baseUrlObj = new URL(baseUrl);
    const fullUrlObj = new URL(fullUrl);
    // 检查是否为同一域名
    if (baseUrlObj.hostname !== fullUrlObj.hostname) {
    return false;
    }
    // 其他非跳转链接检查
    return !fullUrl.startsWith('javascript:') && !fullUrl.includes('#') && fullUrl !== baseUrl;
} catch (e) {
    return false;
}
};

module.exports = isValidUrl;