import React from 'react';
import ReactDOM from 'react-dom';

import Mention from '../src';

const { MentionOption } = Mention;

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
  },
  {
    name: 'bob',
    value: 'bo1b'
  },
  {
    name: 'meszyouh',
    value: 'mesz2youh'
  },
  {
    name: 'me2yz',
    value: 'me2dqwd22z'
  },
  {
    name: 'meszyouh',
    value: 'mesz2ydqdwouh'
  },
  {
    name: 'mey2z',
    value: 'me22dqwd2yz'
  },
  {
    name: 'me2yz',
    value: 'me2dqwddd22z'
  },
  {
    name: 'meszyouh',
    value: 'mesz2dqwydqdwouh'
  },
  {
    name: 'mey2z',
    value: 'me22ddqwd2yz'
  }
];

const App = () => {
  const [list, setList] = React.useState<any[]>(defaultList);

  return (
    <Mention rows={6}>
      {list.map(item => (
        <MentionOption value={item.value} key={item.value}>
          {item.name}
        </MentionOption>
      ))}
    </Mention>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
