import { theme } from 'antd';

// LuckyDrive Ant Design 5 theme — sourced from .cursor/rules/design-system.mdc.
// This is the single place AntD theming lives; never override per-page.

export const ldTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#f0a500',
    colorBgBase: '#12121e',
    colorBgContainer: '#1f1e2b',
    colorBgElevated: '#292936',
    colorBgLayout: '#12121e',
    colorBorder: '#514533',
    colorBorderSecondary: '#292936',
    colorText: '#e3e0f2',
    colorTextSecondary: '#d6c4ac',
    colorTextTertiary: '#9f8e79',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ffb4ab',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
  },
  components: {
    Button: {
      fontWeight: 700,
      controlHeight: 44,
      controlHeightLG: 48,
      primaryShadow: 'none',
      defaultBg: 'transparent',
      defaultBorderColor: '#9f8e79',
      defaultColor: '#e3e0f2',
    },
    Table: {
      headerBg: '#1a1a27',
      headerColor: '#d6c4ac',
      rowHoverBg: '#292936',
      borderColor: '#292936',
      headerSplitColor: 'transparent',
    },
    Tabs: {
      itemActiveColor: '#f0a500',
      itemHoverColor: '#ffc56c',
      itemSelectedColor: '#f0a500',
      inkBarColor: '#f0a500',
      titleFontSize: 14,
    },
    Input: {
      activeBorderColor: '#f0a500',
      hoverBorderColor: '#ffc56c',
      colorBgContainer: '#292936',
    },
    InputNumber: {
      colorBgContainer: '#292936',
      activeBorderColor: '#f0a500',
    },
    Form: {
      labelColor: '#d6c4ac',
      labelFontSize: 14,
    },
    Collapse: {
      headerBg: '#1f1e2b',
      contentBg: '#12121e',
      colorBorder: '#292936',
    },
    Pagination: {
      itemBg: 'transparent',
      itemActiveBg: '#f0a500',
    },
    Layout: {
      bodyBg: '#12121e',
      headerBg: '#12121e',
      siderBg: '#1a1a27',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(240, 165, 0, 0.12)',
      itemSelectedColor: '#f0a500',
      itemHoverColor: '#ffc56c',
    },
    Breadcrumb: {
      itemColor: '#9f8e79',
      lastItemColor: '#e3e0f2',
      linkColor: '#d6c4ac',
      linkHoverColor: '#f0a500',
      separatorColor: '#514533',
    },
  },
};
