import React from 'react';
import omit from 'omit.js';
import PropTypes from 'prop-types';

import AutoResize, { AutoResizeProps } from './AutoResize';
import MentionOption from './Option';
import {
  detectLastMentioned,
  execCb,
  updateValueWhenDelete,
  ILastMentionedMeta,
  insertMention,
  getPrefix,
  getValueFromProps,
  getKeyFromProps,
  createMentionDeleteModeValidator
} from './utils';
import { KEY_DOWN, KEY_UP, KEY_ENTER } from './constants';
import './style.less';

export interface MentionProps extends AutoResizeProps {
  value?: string;
  autoResize?: boolean;
  defaultValue?: string;
  placeholder?: string;
  deleteMode?: 'normal' | 'whole';
  placement?: 'top' | 'bottom';
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onSelect?: (value: string) => void;
  onBlur?: (evt: React.FocusEvent) => void;
  onFocus?: (evt: React.FocusEvent) => void;
  style?: React.CSSProperties;
  className?: string;
  prefix?: string | string[];
  split?: string;
  [x: string]: any;
}

type MentionOptionValue = string | number;

type MentionOptionKey = string | number | number;

type ComponentPropTypes<T> = { [K in keyof T]: any };

interface MentionOptionItem {
  children: React.ReactNode;
  props: Record<string, any>;
  value: MentionOptionValue;
  key: MentionOptionKey;
}

interface MentionState {
  value: string;
  measureText: string;
  dropdownVisible: boolean;
  keyword: string;
  dropdownActiveIndex: number;
  mentionOptions: MentionOptionItem[];
  children: React.ReactNode;
}

interface CursorPosition {
  left: number;
  top: number | 'auto';
  bottom: number | 'auto';
}

export default class ZyouMention extends React.Component<
  MentionProps,
  MentionState
