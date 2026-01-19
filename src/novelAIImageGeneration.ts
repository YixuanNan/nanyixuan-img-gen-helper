/**
 * Novel AI 图片生成 - 直接调用 Novel AI API
 *
 * 这个模块展示如何直接调用 Novel AI 的图片生成功能
 * 而不仅仅是通过斜杠命令
 */

/**
 * 直接调用 Novel AI 生成图片
 * 需要在酒馆中配置 Novel AI API 密钥
 *
 * @param prompt - 图片生成提示词
 * @param options - 生成选项
 * @returns 生成的图片URL或base64数据
 */
export async function generateImageWithNovelAI(
  prompt: string,
  options?: {
    negative?: string; // 负面提示词
    quality?: 'low' | 'medium' | 'high'; // 质量等级
    resolution?: 'low' | 'medium' | 'high' | 'hd'; // 分辨率
    seed?: number; // 随机种子
    model?: string; // 使用的模型
    uncensored?: boolean; // 是否不过滤内容
  },
): Promise<string | undefined> {
  try {
    // 获取酒馆当前的设置
    const SillyTavern = (window as any).SillyTavern;

    if (!SillyTavern) {
      toastr.error('无法访问 SillyTavern API', '错误');
      return undefined;
    }

    // 调用 Novel AI API 进行图片生成
    // Novel AI 通常通过 /generate_image 端点调用
    const requestData = {
      prompt: prompt,
      negative_prompt: options?.negative || '',
      quality_toggle: options?.quality === 'high',
      ucPreset: 0,
      qualityToggle: options?.quality === 'high',
      height:
        options?.resolution === 'hd'
          ? 1024
          : options?.resolution === 'high'
            ? 768
            : options?.resolution === 'medium'
              ? 512
              : 384,
      width:
        options?.resolution === 'hd'
          ? 1024
          : options?.resolution === 'high'
            ? 768
            : options?.resolution === 'medium'
              ? 512
              : 384,
      scale: 7,
      steps: 28,
      seed: options?.seed || undefined,
      sampler: 'k_euler_ancestral',
      schedule: 'native',
      smea: true,
      sm: true,
    };

    // 发送请求到 Novel AI
    const response = await fetch('/api/novelai/generate_image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      toastr.error(`图片生成失败: ${response.statusText}`, '错误');
      return undefined;
    }

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      const imageData = data.images[0];
      toastr.success('Novel AI 图片生成成功！', '成功');
      return imageData;
    } else {
      toastr.error('未能获取生成的图片', '错误');
      return undefined;
    }
  } catch (error) {
    toastr.error(`Novel AI 生成出错: ${error}`, '错误');
    console.error('generateImageWithNovelAI 错误:', error);
    return undefined;
  }
}

/**
 * 便捷包装：使用 Novel AI 生成角色肖像
 */
export async function generateCharacterWithNovelAI(
  characterDescription?: string,
  style?: string,
): Promise<string | undefined> {
  const prompt = characterDescription
    ? `${characterDescription}, ${style || 'anime style'}`
    : `beautiful anime character, ${style || 'anime style'}`;

  return generateImageWithNovelAI(prompt, {
    quality: 'high',
    resolution: 'high',
  });
}

/**
 * 通过 Novel AI API 生成并自动添加到聊天
 */
export async function generateAndAddImageWithNovelAI(
  prompt: string,
  options?: {
    negative?: string;
    quality?: 'low' | 'medium' | 'high';
    resolution?: 'low' | 'medium' | 'high' | 'hd';
    addToChat?: boolean;
  },
): Promise<string | undefined> {
  try {
    toastr.info('正在使用 Novel AI 生成图片...', '生成中');

    const imageUrl = await generateImageWithNovelAI(prompt, {
      negative: options?.negative,
      quality: options?.quality || 'medium',
      resolution: options?.resolution || 'medium',
    });

    if (!imageUrl) {
      return undefined;
    }

    // 如果需要添加到聊天
    if (options?.addToChat) {
      const messageContent = `![Novel AI 生成的图片](data:image/png;base64,${imageUrl})`;

      await createChatMessages([{ role: 'user', message: messageContent }], { refresh: 'affected' });

      toastr.success('已将图片添加到聊天', '成功');
    }

    return imageUrl;
  } catch (error) {
    toastr.error(`操作失败: ${error}`, '错误');
    console.error('generateAndAddImageWithNovelAI 错误:', error);
    return undefined;
  }
}

/**
 * 获取 Novel AI 当前配置信息
 */
export async function getNovelAIConfig(): Promise<any> {
  try {
    const response = await fetch('/api/novelai/config');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('获取 Novel AI 配置失败:', error);
    return null;
  }
}

/**
 * 检查 Novel AI 是否可用
 */
export async function isNovelAIAvailable(): Promise<boolean> {
  try {
    const config = await getNovelAIConfig();
    return config !== null && config.enabled;
  } catch (error) {
    return false;
  }
}

/**
 * 使用示例
 *
 * // 1. 直接生成图片
 * const imageUrl = await generateImageWithNovelAI('beautiful anime girl', {
 *   quality: 'high',
 *   resolution: 'high'
 * });
 *
 * // 2. 生成角色肖像
 * const portraitUrl = await generateCharacterWithNovelAI('elf warrior, magical aura');
 *
 * // 3. 生成并添加到聊天
 * await generateAndAddImageWithNovelAI('fantasy landscape', {
 *   quality: 'high',
 *   addToChat: true
 * });
 *
 * // 4. 在事件中使用
 * eventOn(tavern_events.MESSAGE_UPDATED, async (message_id) => {
 *   if (await isNovelAIAvailable()) {
 *     const url = await generateCharacterWithNovelAI();
 *     console.log('生成的图片:', url);
 *   }
 * });
 */
