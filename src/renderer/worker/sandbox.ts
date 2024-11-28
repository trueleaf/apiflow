import { SandboxReceiveMessage } from "@src/types/global";

self.onmessage = (e: MessageEvent<SandboxReceiveMessage>) => {
 if (e.data.type === "eval") {
  try {
    const data = eval(e.data.code);
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