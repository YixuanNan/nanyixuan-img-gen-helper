# 图片生成调用方式对比和快速参考

## 两种主要调用方式

### 方式 1️⃣: 斜杠命令 (`/imagine`)

**最简单、最快速的方式**

```typescript
// 基础用法
const url = await triggerSlash('/imagine 美丽的女孩');

// 带类型和参数
const url = await triggerSlash(`
  /imagine you 
  happy smile, in garden 
  negative="low quality" 
  seed=12345
`);
```

**优点**：
- ✅ 最简单易用
- ✅ 自动处理错误
- ✅ 无需配置额外参数
- ✅ 支持多种后端（ComfyUI, 等）

**缺点**：
- ❌ 控制选项较少
- ❌ 错误提示不详细

**何时使用**：
- 快速生成图片
- 不需要复杂控制
- 只是想要一个简单的图片

---

### 方式 2️⃣: Novel AI 直接 API

**更细致的控制、更多选项**

```typescript
// 基础用法
const imageData = await generateImageWithNovelAI('美丽的女孩');

// 完整控制
const imageData = await generateImageWithNovelAI('elf warrior', {
  negative: 'low quality, ugly',
  quality: 'high',
  resolution: 'hd',
  seed: 12345
});
```

**优点**：
- ✅ 更细致的参数控制
- ✅ 可获取详细错误信息
- ✅ 支持缓存和批量处理
- ✅ 可检查配置状态
- ✅ 更适合高级应用

**缺点**：
- ❌ 需要配置 Novel AI API
- ❌ 需要 Novel AI 账户和余额
- ❌ 代码略微复杂
- ❌ 仅限于 Novel AI

**何时使用**：
- 需要特定的质量/分辨率设置
- 想要可靠的错误处理
- 需要在脚本中批量生成
- 想要固定结果（使用种子）

---

## 快速参考表

| 功能 | 斜杠命令 | Novel AI API |
|-----|--------|------------|
| **导入** | 无需导入 | `import { generateImageWithNovelAI } from './novelAIImageGeneration'` |
| **基础调用** | `triggerSlash('/imagine 提示词')` | `generateImageWithNovelAI('提示词')` |
| **设置质量** | `/imagine you ... steps=30` | `{ quality: 'high' }` |
| **设置分辨率** | `/imagine ... width=768 height=768` | `{ resolution: 'hd' }` |
| **检查可用性** | 自动 | `await isNovelAIAvailable()` |
| **错误处理** | 自动显示 toast | 需要自己处理 |
| **结果格式** | URL 字符串 | base64 或 URL |
| **耗时** | 取决于后端 | 40-120 秒 |

---

## 使用场景决策树

```
需要生成图片？
├─ 简单快速生成？
│  └─ 使用 /imagine 命令 ✅
│     const url = await triggerSlash('/imagine 提示词');
│
├─ 需要高质量 + 特定分辨率？
│  └─ 使用 Novel AI API ✅
│     const img = await generateImageWithNovelAI('提示词', 
│                    { quality: 'high', resolution: 'hd' });
│
├─ 需要在事件中自动生成？
│  └─ 两种都可以，建议 Novel AI API
│     eventOn(tavern_events.MESSAGE_UPDATED, async () => {
│       if (await isNovelAIAvailable()) { ... }
│     });
│
├─ 需要批量生成多个？
│  └─ 使用 Novel AI API ✅
│     for (const prompt of prompts) {
│       const img = await generateImageWithNovelAI(prompt);
│     }
│
└─ 需要固定可复现的结果？
   └─ 使用 Novel AI API + seed ✅
      await generateImageWithNovelAI('提示词', 
         { seed: 12345 });
```

---

## 代码示例

### 场景 1: 快速为角色生成配图

```typescript
// 用户点击按钮，快速生成图片
eventOn(getButtonEvent('生成配图'), async () => {
  const url = await triggerSlash('/imagine you smiling in garden');
  toastr.success('已生成配图！');
});
```

### 场景 2: 高质量角色肖像系列

```typescript
// 为不同表情生成高质量肖像
async function generateCharacterPortraits() {
  const expressions = ['happy', 'sad', 'angry', 'neutral'];
  
  for (const expression of expressions) {
    const img = await generateImageWithNovelAI(
      `character, ${expression} expression`,
      { quality: 'high', resolution: 'hd' }
    );
    console.log(`${expression}:`, img);
  }
}
```

### 场景 3: 自动为消息生成配图

```typescript
// 每当收到消息时自动生成配图
eventOn(tavern_events.MESSAGE_UPDATED, async (message_id) => {
  // 先检查 Novel AI 是否可用
  if (await isNovelAIAvailable()) {
    const img = await generateImageWithNovelAI(
      '角色在说话，表情认真',
      { quality: 'medium' }
    );
    
    if (img) {
      toastr.success('已生成配图');
    }
  }
});
```

