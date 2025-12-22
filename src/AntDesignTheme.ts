import { theme } from "antd";
import type { ThemeConfig } from "antd";

const themeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorBgBase: "#0a192f",
    colorText: "#ccd6f6",
    colorPrimary: "#64ffda",
    colorError: "#cb952f",
    colorTextSecondary: "#a8b2d1",
    fontFamily: "'Roboto', sans-serif",
    fontSize: 17,
  },
};

export default themeConfig;
