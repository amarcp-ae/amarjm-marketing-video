import React, {createContext, useContext} from 'react';

export type LayoutMode = 'master' | 'vertical' | 'square';

const LayoutContext = createContext<LayoutMode>('master');

type LayoutProviderProps = {
  layout: LayoutMode;
  children: React.ReactNode;
};

export const LayoutProvider: React.FC<LayoutProviderProps> = ({layout, children}) => {
  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>;
};

export const useLayout = (): LayoutMode => {
  return useContext(LayoutContext);
};
