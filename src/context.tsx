import React from 'react';

export interface MentionsContextValue {
  onSelect?: (value: any) => void;
  prefix: string;
}

const ctx = React.createContext<MentionsContextValue>({
  prefix: ''
});

export default ctx;