### 场景 4: 可复现的结果

```typescript
// 使用固定种子生成相同的图片
const seed = 42;

// 第一次生成
const img1 = await generateImageWithNovelAI('beautiful girl', { seed });

// 第二次生成 - 结果完全相同
const img2 = await generateImageWithNovelAI('beautiful girl', { seed });

console.log('两次生成结果相同:', img1 === img2); // true
```

---

## 性能建议

### ⚡ 优化技巧

```typescript
// ❌ 不好 - 同时发起多个请求
Promise.all([
  generateImageWithNovelAI('prompt1'),
  generateImageWithNovelAI('prompt2'),
  generateImageWithNovelAI('prompt3'),
]);

// ✅ 好 - 排队生成，避免过载
for (const prompt of prompts) {
  const img = await generateImageWithNovelAI(prompt);
  await new Promise(r => setTimeout(r, 1500)); // 间隔 1.5 秒
}

// ✅ 最好 - 使用缓存避免重复生成
const cache = new Map();
async function generateCached(prompt) {
  if (cache.has(prompt)) return cache.get(prompt);
  const img = await generateImageWithNovelAI(prompt);
  cache.set(prompt, img);
  return img;
}
```

---

## 错误处理

### 使用 /imagine 命令

```typescript
try {
  const url = await triggerSlash('/imagine 提示词');
  if (url) {
    // 成功
  } else {
    toastr.error('生成失败');
  }
} catch (error) {
  toastr.error(`错误: ${error}`);
}
```

### 使用 Novel AI API

```typescript
// 检查可用性
if (!(await isNovelAIAvailable())) {
  toastr.error('Novel AI 未配置');
  return;
}

try {
  const img = await generateImageWithNovelAI('提示词', {
    quality: 'high'
  });
  
  if (img) {
    console.log('成功');
  } else {
    toastr.error('生成失败');
  }
} catch (error) {
  toastr.error(`错误: ${error}`);
}
```

---

## 配置检查清单

### 使用斜杠命令前检查

- [ ] 图片生成扩展已安装
- [ ] 图片生成后端已启用（ComfyUI 等）
- [ ] API 密钥已配置（如需要）

### 使用 Novel AI API 前检查

- [ ] Novel AI 账户已创建
- [ ] API 密钥已获取
- [ ] API 密钥已在酒馆中配置
- [ ] 账户有充足的积分/余额
- [ ] 网络连接正常

---

## 完整工作流示例

### 示例：创建完整的图片生成系统

```typescript
import { 
  generateImageWithNovelAI, 
  isNovelAIAvailable 
} from './novelAIImageGeneration';

// 1. 初始化
async function initImageGeneration() {
  const novelAIAvailable = await isNovelAIAvailable();
  
  if (novelAIAvailable) {
    console.log('✅ Novel AI 已就绪');
    setupAdvancedGeneration();
  } else {
    console.log('⚠️  Novel AI 不可用，使用斜杠命令');
    setupBasicGeneration();
  }
}

// 2. 高级模式 - Novel AI API
function setupAdvancedGeneration() {
  eventOn(getButtonEvent('高质量生成'), async () => {
    const img = await generateImageWithNovelAI(
      'beautiful anime girl, detailed, high quality',
      {
        quality: 'high',
        resolution: 'hd',
        negative: 'low quality, blurry'
      }
    );
    
    if (img) {
      toastr.success('已生成高质量图片');
    }
  });
}

// 3. 基础模式 - 斜杠命令
function setupBasicGeneration() {
  eventOn(getButtonEvent('快速生成'), async () => {
    const url = await triggerSlash('/imagine beautiful anime girl');
    if (url) {
      toastr.success('已生成图片');
    }
  });
}

// 4. 启动
initImageGeneration();
```

---

## 相关文件速查

| 文件 | 说明 | 用途 |
|-----|-----|------|
| `IMAGE_GENERATION_GUIDE.md` | 斜杠命令详细指南 | 学习 `/imagine` 使用 |
| `NOVEL_AI_API_GUIDE.md` | Novel AI API 详细指南 | 学习 API 调用方式 |
| `src/imageGenerationExample.ts` | 斜杠命令示例代码 | 参考实现 |
| `src/novelAIImageGeneration.ts` | Novel AI API 封装 | 直接使用 |
| `src/messageListener.ts` | 事件监听集成 | 事件触发示例 |

---

## 更新日志

### v1.0
- ✅ 实现斜杠命令调用方式
- ✅ 实现 Novel AI API 直接调用
- ✅ 添加便捷函数库
- ✅ 完整文档和示例

