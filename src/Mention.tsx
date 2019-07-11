import React from 'react';
import ReactDOM from 'react-dom';
import omit from 'omit.js';

import MentionOption from './MentionOption';
import {
  detectLastMentioned,
  execCb,
  ILastMentionedMeta,
  updateValueWhenDelete,
  insertMention
} from './utils';
import { KEY_DOWN, KEY_UP, KEY_ENTER } from './constants';
import './style.less';

export interface MentionProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onBlur?: (evt: React.FocusEvent) => void;
  onFocus?: (evt: React.FocusEvent) => void;
  style?: React.CSSProperties;
  className?: string;
  rows?: number;
  prefix?: string | string[];
  split?: string;
  [x: string]: any;
}

export type MentionOptionValue = string | number | boolean;

export interface MentionContext {
  toggleOption: (option: MentionOptionValue) => void;
  value: any;
  keyword: string;
  classPrefix: string;

  registerValue: (value: MentionOptionValue) => void;
  cancelValue: (value: MentionOptionValue) => void;
}

interface MentionState {
  value: string;
  measureText: string;
  dropdownVisible: boolean;
  keyword: string;
  mentionOptionValue: MentionOptionValue;
  mentionOptions: MentionOptionValue[];
}

type CursorPosition = { left: number; top: number };

export const Context = React.createContext<MentionContext>(
  {} as MentionContext
);

export default class Mention extends React.Component<
  MentionProps,
  MentionState
