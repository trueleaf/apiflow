import { SandboxReceiveMessage } from "@src/types";

self.onmessage = (e: MessageEvent<SandboxReceiveMessage>) => {
 if (e.data.type === "eval") {
  try {
    // 使用 new Function 替代 eval，避免访问本地作用域
    const fn = new Function(e.data.code);
    const data = fn();
    self.postMessage({
      type: "evalSuccess",
      data
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      msg: error?.toString()
    });
  }
 }
};