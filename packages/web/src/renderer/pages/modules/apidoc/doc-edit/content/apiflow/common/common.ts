import { cloneDeep } from '@/helper';
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowContainerStore } from '@/store/apiflow/container';
import { useFlowLinesStore } from '@/store/apiflow/lines';
import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { useFlowRenderAreaStore } from '@/store/apiflow/render-area';
import { useFlowSelectionStore } from '@/store/apiflow/selection';
import { FlowLineInfo, FlowLinePosition, FlowNodeInfo, FlowValidCreateLineArea, FlowValidResizeArea, LineCanHoverPosition } from '@src/types/apiflow';
import { getQuardantInfo } from './quadrant/quardant';
import { getQuardantInfo2 } from './quadrant2/quadrant2';
import { getQuardantInfo3 } from './quadrant3/quadrant3';
import { getQuardantInfo4 } from './quadrant4/quadrant4';

export type Coordinate = {
  x: number,
  y: number
}
export type DrawInfoOptions = {
  fromNode: FlowNodeInfo,
  currendLine?: FlowLineInfo,
  fromPosition: FlowLinePosition
}
export type DrawInfo = {
  x: number,
  y: number,
  width: number,
  height: number,
  lineInfo: {
    cpx: number,
    cpy: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    activeColor?: string,
    arrowInfo: {
      leftTopPoint: Coordinate,
      rightBottomPoint: Coordinate,
      p1: Coordinate,
      p2: Coordinate,
      p3: Coordinate,
    },
    /**
         * 折线控制点
         */
    brokenLinePoints: Coordinate[],
  },
  /**
     * 是否连接到别的节点
     */
  isConnectedNode: boolean,
  /**
     * 连接到节点位置
     */
  connectedPosition: 'left' | 'top' | 'right' | 'bottom'
  /**
     * 被连接的节点id
     */
  connectedNodeId: string,
}
export type LineConfig = {
  /**
     * 线条与canvas容器之间的安全距离
     */
  padding: number,
  /**
     * 箭头长度
     */
  arrowLength: number,
  /**
     * 箭头宽度
     */
  arrowWidth: number,
  /**
     * 折线吸附阈值
     */
  breakLineSticky: number,
  /**
     * 折现与节点之间间隙
     */
  breakLineOffsetNode: number,
}
/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/
type OffsetCoordinate = {
  offsetX: number,
  offsetY: number
}
type StickyAreaPosition = {
  stickySize?: number,
  startPoint: Coordinate
}
type Position = 'left' | 'top' | 'right' | 'bottom'

