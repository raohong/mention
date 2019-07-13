import * as  React from 'react';

export interface ZyouMentionProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  deleteMode?: 'normal' | 'whole';
  placement?: 'top' | 'bottom';
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onBlur?: (evt: React.FocusEvent) => void;
  onFocus?: (evt: React.FocusEvent) => void;
  style?: React.CSSProperties;
  className?: string;
  rows?: number;
  prefix?: string | string[];
  split?: string;
}

export interface ZyouMentionOptionProps {
  value: string | number;
  key: string | number;
  style?: React.CSSProperties;
  className?: string;
}


export class ZyouMention extends React.Component<ZyouMentionProps, never>{
  static Option: typeof ZyouMentionOption
}

export const ZyouMentionOption: React.FunctionComponent<ZyouMentionOptionProps>

