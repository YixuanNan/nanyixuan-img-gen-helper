/**
 * 图片生成示例 - 展示如何调用SillyTavern的图片生成功能
 * 
 * 在SillyTavern中调用图片生成有多种方式：
 * 1. 通过 triggerSlash('/imagine ...') 调用斜杠命令
 * 2. 通过点击UI按钮触发
 * 3. 通过自动流程调用
 */

/**
 * 方式一：基础图片生成 - 生成当前角色的自由模式图片
 * @example
 * // 生成一个自定义提示的图片
 * await generateImageFreeMode('一个穿着蓝色连衣裙的女孩站在樱花树下');
 */
export async function generateImageFreeMode(prompt: string): Promise<string | undefined> {
  try {
    // 使用 /imagine 命令生成图片
    // 参数说明：
    // - raw_last: 使用最后一条消息的背景
    // - negative: 负面提示词
    // - quiet: 是否不发送到聊天（true=不发送, false=发送到聊天）
    
    const result = await triggerSlash(`/imagine ${prompt}`);
    
    if (result) {
      toastr.success(`已生成图片：${result}`, '图片生成成功');
      return result;
    } else {
      toastr.error('图片生成失败', '未能获取返回值');
      return undefined;
    }
  } catch (error) {
    toastr.error(`图片生成出错：${error}`, '错误');
    console.error('generateImageFreeMode 错误:', error);
    return undefined;
  }
}

/**
 * 方式二：生成角色肖像
 * @example
 * // 生成角色的肖像
 * await generateCharacterPortrait('happy smile');
 */
export async function generateCharacterPortrait(
  description?: string,
  options?: {
    quiet?: boolean;
    negative?: string;
    seed?: number;
    steps?: number;
  }
): Promise<string | undefined> {
  try {
    // /imagine you - 生成角色肖像
    // 也可以加额外描述：/imagine you a happy smile
    
    let command = '/imagine you';
    
    if (description) {
      command += ` ${description}`;
    }
    
    if (options?.quiet) {
      command += ` quiet=true`;
    }
    
    if (options?.negative) {
      command += ` negative="${options.negative}"`;
    }
    
    if (options?.seed !== undefined) {
      command += ` seed=${options.seed}`;
    }
    
    if (options?.steps) {
      command += ` steps=${options.steps}`;
    }
    
    const result = await triggerSlash(command);
    
    if (result) {
      toastr.success(`已生成角色肖像`, '图片生成成功');
      return result;
    } else {
      toastr.error('图片生成失败', '无法获取返回值');
      return undefined;
    }
  } catch (error) {
    toastr.error(`图片生成出错：${error}`, '错误');
    console.error('generateCharacterPortrait 错误:', error);
    return undefined;
  }
}

/**
 * 方式三：生成场景图片
 * @example
 * // 生成一个樱花花园的场景
 * await generateSceneImage('樱花花园，樱花树，池塘，日本建筑风格');
 */
export async function generateSceneImage(
  sceneDescription: string,
  options?: {
    quiet?: boolean;
    negative?: string;
    width?: number;
    height?: number;
  }
): Promise<string | undefined> {
  try {
    // /imagine scene - 生成场景
    let command = `/imagine scene ${sceneDescription}`;
    
    if (options?.quiet) {
      command += ` quiet=true`;
    }
    
    if (options?.negative) {
      command += ` negative="${options.negative}"`;
    }
    
    if (options?.width) {
      command += ` width=${options.width}`;
    }
    
    if (options?.height) {
      command += ` height=${options.height}`;
    }
    
    const result = await triggerSlash(command);
    
    if (result) {
      toastr.success(`已生成场景图片`, '图片生成成功');
      return result;
    } else {
      toastr.error('图片生成失败', '无法获取返回值');
      return undefined;
    }
  } catch (error) {
    toastr.error(`图片生成出错：${error}`, '错误');
    console.error('generateSceneImage 错误:', error);
    return undefined;
  }
}

/**
 * 方式四：生成用户肖像
 * @example
 * // 生成用户的肖像
 * await generateUserPortrait('年轻男性，温和表情');
 */
export async function generateUserPortrait(
  description?: string,
  options?: {
    quiet?: boolean;
    negative?: string;
  }
): Promise<string | undefined> {
  try {
    // /imagine me - 生成用户/玩家肖像
    let command = '/imagine me';
    
    if (description) {
      command += ` ${description}`;
    }
    
    if (options?.quiet) {
      command += ` quiet=true`;
    }
    
    if (options?.negative) {
      command += ` negative="${options.negative}"`;
    }
    
    const result = await triggerSlash(command);
    
    if (result) {
      toastr.success(`已生成用户肖像`, '图片生成成功');
      return result;
    } else {
      toastr.error('图片生成失败', '无法获取返回值');
      return undefined;
    }
  } catch (error) {
    toastr.error(`图片生成出错：${error}`, '错误');
    console.error('generateUserPortrait 错误:', error);
    return undefined;
  }
}

/**
 * 方式五：完整的高级图片生成 - 支持所有参数
 * @example
 * // 使用完整参数生成图片
 * await generateImageAdvanced({
 *   prompt: '一个魔法女孩',
 *   type: 'you',
 *   negative: '低质量，模糊',
 *   seed: 12345,
 *   steps: 30,
 *   cfg: 7.5,
 *   width: 768,
 *   height: 1024,
 *   quiet: false,
 *   model: 'myModel'
 * });
 */
