# Novel AI 直接 API 调用指南

## 概述

除了使用斜杠命令 `/imagine` 之外，你还可以直接调用 SillyTavern 中配置的 Novel AI API 来生成图片。这种方法提供了更多的控制和灵活性。

## 基本概念

### Novel AI 是什么？

Novel AI 是一个先进的 AI 图片生成服务，可以：
- 生成高质量的动漫和二次元风格图片
- 支持多种自定义参数
- 提供细粒度的质量和风格控制

### 必要条件

1. **在酒馆中配置 Novel AI API**：
   - 需要有效的 Novel AI 账户和 API 密钥
   - 在酒馆的设置中配置 Novel AI API
   - 确保 API 已启用

2. **权限要求**：
   - 需要 Novel AI 账户有足够的余额/积分来进行生成

## 项目中的 Novel AI 模块

项目提供了 `src/novelAIImageGeneration.ts` 文件，包含以下函数：

### 1. `generateImageWithNovelAI(prompt, options?)`

**基础的 Novel AI 图片生成函数**

```typescript
import { generateImageWithNovelAI } from './novelAIImageGeneration';

// 基础用法
const imageData = await generateImageWithNovelAI('beautiful anime girl');

// 完整选项
const imageData = await generateImageWithNovelAI('elf warrior with glowing sword', {
  negative: 'low quality, blurry, ugly',
  quality: 'high',           // 'low' | 'medium' | 'high'
  resolution: 'high',        // 'low' | 'medium' | 'high' | 'hd'
  seed: 12345,              // 固定种子可以复现结果
  model: 'nai-diffusion-3', // 指定模型
  uncensored: false         // 内容过滤开关
});
```

**参数说明**：
- `prompt` (string): 必须。图片描述提示词
- `negative` (string): 可选。不希望生成的内容
- `quality` (string): 可选。生成质量，默认 'medium'
  - `'low'` - 快速生成，质量较低
  - `'medium'` - 平衡质量和速度
  - `'high'` - 最高质量，耗时最长
- `resolution` (string): 可选。输出分辨率，默认 'medium'
  - `'low'` - 384x384
  - `'medium'` - 512x512
  - `'high'` - 768x768
  - `'hd'` - 1024x1024
- `seed` (number): 可选。随机种子
- `model` (string): 可选。使用的模型名称
- `uncensored` (boolean): 可选。内容过滤

### 2. `generateCharacterWithNovelAI(characterDescription?, style?)`

**方便的角色生成函数**

```typescript
import { generateCharacterWithNovelAI } from './novelAIImageGeneration';

// 生成默认角色
const url = await generateCharacterWithNovelAI();

// 生成特定角色
const url = await generateCharacterWithNovelAI(
  'blue-haired elf mage with magical robes',
  'detailed anime style'
);
```

### 3. `generateAndAddImageWithNovelAI(prompt, options?)`

**生成并自动添加到聊天**

```typescript
import { generateAndAddImageWithNovelAI } from './novelAIImageGeneration';

// 生成图片并自动添加到当前聊天
const imageData = await generateAndAddImageWithNovelAI(
  'fantasy landscape with floating islands',
  {
    quality: 'high',
    resolution: 'high',
    addToChat: true  // 自动添加到聊天消息
  }
);
```

### 4. `getNovelAIConfig()`

**获取 Novel AI 配置信息**

```typescript
import { getNovelAIConfig } from './novelAIImageGeneration';

const config = await getNovelAIConfig();
console.log('Novel AI 配置:', config);
// 返回: { enabled: boolean, model: string, ... }
```

### 5. `isNovelAIAvailable()`

**检查 Novel AI 是否可用**

```typescript
import { isNovelAIAvailable } from './novelAIImageGeneration';

const available = await isNovelAIAvailable();
if (available) {
  console.log('Novel AI 已就绪');
} else {
  console.log('Novel AI 不可用');
}
```

## 使用示例

### 示例 1：生成简单的动漫角色

