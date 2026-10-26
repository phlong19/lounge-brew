export type NavigationItem = {
  key: string;
  label: string;
  href: string;
  children?: { key: string; label: string; href: string }[];
};
