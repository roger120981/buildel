import type { PropsWithChildren } from 'react';
import React from 'react';

import type { NavbarProps } from '~/components/navbar/navbar';
import Navbar from '~/components/navbar/navbar';
import { useNavSidebarContext } from '~/components/sidebar/NavSidebar';
import { cn } from '~/utils/cn';

export const AppNavbar: React.FC<
  Omit<NavbarProps, 'wrapperClassName' | 'menuClassName' | 'onMenuClick'>
> = ({ children, ...rest }) => {
  const { openSidebar, isOpen } = useNavSidebarContext();
  return (
    <Navbar
      menuClassName="lg:hidden !text-white min-w-[24px]"
      wrapperClassName="pt-4 pb-2 md:px-2 md:pb-2 md:pt-6"
      onMenuClick={openSidebar}
      isMenuOpen={isOpen}
      {...rest}
    >
      {children}
    </Navbar>
  );
};

interface AppNavbarHeadingProps extends PropsWithChildren {
  className?: string;
  title?: string;
}
export const AppNavbarHeading = ({
  children,
  className,
  title,
}: AppNavbarHeadingProps) => {
  return (
    <h1
      className={cn('text-2xl md:text-3xl font-medium text-white', className)}
      title={title}
    >
      {children}
    </h1>
  );
};