> {
  static prefix = 'rh';

  static MentionOption: typeof MentionOption;

  static style = {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  } as React.CSSProperties;

  static defaultProps: MentionProps = {
    rows: 3,
    split: ' ',
    prefix: '@'
  };

  private cursorRef: React.RefObject<HTMLSpanElement>;

  private inputRef: React.RefObject<HTMLTextAreaElement>;
  private lastMeta: ILastMentionedMeta | null = null;

  constructor(props: Readonly<Partial<MentionProps>>) {
    super(props);

    this.state = {
      value: '',
      measureText: '',
      keyword: '',

      dropdownVisible: false,
      mentionOptionValue: '',
      mentionOptions: []
    };

    this.cursorRef = React.createRef();

    this.inputRef = React.createRef();
  }

  static getDerivedStateFromProps(
    nextProps: React.PropsWithChildren<MentionProps>,
    prevState: MentionState
  ): null | Partial<MentionState> {
    if ('value' in nextProps && nextProps.value !== prevState.value) {
      return {
        value: nextProps.value
      };
    }

    return null;
  }

  componentDidUpdate() {
    this.getCursorRect();
  }

  // 获取 定位光标相对父级位置
  getCursorRect = (): CursorPosition | null => {
    const node = this.cursorRef.current;

    if (node) {
      const parent = node.parentElement;
      if (parent === null) {
        return null;
      }
      const ret: CursorPosition = {
        left: 0,
        top: 0
      };

      const rect = node.getBoundingClientRect();

      ret.left = rect.left;

      // 计算滚动位置
      ret.top =
        rect.bottom > parent.clientHeight ? parent.clientHeight : rect.bottom;

      return ret;
    }

    return null;
  };

  getPrefix = () => {
    const prefix = this.props.prefix!;

    return Array.isArray(prefix) ? prefix : [prefix];
  };

  setFocus = () => {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  };

  setBlur = () => {
    if (this.inputRef.current) {
      this.inputRef.current.blur();
    }
  };

  registerValue = (value: MentionOptionValue) => {
    this.setState(prev => {
      const list = [...prev.mentionOptions, value];

      const mentionOptionValue = prev.mentionOptionValue || list[0];

      return {
        mentionOptions: list,
        mentionOptionValue
      };
    });
  };

  cancelValue = (value: MentionOptionValue) => {
    this.setState(prev => {
      const list = prev.mentionOptions.filter(item => item !== value);

      const mentionOptionValue =
        prev.mentionOptionValue === value ? list[0] : prev.mentionOptionValue;

      return {
        mentionOptions: list,
        mentionOptionValue
      };
    });
  };

  getContextOptions = (): MentionContext => {
    const { keyword, mentionOptionValue } = this.state;

    return {
      keyword,
      toggleOption: this.toggleOption,
      classPrefix: Mention.prefix,
      value: mentionOptionValue,
      registerValue: this.registerValue,
      cancelValue: this.cancelValue
    } as MentionContext;
  };

  handleFocus = (evt: React.FocusEvent) => {
    const { onFocus } = this.props;

    if (typeof onFocus === 'function') {
      onFocus(evt);
    }
  };

  handleBlur = (evt: React.FocusEvent) => {
    const { onBlur } = this.props;
    if (typeof onBlur === 'function') {
      onBlur(evt);
    }

    this.resetMentionState();
  };

  // 监听键盘事件
  handleKeydown = (evt: React.KeyboardEvent) => {
    const { keyCode } = evt;

    const { dropdownVisible, mentionOptionValue } = this.state;

    if (!dropdownVisible) {
      return;
    }

    switch (keyCode) {
      case KEY_DOWN:
        this.setMentionSelectedValue(1);
        break;
      case KEY_UP:
        this.setMentionSelectedValue(-1);
        break;
      case KEY_ENTER:
        evt.preventDefault();
        this.toggleOption(mentionOptionValue);
        break;
    }
  };

  // 设置当前选中 并滚动 如有需要
  setMentionSelectedValue = (step: number) => {
    const { mentionOptionValue, mentionOptions } = this.state;

    let index = mentionOptions.indexOf(mentionOptionValue);
    if (index === -1) {
      index = 0;
    } else {
      index += step;
    }

    index = Math.max(0, Math.min(index, mentionOptions.length - 1));

    this.setState({
      mentionOptionValue: mentionOptions[index]
    });
  };

  toggleOption = (value: any) => {
    if (this.lastMeta !== null) {
      const { index, prefix } = this.lastMeta;
      this.notifyChange(
        insertMention(
          this.state.value.slice(0, index),
          value,
          prefix,
          this.props.split!
        )
      );
    }

    this.setFocus();
    this.resetMentionState();
  };

  handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = evt.target.value;

    const current = this.state.value;

    // 删除模式
    if (value.length < current.length && this.lastMeta === null) {
      const newValue = updateValueWhenDelete(
        value,
        this.getPrefix(),
        this.props.split!
      );

      this.setState({
        dropdownVisible: false
      });
      this.notifyChange(newValue);

      return;
    }

    this.handleTriggerMention(value);
  };

  handleTriggerMention = (value: string) => {
    const prefix = this.getPrefix();

    const meta = detectLastMentioned(value, prefix);
    this.lastMeta = meta;

    // 关闭下拉
    if (meta === null) {
      this.notifyChange(value);
      this.resetMentionState();

      return;
    }

    this.notifyMention(value, meta);
  };

  // 重置状态
  resetMentionState = () => {
    this.setState({
      measureText: '',
      keyword: '',
      mentionOptionValue: ''
    });

    this.setDropdownVisible(false);
    this.lastMeta = null;
  };

  // 设置下拉框 确保更新其状态时 可以获得到 measure DOM 信息
  setDropdownVisible = (dropdownVisible: boolean) => {
    this.setState(() => ({
      dropdownVisible
    }));
  };

  notifyChange = (value: string) => {
    if ('value' in this.props) {
      return execCb(this.props.onChange, value);
    }

    this.setState({
      value
    });
  };

  notifyMention = (value: string, meta: ILastMentionedMeta) => {
    const { props } = this;

    const { content: mentionContent, index } = meta;
    const { onSearch } = props;
    const { mentionOptions, mentionOptionValue } = this.state;

    const measureText = value.slice(0, index + 1);

    const nextMentionValue = mentionOptionValue || mentionOptions[0];

    let params;

    if (!('value' in props)) {
      params = {
        value,
        keyword: mentionContent,
        measureText,
        mentionOptionValue: nextMentionValue
      } as MentionState;
    } else {
      params = {
        keyword: 'onSearch' in props ? '' : mentionContent,
        measureText,
        mentionOptionValue: nextMentionValue
      } as MentionState;
    }

    this.notifyChange(value);

    // 更新搜索信息
    this.setState(params, () => {
      this.setDropdownVisible(true);
    });

    if ('onSearch' in props) {
      execCb(onSearch, mentionContent);
    }
  };

  renderDropdown = (): React.ReactNode => {
    const { dropdownVisible } = this.state;

    if (!dropdownVisible) {
      return null;
    }

    const { children } = this.props;

    const rect = this.getCursorRect();

    const pos = {
      left: 0,
      top: 0
    };

    if (rect) {
      pos.left = rect.left;
      pos.top = rect.top;
    }

    return ReactDOM.createPortal(
      <div
        tabIndex={0}
        onBlur={this.resetMentionState}
        onKeyDown={this.handleKeydown}
        style={{
          ...pos,
          display: dropdownVisible ? '' : 'none'
        }}
        className={`${Mention.prefix}__mention-dropdown`}
      >
        {children}
      </div>,
      document.body
    );
  };

  render() {
    const {
      style = {},
      className,
      children,
      onChange,
      rows,
      ...rest
    } = this.props;

    const { value, measureText } = this.state;

    const props = omit(rest, [
      'value',
      'prefix',
      'onSearch',
      'split',
      'onBlur',
      'onFocus'
    ]);

    const elStyle = {
      ...style,
      ...Mention.style
    };

    const wrapperClasName = `${Mention.prefix}__mention${
      className ? ` ${className}` : ''
    }`;

    const inputClassName = `${Mention.prefix}__mention-input`;

    const measureClassName = `${Mention.prefix}__mention-measure`;

    return (
      <Context.Provider value={this.getContextOptions()}>
        <div {...props} style={elStyle} className={wrapperClasName}>
          <textarea
            onKeyDown={this.handleKeydown}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            ref={this.inputRef}
            value={value}
            onChange={this.handleChange}
            rows={rows}
            className={inputClassName}
          />

          <div className={measureClassName}>
            {measureText ? (
              <React.Fragment>
                {measureText}
                <span ref={this.cursorRef}>|</span>
              </React.Fragment>
            ) : null}
          </div>
        </div>
        {this.renderDropdown()}
      </Context.Provider>
    );
  }
}
