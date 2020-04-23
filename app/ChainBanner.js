import React from 'react';
import { Alert } from 'antd';

import Ethereum from './Ethereum';

export default function ChainBanner() {
  const { chain } = Ethereum.useContext();
  if (chain === undefined) {
    return <Alert type="info" message="正在连接……" banner />;
  } else if (chain === null) {
    return <Alert type="error" message="连接出错" banner />;
  } else if (chain === 1) {
    return null;
  } else {
    return <Alert type="warning" message="当前在测试链上" banner />;
  }
};
