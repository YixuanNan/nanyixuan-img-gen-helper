/**
 * 点击事件监听配置
 * 自定义需要监听的 DOM 元素和回调逻辑
 */

import { ClickEventInfo, monitorSelector } from './globalClickInterceptor';

/**
 * 配置所有需要监听的选择器和回调
 */
export interface ClickConfig {
  /** 选择器 */
  selector: string;
  /** 描述 */
  description: string;
  /** 回调函数 */
  callback: (info: ClickEventInfo) => void;
}

/**
 * 默认监听配置
 */
export const defaultClickConfigs: ClickConfig[] = [
  // 聊天相关
  {
    selector: '[data-action="send"], .send-btn, button[type="submit"]',
    description: '消息发送按钮',
    callback: (info) => {
      toastr.info('🔍 消息发送', '用户操作');
      console.log('📤 发送按钮点击:', {
        选择器: info.selectorPath,
        文本: info.text,
        CSS路径: info.cssPath
      });
    }
  },

  // 输入框相关
  {
    selector: 'textarea, [contenteditable="true"], .message-input, [role="textbox"]',
    description: '消息输入框',
    callback: (info) => {
      console.log('📝 输入框焦点:', {
        标签: info.tagName,
        选择器: info.selectorPath,
        ID: info.id
      });
    }
  },

  // 角色选择
  {
    selector: '[data-character], .character-select, .char-list-item',
    description: '角色选择',
    callback: (info) => {
      toastr.info('🔄 切换角色', '用户操作');
      console.log('👤 角色选择:', {
        角色信息: info.attributes,
        选择器: info.selectorPath
      });
    }
  },

  // 编辑按钮
  {
    selector: '[data-action="edit"], .edit-btn, [aria-label*="Edit"]',
    description: '编辑按钮',
    callback: (info) => {
      toastr.info('✏️ 编辑消息', '用户操作');
      console.log('🔧 编辑操作:', {
        目标: info.selectorPath,
        文本: info.text
      });
    }
  },

  // 删除按钮
  {
    selector: '[data-action="delete"], .delete-btn, [aria-label*="Delete"]',
    description: '删除按钮',
    callback: (info) => {
      console.log('🗑️ 删除操作:', {
        目标: info.selectorPath
      });
    }
  },

  // 生成图片按钮
  {
    selector: '[data-action="generate"], .gen-img-btn, button:has(.icon-image)',
    description: '生成图片按钮',
    callback: (info) => {
      toastr.success('🎨 生成图片', '用户操作');
      console.log('🖼️ 图片生成请求:', {
        按钮: info.selectorPath,
        属性: info.attributes
      });
    }
  },

  // 菜单/选项按钮
  {
    selector: '[role="menuitem"], .menu-item, .option-item',
    description: '菜单选项',
    callback: (info) => {
      console.log('📋 菜单点击:', {
        选项: info.text,
        选择器: info.selectorPath
      });
    }
  },

  // 设置按钮
  {
    selector: '[data-action="settings"], .settings-btn, button[aria-label*="Settings"]',
    description: '设置按钮',
    callback: (info) => {
      console.log('⚙️ 打开设置:', {
        选择器: info.selectorPath
      });
    }
  },

  // 关闭对话框
  {
    selector: '[data-action="close"], .close-btn, button[aria-label*="Close"], [role="dialog"] .close',
    description: '关闭按钮',
    callback: (info) => {
      console.log('❌ 关闭对话框:', {
        选择器: info.selectorPath
      });
    }
  },

  // 链接点击
  {
    selector: 'a[href], [role="link"]',
    description: '超链接',
    callback: (info) => {
      const href = info.attributes['href'] || '(无)';
      console.log('🔗 链接点击:', {
        链接: href,
        文本: info.text,
        选择器: info.selectorPath
      });
    }
  }
];

/**
 * 注册单个监听配置
 */
export function registerClickConfig(config: ClickConfig): void {
  monitorSelector(config.selector, (info) => {
    console.group(`🎯 ${config.description}`);
    config.callback(info);
    console.groupEnd();
  });
}

/**
 * 注册多个监听配置
 */
export function registerClickConfigs(configs: ClickConfig[]): void {
  configs.forEach(config => {
    registerClickConfig(config);
  });
}

/**
 * 注册默认配置
 */
export function registerDefaultConfigs(): void {
  registerClickConfigs(defaultClickConfigs);
}

/**
 * 自定义配置示例
 */
export const customClickConfigs: ClickConfig[] = [
  // 示例：监听特定角色的消息
  {
    selector: '[data-character="角色名称"]',
    description: '特定角色消息',
    callback: (_info) => {
      console.log('📌 特定角色:', _info.attributes);
    }
  },

  // 示例：监听特定 class 的元素
  {
    selector: '.my-custom-button',
    description: '自定义按钮',
    callback: () => {
      console.log('🔘 自定义按钮被点击');
    }
  },

  // 示例：监听带有特定属性的元素
  {
    selector: '[data-type="premium"]',
    description: '高级功能',
    callback: () => {
      toastr.info('✨ 高级功能被使用');
    }
  }
];
