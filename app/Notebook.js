import React, { useEffect, useState, useMemo } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  PageHeader,
  Skeleton,
  Space,
  notification,
} from 'antd';
import { ethers } from 'ethers';

import { useAsync } from './Async';
import Ethereum from './Ethereum';
import Etherscan from './Etherscan';
import contract from '../contracts/v0.1.1/Notebook';

function parseNote(data) {
  switch (ethers.utils.hexDataSlice(data, 0, 4)) {
    case '0x00000000':
      return {
        type: 'text',
        text: ethers.utils.toUtf8String(
          ethers.utils.hexDataSlice(data, 4), true),
      };
    default:
      return { type: ethers.utils.hexDataSlice(data, 0, 4) };
  }
}

const noteCache = {};
async function loadNote(provider, txid) {
  if (!noteCache[txid]) {
    const { data } = await provider.getTransaction(txid);
    noteCache[txid] = parseNote(data);
  }
  return noteCache[txid];
}

function Note({ txid }) {
  const { connector } = Ethereum.useContext();
  const provider = connector.provider || connector;
  const note = useAsync(() => loadNote(provider, txid), null, [txid]);
  if (note === undefined) {
    return (
      <List.Item>
        <Skeleton />
      </List.Item>
    );
  } else if (note === null) {
    return (
      <List.Item actions={[<Etherscan.Transaction value={txid} />]}>
        <Alert type="error" message={`加载失败`} />
      </List.Item>
    );
  } else if (note.type === 'text') {
    return (
      <List.Item actions={[<Etherscan.Transaction value={txid} />]}>
        <Input.TextArea
          value={note.text}
          autoSize={{ minRows: 0 }}
          readOnly
          style={{
            padding: '0',
            border: 'none',
            resize: 'none',
            cursor: 'auto',
          }}
        />
      </List.Item>
    );
  } else {
    return (
      <List.Item actions={[<Etherscan.Transaction value={txid} />]}>
        <Alert type="error" message={`未知类型笔记：${note.type}`} />
      </List.Item>
    );
  }
}

