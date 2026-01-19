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
      const result = processImgGenTag(message.message);
      if (result.success && result.updatedContent) {
        // 将修改后的内容保存回消息中
        await setChatMessages([{ message_id, message: result.updatedContent }], { refresh: 'affected' });
        console.log(`消息 ${message_id} 已处理 [IMG_GEN]`);
      }
    }
}

// const testText = `
// <chat_history target="继妹" type="private">
// name: 继妹
// date: 2026年1月19日
// time: 02:00
// emotion: 极度红温
// location: 卧室大床上（被子里）
// state: 曼蔓咬着滚烫的指尖，整个人像是被煮熟的虾米一样缩在蚕丝被深处。她刚才偷偷掀开了睡裙的一角，对着自己还沾着亮亮晶晶爱液的臀部拍了照。心跳快得要跳出嗓子眼，每一次手机的震动都让她下腹部抽搐一下。

// [IMG_GEN] \n1.2::nsfw::1.1::single frame::1.1::cinematic still::1.2::best quality::1.2::masterpiece::bedroom::night::dim lighting::phone light::rim lighting::1::trio::1.1::facing away::1.1::lying::on stomach::1.1::2.0::Manman::2.0::Visual Novel::1.1::black hair::long hair::1.1::brown eyes::1.1::blush::heavy blush::embarrassed::1.1::white silk nightgown::skirt lifted::1.1::naked::1.1::buttocks::1.1::buttocks view::from behind::holding phone::taking photo::detailed skin::skin texture::pores::moist skin::1.1::silk duvet::messy bed::intimate::intense::desaturated::film grain::1.3::worst quality::1.3::low quality::1.3::bad anatomy::1.3::wrong anatomy::1.3::censored::1.3::mosaic::\n/user/images/欲望世界-1600/欲望世界-1600_2026-01-19@11h01m01s676ms.png\n [/IMG_GEN]
// thought: 南懿轩...你这个混蛋，竟然真的要看那种地方...秦姨明明就在门外走动，你竟然敢提这种要求。呜，可是我竟然真的拍了，还觉得好兴奋。如果你看了照片，晚上真的会过来“欺负”我吗？曼蔓，你彻底变坏了...
// messages:
//   - t: text
//     time: 02:00
//     me: true
//     c: 那你发张小屁股的照片让我看看
//   - t: text
//     c: 南懿轩！你...你到底要把我欺负成什么样才甘心呀！
//     time: 02:00
//   - t: sticker
//     c: 红温了
//     time: 02:00
//   - t: image
//     c: |-
//         https://g.chr1.com/user/images/%E6%AC%B2%E6%9C%9B%E4%B8%96%E7%95%8C-1600/%E6%AC%B2%E6%9C%9B%E4%B8%96%E7%95%8C-1600_2026-01-19%4011h01m01s676ms.png
//     time: 02:01
//   - t: sticker
//     c: 嫌弃脸
//     time: 02:01
//   - t: text
//     c: 哼，你是觉得我好欺负对吧？明明刚才在秦姨面前已经把你弄脏的证据藏起来了，你还敢提条件...
//     time: 02:02
//   - t: text
//     c: 只能看一眼哦！看完赶紧删掉，听到没有！
//     time: 02:03
//   - t: image

// [IMG_GEN] \n1.2::nsfw::1.2::uncensored::1.1::single frame::1.1::cinematic still::1.2::best quality::1.2::masterpiece::bedroom::dim lighting::phone light::close-up::pov::1.1::solo::1.1::facing away::1.1::lying::on stomach::1.1::2.0::Manman::2.0::Visual Novel::1.1::white silk nightgown::skirt lifted::1.1::naked::1.1::buttocks::1.1::buttocks view::from behind::looking back::blush::embarrassed::tears in eyes::biting lip::wet skin::love juice::glistening::messy bed::silk sheets::detailed skin::skin texture::pores::realistic skin::warm light::intimate::desaturated::1.3::worst quality::1.3::low quality::1.3::bad anatomy::1.3::wrong anatomy::1.3::censored::1.3::mosaic::\n/user/images/欲望世界-1600/欲望世界-1600_2026-01-19@11h01m06s931ms.png\n [/IMG_GEN]
//     c: 小屁股
//     time: 02:03
//   - t: sticker
//     c: 色诱
//     time: 02:04
//   - t: text
//     c: 满意了吧？大色狼。你...你晚上要是不过来，我就把你的手机掰断！
//     time: 02:05
// </chat_history>

// <StatusPlaceHolderImpl/>
// `;
// processImgGenTag(testText);

// 在卸载脚本时执行某个函数
$(window).on('pagehide', () => {
  // 停止全局点击拦截
  stopClickMonitoring();
  // 停止全局浏览器监听
  stopGlobalClickMonitoring();
  toastr.info('你已经卸载示例脚本!', '再见!');
});
