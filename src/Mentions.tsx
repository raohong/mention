import React from 'react';
import ReactDOM from 'react-dom';

import Context from './context';
import MentionsOption, { MentionsOptionsProps } from './MentionsOption';
import {
  detectLastMentioned,
  execCb,
  ILastMentionedMeta,
  updateValueWhenDelete,
  insertMention
} from './utils';

import './style.less';

export interface MentionProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  style?: React.CSSProperties;
  className?: string;
  rows?: number;
  prefix?: string | string[];
  split?: string;
}

interface MentionsState {
  value: string;
  measureText: string;
  dropdownVisible: boolean;
  keyword: string;
}

type IProps = Readonly<Partial<MentionProps>>;
type CursorPosition = { left: number; top: number };

export default class Mentions extends React.Component<
  MentionProps,
  MentionsState
> {
  static prefix = 'rh';

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

  constructor(props: IProps) {
    super(props);

    this.state = {
      value: '',
      measureText: '',
      keyword: '',
      dropdownVisible: false
    };

    this.cursorRef = React.createRef();

    this.inputRef = React.createRef();
  }

  static getDerivedStateFromProps(
    nextProps: IProps,
    prevState: MentionsState
  ): null | Partial<MentionsState> {
    if ('value' in nextProps && nextProps.value !== prevState.value) {
      return {
        value: nextProps.value
      };
    }

    return null;
  }

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

      // when scrolling
      ret.top =
        rect.bottom > parent.clientHeight ? parent.clientHeight : rect.bottom;

      return ret;
    }

    return null;
  };

  componentDidUpdate() {
    this.getCursorRect();
  }

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

  handleFocus = () => {};

  handleBlur = () => {};

  handleSelect = (value: any) => {
    if (this.lastMeta === null) {
      this.setFocus();
      return this.resetMentionState();
    }

    const { index, prefix } = this.lastMeta;

    this.setState({
      keyword: '',
      measureText: ''
    });

    this.notifyChange(
      insertMention(
        this.state.value.slice(0, index),
        value,
        prefix,
        this.props.split!
      )
    );

    this.setDropdownVisible(false);

    this.setFocus();
    this.lastMeta = null;
  };

  handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = evt.target.value;

    const current = this.state.value;

    // delete value
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
    // hide mention list
    if (meta === null) {
      this.setState({
        keyword: '',
        measureText: ''
      });

      this.notifyChange(value);

      this.setDropdownVisible(false);
      return;
    }

    this.notifyMention(value, meta);
  };

  resetMentionState = () => {
    this.setState({
      measureText: '',
      keyword: ''
    });

    this.setDropdownVisible(false);
    this.lastMeta = null;
  };

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
    const props = this.props;

    const { content: mentionContent, index } = meta;
    const { onSearch } = props;

    const measureText = value.slice(0, index + 1);

    if (!('value' in props)) {
      return this.setState(
        {
          value,
          keyword: mentionContent,
          measureText
        },
        () => {
          this.setDropdownVisible(true);
        }
      );
    }

    this.notifyChange(value);

    // 更新搜索信息
    this.setState(
      {
        keyword: 'onSearch' in props ? '' : mentionContent,
        measureText
      },
      () => {
        this.setDropdownVisible(true);
      }
    );

    if ('onSearch' in props) {
      execCb(onSearch, mentionContent);
    }
  };

  renderDropdown = (): React.ReactNode => {
    const { keyword, dropdownVisible } = this.state;

    if (!dropdownVisible) {
      return null;
    }

    const { children } = this.props;

    const rect = this.getCursorRect();

    let newChildren = React.Children.toArray(children).filter(
      item =>
        !!item &&
        typeof item === 'object' &&
        ('type' in item ? item.type === MentionsOption : false)
    ) as React.ReactElement<MentionsOptionsProps>[];

    if (keyword) {
      newChildren = newChildren.filter(item =>
        String(item.props.value).includes(keyword)
      );
    }

    const pos = {
      left: 0,
      top: 0
    };

    if (rect) {
      pos.left = rect.left;
      pos.top = rect.top;
    }

    const dropdown = (
      <div style={pos} className={`${Mentions.prefix}__mentions-dropdown`}>
        {newChildren}
      </div>
    );

    return ReactDOM.createPortal(dropdown, document.body);
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

    const willDeletedKeys = ['value', 'prefix', 'onSearch'];

    willDeletedKeys.forEach(key => delete rest[key]);

    const props = rest as Omit<typeof rest, 'value' | 'prefix' | 'onSearch'>;

    const elStyle = {
      ...style,
      ...Mentions.style
    };

    const wrapperClasName = `${Mentions.prefix}__mentions${
      className ? ` ${className}` : ''
    }`;

    const inputClassName = `${Mentions.prefix}__mentions-input`;

    const measureClassName = `${Mentions.prefix}__mentions-measure`;

    return (
      <Context.Provider
        value={{
          onSelect: this.handleSelect,
          prefix: Mentions.prefix
        }}
      >
        <div {...props} style={elStyle} className={wrapperClasName}>
          <textarea
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
