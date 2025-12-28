import hotkeys from "hotkeys-js";
import { useRouter } from "vue-router";
import { useAgentViewStore } from "@/store/ai/agentView";
import { useProjectNav } from "@/store/projectWorkbench/projectNavStore";
import { useHttpRedoUndo } from "@/store/redoUndo/httpRedoUndoStore";
import { useWsRedoUndo } from "@/store/redoUndo/wsRedoUndoStore";
import { useHttpMockNode } from "@/store/httpMockNode/httpMockNodeStore";
import { useWebSocketMockNode } from "@/store/websocketMockNode/websocketMockNodeStore";
import type { ShortcutConfig, ShortcutConflict } from "@src/types/shortcut";
import { shortcutCache } from "@/cache/settings/shortcutCache";
class ShortcutManager {
  private hasRegisteredDefaultShortcuts = false;
  private shortcutConfigs: ShortcutConfig[] = [];

  constructor() {
    hotkeys.filter = () => true;
  }
  private initShortcutConfigs() {
    const router = useRouter();
    const projectNavStore = useProjectNav();
    const userSettings = shortcutCache.getUserSettings();
    this.shortcutConfigs = [
      {
        id: "ai-assistant",
        name: "AI助手",
        defaultKeys: "ctrl+l,command+l",
        userSetKeys: userSettings["ai-assistant"] || "",
        context: {
          route: "",
          tabType: "",
        },
        handler: (event: KeyboardEvent) => {
          event.preventDefault();
          const agentViewStore = useAgentViewStore();
          if (!agentViewStore.agentViewDialogVisible) {
            agentViewStore.showAgentViewDialog();
          }
        },
      },
      {
        id: "http-undo",
        name: "撤销HTTP请求修改",
        defaultKeys: "ctrl+z,command+z",
        userSetKeys: userSettings["http-undo"] || "",
        context: {
          route: "/workbench",
          tabType: "http",
        },
        handler: () => {
          const currentRoute = router.currentRoute.value?.path || "";
          const currentNavType = projectNavStore.currentSelectNav?.tabType;
          if (currentRoute !== "/workbench" || currentNavType !== "http") {
            return;
          }
          const httpRedoUndoStore = useHttpRedoUndo();
          const nodeId = projectNavStore.currentSelectNav?._id || "";
          httpRedoUndoStore.httpUndo(nodeId);
        },
      },
      {
        id: "http-redo",
        name: "重做HTTP请求修改",
        defaultKeys: "ctrl+y,command+y",
        userSetKeys: userSettings["http-redo"] || "",
        context: {
          route: "/workbench",
          tabType: "http",
        },
        handler: () => {
          const currentRoute = router.currentRoute.value?.path || "";
          const currentNavType = projectNavStore.currentSelectNav?.tabType;
          if (currentRoute !== "/workbench" || currentNavType !== "http") {
            return;
          }
          const httpRedoUndoStore = useHttpRedoUndo();
          const nodeId = projectNavStore.currentSelectNav?._id || "";
          httpRedoUndoStore.httpRedo(nodeId);
        },
      },
      {
        id: "websocket-undo",
        name: "撤销WebSocket修改",
        defaultKeys: "ctrl+z,command+z",
        userSetKeys: userSettings["websocket-undo"] || "",
        context: {
          route: "/workbench",
          tabType: "websocket",
        },
        handler: () => {
          const currentRoute = router.currentRoute.value?.path || "";
          const currentNavType = projectNavStore.currentSelectNav?.tabType;
          if (currentRoute !== "/workbench" || currentNavType !== "websocket") {
            return;
          }
          const wsRedoUndoStore = useWsRedoUndo();
          const nodeId = projectNavStore.currentSelectNav?._id || "";
          wsRedoUndoStore.wsUndo(nodeId);
        },
      },
      {
        id: "websocket-redo",
        name: "重做WebSocket修改",
        defaultKeys: "ctrl+y,command+y",
        userSetKeys: userSettings["websocket-redo"] || "",
        context: {
          route: "/workbench",
          tabType: "websocket",
        },
        handler: () => {
          const currentRoute = router.currentRoute.value?.path || "";
          const currentNavType = projectNavStore.currentSelectNav?.tabType;
          if (currentRoute !== "/workbench" || currentNavType !== "websocket") {
            return;
          }
          const wsRedoUndoStore = useWsRedoUndo();
          const nodeId = projectNavStore.currentSelectNav?._id || "";
          wsRedoUndoStore.wsRedo(nodeId);
        },
      },
      {
        id: "variable-save",
        name: "保存变量(仅在保存变量页面生效)",
        defaultKeys: "ctrl+s,command+s",
        userSetKeys: userSettings["variable-save"] || "",
        context: {
          route: "/workbench",
          tabType: "variable",
        },
        handler: () => {
          const currentRoute = router.currentRoute.value?.path || "";
          const currentNavType = projectNavStore.currentSelectNav?.tabType;
          if (currentRoute !== "/workbench" || currentNavType !== "variable") {
            return;
          }
          window.dispatchEvent(new CustomEvent("variable:save"));
        },
      },
      {
        id: "http-mock-save",
        name: "保存Mock配置(仅在HTTP Mock页面生效)",
        defaultKeys: "ctrl+s,command+s",
        userSetKeys: userSettings["http-mock-save"] || "",
        context: {
          route: "/workbench",
          tabType: "httpMock",
        },
        handler: () => {
          const currentRoute = router.currentRoute.value?.path || "";
          const currentNavType = projectNavStore.currentSelectNav?.tabType;
          if (currentRoute !== "/workbench" || currentNavType !== "httpMock") {
            return;
          }
          const httpMockNodeStore = useHttpMockNode();
          httpMockNodeStore.saveHttpMockNode();
        },
      },
      {
        id: "websocket-mock-save",
        name: "保存WebSocket Mock配置(仅在WebSocket Mock页面生效)",
        defaultKeys: "ctrl+s,command+s",
        userSetKeys: userSettings["websocket-mock-save"] || "",
        context: {
          route: "/workbench",
          tabType: "websocketMock",
        },
        handler: () => {
          const currentRoute = router.currentRoute.value?.path || "";
          const currentNavType = projectNavStore.currentSelectNav?.tabType;
          if (currentRoute !== "/workbench" || currentNavType !== "websocketMock") {
            return;
          }
          const websocketMockNodeStore = useWebSocketMockNode();
          websocketMockNodeStore.saveWebSocketMockNode();
        },
      },
    ];
  }
  initAppShortcuts() {
    if (this.hasRegisteredDefaultShortcuts) {
      return;
    }
    if (this.shortcutConfigs.length === 0) {
      this.initShortcutConfigs();
    }
    this.shortcutConfigs.forEach((config) => {
      const keys = config.userSetKeys || config.defaultKeys;
      hotkeys(keys, (event) => {
        config.handler(event);
      });
    });
    this.hasRegisteredDefaultShortcuts = true;
  }
  destroy() {
    this.shortcutConfigs.forEach((config) => {
      const keys = config.userSetKeys || config.defaultKeys;
      hotkeys.unbind(keys);
    });
    this.hasRegisteredDefaultShortcuts = false;
  }
  getAllShortcuts(): ShortcutConfig[] {
    if (this.shortcutConfigs.length === 0) {
      this.initShortcutConfigs();
    }
    return this.shortcutConfigs;
  }
  updateShortcutKeys(shortcutId: string, newKeys: string) {
    const config = this.shortcutConfigs.find((c) => c.id === shortcutId);
    if (!config) {
      return;
    }
    const oldKeys = config.userSetKeys || config.defaultKeys;
    hotkeys.unbind(oldKeys);
    config.userSetKeys = newKeys;
    shortcutCache.setShortcutKeys(shortcutId, newKeys);
    hotkeys(newKeys, (event) => {
      config.handler(event);
    });
  }
  resetShortcut(shortcutId: string) {
    const config = this.shortcutConfigs.find((c) => c.id === shortcutId);
    if (!config) {
      return;
    }
    const oldKeys = config.userSetKeys || config.defaultKeys;
    hotkeys.unbind(oldKeys);
    config.userSetKeys = "";
    shortcutCache.removeShortcutKeys(shortcutId);
    hotkeys(config.defaultKeys, (event) => {
      config.handler(event);
    });
  }
  resetAllShortcuts() {
    this.shortcutConfigs.forEach((config) => {
      const oldKeys = config.userSetKeys || config.defaultKeys;
      hotkeys.unbind(oldKeys);
      config.userSetKeys = "";
      hotkeys(config.defaultKeys, (event) => {
        config.handler(event);
      });
    });
    shortcutCache.clearAllSettings();
  }
  checkConflict(shortcutId: string, keys: string): ShortcutConflict | null {
    const existingShortcut = this.shortcutConfigs.find((config) => {
      if (config.id === shortcutId) {
        return false;
      }
      const configKeys = config.userSetKeys || config.defaultKeys;
      return configKeys === keys;
    });
    if (existingShortcut) {
      return {
        existingShortcut,
        keys,
      };
    }
    return null;
  }
}

export const shortcutManager = new ShortcutManager();