> {
  static clsPrefix = 'zyou';

  static Option: typeof MentionOption;

  static style = {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  } as React.CSSProperties;

  static defaultProps: MentionProps = {
    rows: 3,
    split: ' ',
    prefix: '@',
    autoResize: true,
    placement: 'top',
    /**
     * After selecting a mention,
     * if the text behind the cursor can match from the data source,
     * delete the corresponding text.
     */
    deleteMode: 'whole'
  };

  static propTypes = {
    value: PropTypes.string,
    deleteMode: PropTypes.oneOf(['normal', 'whole']),
    placement: PropTypes.oneOf(['top', 'bottom']),
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    onSearch: PropTypes.func,
    onSelect: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    split: PropTypes.string,
    prefix: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    ...AutoResize.propTypes
  } as ComponentPropTypes<MentionProps>;

  private cursorRef: React.RefObject<HTMLSpanElement>;
  private dropdownItemRefs: HTMLLIElement[] = [];
  private inputRef: React.RefObject<HTMLTextAreaElement>;
  private lastMeta: ILastMentionedMeta | null = null;

  constructor(props: Readonly<Partial<MentionProps>>) {
    super(props);

    this.state = {
      value: props.defaultValue || '',
      measureText: '',
      keyword: '',
      dropdownVisible: false,
      dropdownActiveIndex: 0,
      mentionOptions: [],
      children: null
    };

    this.cursorRef = React.createRef();
    this.inputRef = React.createRef();
  }

  static getDerivedStateFromProps(
    nextProps: React.PropsWithChildren<MentionProps>,
    prevState: MentionState
  ): null | Partial<MentionState> {
    const nextState = {} as Partial<MentionState>;

    const { value, children } = nextProps;

    // 缓存 children
    if (nextProps.children !== prevState.children) {
      nextState.mentionOptions = ZyouMention.getOptionsFromChildren(
        nextProps.children
      );
      nextState.children = children;
      nextState.dropdownActiveIndex = 0;
    }

    if ('value' in nextProps && value !== prevState.value) {
      nextState.value = value;
      return nextState;
    }

    return nextState;
  }

  static getOptionsFromChildren(childen: React.ReactNode): MentionOptionItem[] {
    return React.Children.map(childen, child => {
      return {
        value: getValueFromProps(child),
        children: child,
        key: getKeyFromProps(child),
        props:
          typeof child === 'object' && child !== null
            ? omit((child as Record<string, any>).props, ['children', 'value'])
            : {}
      } as MentionOptionItem;
    });
  }

  componentDidUpdate() {
    this.getCursorRect();

    const { dropdownActiveIndex } = this.state;

    const item = this.dropdownItemRefs[dropdownActiveIndex];

    if (item && item.scrollIntoView) {
      item.scrollIntoView(false);
    }
  }

  // 获取 测量光标位置
  getCursorRect = (): CursorPosition => {
    const node = this.cursorRef.current;
    const ret: CursorPosition = {
      left: 0,
      top: 'auto',
      bottom: 'auto'
    };

    if (node) {
      const parent = node.offsetParent;
      if (parent === null) {
        return ret;
      }

      const style = getComputedStyle(parent);
      ret.left = node.offsetLeft + parseInt(style.borderLeft || '0', 10);

      const offset = node.offsetTop + node.offsetHeight;

      if (this.props.placement === 'bottom') {
        ret.top = offset;
      } else {
        ret.bottom = Math.max(
          parseInt(style.paddingBottom || '0', 10) + parent.clientTop,
          parent.clientHeight - offset
        );
      }
    }

    return ret;
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
  };

  /**
   * 获取 keyword  过滤后的数据
   */
  getFilterdOptions = () => {
    const { keyword, mentionOptions } = this.state;
    return keyword
      ? mentionOptions.filter(item => String(item.value).includes(keyword))
      : mentionOptions;
  };

  /**
   * 监听下拉框键盘选择事件
   * UP move up
   * DOWN move down
   * ENTER select
   */
  handleKeydown = (evt: React.KeyboardEvent) => {
    const { keyCode } = evt;
    const { dropdownVisible, dropdownActiveIndex } = this.state;

    if (!dropdownVisible) {
      return;
    }
    const options = this.getFilterdOptions();

    let index = dropdownActiveIndex;

    index = Math.max(0, Math.min(options.length - 1, index));

    switch (keyCode) {
      case KEY_DOWN:
        index += 1;
        index = index % options.length;
        break;
      case KEY_UP:
        index -= 1;
        index = (index + options.length) % options.length;
        break;
      case KEY_ENTER:
        evt.preventDefault();
        this.toggleOption(options[dropdownActiveIndex].value);
        return;
    }

    this.setState({
      dropdownActiveIndex: index
    });
  };

  /**
   * 选中
   */
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

    if ('onSelect' in this.props && typeof this.props.onSelect === 'function') {
      this.props.onSelect(value);
    }
  };

  handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = evt.target.value;

    const { value: current, mentionOptions } = this.state;

    const { prefix, deleteMode, split } = this.props;

    // 获取光标 因为存在从右到左选取 从左到右选取
    const selectionEnd = Math.max(
      evt.target.selectionStart || value.length,
      evt.target.selectionEnd || value.length
    );

    // 当 deleteMode 是 whole 时
    if (
      value.length < current.length &&
      this.lastMeta === null &&
      deleteMode === 'whole'
    ) {
      const newValue = updateValueWhenDelete(
        value,
        current,
        getPrefix(prefix!),
        split!,
        selectionEnd,
        createMentionDeleteModeValidator(mentionOptions)
      );
      if (newValue !== null) {
        this.resetMentionState();
        this.notifyChange(newValue);
        return;
      }
    }
    this.handleTriggerMention(value);
  };

  handleTriggerMention = (value: string) => {
    const prefix = getPrefix(this.props.prefix!);

    const meta = detectLastMentioned(value, prefix);
    this.lastMeta = meta;

    // 说明没有 @
    if (meta === null) {
      this.resetMentionState();
      this.notifyChange(value);

      return;
    }

    this.notifyMention(value, meta);
  };

  /**
   * 重置 Mention state
   */
  resetMentionState = () => {
    this.setState({
      measureText: '',
      keyword: '',
      dropdownActiveIndex: 0
    });

    this.setDropdownVisible(false);
    this.lastMeta = null;
  };

  /**
   * 设置下拉框  确保更新其状态时 可以获得到 measure DOM 信息
   */
  setDropdownVisible = (dropdownVisible: boolean) => {
    this.setState(() => ({
      dropdownVisible
    }));
  };

  /**
   * 通用 change 回调
   */
  notifyChange = (value: string) => {
    if ('value' in this.props) {
      return execCb(this.props.onChange, value);
    }

    this.setState({
      value
    });
  };

  notifyMention = (value: string, meta: ILastMentionedMeta) => {
    const props = this.props;

    const { content: mentionContent, index } = meta;
    const { onSearch } = props;

    // eg hello@meszyouh => hello@
    const measureText = value.slice(0, index + 1);

    let params;

    if (!('value' in props)) {
      params = {
        value,
        keyword: mentionContent,
        measureText
      } as MentionState;
    } else {
      params = {
        // 存在 onSearch 由外部驱动
        keyword: 'onSearch' in props ? '' : mentionContent,
        measureText
      } as MentionState;
    }

    // 重置为 0
    params.dropdownActiveIndex = 0;

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
    const { dropdownVisible, dropdownActiveIndex } = this.state;

    if (!dropdownVisible) {
      return null;
    }

    const pos = this.getCursorRect();

    // 渲染时重置
    this.dropdownItemRefs = [];

    const options = this.getFilterdOptions();

    const children = options.map((item, index) => {
      const { onClick, ...rest } = item.props;

      const handleClick = (evt: React.MouseEvent) => {
        this.toggleOption(item.value);

        if (typeof onClick === 'function') {
          onClick(evt);
        }
      };

      return (
        <li
          {...rest}
          onClick={handleClick}
          ref={(node: HTMLLIElement) => (this.dropdownItemRefs[index] = node)}
          key={item.key}
          className={`${ZyouMention.clsPrefix}__mention-dropdown-item${
            index === dropdownActiveIndex
              ? ` ${ZyouMention.clsPrefix}__mention-dropdown-item-active`
              : ''
          }`}
        >
          {item.children}
        </li>
      );
    });

    return (
      <ul
        tabIndex={0}
        onBlur={this.resetMentionState}
        onKeyDown={this.handleKeydown}
        style={pos}
        className={`${ZyouMention.clsPrefix}__mention-dropdown`}
      >
        {children}
      </ul>
    );
  };

  render() {
    const {
      style = {},
      className,
      children,
      onChange,
      placeholder,
      rows,
      autoResize,
      ...rest
    } = this.props;

    const { value, measureText } = this.state;

    const props = omit(rest, [
      'value',
      'prefix',
      'onSearch',
      'split',
      'onBlur',
      'onFocus',
      'defaultValue',
      'deleteMode'
    ]);

    const elStyle = {
      ...style,
      ...ZyouMention.style
    };

    const wrapperClasName = `${ZyouMention.clsPrefix}__mention${
      className ? ` ${className}` : ''
    }`;

    const inputClassName = `${ZyouMention.clsPrefix}__mention-input`;

    const measureClassName = `${ZyouMention.clsPrefix}__mention-measure`;

    const input = (
      <textarea
        placeholder={placeholder}
        onKeyDown={this.handleKeydown}
        onBlur={this.handleBlur}
        onFocus={this.handleFocus}
        ref={this.inputRef}
        value={value}
        onChange={this.handleChange}
        className={inputClassName}
      />
    );

    return (
      <React.Fragment>
        <div {...props} style={elStyle} className={wrapperClasName}>
          {autoResize ? <AutoResize rows={rows}>{input}</AutoResize> : input}
          <div className={measureClassName}>
            {measureText ? (
              <React.Fragment>
                {measureText}
                <span ref={this.cursorRef}>|</span>
              </React.Fragment>
            ) : null}
          </div>
          {this.renderDropdown()}
        </div>
      </React.Fragment>
    );
  }
}