export default function Notebook({ address }) {
  const { connector, account } = Ethereum.useContext();
  const provider = connector.provider || connector;
  const actualAddress = useAsync(async () => (
    await provider.resolveName(address)
  ), null, [address, provider]);
  const notebook = useMemo(() => (
    actualAddress && new ethers.Contract(actualAddress, contract.abi, connector)
  ), [actualAddress, connector]);
  const [symbolForSettingsReload, setSymbolForSettingsReload] = useState();
  useEffect(() => {
    if (notebook) {
      function f() { setSymbolForSettingsReload(Symbol()); }
      notebook.on('Settings', f);
      return () => { notebook.removeListener('Settings', f); };
    }
  }, [notebook]);
  const version = useAsync(async () => (
    ethers.utils.parseBytes32String(await notebook.version())
  ), null, [notebook, symbolForSettingsReload]);
  const loading = notebook === undefined || version === undefined;
  const owner = useAsync(async () => (
    await notebook.owner()
  ), null, [notebook, symbolForSettingsReload]);
  const settings = useAsync(async () => (
    JSON.parse(await notebook.settings())
  ), null, [notebook, symbolForSettingsReload]) || {
    title: '笔记本',
  };
  const [symbolForNotesReload, setSymbolForNotesReload] = useState();
  useEffect(() => {
    if (notebook) {
      function f() { setSymbolForNotesReload(Symbol()); }
      notebook.on('Note', f);
      return () => { notebook.removeListener('Note', f); };
    }
  }, [notebook]);
  const noteEvents = useAsync(async () => {
    const provider = connector.provider || connector;
    const logs = await provider.getLogs({
      ...notebook.filters.Note(),
      fromBlock: 0,
    });
    return logs.map((i) => i.transactionHash);
  }, [], [notebook, symbolForNotesReload]);
  const notes = noteEvents && [...noteEvents].reverse();
  const [addDrawerVisible, setAddDrawerVisible] = useState(false);
  const [addDrawerData, setAddDrawerData] = useState('');
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [settingsDrawerData, setSettingsDrawerData] = useState({});
  if (!address) {
    return <Empty description="暂无笔记本" style={{ marginTop: '100px' }} />;
  }
  if (loading) {
    return (
      <PageHeader ghost={false}>
        <Skeleton />
      </PageHeader>
    );
  }
  if (!actualAddress) {
    return (
      <PageHeader
        ghost={false}
        title="解析 ENS 失败"
      />
    );
  }
  if (version === null) {
    return (
      <PageHeader
        ghost={false}
        title="笔记本不存在"
        subTitle={<Etherscan.Address value={actualAddress} />}
      />
    );
  }
  if (version !== contract.version) {
    console.log('v', version);
    return (
      <PageHeader
        ghost={false}
        title="笔记本版本错误"
        subTitle={<Etherscan.Address value={actualAddress} />}
      >
        笔记本版本：{version}
      </PageHeader>
    );
  }
  function showAddDrawer() {
    setAddDrawerData('');
    setAddDrawerVisible(true);
  }
  function hideAddDrawer() {
    setAddDrawerVisible(false);
  }
  function submitAddDrawer() {
    connector.sendTransaction({
      to: actualAddress,
      data: ethers.utils.concat([
        [0, 0, 0, 0],
        ethers.utils.toUtf8Bytes(addDrawerData),
      ]),
    }).then(() => {
      setAddDrawerVisible(false);
      notification.info({
        message: '正在发布新笔记',
        description: '请耐心等待网络确认',
      });
    });
  }
  function showSettingsDrawer() {
    setSettingsDrawerData(settings);
    setSettingsDrawerVisible(true);
  }
  function hideSettingsDrawer() {
    setSettingsDrawerVisible(false);
  }
  function submitSettingsDrawer() {
    notebook.update_settings(JSON.stringify(settingsDrawerData))
      .then(() => setSettingsDrawerVisible(false));
  }
  const buttons = [
    <Button type="primary" onClick={showAddDrawer} key="add">新笔记</Button>,
    <Button onClick={showSettingsDrawer} key="settings">笔记本设置</Button>,
  ];
  return (
    <>
      <PageHeader
        ghost={false}
        title={settings.title}
        subTitle={<Etherscan.Address value={actualAddress} />}
      >
        <Descriptions>
          <Descriptions.Item label="所有者" span={3}>
            <Etherscan.Address value={owner} />
          </Descriptions.Item>
        </Descriptions>
        <Space>
          {owner === account ? buttons : null}
        </Space>
      </PageHeader>
      <List
        bordered
        itemLayout="vertical"
        dataSource={notes}
        style={{ margin: '24px', background: '#fff' }}
        renderItem={(i) => <Note key={i} txid={i} />}
      />
      <Drawer
        title="新笔记"
        destroyOnClose
        width={720}
        visible={addDrawerVisible}
        onClose={hideAddDrawer}
        footer={
          <Space style={{ textAlign: 'right' }}>
            <Button onClick={hideAddDrawer}>
              取消
            </Button>
            <Button type="primary" onClick={submitAddDrawer}>
              发布
            </Button>
          </Space>
        }
      >
        <Form hideRequiredMark>
          <Form.Item name="text" label="文本">
            <Input.TextArea
              rows={8}
              value={addDrawerData}
              onChange={(e) => setAddDrawerData(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Drawer>
      <Drawer
        title="笔记本设置"
        destroyOnClose
        width={720}
        visible={settingsDrawerVisible}
        onClose={hideSettingsDrawer}
        footer={
          <Space style={{ textAlign: 'right' }}>
            <Button onClick={hideSettingsDrawer}>
              取消
            </Button>
            <Button type="primary" onClick={submitSettingsDrawer}>
              确认
            </Button>
          </Space>
        }
      >
        <Form hideRequiredMark>
          <Form.Item name="title" label="标题">
            <Input
              value={settingsDrawerData.title}
              onChange={({ target: { value } }) => setSettingsDrawerData(
                (s) => ({...s, title: value})
              )}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