```typescript
import { generateCharacterWithNovelAI } from './novelAIImageGeneration';

const portraitUrl = await generateCharacterWithNovelAI();
console.log('生成的肖像:', portraitUrl);
```

### 示例 2：生成具有特定风格的角色

```typescript
import { generateImageWithNovelAI } from './novelAIImageGeneration';

const imageUrl = await generateImageWithNovelAI(
  '(masterpiece, best quality), 1girl, long blue hair, mage robes, magical aura, detailed eyes',
  {
    negative: '(low quality, worst quality), blur, mismatched eyes, asymmetry',
    quality: 'high',
    resolution: 'hd',
    seed: 42 // 固定种子以复现效果
  }
);
```

### 示例 3：在事件中自动生成图片

```typescript
import { generateAndAddImageWithNovelAI, isNovelAIAvailable } from './novelAIImageGeneration';

// 在消息更新时自动生成配图
eventOn(tavern_events.MESSAGE_UPDATED, async (message_id: number) => {
  // 先检查 Novel AI 是否可用
  if (await isNovelAIAvailable()) {
    try {
      const messages = getChatMessages(message_id);
      if (messages.length > 0 && !messages[0].is_user) {
        // 为角色消息生成图片
        await generateAndAddImageWithNovelAI(
          '角色在说话，表情认真，背景是房间',
          {
            quality: 'medium',
            resolution: 'high',
            addToChat: true
          }
        );
        
        toastr.success('已为消息生成 Novel AI 配图');
      }
    } catch (error) {
      console.error('自动生成失败:', error);
    }
  }
});
```

### 示例 4：创建图片生成按钮

```typescript
import { generateCharacterWithNovelAI, isNovelAIAvailable } from './novelAIImageGeneration';

// 创建一个按钮来生成 Novel AI 图片
eventOn(getButtonEvent('用Novel AI生成角色'), async () => {
  // 检查可用性
  if (!(await isNovelAIAvailable())) {
    toastr.error('Novel AI 未配置或不可用', '错误');
    return;
  }

  try {
    toastr.info('正在使用 Novel AI 生成图片...', '生成中');
    
    const portraitUrl = await generateCharacterWithNovelAI(
      '美丽的女性角色，精细的细节，高质量'
    );
    
    if (portraitUrl) {
      toastr.success('Novel AI 图片生成成功！', '成功');
    } else {
      toastr.error('生成失败，请检查配置', '错误');
    }
  } catch (error) {
    toastr.error(`生成出错: ${error}`, '错误');
  }
});
```

### 示例 5：高级用法 - 批量生成多个变体

```typescript
import { generateImageWithNovelAI } from './novelAIImageGeneration';

async function generateCharacterVariants(characterName: string) {
  const basePrompt = `${characterName}, beautiful anime character`;
  
  const variants = [
    '嬉皮笑脸的表情',
    '认真的表情',
    '悲伤的表情',
  ];
  
  const results = [];
  
  for (const emotion of variants) {
    const prompt = `${basePrompt}, ${emotion}`;
    
    try {
      const imageData = await generateImageWithNovelAI(prompt, {
        quality: 'high',
        resolution: 'high',
      });
      
      results.push({
        emotion,
        imageData,
      });
      
      // 避免频繁请求，添加延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`生成 ${emotion} 失败:`, error);
    }
  }
  
  return results;
}

// 使用
const variants = await generateCharacterVariants('Aria');
console.log('生成的变体:', variants);
```

## 对比：Novel AI API vs /imagine 命令

| 特性 | Novel AI API | /imagine 命令 |
|------|-------------|-------------|
| **调用方式** | 直接 HTTP 请求 | 斜杠命令 |
| **控制粒度** | 更细致 | 基础 |
| **配置灵活性** | 高 | 中等 |
| **错误处理** | 可自定义 | 自动处理 |
| **集成难度** | 低 | 最低 |
| **适用场景** | 需要特定控制 | 快速简单使用 |

## 常见问题

