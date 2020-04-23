import React from 'react';
import { Typography } from 'antd';

import Ethereum from './Ethereum';

const host = {
  1: 'https://etherscan.io',
  3: 'https://ropsten.etherscan.io',
  4: 'https://rinkeby.etherscan.io',
  5: 'https://goerli.etherscan.io',
  42: 'https://kovan.etherscan.io',
};

function Address({ value }) {
  const { chain } = Ethereum.useContext();
  let node = value;
  if (host[chain]) {
    node = (
      <a href={`${host[chain]}/address/${value}`}>
        {node}
      </a>
    );
  }
  return (
    <Typography.Text copyable={{ text: value }}>
      {node}
    </Typography.Text>
  );
}

function Transaction({ value }) {
  const { chain } = Ethereum.useContext();
  let node = value;
  if (host[chain]) {
    node = (
      <a href={`${host[chain]}/tx/${value}`}>
        {node}
      </a>
    );
  }
  return (
    <Typography.Text copyable={{ text: value }}>
      {node}
    </Typography.Text>
  );
}

export default { Address, Transaction };
