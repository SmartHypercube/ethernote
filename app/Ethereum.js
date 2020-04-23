import React, { useContext, useState, useMemo } from 'react';
import { ethers } from 'ethers';

import { useAsync } from './Async';

const infura_key = 'feb451e090a94ab59bddf47bf07b7780';

const Context = React.createContext();
Context.displayName = 'Ethereum.Context';

function Provider({ children }) {
  const [provider, setProvider] = useState(() => (
    new ethers.providers.InfuraProvider(1, infura_key)
  ));
  const [signer, setSigner] = useState(null);
  const connector = useMemo(() => {
    if (signer && provider && signer.connect) {
      return signer.connect(provider);
    } else {
      return signer || provider;
    }
  }, [provider, signer]);
  const chain = useAsync(async () => {
    if (connector.provider) {
      return (await connector.provider.getNetwork()).chainId;
    } else {
      return (await connector.getNetwork()).chainId;
    }
  }, null, [connector]);
  const account = useAsync(async () => (
    await connector.getAddress()
  ), null, [connector]);
  return (
    <Context.Provider
      value={{
        connector,
        loading: chain === undefined || account === undefined,
        chain,
        account,
        provider,
        signer,
        setProvider,
        setSigner,
      }}
    >
      {children}
    </Context.Provider>
  );
}

function useEthereumContext() {
  return useContext(Context);
}

export default { Context, Provider, useContext: useEthereumContext };
