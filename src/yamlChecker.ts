/**
 * 检查字符串是否为YAML格式
 * @param content 要检查的内容
 * @returns 是否为YAML格式
 */
export function isYAML(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmedContent = content.trim();

  // 检查是否以 YAML 特征开头
  // 1. 以 key: value 格式开始
  // 2. 以 - 开始的列表
  // 3. 以 { 或 [ 开始（JSON）

  // 排除 JSON 格式
  if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
    return false;
  }

  // 检查基本的 YAML 特征
  const yamlKeyValueRegex = /^\s*[a-zA-Z_][a-zA-Z0-9_-]*\s*:/m;
  const yamlListRegex = /^\s*-\s+/m;

  if (yamlKeyValueRegex.test(trimmedContent) || yamlListRegex.test(trimmedContent)) {
    return true;
  }

  return false;
}

/**
 * 检查字符串是否为有效的YAML格式（更严格的检查）
 * @param content 要检查的内容
 * @returns { valid: boolean; error?: string }
 */
export function validateYAML(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: '内容不能为空或不是字符串' };
  }

  try {
    const trimmedContent = content.trim();

    // 排除 JSON 格式
    if (trimmedContent.startsWith('{') || trimmedContent.startsWith('[')) {
      return { valid: false, error: '检测到JSON格式而非YAML格式' };
    }

    // 检查 YAML 特征
    const lines = trimmedContent.split('\n');
    let hasYAMLFeature = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // 检查 key: value 格式
      if (/^[a-zA-Z_][a-zA-Z0-9_-]*\s*:/.test(trimmedLine)) {
        hasYAMLFeature = true;
        break;
      }

      // 检查列表格式
      if (/^-\s+/.test(trimmedLine)) {
        hasYAMLFeature = true;
        break;
      }

      // 检查缩进列表项
      if (/^\s+-\s+/.test(line)) {
        hasYAMLFeature = true;
        break;
      }
    }

    if (!hasYAMLFeature) {
      return { valid: false, error: '未检测到YAML格式特征' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `检验失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

/**
 * 定位 [IMG_GEN]...[/IMG_GEN] 标签在YAML中的位置
 * @param content YAML内容
 * @returns 标签位置信息数组
 */
export function locateImgGenTags(content: string): Array<{
  index: number;
  line: number;
  column: number;
  tag: string;
  lineContent: string;
}> {
  const results: Array<{
    index: number;
    line: number;
    column: number;
    tag: string;
    lineContent: string;
  }> = [];

  const contentLines = content.split('\n');
  let charCount = 0;

  contentLines.forEach((line, lineNum) => {
    const lineRegex = /\[IMG_GEN\][\s\S]*?\[\/IMG_GEN\]/g;
    let lineMatch;

    while ((lineMatch = lineRegex.exec(line)) !== null) {
      results.push({
        index: charCount + lineMatch.index,
        line: lineNum + 1,
        column: lineMatch.index + 1,
        tag: lineMatch[0],
        lineContent: line,
      });
    }

    charCount += line.length + 1; // +1 for newline
  });

  return results;
}

/**
 * 获取 [IMG_GEN] 标签的详细信息
 * @param content YAML内容
 * @returns 详细的标签信息
 */
export function getImgGenTagsInfo(content: string): Array<{
  position: number;
  line: number;
  column: number;
  tag: string;
  yamlKey?: string;
  tagLength: number;
}> {
  const locations = locateImgGenTags(content);
  const lines = content.split('\n');

  return locations.map(loc => {
    // 尝试找出该行所属的YAML key
    let yamlKey = '';
    if (loc.line > 0) {
      const lineContent = lines[loc.line - 1];
      const keyMatch = lineContent.match(/^\s*([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/);
      if (keyMatch) {
        yamlKey = keyMatch[1];
      }
    }

    return {
      position: loc.index,
      line: loc.line,
      column: loc.column,
      tag: loc.tag,
      yamlKey: yamlKey || undefined,
      tagLength: loc.tag.length,
    };
  });
}
