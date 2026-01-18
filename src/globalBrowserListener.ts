/**
 * 全局浏览器事件监听器
 * 监听整个浏览器窗口的所有事件，包括 iframe 外部
 */

export interface GlobalEventInfo {
  /** 事件类型 */
  type: string;
  /** 目标元素 */
  target: HTMLElement | Window | Document | null;
  /** 元素标签名 */
  tagName?: string;
  /** 元素 ID */
  elementId?: string;
  /** 元素类名 */
  className?: string;
  /** 事件对象 */
  event: Event;
  /** 事件时间戳 */
  timestamp: number;
  /** 是否来自 iframe */
  isFromIFrame: boolean;
}

class GlobalBrowserListener {
  private listeners: Map<string, ((info: GlobalEventInfo) => void)[]> = new Map();
  private isListening = false;
  private eventTypes = [
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mousemove',
    'keydown',
    'keyup',
    'keypress',
    'input',
    'change',
    'focus',
    'blur',
    'submit',
    'reset',
    'scroll',
    'resize',
    'load',
    'unload',
    'beforeunload',
    'message',
  ];

  /**
   * 启动全局监听
   */
  public start(): void {
    if (this.isListening) {
      console.warn('全局浏览器监听已启动');
      return;
    }

    this.isListening = true;

    // 监听主窗口的事件
    this.attachWindowListeners(window);

    // 监听所有 iframe
    this.attachIFrameListeners();

    // 定期检查新增的 iframe
    setInterval(() => {
      this.attachIFrameListeners();
    }, 2000);

    console.log('✅ 全局浏览器监听已启动');
  }

  /**
   * 停止全局监听
   */
  public stop(): void {
    if (!this.isListening) {
      console.warn('全局浏览器监听未启动');
      return;
    }

    this.isListening = false;
    this.listeners.clear();
    console.log('✅ 全局浏览器监听已停止');
  }

  /**
   * 注册事件监听
   */
  public on(eventType: string, callback: (info: GlobalEventInfo) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * 注销事件监听
   */
  public off(eventType: string, callback: (info: GlobalEventInfo) => void): void {
    if (!this.listeners.has(eventType)) return;
    const callbacks = this.listeners.get(eventType)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 为主窗口附加事件监听
   */
  private attachWindowListeners(win: Window): void {
    this.eventTypes.forEach(eventType => {
      try {
        win.addEventListener(
          eventType,
          (event: Event) => this.handleEvent(event, false),
          true // 使用捕获阶段
        );
      } catch (error) {
        // 某些事件可能无法监听
        console.debug(`无法监听事件: ${eventType}`);
      }
    });
  }

  /**
   * 为所有 iframe 附加事件监听
   */
  private attachIFrameListeners(): void {
    const iframes = document.querySelectorAll('iframe');
    
    iframes.forEach(iframe => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const iframeWin = iframe.contentWindow;

        if (!iframeDoc || !iframeWin) {
          return; // 跨域 iframe，无法访问
        }

        // 为 iframe 的 window 对象附加监听
        this.attachWindowListeners(iframeWin);

        // 监听 iframe 内的 message 事件
        iframeWin.addEventListener('message', (event: Event) => {
          this.handleEvent(event, true);
        });
      } catch (error) {
        // 跨域 iframe 会触发错误，这是预期的
        console.debug(`无法访问 iframe: ${error}`);
      }
    });
  }

  /**
   * 处理事件
   */
  private handleEvent(event: Event, isFromIFrame: boolean): void {
    const eventInfo = this.buildEventInfo(event, isFromIFrame);

    // 执行该事件类型的所有回调
    const callbacks = this.listeners.get(eventInfo.type) || [];
    for (const callback of callbacks) {
      try {
        callback(eventInfo);
      } catch (error) {
        console.error('事件回调执行出错:', error);
      }
    }
  }

  /**
   * 构建事件信息对象
   */
  private buildEventInfo(event: Event, isFromIFrame: boolean): GlobalEventInfo {
    let target = event.target as HTMLElement | null;
    let tagName = '';
    let elementId = '';
    let className = '';

    if (target && target instanceof HTMLElement) {
      tagName = target.tagName.toLowerCase();
      elementId = target.id || '';
      className = target.className || '';
    }

    return {
      type: event.type,
      target: event.target as HTMLElement | Window | Document | null,
      tagName,
      elementId,
      className,
      event,
      timestamp: Date.now(),
      isFromIFrame,
    };
  }

  /**
   * 获取监听器列表
   */
  public getListeners(): Map<string, ((info: GlobalEventInfo) => void)[]> {
    return this.listeners;
  }

  /**
   * 清空所有监听器
   */
  public clear(): void {
    this.listeners.clear();
  }
}

