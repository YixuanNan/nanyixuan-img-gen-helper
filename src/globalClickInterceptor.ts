/**
 * 全局 HTML 点击事件拦截器
 * 可以捕获页面上所有的点击事件及相关 DOM 信息
 */

export interface ClickEventInfo {
  /** 点击的 DOM 元素 */
  element: HTMLElement;
  /** 元素的 HTML 内容 */
  html: string;
  /** 元素的文本内容 */
  text: string;
  /** 元素的所有属性 */
  attributes: Record<string, string>;
  /** 元素的 class 列表 */
  classList: string[];
  /** 元素的 ID */
  id: string;
  /** 元素的标签名 */
  tagName: string;
  /** 点击事件的原始对象 */
  event: MouseEvent;
  /** 鼠标在页面中的坐标 */
  clientX: number;
  clientY: number;
  /** 鼠标在视口中的坐标 */
  pageX: number;
  pageY: number;
  /** 点击的是否是左键 */
  isLeftClick: boolean;
  /** 点击的是否是右键 */
  isRightClick: boolean;
  /** 点击的是否是中键 */
  isMiddleClick: boolean;
  /** 是否按住了 Ctrl/Cmd */
  ctrlKey: boolean;
  /** 是否按住了 Shift */
  shiftKey: boolean;
  /** 是否按住了 Alt */
  altKey: boolean;
  /** 元素的父链路（从根到该元素） */
  elementPath: HTMLElement[];
  /** 元素的选择器路径 */
  selectorPath: string;
  /** 元素到根的 CSS 路径 */
  cssPath: string;
}

// 全局点击拦截器配置
interface ClickInterceptorConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 回调函数列表 */
  callbacks: ((info: ClickEventInfo) => void)[];
  /** 是否阻止默认行为 */
  preventDefault: boolean;
  /** 是否阻止事件冒泡 */
  stopPropagation: boolean;
  /** 过滤器函数 - 返回 true 则处理，false 则跳过 */
  filter?: (info: ClickEventInfo) => boolean;
}

class GlobalClickInterceptor {
  private config: ClickInterceptorConfig = {
    enabled: false,
    callbacks: [],
    preventDefault: false,
    stopPropagation: false,
  };

  private boundHandler: ((e: MouseEvent) => void) | null = null;

  /**
   * 启动全局点击拦截
   */
  public start(options?: Partial<ClickInterceptorConfig>): void {
    if (this.config.enabled) {
      console.warn('全局点击拦截器已启动');
      return;
    }

    // 合并配置
    this.config = {
      ...this.config,
      ...options,
      enabled: true,
    };

    // 创建事件处理器
    this.boundHandler = (event: MouseEvent) => {
      this.handleClick(event);
    };

    // 在捕获阶段监听所有点击
    document.addEventListener('click', this.boundHandler, true);

    console.log('✅ 全局点击拦截器已启动');
  }

  /**
   * 停止全局点击拦截
   */
  public stop(): void {
    if (!this.config.enabled) {
      console.warn('全局点击拦截器未启动');
      return;
    }

    if (this.boundHandler) {
      document.removeEventListener('click', this.boundHandler, true);
      this.boundHandler = null;
    }

    this.config.enabled = false;
    console.log('✅ 全局点击拦截器已停止');
  }

  /**
   * 注册点击事件回调
   */
  public on(callback: (info: ClickEventInfo) => void): void {
    this.config.callbacks.push(callback);
  }

  /**
   * 注销点击事件回调
   */
  public off(callback: (info: ClickEventInfo) => void): void {
    this.config.callbacks = this.config.callbacks.filter(cb => cb !== callback);
  }

  /**
   * 清空所有回调
   */
  public clear(): void {
    this.config.callbacks = [];
  }

  /**
   * 设置过滤器
   */
  public setFilter(filter: (info: ClickEventInfo) => boolean): void {
    this.config.filter = filter;
  }

  /**
   * 获取当前是否启用
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 处理点击事件
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target) return;

    // 构建点击信息对象
    const clickInfo = this.buildClickInfo(target, event);

    // 应用过滤器
    if (this.config.filter && !this.config.filter(clickInfo)) {
      return;
    }

    // 执行所有回调
    for (const callback of this.config.callbacks) {
      try {
        callback(clickInfo);
      } catch (error) {
        console.error('点击回调执行出错:', error);
      }
    }

    // 根据配置决定是否阻止默认行为
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    if (this.config.stopPropagation) {
      event.stopPropagation();
    }
  }

  /**
   * 构建点击信息对象
   */
  private buildClickInfo(element: HTMLElement, event: MouseEvent): ClickEventInfo {
    // 获取所有属性
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    // 获取元素路径
    const elementPath = this.getElementPath(element);
    const selectorPath = this.getSelectorPath(element);
    const cssPath = this.getCSSPath(element);

    return {
      element,
      html: element.innerHTML,
      text: element.innerText || element.textContent || '',
      attributes,
      classList: Array.from(element.classList),
      id: element.id,
      tagName: element.tagName.toLowerCase(),
      event,
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      isLeftClick: event.button === 0,
      isRightClick: event.button === 2,
      isMiddleClick: event.button === 1,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      elementPath,
      selectorPath,
      cssPath,
    };
  }

  /**
   * 获取元素到根的路径
   */
  private getElementPath(element: HTMLElement): HTMLElement[] {
    const path: HTMLElement[] = [];
    let current: Element | null = element;

    while (current) {
      if (current instanceof HTMLElement) {
        path.unshift(current);
      }
      current = current.parentElement;
    }

    return path;
  }