export async function generateImageAdvanced(options: {
  prompt: string;
  type?: 'raw_last' | 'you' | 'me' | 'scene' | 'face' | 'background'; // 图片类型
  quiet?: boolean;           // 是否不发送到聊天
  negative?: string;         // 负面提示词
  extend?: boolean;          // 是否扩展
  edit?: boolean;            // 是否编辑模式
  seed?: number;             // 随机种子（固定种子可以复现结果）
  steps?: number;            // 采样步数（越多越精细，但时间越长）
  cfg?: number;              // 引导比例（越高越接近提示词）
  width?: number;            // 宽度
  height?: number;           // 高度
  sampler?: string;          // 采样器
  model?: string;            // 模型名称
  upscaler?: string;         // 放大器
  scale?: number;            // 放大倍数
}): Promise<string | undefined> {
  try {
    let command = `/imagine`;
    
    // 添加图片类型
    if (options.type) {
      command += ` ${options.type}`;
    }
    
    // 添加提示词
    command += ` ${options.prompt}`;
    
    // 添加各种参数
    if (options.quiet !== undefined) {
      command += ` quiet=${options.quiet}`;
    }
    
    if (options.negative) {
      command += ` negative="${options.negative}"`;
    }
    
    if (options.extend !== undefined) {
      command += ` extend=${options.extend}`;
    }
    
    if (options.edit !== undefined) {
      command += ` edit=${options.edit}`;
    }
    
    if (options.seed !== undefined) {
      command += ` seed=${options.seed}`;
    }
    
    if (options.steps) {
      command += ` steps=${options.steps}`;
    }
    
    if (options.cfg) {
      command += ` cfg=${options.cfg}`;
    }
    
    if (options.width) {
      command += ` width=${options.width}`;
    }
    
    if (options.height) {
      command += ` height=${options.height}`;
    }
    
    if (options.sampler) {
      command += ` sampler="${options.sampler}"`;
    }
    
    if (options.model) {
      command += ` model="${options.model}"`;
    }
    
    if (options.upscaler) {
      command += ` upscaler="${options.upscaler}"`;
    }
    
    if (options.scale) {
      command += ` scale=${options.scale}`;
    }
    
    console.log(`执行图片生成命令: ${command}`);
    const result = await triggerSlash(command);
    
    if (result) {
      toastr.success(`已生成图片`, '图片生成成功');
      return result;
    } else {
      toastr.error('图片生成失败', '无法获取返回值');
      return undefined;
    }
  } catch (error) {
    toastr.error(`图片生成出错：${error}`, '错误');
    console.error('generateImageAdvanced 错误:', error);
    return undefined;
  }
}

/**
 * 方式六：生成图片并自动插入到消息中
 * 这是一个实际应用示例 - 生成图片后将其添加到当前聊天
 * 
 * @example
 * // 生成图片并自动添加到聊天
 * await generateAndAddImage({
 *   prompt: '角色在战斗中',
 *   type: 'you',
 *   addToChat: true
 * });
 */
export async function generateAndAddImage(options: {
  prompt: string;
  type?: 'raw_last' | 'you' | 'me' | 'scene' | 'face' | 'background';
  quiet?: boolean;
  addToChat?: boolean;
  insertAsMessage?: boolean; // 是否作为单独的消息插入
}): Promise<string | undefined> {
  try {
    // 先生成图片（quiet=true 不发送到聊天）
    const command = options.quiet !== false 
      ? `/imagine ${options.type || ''} ${options.prompt} quiet=true`
      : `/imagine ${options.type || ''} ${options.prompt}`;
    
    console.log(`生成图片，命令: ${command}`);
    const imageUrl = await triggerSlash(command);
    
    if (!imageUrl) {
      toastr.error('图片生成失败', '无法获取图片URL');
      return undefined;
    }
    
    console.log(`成功生成图片: ${imageUrl}`);
    
    // 如果需要添加到聊天，创建一条消息包含这个图片
    if (options.addToChat || options.insertAsMessage) {
      const messageContent = `![生成的图片](${imageUrl})`;
      
      await createChatMessages(
        [{ role: 'user', message: messageContent }],
        { refresh: 'affected' }
      );
      
      toastr.success(`已将图片添加到聊天`, '成功');
    }
    
    return imageUrl;
  } catch (error) {
    toastr.error(`操作失败：${error}`, '错误');
    console.error('generateAndAddImage 错误:', error);
    return undefined;
  }
}

/**
 * 使用示例 - 在脚本中调用
 * 
 * 如果你要在消息监听或按钮事件中使用，这样调用：
 * 
 * @example
 * // 在按钮点击事件中生成图片
 * eventOn(getButtonEvent('生成图片'), async () => {
 *   await generateCharacterPortrait('happy smile, in garden');
 * });
 * 
 * @example
 * // 在消息更新事件中自动生成配图
 * eventOn(tavern_events.MESSAGE_UPDATED, async (message_id: number) => {
 *   const result = await generateAndAddImage({
 *     prompt: '角色说话的场景',
 *     type: 'you',
 *     addToChat: true
 *   });
 *   
 *   if (result) {
 *     console.log('自动生成的图片:', result);
 *   }
 * });
 */

// 导出所有生成函数供其他模块使用

