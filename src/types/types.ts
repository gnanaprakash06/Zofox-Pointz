// metric card related types

import { ReactNode } from "react";

// auth header related types
export type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  rightSection?: ReactNode;
  className?: string;
};

export type TrendData = {
  icon?: ReactNode;
  value?: string;
  color?: string;
  description?: string;
};

export type ProgressData = {
  value: number; // 0-100
  label?: string;
};

export type MetricCardProps = {
  title: string;
  value: string | number;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  valueDescription?: string;
  trend?: TrendData; // optional, grouped
  progress?: ProgressData; // optional, grouped
  className?: string;
  testId?: string;
};

// sidebar related

export type SidebarNavItem = {
  label: string; // Text for nav
  icon?: React.ReactNode; // Icon component
  route: string; // Path to link/navigate
  active?: boolean; // Is this item highlighted/active?
  disabled?: boolean; // Is this item disabled?
  onClick?: () => void; // Custom handler (for logout or special action)
};

export type SidebarProps = {
  items: SidebarNavItem[]; // Array of navigation items
  header?: ReactNode; // Optional: logo/title/user slot
  footer?: ReactNode; // Optional: logout, etc.
  collapsed?: boolean; // Optional: collapsed state
  onCollapseToggle?: () => void; // Optional: collapse handler
  width?: string; // Optional: custom width for sidebar
  className?: string; // Optional: for extra custom styling
};