export type StickyArea = {
  leftArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
  topArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
  rightArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
  bottomArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
}
export type ResizeDotArea = {
  leftTopArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
  rightTopArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
  leftBottomArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
  rightBottomArea: {
    pointX: number,
    pointY: number,
    offsetX: number,
    offsetX2: number,
    offsetY: number,
    offsetY2: number,
  },
}
//返回节点上下左右四个连接点吸附区域
export function getNodeStickyArea(toNode: FlowNodeInfo, options: StickyAreaPosition): StickyArea {
  const { styleInfo } = toNode;
  const { stickySize = 10, startPoint } = options
  const leftMidPoint: OffsetCoordinate = {
    offsetX: styleInfo.offsetX,
    offsetY: styleInfo.offsetY + styleInfo.height / 2
  }
  const topMidPoint: OffsetCoordinate = {
    offsetX: styleInfo.offsetX + styleInfo.width / 2,
    offsetY: styleInfo.offsetY
  }
  const rightMidPoint: OffsetCoordinate = {
    offsetX: styleInfo.offsetX + styleInfo.width,
    offsetY: styleInfo.offsetY + styleInfo.height / 2
  }
  const bottomMidPoint: OffsetCoordinate = {
    offsetX: styleInfo.offsetX + styleInfo.width / 2,
    offsetY: styleInfo.offsetY + styleInfo.height
  }
  const leftArea = {
    pointX: leftMidPoint.offsetX,
    pointY: leftMidPoint.offsetY,
    offsetX: leftMidPoint.offsetX - stickySize,
    offsetX2: leftMidPoint.offsetX + stickySize,
    offsetY: styleInfo.offsetY + stickySize,
    offsetY2: styleInfo.offsetY + styleInfo.height - stickySize,
  };
  const rightArea = {
    pointX: rightMidPoint.offsetX,
    pointY: rightMidPoint.offsetY,
    offsetX: rightMidPoint.offsetX - stickySize,
    offsetX2: rightMidPoint.offsetX + stickySize,
    offsetY: styleInfo.offsetY + stickySize,
    offsetY2: styleInfo.offsetY + styleInfo.height - stickySize,
  }
  const topArea = {
    pointX: topMidPoint.offsetX,
    pointY: topMidPoint.offsetY,
    offsetX: styleInfo.offsetX + stickySize,
    offsetX2: styleInfo.offsetX + styleInfo.width - stickySize,
    offsetY: topMidPoint.offsetY - stickySize,
    offsetY2: topMidPoint.offsetY + stickySize,
  }
  const bottomArea = {
    pointX: bottomMidPoint.offsetX,
    pointY: bottomMidPoint.offsetY,
    offsetX: styleInfo.offsetX + stickySize,
    offsetX2: styleInfo.offsetX + styleInfo.width - stickySize,
    offsetY: bottomMidPoint.offsetY - stickySize,
    offsetY2: bottomMidPoint.offsetY + stickySize,
  }
  const stickyFactor = 0.618
  const toNodeIsOnRightSide = styleInfo.offsetX > startPoint.x;
  const toNodeIsOnTopSide = styleInfo.offsetY < startPoint.y;
  if (toNodeIsOnRightSide && toNodeIsOnTopSide) {
    const gapX = Math.abs(styleInfo.offsetX - startPoint.x);
    const gapY = Math.abs(styleInfo.offsetY + styleInfo.height - startPoint.y);
    if (gapX > gapY * stickyFactor) {
      leftArea.offsetX2 = leftMidPoint.offsetX + styleInfo.width - stickySize
    } else {
      bottomArea.offsetY = styleInfo.offsetY + stickySize
    }
  } else if (!toNodeIsOnRightSide && toNodeIsOnTopSide) {
    const gapX = Math.abs(styleInfo.offsetX + styleInfo.width - startPoint.x);
    const gapY = Math.abs(styleInfo.offsetY + styleInfo.height - startPoint.y);
    if (gapX > gapY * stickyFactor) {
      rightArea.offsetX = leftMidPoint.offsetX + stickySize
    } else {
      bottomArea.offsetY = styleInfo.offsetY + stickySize
    }
  } else if (toNodeIsOnRightSide && !toNodeIsOnTopSide) {
    const gapX = Math.abs(startPoint.x - styleInfo.offsetX);
    const gapY = Math.abs(startPoint.y - styleInfo.offsetY);
    if (gapX > gapY * stickyFactor) {
      leftArea.offsetX2 = leftMidPoint.offsetX + styleInfo.width - stickySize
    } else {
      topArea.offsetY2 = bottomMidPoint.offsetY - stickySize
    }
  } else if (!toNodeIsOnRightSide && !toNodeIsOnTopSide) {
    const gapX = Math.abs(styleInfo.offsetX + styleInfo.width - startPoint.x);
    const gapY = Math.abs(startPoint.y - styleInfo.offsetY);
    if (gapX > gapY * stickyFactor) {
      rightArea.offsetX = leftMidPoint.offsetX + stickySize
    } else {
      topArea.offsetY2 = bottomMidPoint.offsetY - stickySize
    }
  }
  return {
    leftArea,
    topArea,
    rightArea,
    bottomArea,
  };
}
export const getLineStickyPosition = (point: Coordinate, stickyArea: StickyArea): Position | null => {
  const isLineXInLeftStickyArea = point.x >= stickyArea.leftArea.offsetX && point.x <= stickyArea.leftArea.offsetX2;
  const isLineYInLeftStickyArea = point.y >= stickyArea.leftArea.offsetY && point.y <= stickyArea.leftArea.offsetY2;
  const isLineXInTopStickyArea = point.x >= stickyArea.topArea.offsetX && point.x <= stickyArea.topArea.offsetX2;
  const isLineYInTopStickyArea = point.y >= stickyArea.topArea.offsetY && point.y <= stickyArea.topArea.offsetY2;
  const isLineXInBottomStickyArea = point.x >= stickyArea.bottomArea.offsetX && point.x <= stickyArea.bottomArea.offsetX2;
  const isLineYInBottomStickyArea = point.y >= stickyArea.bottomArea.offsetY && point.y <= stickyArea.bottomArea.offsetY2;
  const isLineXInRightStickyArea = point.x >= stickyArea.rightArea.offsetX && point.x <= stickyArea.rightArea.offsetX2;
  const isLineYInRightStickyArea = point.y >= stickyArea.rightArea.offsetY && point.y <= stickyArea.rightArea.offsetY2;
  if (isLineXInLeftStickyArea && isLineYInLeftStickyArea) {
    return 'left'
  }
  if (isLineXInTopStickyArea && isLineYInTopStickyArea) {
    return 'top'
  }
  if (isLineXInBottomStickyArea && isLineYInBottomStickyArea) {
    return 'bottom'
  }
  if (isLineXInRightStickyArea && isLineYInRightStickyArea) {
    return 'right'
  }
  return null;
}
export const getContraryPosition = (position: Position): Position => {
  if (position === 'left') {
    return 'right'
  }
  if (position === 'right') {
    return 'left'
  }
  if (position === 'top') {
    return 'bottom'
  }
  if (position === 'bottom') {
    return 'top'
  }
  return 'left'
}

