/**
 * 全局函数调用监听器
 * 追踪浏览器中调用的所有函数
 */

import { stopGlobalClickMonitoring } from './globalBrowserListener';
import { stopClickMonitoring } from './globalClickInterceptor';
import { processImgGenTag } from './imgGenProcessor';

// 在加载脚本时执行某个函数
$(() => {
  toastr.success('你已经成功加载示例脚本!', '恭喜你!');

  // 增加button点击监听
  eventOn(getButtonEvent('重置消息'), () => {
    // 获取当前聊天的所有消息
    const chatMessages = getChatMessages('0-{{lastMessageId}}');
    chatMessages.forEach(msg => {
      checkMessage(msg.message_id);
    });
  });
});

// 处理消息中的 [IMG_GEN] 标签
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkMessage(message_id: number) {
  console.debug(`检测到消息 ${message_id} 被修改，开始处理...`);
  const messages = getChatMessages(message_id);
  if (messages.length > 0) {
    const message = messages[0];

    // 直接传入 message 对象处理 [IMG_GEN] 标签
    const result = processImgGenTag(message);

    if (result.success && result.updatedContent) {
      // 将修改后的内容保存回消息中
      await setChatMessages([{ message_id, message: result.updatedContent }], { refresh: 'affected' });
      console.log(`消息 ${message_id} 已处理 [IMG_GEN]`);
    }
  }
}

// 在卸载脚本时执行某个函数
$(window).on('pagehide', () => {
  // 停止全局点击拦截
  stopClickMonitoring();
  // 停止全局浏览器监听
  stopGlobalClickMonitoring();
  toastr.info('你已经卸载示例脚本!', '再见!');
});
