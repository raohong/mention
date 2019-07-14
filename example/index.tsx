import React from 'react';
import ReactDOM from 'react-dom';

import ZyouMention from '../src';

const { Option } = ZyouMention;

const defaultList = [
  {
    name: 'bob',
    value: 'bob'
  },
  {
    name: 'bob',
    value: 'bo1b'
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
  const [list, _] = React.useState<any[]>(defaultList);

  return (
    <div>
      <ZyouMention
        defaultValue='joioioioioioioioioioioioioioioioioioioioioi'
        rows={{
          max: 10,
          min: 2
        }}
      >
        {list.map(item => (
          <Option value={item.value} key={item.value}>
            {item.name}
          </Option>
        ))}
      </ZyouMention>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
