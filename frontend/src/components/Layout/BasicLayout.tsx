import { FC } from 'react';

const BasicLayout: FC = ({ children }) => {
  return (
    <main className="flex items-center justify-center w-screen h-screen">
      {children}
    </main>
  );
};

export default BasicLayout;
