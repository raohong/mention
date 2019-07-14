import React from 'react';
import PropTypes from 'prop-types';

type Rows = number | { min: number; max: number };

export interface AutoResizeProps {
  rows?: Rows;
}

export default class AutoResize extends React.Component<AutoResizeProps> {
  static propTypes = {
    rows: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number
      })
    ])
  };

  static defaultProps = {
    rows: 1
  };

  private el: HTMLElement | null = null;

  componentDidMount() {
    const el = this.el;

    const rows = this.props.rows;
    if (el === null) {
      return;
    }

    this.setRows(el, rows!);

    if (typeof rows === 'object') {
      this.adjustHeight(el);
    }
  }

  componentDidUpdate(prev: AutoResizeProps) {
    const el = this.el;
    const rows = this.props.rows;

    if (el === null) {
      return;
    }
    if (prev.rows !== rows) {
      this.setRows(el, rows!);
    }

    if (typeof rows === 'object') {
      this.adjustHeight(el);
    }
  }

  setRows = (el: HTMLElement, rows: Rows) => {
    const style = getComputedStyle(el);

    const baseSize = parseInt(style.lineHeight || '0', 10);

    let padding: number = 0;

    if (style.boxSizing !== 'content-box') {
      padding =
        parseInt(style.paddingTop || '0', 10) +
        parseInt(style.paddingBottom || '0', 10) +
        parseInt(style.borderTop || '0', 10) +
        parseInt(style.borderBottom || '0', 10);
    }

    if (typeof rows === 'number') {
      el.style.height = baseSize * rows + padding + 'px';

      el.style.overflowY = 'auto';
      return;
    }

    el.style.overflowY = 'hidden';

    if (typeof rows.min === 'number') {
      el.style.minHeight = baseSize * rows.min + padding + 'px';
    }

    if (typeof rows.max === 'number') {
      el.style.maxHeight = baseSize * rows.max + padding + 'px';
    }
  };

  adjustHeight = (el: HTMLElement) => {
    const style = getComputedStyle(el);

    const borderBox = style.boxSizing;
    el.style.height = 'auto';

    const padding =
      borderBox === 'content-box'
        ? 0
        : parseInt(style.borderTop || '0', 10) +
          parseInt(style.borderBottom || '0', 10);

    const height = el.scrollHeight + padding;

    el.style.overflowY =
      style.maxHeight && height > parseInt(style.maxHeight, 10)
        ? 'auto'
        : 'hidden';

    el.style.height = height + 'px';
  };

  setRef = (node: HTMLElement) => {
    const { children } = this.props;

    const child = React.Children.only(children);

    this.el = node;

    if (typeof child === 'object' && child !== null && 'ref' in child) {
      // @ts-ignore
      const ref = child.ref as any;
      if (!ref) {
        return;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (typeof ref === 'object') {
        ref.current = node;
      }
    }
  };

  render() {
    const { children } = this.props;

    const child = React.Children.only(children);

    if (!child || typeof child !== 'object') {
      return child;
    }

    const style = 'props' in child ? child.props.style || {} : {};

    delete style.height;

    return React.cloneElement(child as React.ReactElement, {
      ref: this.setRef,
      style
    });
  }
}
