import { atom, selector, useRecoilValue, useSetRecoilState } from "recoil";
import { useCallback } from "react";

// 상태 업데이트 유틸리티
export const createStateUpdater = <T>(atom: any) => {
  return () => {
    const setState = useSetRecoilState(atom);
    return useCallback(
      (newValue: T | ((prev: T) => T)) => {
        setState(newValue);
      },
      [setState]
    );
  };
};

// 상태 선택자 유틸리티
export const createStateSelector = (atom: any) => {
  return () => useRecoilValue(atom);
};

// 메모이제이션된 상태 선택자
export const createMemoizedSelector = <T, R>(
  atom: any,
  transform: (value: T) => R
) => {
  return selector({
    key: `${atom.key}-memoized`,
    get: ({ get }) => {
      const value = get(atom) as T;
      return transform(value);
    },
  });
};

// 상태 초기화 유틸리티
export const createStateInitializer = <T>(atom: any, defaultValue: T) => {
  return () => {
    const setState = useSetRecoilState(atom);
    return useCallback(() => {
      setState(defaultValue);
    }, [setState]);
  };
};

// 상태 구독 유틸리티
export const createStateSubscriber = <T>(
  atom: any,
  callback: (value: T) => void
) => {
  return () => {
    const value = useRecoilValue(atom) as T;
    return useCallback(() => {
      callback(value);
    }, [value]);
  };
};
