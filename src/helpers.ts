import {theme} from 'antd';

export const getThemeToken = () => {
  return theme.useToken().token;
};