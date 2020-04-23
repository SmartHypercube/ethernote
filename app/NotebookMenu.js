import React, { useEffect, useState } from 'react';
import { Menu, notification } from 'antd';
import { ethers } from 'ethers';

import useInputModal from './InputModal';
import Ethereum from './Ethereum';
import contract from '../contracts/v0.1.1/Notebook';

export default function NotebookMenu({ value, onChange }) {
  const { connector, account } = Ethereum.useContext();
  const [notebooks, setNotebooks] = useState([
    'ethernote.eth',
    'public.ethernote.eth',
  ]);

  useEffect(() => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h) {
      if (!notebooks.includes(h)) {
        setNotebooks(notebooks.concat(h));
      }
      onChange(h);
    }
  }, []);
  useEffect(() => {
    if (value) {
      // We must prepend '#' in case the name itself
      // starts with '#'.
      // We only need to replace '%'. The browser will
      // take care of encoding Unicode characters.
      // To decode this:
      // decodeURIComponent(location.hash.slice(1))
      location.hash = '#' + value.replace('%', '%25');
    }
  }, [value]);

  const [addModal, showAddModal] = useInputModal({
    title: '打开笔记本',
    label: '地址',
    onSubmit(v) {
      if (!notebooks.includes(v)) {
        setNotebooks(notebooks.concat(v));
      }
      onChange(v);
    },
  });

  function createNotebook() {
    const factory = new ethers.ContractFactory(
      contract.abi, contract.code, connector);
    factory.deploy().then((c) => {
      setNotebooks(notebooks.concat(c.address));
      onChange(c.address);
      notification.info({
        message: '正在创建笔记本',
        description: '请耐心等待网络确认',
      });
      c.deployed().then(() => {
        onChange();
        setTimeout(() => onChange(c.address));
        notification.success({
          message: '笔记本创建成功',
        });
      });
    });
  }

  return (
    <Menu mode="inline" selectedKeys={[value]}>
      <Menu.ItemGroup title="笔记本">
        {notebooks.map((i) => (
          <Menu.Item key={i} onClick={() => onChange(i)}>
            {i}
          </Menu.Item>
        ))}
        <Menu.Item key="add" onClick={() => showAddModal()}>
          打开笔记本…
        </Menu.Item>
        {addModal}
        {account ?
          <Menu.Item key="create" onClick={createNotebook}>
            创建笔记本
          </Menu.Item>
        : null}
      </Menu.ItemGroup>
    </Menu>
  );
};
