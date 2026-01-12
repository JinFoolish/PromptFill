const fs = require('fs');
const path = require('path');

// 1. 设置你的 banks.json 路径
const filePath = path.join('backend/json/banks.json');

try {
    // 2. 读取文件内容
    const rawData = fs.readFileSync(filePath, 'utf8');
    const banks = JSON.parse(rawData);

    // 3. 提取第一层的 Key
    const keys = Object.keys(banks);

    // 4. 输出结果
    console.log("--- 提取到的变量 Keys (共 " + keys.length + " 个) ---");
    console.log(keys.join(', '));

    // 5. 格式化输出为 Antigravity Workflow 规则中可用的列表
    console.log("\n--- 建议复制到 Rule 中的格式 ---");
    console.log(keys.map(k => `{{${k}}}`).join(' '));

} catch (error) {
    console.error("读取或解析 JSON 失败:", error.message);
}