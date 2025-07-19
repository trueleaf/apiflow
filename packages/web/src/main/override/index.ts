import { BrowserWindow, Menu, shell, WebContentsView } from "electron";
import { changeDevtoolsFont } from "../utils/index.ts";

export const overrideBrowserWindow = (
  win: BrowserWindow,
  contentView: WebContentsView,
  topBarView: WebContentsView
) => {
  // 隐藏菜单栏
  Menu.setApplicationMenu(null);
  // 设置窗口打开外部链接的默认行为
  contentView.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  topBarView.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  // 修改devtools字体
  changeDevtoolsFont(win);
};
