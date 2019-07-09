import React from 'react';

import Context from './context';

export interface MentionsOptionsProps {
  value: any;
  style?: React.CSSProperties;
  className?: string;
}

const MentionsOptions: React.FunctionComponent<MentionsOptionsProps> = ({
  children,
  value,
  style = {},
  className = ''
}) => {
  return (
    <Context.Consumer>
      {({ onSelect, prefix }) => (
        <li
          style={style}
          onClick={() => onSelect!(value)}
          className={`${prefix}__mentions-dropdown-item ${className}`}
        >
          {children}
        </li>
      )}
    </Context.Consumer>
  );
};

export default MentionsOptions;