export function getCreateLineArea(nodeInfo: FlowNodeInfo): FlowValidCreateLineArea {
  const configStore = useFlowConfigStore()
  const { createLineDotSize } = configStore
  const leftArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom),
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(Math.floor(nodeInfo.styleInfo.height * configStore.zoom)) / 2,
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) - createLineDotSize / 2,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + createLineDotSize / 2,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(Math.floor(nodeInfo.styleInfo.height * configStore.zoom)) / 2 - createLineDotSize / 2,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(Math.floor(nodeInfo.styleInfo.height * configStore.zoom)) / 2 + createLineDotSize / 2,
  }
  const rightArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom),
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(Math.floor(nodeInfo.styleInfo.height * configStore.zoom)) / 2,
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom) - createLineDotSize / 2,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom) + createLineDotSize / 2,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(Math.floor(nodeInfo.styleInfo.height * configStore.zoom)) / 2 - createLineDotSize / 2,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(Math.floor(nodeInfo.styleInfo.height * configStore.zoom)) / 2 + createLineDotSize / 2,
  }
  const topArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + (Math.floor(nodeInfo.styleInfo.width * configStore.zoom)) / 2,
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom),
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + (Math.floor(nodeInfo.styleInfo.width * configStore.zoom)) / 2 - createLineDotSize / 2,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + (Math.floor(nodeInfo.styleInfo.width * configStore.zoom)) / 2 + createLineDotSize / 2,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) - createLineDotSize / 2,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + createLineDotSize / 2,
  }
  const bottomArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + (Math.floor(nodeInfo.styleInfo.width * configStore.zoom)) / 2,
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom),
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + (Math.floor(nodeInfo.styleInfo.width * configStore.zoom)) / 2 - createLineDotSize,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + (Math.floor(nodeInfo.styleInfo.width * configStore.zoom)) / 2 + createLineDotSize,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom) - createLineDotSize,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom) + createLineDotSize,
  }
  return {
    leftArea,
    rightArea,
    topArea,
    bottomArea
  }
}
export function getResizeBarArea(nodeInfo: FlowNodeInfo): FlowValidResizeArea {
  const configStore = useFlowConfigStore()
  const { resizeDotSize } = configStore
  const leftTopArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom),
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom),
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) - resizeDotSize / 2,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + resizeDotSize / 2,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) - resizeDotSize / 2,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + resizeDotSize / 2,
  }
  const rightTopArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom),
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom),
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom) - resizeDotSize / 2,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom) + resizeDotSize / 2,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) - resizeDotSize / 2,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + resizeDotSize / 2,
  }
  const leftBottomArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom),
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom),
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) - resizeDotSize / 2,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + resizeDotSize / 2,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom) - resizeDotSize / 2,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom) + resizeDotSize / 2,
  }
  const rightBottomArea = {
    pointX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom),
    pointY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom),
    offsetX: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom) - resizeDotSize / 2,
    offsetX2: Math.floor(nodeInfo.styleInfo.offsetX * configStore.zoom) + Math.floor(nodeInfo.styleInfo.width * configStore.zoom) + resizeDotSize / 2,
    offsetY: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom) - resizeDotSize / 2,
    offsetY2: Math.floor(nodeInfo.styleInfo.offsetY * configStore.zoom) + Math.floor(nodeInfo.styleInfo.height * configStore.zoom) + resizeDotSize / 2,
  }
  return {
    leftTopArea,
    rightTopArea,
    leftBottomArea,
    rightBottomArea
  }
}