  /**
   * 获取元素的选择器路径（使用 class 和 id）
   */
  private getSelectorPath(element: HTMLElement): string {
    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.classList.length > 0) {
        selector += '.' + Array.from(current.classList).join('.');
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  /**
   * 获取元素的 CSS 路径（完整的 querySelector 路径）
   */
  private getCSSPath(element: HTMLElement): string {
    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
        parts.unshift(selector);
        break; // 如果有 ID，就用 ID 作为起点
      } else {
        // 计算该元素在其父元素中的索引
        let sibling = current.previousElementSibling;
        let index = 1;
        while (sibling) {
          if (sibling.tagName.toLowerCase() === selector) {
            index++;
          }
          sibling = sibling.previousElementSibling;
        }

        if (index > 1) {
          selector += `:nth-of-type(${index})`;
        }

        parts.unshift(selector);
      }

      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  /**
   * 根据选择器查找元素（用于验证）
   */
  public querySelectorByPath(selectorPath: string): HTMLElement | null {
    try {
      return document.querySelector(selectorPath) as HTMLElement;
    } catch {
      return null;
    }
  }
}

// 导出单例
export const globalClickInterceptor = new GlobalClickInterceptor();

/**
 * 快速开始 - 监听所有点击
 * 
 * @example
 * // 启动并打印所有点击
 * startClickMonitoring();
 * 
 * // 或带自定义回调
 * startClickMonitoring((info) => {
 *   console.log('点击了:', info.tagName, info.classList);
 * });
 */
export function startClickMonitoring(
  callback?: (info: ClickEventInfo) => void
): void {
  globalClickInterceptor.start();

  // 默认回调 - 打印信息到控制台
  const defaultCallback = (info: ClickEventInfo) => {
    console.group(`🖱️ 点击事件 - ${info.tagName}${info.id ? `#${info.id}` : ''}`);
    console.log('标签:', info.tagName);
    console.log('ID:', info.id || '(无)');
    console.log('类名:', info.classList);
    console.log('文本:', info.text.substring(0, 50));
    console.log('选择器路径:', info.selectorPath);
    console.log('CSS 路径:', info.cssPath);
    console.log('坐标:', `(${info.clientX}, ${info.clientY})`);
    console.log('完整元素:', info.element);
    console.groupEnd();
  };

  if (callback) {
    globalClickInterceptor.on(callback);
  } else {
    globalClickInterceptor.on(defaultCallback);
  }
}

/**
 * 停止点击监听
 */
export function stopClickMonitoring(): void {
  globalClickInterceptor.stop();
  globalClickInterceptor.clear();
}

/**
 * 监听特定选择器的点击
 * 
 * @example
 * // 监听所有 button 的点击
 * monitorSelector('button', (info) => {
 *   console.log('点击了按钮:', info.text);
 * });
 * 
 * // 监听特定 class 的点击
 * monitorSelector('.send-btn', (info) => {
 *   console.log('点击了发送按钮');
 * });
 */
export function monitorSelector(
  selector: string,
  callback: (info: ClickEventInfo) => void
): void {
  if (!globalClickInterceptor.isEnabled()) {
    globalClickInterceptor.start();
  }

  globalClickInterceptor.setFilter((info) => {
    try {
      return info.element.matches(selector);
    } catch {
      return false;
    }
  });

  globalClickInterceptor.on(callback);
}

/**
 * 获取点击元素的完整路径信息
 * 
 * @example
 * const info = getClickPathInfo(element);
 * console.log(info.selectorPath);
 */
export function getClickPathInfo(element: HTMLElement): ClickEventInfo {
  const event = new MouseEvent('click', { bubbles: true });
  // 这里我们创建一个模拟的 ClickEventInfo，只是为了获取路径信息
  // 实际使用中应该通过点击事件回调获取
  const attributes: Record<string, string> = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attributes[attr.name] = attr.value;
  }

  return {
    element,
    html: element.innerHTML,
    text: element.innerText || element.textContent || '',
    attributes,
    classList: Array.from(element.classList),
    id: element.id,
    tagName: element.tagName.toLowerCase(),
    event: event as MouseEvent,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    isLeftClick: true,
    isRightClick: false,
    isMiddleClick: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    elementPath: getElementPathStatic(element),
    selectorPath: getSelectorPathStatic(element),
    cssPath: getCSSPathStatic(element),
  };
}

/**
 * 获取元素到根的路径（静态版本）
 */
function getElementPathStatic(element: HTMLElement): HTMLElement[] {
  const path: HTMLElement[] = [];
  let current: Element | null = element;

  while (current) {
    if (current instanceof HTMLElement) {
      path.unshift(current);
    }
    current = current.parentElement;
  }

  return path;
}

/**
 * 获取元素的选择器路径（静态版本）
 */
function getSelectorPathStatic(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.classList.length > 0) {
      selector += '.' + Array.from(current.classList).join('.');
    }

    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

/**
 * 获取元素的 CSS 路径（静态版本）
 */
function getCSSPathStatic(element: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      parts.unshift(selector);
      break;
    } else {
      let sibling = current.previousElementSibling;
      let index = 1;
      while (sibling) {
        if (sibling.tagName.toLowerCase() === selector) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }

      if (index > 1) {
        selector += `:nth-of-type(${index})`;
      }

      parts.unshift(selector);
    }

    current = current.parentElement;
  }

  return parts.join(' > ');
}
