import { useEffect, useState } from 'react';

export function useAsync(f, onError, deps) {
  const [result, setResult] = useState();
  useEffect(() => {
    setResult();
    let active = true;
    f().then((r) => {
      if (active) {
        setResult(r);
      }
    }).catch((e) => {
      if (active) {
        if (onError === undefined) {
          setResult(null);
        } else if (typeof onError === 'function') {
          setResult(onError(e));
        } else {
          setResult(onError);
        }
      }
    });
    return () => {
      active = false;
    };
  }, deps);
  return result;
};