export function getDrawInfoByPoint(startPoint: Coordinate, endPoint: Coordinate, options: DrawInfoOptions): DrawInfo {
  const result: DrawInfo = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    lineInfo: {
      cpx: 0,
      cpy: 0,
      startX: 0,
      activeColor: '#333',
      startY: 0,
      endX: 0,
      endY: 0,
      arrowInfo: {
        leftTopPoint: {
          x: 0,
          y: 0,
        },
        rightBottomPoint: {
          x: 0,
          y: 0,
        },
        p1: {
          x: 0,
          y: 0,
        },
        p2: {
          x: 0,
          y: 0,
        },
        p3: {
          x: 0,
          y: 0,
        },
      },
      brokenLinePoints: [],
    },
    isConnectedNode: false,
    connectedPosition: 'left',
    connectedNodeId: ''
  }
  const lineConfig: LineConfig = {
    padding: 15, //绘制图形边距
    arrowLength: 15, //箭头长度, 箭头长度不能超过绘制图形边距
    arrowWidth: 5, //箭头宽度
    breakLineSticky: 5, //折线吸附阈值
    breakLineOffsetNode: 25, //折现与节点之间间隙
  }
  if (Math.abs(endPoint.x - startPoint.x) < 10 && Math.abs(endPoint.y - startPoint.y) < 10) {
    return result
  }
  if (endPoint.x > startPoint.x && endPoint.y <= startPoint.y) { //第一象限(startPostion为原点)
    getQuardantInfo(result, {
      ...options,
      startPoint,
      endPoint,
      lineConfig,
    });
  } else if (endPoint.x <= startPoint.x && endPoint.y <= startPoint.y) { //第二象限
    getQuardantInfo2(result, {
      ...options,
      startPoint,
      endPoint,
      lineConfig,
    });
  } else if (endPoint.x <= startPoint.x && endPoint.y > startPoint.y) { //第三象限
    getQuardantInfo3(result, {
      ...options,
      startPoint,
      endPoint,
      lineConfig,
    });
  } else if (endPoint.x > startPoint.x && endPoint.y > startPoint.y) { //第四象限
    getQuardantInfo4(result, {
      ...options,
      startPoint,
      endPoint,
      lineConfig,
    });
  }
  return result;
}
//获取zIndex值
let zIndex = 0;
export function getZIndex(): number {
  zIndex += 1;
  return zIndex;
}
//鼠标是否在线条上面
export const mouseIsInLine = (e: MouseEvent, lineInfo: FlowLineInfo): boolean => {
  const { canHoverPosition } = lineInfo;
  for (let i = 0; i < canHoverPosition.length; i += 1) {
    const position = canHoverPosition[i];
    const x1 = position.leftTopPosition.clientX;
    const x2 = position.rightBottomPosition.clientX;
    const y1 = position.leftTopPosition.clientY;
    const y2 = position.rightBottomPosition.clientY;
    if (e.clientX >= x1 && e.clientX <= x2 && e.clientY >= y1 && e.clientY <= y2) {
      return true
    }
  }
  return false;
}
export const getHoverPosition = (lineInfo: FlowLineInfo, drawInfo: DrawInfo): LineCanHoverPosition[] => {
  const containerStore = useFlowContainerStore()
  const { brokenLinePoints } = drawInfo.lineInfo;
  const hoverPosition: LineCanHoverPosition[] = [];
  const validLineAreaSize = 10
  for (let i = 0; i < brokenLinePoints.length - 1; i += 1) {
    const point = brokenLinePoints[i];
    const point2 = brokenLinePoints[i + 1];
    if (point.x === point2.x && point.y < point2.y) { //竖线,从上到下
      hoverPosition.push({
        leftTopPosition: {
          clientX: point.x + lineInfo.offsetX + containerStore.clientX - validLineAreaSize,
          clientY: point.y + lineInfo.offsetY + containerStore.clientY,
        },
        rightBottomPosition: {
          clientX: point2.x + lineInfo.offsetX + containerStore.clientX + validLineAreaSize,
          clientY: point2.y + lineInfo.offsetY + containerStore.clientY + validLineAreaSize,
        }
      });
    } else if (point.x === point2.x && point.y >= point2.y) { //竖线,从下到上
      hoverPosition.push({
        leftTopPosition: {
          clientX: point2.x + lineInfo.offsetX + containerStore.clientX - validLineAreaSize,
          clientY: point2.y + lineInfo.offsetY + containerStore.clientY,
        },
        rightBottomPosition: {
          clientX: point.x + lineInfo.offsetX + containerStore.clientX + validLineAreaSize,
          clientY: point.y + lineInfo.offsetY + containerStore.clientY + validLineAreaSize,
        }
      });
    } else if (point.y === point2.y && point.x < point2.x) { //横线，从左到右
      hoverPosition.push({
        leftTopPosition: {
          clientX: point.x + lineInfo.offsetX + containerStore.clientX,
          clientY: point.y + lineInfo.offsetY + containerStore.clientY - validLineAreaSize,
        },
        rightBottomPosition: {
          clientX: point2.x + lineInfo.offsetX + containerStore.clientX,
          clientY: point2.y + lineInfo.offsetY + containerStore.clientY + validLineAreaSize,
        }
      });
    } else if (point.y === point2.y && point.x >= point2.x) { //横线，从右到左
      hoverPosition.push({
        leftTopPosition: {
          clientX: point2.x + lineInfo.offsetX + containerStore.clientX,
          clientY: point2.y + lineInfo.offsetY + containerStore.clientY - validLineAreaSize,
        },
        rightBottomPosition: {
          clientX: point.x + lineInfo.offsetX + containerStore.clientX,
          clientY: point.y + lineInfo.offsetY + containerStore.clientY + validLineAreaSize,
        }
      });
    }
  }
  return hoverPosition;
}
export const repaintLine = (dom: HTMLCanvasElement, drawInfo: DrawInfo): void => {
  const ctx = dom.getContext('2d') as CanvasRenderingContext2D;
  dom.width = drawInfo.width;
  dom.height = drawInfo.height;
  const { brokenLinePoints, arrowInfo: { p1, p2, p3 } } = drawInfo.lineInfo;
  ctx.beginPath();
  // ctx.fillRect(drawInfo.lineInfo.arrowInfo.leftTopPoint.x, drawInfo.lineInfo.arrowInfo.leftTopPoint.y, drawInfo.lineInfo.arrowInfo.rightBottomPoint.x - drawInfo.lineInfo.arrowInfo.leftTopPoint.x, drawInfo.lineInfo.arrowInfo.rightBottomPoint.y - drawInfo.lineInfo.arrowInfo.leftTopPoint.y)
  ctx.closePath()
  ctx.lineWidth = 1;
  ctx.fillStyle = drawInfo.lineInfo.activeColor || '#333';
  ctx.strokeStyle = drawInfo.lineInfo.activeColor || '#333';
  ctx.lineCap = 'round';
  for (let i = 0; i < brokenLinePoints.length - 1; i += 1) {
    const point = brokenLinePoints[i];
    const point2 = brokenLinePoints[i + 1];
    if (point.x === point2.x) { //画竖线
      ctx.moveTo(point.x + 0.5, point.y);
      ctx.lineTo(point2.x + 0.5, point2.y);
    } else if (point.y === point2.y) { //画横线
      ctx.moveTo(point.x, point.y + 0.5);
      ctx.lineTo(point2.x, point2.y + 0.5);
    }
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke()
  }
  ctx.closePath()
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.fill();
  ctx.closePath()
}
export const repaintRenderArea = (): void => {
  const canvas = document.querySelector('#renderArea') as HTMLCanvasElement;
  const canvasRect = canvas.getBoundingClientRect()
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const flowRenderAreaStore = useFlowRenderAreaStore()
  const width = Math.ceil(flowRenderAreaStore.width / flowRenderAreaStore.gridUnit);
  const height = Math.ceil(flowRenderAreaStore.height / flowRenderAreaStore.gridUnit);
  for (let i = 0; i < width; i += 1) {
    ctx.beginPath()
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#eee';
    if (i % 5 === 0) {
      ctx.strokeStyle = '#ccc'
    }
    ctx.moveTo(i * flowRenderAreaStore.gridUnit + 0.5, 0)
    ctx.lineTo(i * flowRenderAreaStore.gridUnit + 0.5, canvasRect.height)
    ctx.stroke()
    ctx.closePath()
  }
  for (let j = 0; j < height; j += 1) {
    ctx.beginPath()
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#eee'
    if (j % 5 === 0) {
      ctx.strokeStyle = '#ccc'
    }
    ctx.moveTo(0, j * flowRenderAreaStore.gridUnit + 0.5)
    ctx.lineTo(canvasRect.width, j * flowRenderAreaStore.gridUnit + 0.5)
    ctx.stroke()
    ctx.closePath()
  }
}
export function getDrawInfoByLineId(lineId: string): DrawInfo | null {
  const linesStore = useFlowLinesStore()
  const nodesStore = useFlowNodesStore()
  const matchedLine = linesStore.lineList.find(line => line.id === lineId)
  const matchedNode = nodesStore.nodeList.find(node => node.outcomingIds.includes(lineId))
  const configStore = useFlowConfigStore()
  if (!matchedNode || !matchedLine) {
    return null
  }
  const startPoint = {
    x: 0,
    y: 0,
  }
  const endPoint = {
    x: matchedLine.lineEndOffsetX,
    y: matchedLine.lineEndOffsetY,
  }
  if (matchedLine.fromPosition === 'left') {
    startPoint.x = matchedNode.styleInfo.offsetX;
    startPoint.y = matchedNode.styleInfo.offsetY + matchedNode.styleInfo.height / 2;
  } else if (matchedLine.fromPosition === 'top') {
    startPoint.x = matchedNode.styleInfo.offsetX + matchedNode.styleInfo.width / 2;
    startPoint.y = matchedNode.styleInfo.offsetY;
  } else if (matchedLine.fromPosition === 'right') {
    startPoint.x = matchedNode.styleInfo.offsetX + matchedNode.styleInfo.width
    startPoint.y = matchedNode.styleInfo.offsetY + matchedNode.styleInfo.height / 2;
  } else if (matchedLine.fromPosition === 'bottom') {
    startPoint.x = matchedNode.styleInfo.offsetX + matchedNode.styleInfo.width / 2;
    startPoint.y = matchedNode.styleInfo.offsetY + matchedNode.styleInfo.height;
  }
  startPoint.x = Math.floor(startPoint.x * configStore.zoom);
  startPoint.y = Math.floor(startPoint.y * configStore.zoom);
  const clonedToNode = cloneDeep(matchedNode)
  clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
  clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
  clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
  clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
  const drawInfo = getDrawInfoByPoint(startPoint, endPoint, {
    fromNode: clonedToNode,
    fromPosition: matchedLine.fromPosition,
  });
  return drawInfo;
}
export const drawLineWhenMoveOrResize = (node: FlowNodeInfo): void => {
  const { incomingIds, outcomingIds, styleInfo: nodeStyleInfo } = node;
  const containerStore = useFlowContainerStore()
  const linesStore = useFlowLinesStore()
  const nodesStore = useFlowNodesStore()
  const configStore = useFlowConfigStore()
  if (incomingIds.length === 0 && outcomingIds.length === 0) {
    return
  }
  //节点移动过程中，出现startPoint会发生改变
  outcomingIds.forEach(lineId => {
    const line = linesStore.lineList.find(item => item.id === lineId)
    if (!line) {
      return
    }
    const startPoint = {
      x: 0,
      y: 0,
    }
    const endPoint = {
      x: line.lineEndOffsetX,
      y: line.lineEndOffsetY,
    }
    if (line.fromPosition === 'left') {
      startPoint.x = nodeStyleInfo.offsetX;
      startPoint.y = nodeStyleInfo.offsetY + nodeStyleInfo.height / 2;
    } else if (line.fromPosition === 'top') {
      startPoint.x = nodeStyleInfo.offsetX + nodeStyleInfo.width / 2;
      startPoint.y = nodeStyleInfo.offsetY;
    } else if (line.fromPosition === 'right') {
      startPoint.x = nodeStyleInfo.offsetX + nodeStyleInfo.width
      startPoint.y = nodeStyleInfo.offsetY + nodeStyleInfo.height / 2;
    } else if (line.fromPosition === 'bottom') {
      startPoint.x = nodeStyleInfo.offsetX + nodeStyleInfo.width / 2;
      startPoint.y = nodeStyleInfo.offsetY + nodeStyleInfo.height;
    }
    startPoint.x = Math.floor(startPoint.x * configStore.zoom);
    startPoint.y = Math.floor(startPoint.y * configStore.zoom);
    const clonedToNode = cloneDeep(node)
    clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
    clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
    clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
    clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
    const drawInfo = getDrawInfoByPoint(startPoint, endPoint, {
      fromNode: clonedToNode,
      fromPosition: line.fromPosition,
    });
    linesStore.changeLineInfoById(line.id, {
      lineStartOffsetX: startPoint.x,
      lineStartOffsetY: startPoint.y,
      offsetX: drawInfo.x,
      offsetY: drawInfo.y,
      width: drawInfo.width,
      height: drawInfo.height,
      arrowInfo: {
        leftTopPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
        rightBottomPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
      }
    })
    const hoverPosition = getHoverPosition(line, drawInfo);
    linesStore.changeLineInfoById(line.id, {
      canHoverPosition: hoverPosition,
    })
    const canvasDom = document.querySelector(`#line__${lineId}`) as HTMLCanvasElement;
    if (canvasDom) {
      repaintLine(canvasDom, drawInfo,);
    }
  })
  incomingIds.forEach(lineId => {
    const line = linesStore.lineList.find(item => item.id === lineId)
    if (!line) {
      return
    }
    const fromNode = nodesStore.nodeList.find(nodeInfo => {
      return nodeInfo.outcomingIds.includes(lineId)
    })
    if (!fromNode) {
      return
    }
    const startPoint = {
      x: 0,
      y: 0,
    }
    const endPoint = {
      x: 0,
      y: 0,
    }
    if (line.fromPosition === 'left') {
      startPoint.x = fromNode.styleInfo.offsetX;
      startPoint.y = fromNode.styleInfo.offsetY + fromNode.styleInfo.height / 2;
    } else if (line.fromPosition === 'top') {
      startPoint.x = fromNode.styleInfo.offsetX + fromNode.styleInfo.width / 2;
      startPoint.y = fromNode.styleInfo.offsetY;
    } else if (line.fromPosition === 'right') {
      startPoint.x = fromNode.styleInfo.offsetX + fromNode.styleInfo.width
      startPoint.y = fromNode.styleInfo.offsetY + fromNode.styleInfo.height / 2;
    } else if (line.fromPosition === 'bottom') {
      startPoint.x = fromNode.styleInfo.offsetX + fromNode.styleInfo.width / 2;
      startPoint.y = fromNode.styleInfo.offsetY + fromNode.styleInfo.height;
    }
    if (line.toPosition === 'left') {
      endPoint.x = node.styleInfo.offsetX;
      endPoint.y = node.styleInfo.offsetY + node.styleInfo.height / 2;
    } else if (line.toPosition === 'top') {
      endPoint.x = node.styleInfo.offsetX + node.styleInfo.width / 2;
      endPoint.y = node.styleInfo.offsetY;
    } else if (line.toPosition === 'right') {
      endPoint.x = node.styleInfo.offsetX + node.styleInfo.width
      endPoint.y = node.styleInfo.offsetY + node.styleInfo.height / 2;
    } else if (line.toPosition === 'bottom') {
      endPoint.x = node.styleInfo.offsetX + node.styleInfo.width / 2;
      endPoint.y = node.styleInfo.offsetY + node.styleInfo.height;
    }
    startPoint.x = Math.floor(startPoint.x * configStore.zoom);
    startPoint.y = Math.floor(startPoint.y * configStore.zoom);
    endPoint.x = Math.floor(endPoint.x * configStore.zoom);
    endPoint.y = Math.floor(endPoint.y * configStore.zoom);
    const clonedToNode = cloneDeep(fromNode)
    clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
    clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
    clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
    clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
    const drawInfo = getDrawInfoByPoint(startPoint, endPoint, {
      fromNode: clonedToNode,
      fromPosition: line.fromPosition,
    });
    linesStore.changeLineInfoById(line.id, {
      lineEndOffsetX: endPoint.x,
      lineEndOffsetY: endPoint.y,
      offsetX: drawInfo.x,
      offsetY: drawInfo.y,
      width: drawInfo.width,
      height: drawInfo.height,
      arrowInfo: {
        leftTopPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
        rightBottomPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
      }
    })
    const hoverPosition = getHoverPosition(line, drawInfo);
    linesStore.changeLineInfoById(line.id, {
      canHoverPosition: hoverPosition,
    })
    const canvasDom = document.querySelector(`#line__${lineId}`) as HTMLCanvasElement;
    if (canvasDom) {
      repaintLine(canvasDom, drawInfo,);
    }
  })
}
export const getAlignmentInfo = (): void => {
  // const nodesStore = useFlowNodesStore();
  // const nodeStateStore = useFlowNodeStateStore();
  // const alignmentInfo: FlowAlignmentInfo = {
  //     xRange: [],
  //     yRange: [],
  // }
  // for (let i = 0; i < nodesStore.nodeList.length; i += 1) {

  // }
}
export const getQuardantByPoint = (point: Coordinate, point2: Coordinate): '1' | '2' | '3' | '4' => {
  const pointX = point.x;
  const pointY = point.y;
  const pointX2 = point2.x;
  const pointY2 = point2.y;
  if (pointX2 > pointX && pointY2 < pointY) {
    return '1'
  }
  if (pointX2 < pointX && pointY2 < pointY) {
    return '2'
  }
  if (pointX2 <= pointX && pointY2 >= pointY) {
    return '3'
  }
  if (pointX2 >= pointX && pointY2 >= pointY) {
    return '4'
  }
  return '1'
}
//节点是否在选中区域
export const getNodesInSelection = (): string[] => {
  const selectionStore = useFlowSelectionStore()
  const configStore = useFlowConfigStore();
  const nodeListStore = useFlowNodesStore();
  const minSelectionOffsetLeft = selectionStore.offsetX;
  const maxSelectionOffsetLeft = selectionStore.offsetX + selectionStore.width;
  const minSelectionOffsetTop = selectionStore.offsetY
  const maxSelectionOffsetTop = selectionStore.offsetY + selectionStore.height;
  const matchedNodeIds: string[] = [];
  nodeListStore.nodeList.forEach(node => {
    const minOffsetLeft = node.styleInfo.offsetX;
    const maxOffsetLeft = node.styleInfo.offsetX + node.styleInfo.width;
    const minOffsetTop = node.styleInfo.offsetY
    const maxOffsetTop = node.styleInfo.offsetY + node.styleInfo.height;
    const isXIn = minOffsetLeft * configStore.zoom >= minSelectionOffsetLeft && maxOffsetLeft * configStore.zoom <= maxSelectionOffsetLeft;
    const isYIn = minOffsetTop * configStore.zoom >= minSelectionOffsetTop && maxOffsetTop * configStore.zoom <= maxSelectionOffsetTop;
    if (isXIn && isYIn) {
      matchedNodeIds.push(node.id);
    }
  })
  return matchedNodeIds;
}
