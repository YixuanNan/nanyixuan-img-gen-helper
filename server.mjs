import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 启用CORS
app.use(cors());

// 提供静态文件
app.use(express.static(path.join(__dirname, 'dist/src')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
  console.log(`📁 服务文件夹: dist/src`);
  console.log(`🔗 脚本地址: http://localhost:${PORT}/index.js`);
});
