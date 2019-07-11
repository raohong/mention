import React from 'react';

import { Context } from './Mention';

export interface MentionOptionProps {
  value: any;
  style?: React.CSSProperties;
  className?: string;
  [x: string]: any;
}

export default class MentionOptions extends React.Component<
  MentionOptionProps,
  any
> {
  static contextType = Context;

  static defaultProps: Partial<MentionOptionProps> = {
    className: ''
  };

  private ref: React.RefObject<HTMLLIElement> = React.createRef();

  componentDidMount() {
    const context = this.context as React.ContextType<typeof Context>;

    const { value } = this.props;

    context.registerValue(value);

    if (value === context.value) {
      this.scrollInToView();
    }
  }

  scrollInToView = () => {
    if (this.ref.current) {
      this.ref.current.scrollIntoView(false);
    }
  };

  componentWillUnmount() {
    const context = this.context as React.ContextType<typeof Context>;
    context.cancelValue(this.props.value);
  }

  componentDidUpdate({ value }: MentionOptionProps) {
    const context = this.context as React.ContextType<typeof Context>;
    if (value !== this.props.value) {
      context.cancelValue(value);
      context.registerValue(this.props.value);
    }

    if (value === context.value) {
      this.scrollInToView();
    }
  }

  render() {
    const context = this.context as React.ContextType<typeof Context>;
    const { value, children, className, ...rest } = this.props;

    const actived = value === context.value;

    const classNames = `${
      context.classPrefix
    }__mention-dropdown-item ${className} ${actived ? 'active' : ''}`.trim();

    const props = {
      ...rest,
      onClick: (evt: React.MouseEvent) => {
        if (rest.onClick) {
          rest.onClick(evt);
        }
        context.toggleOption(value);
      }
    };

    if (context.keyword && value.indexOf(context.keyword) === -1) {
      return null;
    }

    return (
      <li ref={this.ref} className={classNames} {...props}>
        {children}
      </li>
    );
  }
}
