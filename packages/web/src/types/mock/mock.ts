import { Method } from "got";
import { ApidocBaseInfo } from "../types.ts";

export type MockHttpNode = {
  _id: string;
  pid: string;
  projectId: string;
  sort: number;
  info: ApidocBaseInfo;
  requestCondition: {
    method: (Method | "ALL")[];
    url: string;
    port: number;
    enabled: boolean;
  };
  config: {
    delay: number;
  };
  response: {
    isDefault: boolean;
    conditions: {
      name: string;
      scriptCode: string;
    };
    statusCode: number;
    headers: Record<string, string>;
    dataType: "sse" | "json" | "text" | "image" | "file" | "binary";
    sseConfig: {};
    jsonConfig: {
      mode: "random" | "fixed";
      fixedData: string;
      randomSize: number;
    };
    textConfig: {
      mode: "random" | "fixed";
      fixedData: string;
      randomSize: number;
    };
    imageConfig: {
      mode: "random" | "fixed";
      randomSize: number;
      randomWidth: number;
      randomHeight: number;
      fixedFilePath: string;
    };
    fileConfig: {
      fileType: "doc" | "docx" | "xls" | "xlsx" | "pdf" | "ppt" | "pptx" | "zip" | "7z";
    };
    binaryConfig: {
      filePath: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};
