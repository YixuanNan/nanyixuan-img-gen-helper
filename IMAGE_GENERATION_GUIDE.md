# 图片生成调用指南

## 概述

在酒馆中调用图片生成有多种方式。最简单的方式是使用 `triggerSlash()` 函数来执行 `/imagine` 斜杠命令。

## 核心概念

### 什么是 `/imagine` 命令？

`/imagine` 是酒馆提供的斜杠命令，用于调用图片生成功能（需要安装图片生成扩展，如 ComfyUI）。

**基本语法：**
```
/imagine [type] [prompt] [options]
```

### 参数说明

#### 图片类型（type）
可选的图片生成类型：
- `you` - 生成角色肖像
- `me` - 生成用户/玩家肖像  
- `scene` - 生成场景图
- `face` - 生成脸部特写
- `background` - 生成背景
- `raw_last` - 使用最后一条消息的背景
- 如果不指定，则为自由模式（可输入任意提示词）

#### 通用选项（options）
- `quiet=true|false` - 是否不发送到聊天（默认false）
- `negative="..."` - 负面提示词，告诉模型不要生成什么
- `seed=number` - 随机种子，相同种子会生成相同的图片
- `steps=number` - 采样步数，越多越精细但越耗时
- `cfg=number` - 引导比例，控制与提示词的匹配度
- `width=number` - 图片宽度
- `height=number` - 图片高度
- `model=string` - 使用的模型名称
- `sampler=string` - 采样器类型
- `scheduler=string` - 调度器类型
- `upscaler=string` - 放大器
- `scale=number` - 放大倍数
- `hires=true|false` - 是否使用高分辨率
- `extend=true|false` - 是否扩展
- `edit=true|false` - 是否编辑模式
- `multimodal=true|false` - 是否多模态
- `snap=true|false` - 是否对齐
- `denoise=number` - 去噪强度
- `2ndpass=number` - 二次通过

## 使用示例

### 例子 1：生成简单的自由模式图片

```typescript
// 生成一个自定义描述的图片
const imageUrl = await triggerSlash('/imagine 一个穿着蓝色连衣裙的女孩站在樱花树下');
console.log('生成的图片URL:', imageUrl);
```

### 例子 2：生成角色肖像

```typescript
// 生成当前角色在不同表情下的肖像
const imageUrl = await triggerSlash('/imagine you happy smile, in garden');
console.log('生成的角色肖像:', imageUrl);
```

### 例子 3：生成场景图

```typescript
// 生成一个特定场景
const imageUrl = await triggerSlash('/imagine scene 樱花花园，樱花树，池塘，日本建筑风格');
console.log('生成的场景:', imageUrl);
```

### 例子 4：使用完整参数

```typescript
// 使用更多参数控制图片生成
const imageUrl = await triggerSlash(`
  /imagine you 
  happy smile, in garden 
  negative="low quality, blurry" 
  seed=12345 
  steps=30 
  cfg=7.5 
  width=768 
  height=1024
`);
console.log('生成的高质量图片:', imageUrl);
```

### 例子 5：生成图片但不发送到聊天

```typescript
// 生成图片（quiet=true 不自动发送到聊天）
const imageUrl = await triggerSlash('/imagine you smiling quiet=true');
// 这样可以用来处理和检查图片，然后手动决定是否添加到聊天
```

### 例子 6：带负面提示词生成

```typescript
// 使用负面提示词排除不想要的内容
const imageUrl = await triggerSlash(`
  /imagine you 
  beautiful girl, fantasy style 
  negative="ugly, deformed, low quality, blurry, duplicate"
`);
```

## 实用函数库

项目中提供了 `src/imageGenerationExample.ts` 文件，包含6个便捷函数：

### 1. `generateImageFreeMode(prompt: string)`

自由模式生成图片

```typescript
import { generateImageFreeMode } from './imageGenerationExample';

// 使用
const url = await generateImageFreeMode('一个穿着蓝色连衣裙的女孩');
```

### 2. `generateCharacterPortrait(description?, options?)`

生成角色肖像

```typescript
import { generateCharacterPortrait } from './imageGenerationExample';

// 基础用法
const url = await generateCharacterPortrait();

// 带描述
const url = await generateCharacterPortrait('happy smile, in garden');

// 完整选项
const url = await generateCharacterPortrait('happy smile', {
  quiet: false,
  negative: 'low quality',
  seed: 12345,
  steps: 30
});
```

### 3. `generateSceneImage(sceneDescription, options?)`

生成场景图

```typescript
import { generateSceneImage } from './imageGenerationExample';

const url = await generateSceneImage('樱花花园，樱花树，池塘', {
  negative: 'low quality',
  width: 1024,
  height: 768
});
```

### 4. `generateUserPortrait(description?, options?)`

生成用户/玩家肖像

```typescript
import { generateUserPortrait } from './imageGenerationExample';

const url = await generateUserPortrait('年轻男性，温和表情', {
  quiet: true
});
```

### 5. `generateImageAdvanced(options)`

高级图片生成 - 支持所有参数

```typescript
import { generateImageAdvanced } from './imageGenerationExample';

const url = await generateImageAdvanced({
  prompt: '一个魔法女孩',
  type: 'you',
  negative: '低质量，模糊',
  seed: 12345,
  steps: 30,
  cfg: 7.5,
  width: 768,
  height: 1024,
  quiet: false,
  model: 'myModel'
});
```