### Q: 生成的图片显示为 base64，如何保存？

**A**: 返回的是 base64 编码的图片数据。可以这样显示：

```typescript
const imageData = await generateImageWithNovelAI('prompt');

// 创建图片标签显示
const imageTag = `![Novel AI 生成](data:image/png;base64,${imageData})`;

// 添加到聊天
await createChatMessages(
  [{ role: 'user', message: imageTag }],
  { refresh: 'affected' }
);
```

### Q: Novel AI 生成需要多长时间？

**A**: 取决于设置：
- `quality: 'low'` - 10-15 秒
- `quality: 'medium'` - 20-30 秒
- `quality: 'high'` - 40-60 秒
- `resolution: 'hd'` - 额外增加 20-30 秒

### Q: 如何获得更好的图片质量？

**A**: 使用这些技巧：

```typescript
const imageData = await generateImageWithNovelAI(
  '(masterpiece, best quality, detailed), beautiful girl, high detail',
  {
    negative: '(low quality, worst quality, blurry, mismatched, bad hands)',
    quality: 'high',
    resolution: 'hd',
    seed: Math.floor(Math.random() * 1000000) // 随机种子尝试不同结果
  }
);
```

### Q: Novel AI API 和 ComfyUI 有什么区别？

**A**:
- **Novel AI**: 云端服务，需要 API 密钥，生成速度快，风格固定
- **ComfyUI**: 本地运行，需要配置，速度取决于硬件，风格可自定义

### Q: 如何检查 Novel AI 余额？

**A**: 通过 `getNovelAIConfig()` 获取配置信息，或登录 Novel AI 网站查看。

## 高级技巧

### 1. 缓存生成结果

```typescript
const imageCache = new Map<string, string>();

async function generateImageCached(prompt: string): Promise<string | undefined> {
  if (imageCache.has(prompt)) {
    console.log('从缓存返回图片');
    return imageCache.get(prompt);
  }
  
  const imageData = await generateImageWithNovelAI(prompt);
  if (imageData) {
    imageCache.set(prompt, imageData);
  }
  return imageData;
}
```

### 2. 生成进度提示

```typescript
async function generateWithProgress(prompt: string) {
  const toastId = toastr.info('生成中 0%', '', { timeOut: 0 });
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;
    toastr.info(`生成中 ${Math.floor(progress)}%`, '', { timeOut: 0 });
  }, 500);
  
  try {
    const imageData = await generateImageWithNovelAI(prompt, {
      quality: 'high'
    });
    
    clearInterval(interval);
    toastr.clear();
    
    if (imageData) {
      toastr.success('生成完成！', '成功');
      return imageData;
    }
  } catch (error) {
    clearInterval(interval);
    toastr.error(`生成失败: ${error}`, '错误');
  }
}
```

### 3. 批量生成管理

```typescript
class NovelAIBatchGenerator {
  private queue: Array<{ prompt: string; options?: any }> = [];
  private isGenerating = false;
  private results: any[] = [];
  
  add(prompt: string, options?: any) {
    this.queue.push({ prompt, options });
  }
  
  async start() {
    if (this.isGenerating) return;
    this.isGenerating = true;
    
    while (this.queue.length > 0) {
      const { prompt, options } = this.queue.shift()!;
      
      try {
        const result = await generateImageWithNovelAI(prompt, options);
        this.results.push({ prompt, result });
        
        // 避免过频繁的请求
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error(`生成失败: ${prompt}`, error);
      }
    }
    
    this.isGenerating = false;
    return this.results;
  }
}
```

## 相关文件

- `src/novelAIImageGeneration.ts` - Novel AI API 包装函数
- `src/imageGenerationExample.ts` - 斜杠命令调用示例
- `src/messageListener.ts` - 事件监听集成
- `IMAGE_GENERATION_GUIDE.md` - 斜杠命令指南

## 参考资源

- [Novel AI 官方文档](https://docs.novelai.net/)
- SillyTavern API 文档
- 项目中的类型定义文件

