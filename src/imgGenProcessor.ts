/**
 * 处理消息中 [IMG_GEN]...[/IMG_GEN] 标签
 * @param message 消息对象
 * @returns { success: boolean; message: string; updatedContent?: string }
 */
export function processImgGenTag(message: any): {
  success: boolean;
  message: string;
  updatedContent?: string;
} {
  const content = message.message;

  // 检查是否包含 [IMG_GEN]...[/IMG_GEN] 标签
  const hasImgGen = /\[IMG_GEN\][\s\S]*?\[\/IMG_GEN\]/.test(content);

  if (!hasImgGen) {
    return {
      success: false,
      message: '未检测到 [IMG_GEN] 标签',
    };
  }

  console.log('检测到 [IMG_GEN] 标签，开始处理...');

  // 处理：将 [IMG_GEN]...[/IMG_GEN] 内的换行替换为 \n，最后转为单行
  const updatedContent = content.replace(
    /\[IMG_GEN\]([\s\S]*?)\[\/IMG_GEN\]/g,
    (_match: string, innerContent: string) => {
      // 将换行替换为 \n，去掉多余空格
      const singleLine = innerContent.replace(/\n/g, '\\n').replace(/\s+/g, ' ').trim();
      return `#[IMG_GEN] ${singleLine} [/IMG_GEN]`;
    }
  );

  console.log(`处理完成，已将 [IMG_GEN] 标签转为单行`);

  return {
    success: true,
    message: '已成功处理 [IMG_GEN] 标签',
    updatedContent: updatedContent,
  };
}