### 6. `generateAndAddImage(options)`

生成图片并自动添加到聊天消息

```typescript
import { generateAndAddImage } from './imageGenerationExample';

const url = await generateAndAddImage({
  prompt: '角色在战斗中',
  type: 'you',
  quiet: true,
  addToChat: true  // 自动添加到聊天
});
```

## 集成到消息监听

### 示例：自动为消息生成配图

```typescript
import { generateAndAddImage } from './imageGenerationExample';

// 在消息更新事件中自动生成配图
eventOn(tavern_events.MESSAGE_UPDATED, async (message_id: number) => {
  try {
    const messages = getChatMessages(message_id);
    if (messages.length > 0 && messages[0].is_user === false) {
      // 为角色消息生成对应的图片
      const imageUrl = await generateAndAddImage({
        prompt: '角色说话的场景',
        type: 'you',
        quiet: false,
        addToChat: true
      });
      
      if (imageUrl) {
        console.log('自动生成的图片:', imageUrl);
        toastr.success('已为消息生成配图');
      }
    }
  } catch (error) {
    console.error('自动生成图片失败:', error);
  }
});
```

### 示例：按钮触发图片生成

```typescript
import { generateCharacterPortrait } from './imageGenerationExample';

// 创建一个按钮来生成图片
eventOn(getButtonEvent('生成角色肖像'), async () => {
  try {
    toastr.info('正在生成图片，请稍候...');
    const imageUrl = await generateCharacterPortrait('happy smile, in garden');
    
    if (imageUrl) {
      toastr.success('图片生成成功！');
    } else {
      toastr.error('图片生成失败');
    }
  } catch (error) {
    toastr.error(`错误: ${error}`);
  }
});
```

## 技巧和最佳实践

### 1. 使用固定种子复现结果

```typescript
// 相同的种子会生成相同的图片
const url = await generateImageAdvanced({
  prompt: '美丽的女孩',
  seed: 42,  // 固定种子
  steps: 30
});
```

### 2. 使用负面提示词改进质量

```typescript
const url = await generateImageAdvanced({
  prompt: '美丽的女孩',
  negative: 'ugly, deformed, low quality, blurry, duplicate, extra limbs, missing limbs',
  steps: 30,
  cfg: 7.5
});
```

### 3. 调整采样步数和CFG值

```typescript
// 更高质量的生成（更耗时）
const url = await generateImageAdvanced({
  prompt: '美丽的女孩',
  steps: 50,    // 更多步数 = 更精细但更慢
  cfg: 10,      // 更高 = 更遵循提示词
  seed: 12345
});
```

### 4. 处理错误

```typescript
async function safeGenerateImage(prompt: string) {
  try {
    const url = await generateImageFreeMode(prompt);
    if (url) {
      return url;
    } else {
      toastr.error('未能获取图片URL');
      return null;
    }
  } catch (error) {
    console.error('图片生成异常:', error);
    toastr.error(`生成失败: ${error}`);
    return null;
  }
}
```

### 5. 与[IMG_GEN]标签集成

```typescript
import { generateImageAdvanced } from './imageGenerationExample';
import { processImgGenTag } from './imgGenProcessor';

// 生成图片后处理[IMG_GEN]标签
async function generateAndProcess() {
  const imageUrl = await generateImageAdvanced({
    prompt: '角色肖像',
    quiet: true
  });
  
  if (imageUrl) {
    // 处理消息中的[IMG_GEN]标签
    const message = getChatMessages(getLastMessageId())[0];
    const result = processImgGenTag(message);
    console.log('处理结果:', result);
  }
}
```

## 常见问题

### Q: 为什么生成的图片URL是undefined?

**A:** 可能的原因：
1. 图片生成扩展未安装或未启用
2. 配置的图片生成服务不可用（如ComfyUI）
3. 提示词过长或包含非法字符
4. 生成超时

解决方案：
- 检查是否安装了图片生成扩展
- 查看酒馆的日志了解具体错误
- 简化提示词
- 增加超时时间

### Q: 如何获取生成进度?

**A:** `triggerSlash` 返回最终结果。如果需要实时进度：
```typescript
// 监听生成事件
eventOn(iframe_events.GENERATION_STARTED, () => {
  toastr.info('开始生成...');
});

eventOn(iframe_events.GENERATION_ENDED, (message_id) => {
  toastr.success('生成完成');
});
```

### Q: 如何使用特定的图片生成模型?

**A:** 使用 `model` 参数：
```typescript
const url = await generateImageAdvanced({
  prompt: '美丽的女孩',
  model: 'my-custom-model-name'
});
```

### Q: 支持哪些图片格式?

**A:** 大多数图片生成返回的是URL形式，通常为 PNG 或 JPEG 格式。

## 相关文件

- `src/imageGenerationExample.ts` - 图片生成函数库
- `src/imgGenProcessor.ts` - [IMG_GEN]标签处理
- `src/messageListener.ts` - 消息监听和事件处理
- `@types/function/slash.d.ts` - 斜杠命令API定义
- `@types/iframe/event.d.ts` - 事件系统定义

## 参考资源

- 斜杠命令文档：见项目根目录 `slash_command.txt` 中的 `/imagine` 部分
- SillyTavern 官方文档
- 图片生成扩展文档

