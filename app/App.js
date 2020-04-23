import React, { useState } from 'react';
import { Layout } from 'antd';

import Ethereum from './Ethereum';
import ConnectButton from './ConnectButton';
import NotebookMenu from './NotebookMenu';
import ChainBanner from './ChainBanner';
import Notebook from './Notebook';

export default function App() {
  const [notebook, setNotebook] = useState();
  return (
    <Ethereum.Provider>
      <Layout>
        <Layout.Header>
          <h1
            style={{ float: 'left', color: '#fff' }}
          >
            EtherNote
          </h1>
          <ConnectButton
            style={{ float: 'right', marginTop: '16px' }}
          />
        </Layout.Header>
        <Layout.Content>
          <Layout style={{ height: 'calc(100vh - 64px)' }}>
            <Layout.Sider
              style={{ overflowX: 'hidden', background: '#fff' }}
            >
              <NotebookMenu value={notebook} onChange={setNotebook} />
            </Layout.Sider>
            <Layout.Content>
              <ChainBanner />
              <Notebook address={notebook} />
            </Layout.Content>
          </Layout>
        </Layout.Content>
      </Layout>
    </Ethereum.Provider>
  );
};
