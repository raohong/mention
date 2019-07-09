import React from 'react';
import classnames from 'classnames';

import './style.less';

export interface MentionProps {
  value?: string;
  onChange?: string;
  style?: React.CSSProperties;
  className?: string;
  rows?: number;
  prefix?: string | string[];
}

interface MentionsState {
  value: string;
  measureText: string;
}

type IProps = Readonly<Partial<MentionProps>>;

export default class Mentions extends React.Component<
  MentionProps,
  MentionsState
> {
  static prefix = 'rh';

  static style = {
    whiteSpace: 'pre-wrap'
  } as React.CSSProperties;

  static defaultProps: MentionProps = {
    rows: 3,
    prefix: '@'
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
      value: '',
      measureText: ''
    };
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

  handleChange = (evt: React.ChangeEvent) => {};

  render() {
    const {
      style = {},
      className,
      children,

      onChange,
      rows,
      ...rest
    } = this.props;

    const willDeletedKeys = ['value', 'prefix'];

    willDeletedKeys.forEach(key => delete rest[key]);

    const props = rest as Omit<typeof rest, 'value' | 'prefix'>;

    const { value } = this.state;

    const elStyle = {
      ...style,
      ...Mentions.style
    };

    const wrapperClasName = classnames(`${Mentions.prefix}__mentions`, {
      [className!]: className
    });

    const inputClassName = classnames(`${Mentions.prefix}__mentions-input`);

    return (
      <div {...props} style={elStyle} className={wrapperClasName}>
        <textarea
          value={value}
          onChange={this.handleChange}
          rows={rows}
          className={inputClassName}
        />
      </div>
    );
  }
}