// 导出单例
export const globalBrowserListener = new GlobalBrowserListener();

/**
 * 快速开始 - 监听所有点击事件（包括 iframe）
 * 
 * @example
 * startGlobalClickMonitoring((info) => {
 *   console.log('点击位置:', info.target);
 *   console.log('来自 iframe:', info.isFromIFrame);
 * });
 */
export function startGlobalClickMonitoring(
  callback?: (info: GlobalEventInfo) => void
): void {
  globalBrowserListener.start();

  const defaultCallback = (info: GlobalEventInfo) => {
    console.group(`🖱️ 全局点击事件 ${info.isFromIFrame ? '(iframe)' : '(主窗口)'}`);
    console.log('标签:', info.tagName);
    console.log('ID:', info.elementId || '(无)');
    console.log('类名:', info.className || '(无)');
    console.log('目标:', info.target);
    console.log('来自 iframe:', info.isFromIFrame);
    console.groupEnd();
  };

  if (callback) {
    globalBrowserListener.on('click', callback);
  } else {
    globalBrowserListener.on('click', defaultCallback);
  }
}

/**
 * 停止全局点击监听
 */
export function stopGlobalClickMonitoring(): void {
  globalBrowserListener.stop();
  globalBrowserListener.clear();
}

/**
 * 监听全局键盘事件
 * 
 * @example
 * startGlobalKeyboardMonitoring((info) => {
 *   console.log('按键事件:', info.event);
 * });
 */
export function startGlobalKeyboardMonitoring(
  callback?: (info: GlobalEventInfo) => void
): void {
  globalBrowserListener.start();

  const defaultCallback = (info: GlobalEventInfo) => {
    const keyEvent = info.event as KeyboardEvent;
    console.log(`⌨️ ${info.type} - ${keyEvent.key}`, {
      code: keyEvent.code,
      shiftKey: keyEvent.shiftKey,
      ctrlKey: keyEvent.ctrlKey,
      altKey: keyEvent.altKey,
      isFromIFrame: info.isFromIFrame,
    });
  };

  if (callback) {
    globalBrowserListener.on('keydown', callback);
    globalBrowserListener.on('keyup', callback);
  } else {
    globalBrowserListener.on('keydown', defaultCallback);
    globalBrowserListener.on('keyup', defaultCallback);
  }
}

/**
 * 监听全局输入事件
 * 
 * @example
 * startGlobalInputMonitoring((info) => {
 *   const input = info.target as HTMLInputElement;
 *   console.log('输入值:', input.value);
 * });
 */
export function startGlobalInputMonitoring(
  callback?: (info: GlobalEventInfo) => void
): void {
  globalBrowserListener.start();

  const defaultCallback = (info: GlobalEventInfo) => {
    if (info.target instanceof HTMLInputElement || info.target instanceof HTMLTextAreaElement) {
      console.log(`📝 ${info.type} - ${info.tagName}`, {
        value: (info.target as any).value?.substring(0, 50),
        isFromIFrame: info.isFromIFrame,
      });
    }
  };

  if (callback) {
    globalBrowserListener.on('input', callback);
    globalBrowserListener.on('change', callback);
  } else {
    globalBrowserListener.on('input', defaultCallback);
    globalBrowserListener.on('change', defaultCallback);
  }
}

/**
 * 监听全局提交事件
 * 
 * @example
 * startGlobalFormMonitoring((info) => {
 *   console.log('表单提交:', info.target);
 * });
 */
export function startGlobalFormMonitoring(
  callback?: (info: GlobalEventInfo) => void
): void {
  globalBrowserListener.start();

  const defaultCallback = (info: GlobalEventInfo) => {
    console.log(`📋 ${info.type}`, {
      target: info.target,
      isFromIFrame: info.isFromIFrame,
    });
  };

  if (callback) {
    globalBrowserListener.on('submit', callback);
    globalBrowserListener.on('reset', callback);
  } else {
    globalBrowserListener.on('submit', defaultCallback);
    globalBrowserListener.on('reset', defaultCallback);
  }
}

/**
 * 监听特定事件类型
 * 
 * @example
 * startMonitoringEvent('focus', (info) => {
 *   console.log('获得焦点:', info.target);
 * });
 */
export function startMonitoringEvent(
  eventType: string,
  callback: (info: GlobalEventInfo) => void
): void {
  globalBrowserListener.start();
  globalBrowserListener.on(eventType, callback);
}

/**
 * 停止监听特定事件
 */
export function stopMonitoringEvent(
  eventType: string,
  callback: (info: GlobalEventInfo) => void
): void {
  globalBrowserListener.off(eventType, callback);
}
