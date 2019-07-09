
export interface ILastMentionedMeta {
  index: number;
  prefix: string;
  content: string
}

/**
 *
 * @param value
 * @param current
 * @param prefix
 */
export const detectLastMentioned = (value: string, prefix: string[]): ILastMentionedMeta | null => {

  const lastChar = value.charAt(value.length - 1)

  if (prefix.includes(lastChar)) {
    return {
      index: value.length - 1,
      prefix: lastChar, content: ''
    } as ILastMentionedMeta
  }


  const parser = new RegExp(
    `(${prefix.join('|')})([^\\s${prefix.join('')}]+)$`
  );

  const match = value.match(parser);

  if (match === null) {
    return null;
  }

  const meta: ILastMentionedMeta = {
    index: match.index!,
    prefix: match[1],
    content: match[2] || ''
  }
  return meta;
};

/**
 *
 * @param value
 * @param prefix
 * @param split
 * @param validator
 */
export const updateValueWhenDelete = (value: string, prefix: string[], split: string, validator?: (value: string) => boolean): string => {

  const meta = detectLastMentioned(value, prefix);

  if (meta === null) {
    return value
  }

  if (typeof validator === 'function' && !validator(meta.content)) {
    return value;
  }


  return value.slice(0, meta.index - split.length)

}

export const insertMention = (value: string, mention: string, prefix: string, split: string): string => {
  let gap = split;

  // 新的一行 不添加 间隙
  if (/(?:\r?\n|\r)$/.test(value)) {
    gap = '';
  }

  return `${value}${gap}${prefix}${mention} `;


}

export const execCb = (cb: Function | undefined, ...rest: any[]) => {
  if (typeof cb === 'function') {
    cb(...rest);
  }
}
