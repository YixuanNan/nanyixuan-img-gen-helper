/**
 * 处理消息中 [IMG_GEN]...[/IMG_GEN] 标签
 * @param message 要处理的文本
 * @returns { success: boolean; message: string; updatedContent?: string }
 */
const LOG_TAG = 'Nanyixuan';
export function processImgGenTag(message: any): {
  success: boolean;
  message: string;
  updatedContent?: string;
} {
  const content = message;
  var replacedContent = null;
  console.log(`${LOG_TAG}处理消息内容:`, content);
  // 先检查content里是否包含 [IMG_GEN] 标签，如果包含，全部移除，移除的内容存在一个列表里
  // 得考虑有多个 [IMG_GEN] 标签的情况
  // 提取后要删除这些标签
  const imgGenList: string[] = [];
  replacedContent = content.replace(/\[IMG_GEN\]([\s\S]*?)\[\/IMG_GEN\]/g, (_match: string, innerContent: string) => {
    imgGenList.push(innerContent);
    return '';
  });
  console.log(`${LOG_TAG}处理消息内容后:`, replacedContent);
  console.log(`${LOG_TAG}提取到的 [IMG_GEN] 内容列表:`, imgGenList);
  // 提取chatHistoryContent中的<chat_history>...</chat_history>标签内的内容，用最安全的方法
  // 这样写有可能匹配不到，需要考虑<chat_history props="...">的情况
  // 提取props
  const chatHistoryContent = replacedContent.match(/<chat_history(?:\s+[^>]*)?>([\s\S]*?)<\/chat_history>/);
  // 判断chatHistoryContent是否为空或长度小于2
  if (!chatHistoryContent || chatHistoryContent.length < 2) {
    console.log(`${LOG_TAG}未检测到 <chat_history> 标签内的内容`);
    return {
      success: false,
      message: '未检测到 <chat_history> 标签内的内容',
    };
  }
  chatHistoryContent.forEach((item: any, index: any) => {
    console.log(`${LOG_TAG}chatHistoryContent[${index}]:`, item);
  });
  // 判断chatHistoryContent[1]能不能解析成YAML格式
  try {
    const parsedYAML = YAML.parse(chatHistoryContent[1]);
    console.log(`${LOG_TAG}已成功解析 <chat_history> 内容为 YAML:`, parsedYAML);
    imgGenList.forEach((imgGenContent, idx) => {
      console.log(`${LOG_TAG}处理提取到的 [IMG_GEN] 内容[${idx}]:`, imgGenContent);
      // 这里可以对 imgGenContent 进行进一步处理，比如替换回 chatHistoryContent[1] 中的某个位置
      // 在imgGenContent中提取.png或.jpg等图片链接
      // 不要判断https?://开头，直接提取所有符合格式的链接
      const imgLinkRegex = /\/user\/images\/[^\s\[\]]+\.(png|jpg|jpeg|gif)/g;
      const imgLinks = imgGenContent.match(imgLinkRegex) || [];
      console.log(`${LOG_TAG}提取到的图片链接:`, imgLinks);
      imgLinks.forEach((link, linkIdx) => {
        // 通过link生成YAML对象
        const yamlObject = {
          t: 'image',
          c: link,
          time: '02:00',
        };
        parsedYAML.messages.push(yamlObject);
        console.log(`${LOG_TAG}已将图片链接添加到 messages 中:`, yamlObject);
      });
    });
    // 替换content中的<chat_history>标签内容为更新后的YAML字符串，要保留<chat_history>标签的props
    const updatedYAMLString = YAML.stringify(parsedYAML);
    const propsMatch = replacedContent.match(/<chat_history(\s+[^>]*)?>/);
    const props = propsMatch?.[1] || '';
    replacedContent = replacedContent.replace(
      /<chat_history(?:\s+[^>]*)?>([\s\S]*?)<\/chat_history>/,
      `<chat_history${props}>\n${updatedYAMLString}</chat_history>`,
    );
    console.log(`${LOG_TAG}更新后的消息内容:`, replacedContent);
    return {
      success: true,
      message: '已成功提取 <chat_history> 内容',
      updatedContent: replacedContent,
    };
  } catch (e) {
    console.log(`${LOG_TAG}提取到的 <chat_history> 内容无法解析成YAML格式`);
    return {
      success: false,
      message: '提取到的 <chat_history> 内容无法解析成YAML格式',
    };
  }

  // if (!chatHistoryContent || chatHistoryContent.length < 2) {
  //   return {
  //     success: false,
  //     message: '未检测到 <chat_history> 标签内的内容',
  //   };
  // }
  // // chatHistoryContent是否是一个YAML格式的字符串
  // // 检查是否包含 [IMG_GEN]...[/IMG_GEN] 标签
  // const hasImgGen = /\[IMG_GEN\][\s\S]*?\[\/IMG_GEN\]/.test(content);

  // if (!hasImgGen) {
  //   return {
  //     success: false,
  //     message: '未检测到 [IMG_GEN] 标签',
  //   };
  // }

  // console.log('检测到 [IMG_GEN] 标签，开始处理...');

  // // 处理：将 [IMG_GEN]...[/IMG_GEN] 内的换行替换为 \n，最后转为单行
  // const updatedContent = content.replace(
  //   /\[IMG_GEN\]([\s\S]*?)\[\/IMG_GEN\]/g,
  //   (_match: string, innerContent: string) => {
  //     // 将换行替换为 \n，去掉多余空格
  //     const singleLine = innerContent.replace(/\n/g, '\\n').replace(/\s+/g, ' ').trim();
  //     return `#[IMG_GEN] ${singleLine} [/IMG_GEN]`;
  //   }
  // );

  // console.log(`处理完成，已将 [IMG_GEN] 标签转为单行`);

  // return {
  //   success: true,
  //   message: '已成功处理 [IMG_GEN] 标签',
  //   updatedContent: updatedContent,
  // };
}
