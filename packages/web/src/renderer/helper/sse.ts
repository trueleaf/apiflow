import type { ParsedSSeData, ChunkWithTimestampe } from '@src/types';

/**
 * 解析 SSE 数据块
 */
const parseSseBlock = (block: string, timestamp?: number) => {
  const lines = block.split(/\r?\n/);
  const msg: ParsedSSeData = {
    id: "",
    type: "",
    data: '',
    retry: 0,
    timestamp: timestamp || Date.now(),
    dataType: 'normal',
    rawBlock: block,
  };

  for (let line of lines) {
    if (line === '' || line.startsWith(':')) continue; // 空行或注释行忽略
    const [field, ...rest] = line.split(':');
    const value = rest.join(':').replace(/^ /, '');  // 去掉冒号后可能的空格

    switch (field) {
      case 'data':
        // 多行 data 要用 "\n" 拼接
        msg.data += (msg.data ? '\n' : '') + value;
        break;
      case 'event':
        msg.event = value;
        break;
      case 'id':
        msg.id = value;
        break;
      case 'retry':
        const n = parseInt(value, 10);
        if (!isNaN(n)) msg.retry = n;
        break;
    }
  }

  return msg;
}

/**
 * 解析 SSE chunk 列表
 */
export const parseChunkList = (chunkList: ChunkWithTimestampe[]): ParsedSSeData[] => {
  const parsedData: ParsedSSeData[] = [];

  // 尝试使用 TextDecoder，如果失败则使用二进制模式
  let decoder: TextDecoder | null = null;
  let useBinaryMode = false;

  try {
    decoder = new TextDecoder('utf-8', { fatal: false });
  } catch (error) {
    useBinaryMode = true;
  }

  if (useBinaryMode) {
    // 二进制模式：将所有 chunk 转换为十六进制字符串
    const hexBlocks: string[] = [];
    let firstTimestamp = Date.now();
    for (let streamChunk of chunkList) {
      const hexString = Array.from(streamChunk.chunk)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      hexBlocks.push(hexString);
      if (firstTimestamp === Date.now()) {
        firstTimestamp = streamChunk.timestamp;
      }
    }

    // 创建一个二进制类型的 ParsedSSeData
    const binaryMsg: ParsedSSeData = {
      id: "",
      type: "",
      data: '',
      retry: 0,
      timestamp: firstTimestamp,
      dataType: 'binary',
      rawBlock: hexBlocks.join(''),
    };

    parsedData.push(binaryMsg);
    return parsedData;
  }

  // 正常的文本解码模式
  let buffer = '';
  for (let streamChunk of chunkList) {
    buffer += decoder!.decode(streamChunk.chunk, { stream: true });
    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const msg = parseSseBlock(block, streamChunk.timestamp);
      parsedData.push(msg);
    }
  }
  buffer += decoder!.decode();
  if (buffer.includes('\n\n')) {
    // 对于最后的 buffer，使用最后一个 chunk 的时间戳（如果有的话）
    const lastTimestamp = chunkList.length > 0 ? chunkList[chunkList.length - 1].timestamp : Date.now();
    buffer.split(/\r?\n\r?\n/).forEach(block => {
      if (block.trim()) parsedData.push(parseSseBlock(block, lastTimestamp));
    });
  }

  return parsedData;
};
