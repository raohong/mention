import React from 'react';
import PropTypes from 'prop-types';

export interface ZyouMentionOptionProps {
  value: string | number;
  style?: React.CSSProperties;
  className?: string;
}

const ZyouMentionOption: React.FunctionComponent<ZyouMentionOptionProps> = ({
  children
}) => {
  return <React.Fragment>{children}</React.Fragment>;
};

ZyouMentionOption.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  style: PropTypes.object,
  className: PropTypes.string
};

export default ZyouMentionOption;
