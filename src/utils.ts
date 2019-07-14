export const regEscape = (str: string): string =>
  str.replace(/[*+?{}[\]().^$\\/-]/g, '\\$&');

export interface ILastMentionedMeta {
  index: number;
  prefix: string;
  content: string;
}

/**
 *
 * @param value
 * @param current
 * @param prefix
 */
export const detectLastMentioned = (
  value: string,
  prefix: string[]
): ILastMentionedMeta | null => {
  // not expected line wrap (?:(?!\\r\\n?|\\n)\\s)*
  const parser = new RegExp(
    `(${regEscape(prefix.join('|'))})([^\\s${regEscape(prefix.join(''))}]*)$`
  );

  const match = value.match(parser);

  if (match === null) {
    return null;
  }

  const meta: ILastMentionedMeta = {
    content: match[2] || '',
    prefix: match[1],
    index: match.index!
  };
  return meta;
};

interface DeepGetMetaResult {
  raw: string;
  meta: null | ILastMentionedMeta;
  offset: number;
}

/**
 * 获取 mention 信息
 * @param str
 * @param prefix
 * @param backup
 * @param validator
 * @param offset 默认是 -1. 因为取值是 value.slice(0, selectionEnd), 当进入递归时, 要把默认删除行为删除的字符加上
 */
const deepGetMetaInfo = (
  str: string,
  prefix: string[],
  backup: string[],
  validator: (value: string) => boolean,
  offset: number = -1
): DeepGetMetaResult => {
  let meta = detectLastMentioned(str, prefix);

  if (typeof validator === 'function' && meta !== null) {
    const flag = validator(meta.content);

    if (!flag && backup.length) {
      return deepGetMetaInfo(
        str + backup[0],
        prefix,
        backup.slice(1),
        validator,
        offset + 1
      );
    } else if (!flag) {
      meta = null;
    }
  }

  return { raw: str, meta, offset };
};

/**
 *
 * @param value
 * @param prefix
 * @param split
 * @param validator
 */
export const updateValueWhenDelete = (
  value: string,
  current: string,
  prefix: string[],
  split: string,
  selectionEnd: number,
  validator: (value: string) => boolean
): string | null => {
  const startValue = current.slice(0, selectionEnd);

  let gap = current.slice(selectionEnd);
  gap = gap.match(/^\S+/) ? gap.match(/^\S+/)![0] : '';

  const backup = gap.split('');
  const rest = value.slice(selectionEnd);
  const info = deepGetMetaInfo(startValue, prefix, backup, validator);

  if (info.meta === null) {
    return value;
  }

  const restFilter = new RegExp(`^[${regEscape(split)}]`);
  const restText: string =
    info.offset >= 0 ? rest.slice(info.offset).replace(restFilter, '') : rest;

  return info.raw.slice(0, Math.max(0, info.meta.index - 1)) + restText;
};

export const insertMention = (
  value: string,
  mention: string,
  prefix: string,
  split: string
): string => {
  let gap = split;

  const reg = new RegExp(`${regEscape(gap)}+$`);

  // 新的一行 不添加 间隙 已有间隙不加
  if (/(?:\r?\n|\r)$/.test(value) || value.length === 0 || reg.test(value)) {
    gap = '';
  }

  return `${value}${gap}${prefix}${mention} `;
};

// tslint:disable-next-line: ban-types
export const execCb = (cb: Function | undefined, ...rest: any[]) => {
  if (typeof cb === 'function') {
    cb(...rest);
  }
};

export const getValueFromProps = (child: React.ReactNode): string | number => {
  if (typeof child !== 'object' || child === null) {
    throw new TypeError('MentionOption is required a value propperty');
  }

  if ('props' in child && 'value' in child.props) {
    return child.props.value;
  }

  throw new TypeError('MentionOption is required a value propperty');
};

export const getKeyFromProps = (
  child: React.ReactNode
): string | null | number => {
  if (typeof child !== 'object') {
    return null;
  }

  if (child !== null && 'key' in child) {
    return child.key;
  }
  return null;
};

export const getPrefix = (prefix: string | string[]): string[] => {
  return Array.isArray(prefix) ? prefix : [prefix];
};

export const createMentionDeleteModeValidator = (options: any[]) => {
  return (value: string) => {
    return options.some(item => String(item.value) === value);
  };
};
