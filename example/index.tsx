import React from 'react';
import ReactDOM from 'react-dom';

import Mentions, { MentionsOption } from '../src';

const defaultList = [
  {
    name: 'bob',
    value: 'bob'
  },
  {
    name: 'meszyouh',
    value: 'meszyouh'
  },
  {
    name: 'meyz',
    value: 'meyz'
  }
];

const App = () => {
  const [value, setValue] = React.useState<string>('');

  const [list, setList] = React.useState<any[]>([]);

  const onSearch = (keyword: string) => {
    console.log(keyword);

    setTimeout(() => {
      setList(defaultList);
    }, 5000);
  };

  return (
    <Mentions onSearch={onSearch} rows={6} value={value} onChange={setValue}>
      {list.map(item => (
        <MentionsOption value={item.value} key={item.value}>
          {item.name}
        </MentionsOption>
      ))}
    </Mentions>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
