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
  let node = <Typography.Text copyable>{value}</Typography.Text>;
  if (host[chain]) {
    return <a href={`${host[chain]}/address/${value}`}>{node}</a>;
  } else {
    return node;
  }
}

function Transaction({ value }) {
  const { chain } = Ethereum.useContext();
  let node = <Typography.Text copyable>{value}</Typography.Text>;
  if (host[chain]) {
    return <a href={`${host[chain]}/tx/${value}`}>{node}</a>;
  } else {
    return node;
  }
}

export default { Address, Transaction };
