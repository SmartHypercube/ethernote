import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { ethers } from 'ethers';

import Ethereum from './Ethereum';
import useInputModal from './InputModal';

const infura_key = 'feb451e090a94ab59bddf47bf07b7780';

function guessName(provider, unknown) {
  if (!provider) { return null; }
  if (provider.isMetaMask) { return 'MetaMask'; }
  if (provider.isTrust) { return 'Trust Wallet'; }
  if (provider.isGoWallet) { return 'GO ! WALLET'; }
  if (provider.isAlphaWallet) { return 'AlphaWallet'; }
  if (provider.isStatus) { return 'Status'; }
  if (provider.isToshi) { return 'Coinbase Wallet'; }
  if (provider.constructor.name === 'EthereumProvider') { return 'Mist'; }
  if (provider.constructor.name === 'Web3FrameProvider') { return 'Parity'; }
  return unknown;
}

function useInjectedSigner() {
  const { signer, setSigner } = Ethereum.useContext();
  const [lastSigner, setLastSigner] = useState();
  const [symbolForReload, setSymbolForReload] = useState();
  const name = guessName(window.ethereum);
  useEffect(() => {
    if (lastSigner && lastSigner === signer) {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      const s = p.getSigner();
      setLastSigner(s);
      setSigner(s);
    }
  }, [symbolForReload]);
  useEffect(() => {
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', () => setSymbolForReload(Symbol()));
      window.ethereum.on('chainChanged', () => setSymbolForReload(Symbol()));
      window.ethereum.on('networkChanged', () => setSymbolForReload(Symbol()));
      window.ethereum.on('close', () => setSymbolForReload(Symbol()));
    }
  }, []);
  if (!window.ethereum) {
    return (
      <Menu.Item key="injected">
        <a href="https://metamask.io/">
          安装 MetaMask
        </a>
      </Menu.Item>
    );
  }
  function onClick() {
    function s() {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      const s = p.getSigner();
      setLastSigner(s);
      setSigner(s);
    }
    try {
      window.ethereum.send('eth_requestAccounts').then(s);
    } catch (e) {
      if (e.code !== 4001) {
        window.ethereum.enable().then(s);
      }
    }
  }
  return (
    <Menu.Item key="injected" onClick={onClick}>
      {name}
    </Menu.Item>
  );
}

export default function ConnectButton(props) {
  const { loading, account, setProvider, setSigner } = Ethereum.useContext();
  const injectedSigner = useInjectedSigner();
  const [customRpcModal, showCustomRpcModal] = useInputModal({
    title: '自定义',
    label: 'RPC URL',
    onSubmit(url) {
      setSigner((new ethers.providers.JsonRpcProvider(url)).getSigner());
    },
  });
  if (account) {
    const menu = (
      <Menu>
        <Menu.Item onClick={() => setSigner()}>
          断开连接
        </Menu.Item>
      </Menu>
    );
    return (
      <>
        <Dropdown overlay={menu}>
          <Button {...props} loading={loading}>
            {account.slice(0, 6)}…{account.slice(-4)}
          </Button>
        </Dropdown>
        {customRpcModal}
      </>
    );
  } else {
    const menu = (
      <Menu>
        <Menu.ItemGroup title="浏览器内置钱包">
          {injectedSigner}
        </Menu.ItemGroup>
        <Menu.ItemGroup title="连接 RPC URL">
          <Menu.Item
            key="localhost"
            onClick={() => {
              const u = 'http://localhost:8545';
              const p = new ethers.providers.JsonRpcProvider(u);
              setSigner(p.getSigner());
            }}
          >
            localhost:8545
          </Menu.Item>
          <Menu.Item
            key="customrpc"
            onClick={() => showCustomRpcModal()}
          >
            自定义…
          </Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup title="只读浏览">
        <Menu.Item
            key="homestead"
            onClick={() => {
              setSigner();
              setProvider(new ethers.providers.InfuraProvider(1, infura_key));
            }}
          >
            以太坊主链
          </Menu.Item>
          <Menu.Item
            key="ropsten"
            onClick={() => {
              setSigner();
              setProvider(new ethers.providers.InfuraProvider(3, infura_key));
            }}
          >
            Ropsten 测试链
          </Menu.Item>
          <Menu.Item
            key="kovan"
            onClick={() => {
              setSigner();
              setProvider(new ethers.providers.InfuraProvider(42, infura_key));
            }}
          >
            Kovan 测试链
          </Menu.Item>
          <Menu.Item
            key="rinkeby"
            onClick={() => {
              setSigner();
              setProvider(new ethers.providers.InfuraProvider(4, infura_key));
            }}
          >
            Rinkeby 测试链
          </Menu.Item>
          <Menu.Item
            key="goerli"
            onClick={() => {
              setSigner();
              setProvider(new ethers.providers.InfuraProvider(5, infura_key));
            }}
          >
            Goerli 测试链
          </Menu.Item>
        </Menu.ItemGroup>
      </Menu>
    );
    return (
      <>
        <Dropdown overlay={menu}>
          <Button {...props} type="primary" loading={loading}>
            连接钱包
          </Button>
        </Dropdown>
        {customRpcModal}
      </>
    );
  }
};
