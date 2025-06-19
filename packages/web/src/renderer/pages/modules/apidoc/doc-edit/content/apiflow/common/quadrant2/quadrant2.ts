import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { cloneDeep } from '@/helper';
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowSelectionStore } from '@/store/apiflow/selection';
import { getNodeStickyArea, getLineStickyPosition, getContraryPosition } from '../common';
import type { DrawInfo, Coordinate, DrawInfoOptions, LineConfig } from '../common'

type Options = DrawInfoOptions & {
  startPoint: Coordinate,
  endPoint: Coordinate,
  lineConfig: LineConfig
}
type GetArrowInfoOptions = {
  position: 'left'| 'right' | 'top' | 'bottom';
  arrowLength: number;
  arrowWidth: number;
}
/*
|--------------------------------------------------------------------------
| 到达toNode时候线条绘制
|--------------------------------------------------------------------------
*/
//绘制箭头
const getDrawArrowInfo = (point: Coordinate, options: GetArrowInfoOptions): Coordinate[] => {
  const arrowList: Coordinate[] = [];
  const { position, arrowLength, arrowWidth } = options;
  if (position === 'right') {
    arrowList[0] = {
      x: point.x,
      y: point.y - arrowWidth
    };
    arrowList[1] = {
      x: point.x,
      y: point.y + arrowWidth
    };
    arrowList[2] = {
      x: point.x + arrowLength,
      y: point.y
    }
  } else if (position === 'bottom') {
    arrowList[0] = {
      x: point.x - arrowWidth,
      y: point.y
    };
    arrowList[1] = {
      x: point.x + arrowWidth,
      y: point.y
    };
    arrowList[2] = {
      x: point.x,
      y: point.y + arrowLength
    }
  } else if (position === 'left') {
    arrowList[0] = {
      x: point.x,
      y: point.y - arrowWidth
    };
    arrowList[1] = {
      x: point.x,
      y: point.y + arrowWidth
    };
    arrowList[2] = {
      x: point.x - arrowLength,
      y: point.y
    }
  } else if (position === 'top') {
    arrowList[0] = {
      x: point.x - arrowWidth,
      y: point.y
    };
    arrowList[1] = {
      x: point.x + arrowWidth,
      y: point.y
    };
    arrowList[2] = {
      x: point.x,
      y: point.y - arrowLength
    }
  }
  return arrowList
}
//当右侧线条与其他节点吸附时候，改变线条绘制路径
const drawRightLineWhenStick = (result: DrawInfo, options: Options) => {
  const nodesSotre = useFlowNodesStore()
  const toNodes = nodesSotre.nodeList
  const configStore = useFlowConfigStore()
  const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
  for (let i = 0; i < toNodes.length; i += 1) {
    const toNode = toNodes[i]
    if (toNode.id === options.fromNode.id) {
      continue;
    }
    const clonedToNode = cloneDeep(toNode)
    clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
    clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
    clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
    clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
    const stickyArea = getNodeStickyArea(clonedToNode, {
      startPoint,
    });
    const stickyNodePosition = getLineStickyPosition({
      x: endPoint.x,
      y: endPoint.y
    }, stickyArea);
    const lineEndPoint: Coordinate = {
      x: 0,
      y: 0,
    };
    if (stickyNodePosition === 'left') {
      const gapY = fromNode.styleInfo.offsetY - clonedToNode.styleInfo.offsetY - clonedToNode.styleInfo.height;
      const gapX = startPoint.x - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width
      result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * breakLineOffsetNode + 2 * padding;
      result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.y = stickyArea.leftArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapY > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - breakLineOffsetNode - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height / 2
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height / 2
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode - arrowLength,
          y: padding
        });
      } else if (gapX > 0) {
        result.height = Math.abs(clonedToNode.styleInfo.offsetY - startPoint.y) + 2 * padding + breakLineOffsetNode;
        result.y = clonedToNode.styleInfo.offsetY - padding - breakLineOffsetNode;
        result.lineInfo.brokenLinePoints.push({
          x: result.width - breakLineOffsetNode - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: stickyArea.leftArea.pointY - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode - arrowLength,
          y: stickyArea.leftArea.pointY - result.y
        });
      } else if (gapX <= 0) {
        result.width = clonedToNode.styleInfo.width + 2 * padding + breakLineOffsetNode * 2;
        result.height = Math.abs(clonedToNode.styleInfo.offsetY - startPoint.y) + 2 * padding + breakLineOffsetNode;
        result.y = clonedToNode.styleInfo.offsetY - padding - breakLineOffsetNode;
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: stickyArea.leftArea.pointY - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode - arrowLength,
          y: stickyArea.leftArea.pointY - result.y
        });
      }
      lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
      lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
      result.isConnectedNode = true
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      const gapX = startPoint.x - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width;
      const gapY = fromNode.styleInfo.offsetY - clonedToNode.styleInfo.offsetY;
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.topArea.pointX - padding;
      result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      if (gapX > 0 && gapY > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + breakLineOffsetNode - arrowLength
        });
        lineEndPoint.x = padding;
        lineEndPoint.y = padding + breakLineOffsetNode - arrowLength;
      } else if (gapX <= 0 && gapY > 0) {
        result.width = clonedToNode.styleInfo.width / 2 + breakLineOffsetNode + 2 * padding;
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + breakLineOffsetNode - arrowLength
        });
        lineEndPoint.x = padding;
        lineEndPoint.y = padding + breakLineOffsetNode - arrowLength;
      } else if (gapY <= 0) {
        result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
        result.y = fromNode.styleInfo.offsetY - breakLineOffsetNode - padding;
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: stickyArea.topArea.pointY - result.y - arrowLength
        });
        lineEndPoint.x = padding;
        lineEndPoint.y = stickyArea.topArea.pointY - result.y - arrowLength;
      }
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      const gapY = fromNode.styleInfo.offsetY - stickyArea.bottomArea.pointY
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.y = stickyArea.bottomArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapY > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: gapY / 2 + padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: gapY / 2 + padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + arrowLength
        });
      } else {
        result.height = Math.abs(fromNode.styleInfo.offsetY + fromNode.styleInfo.height - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode;
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: startPoint.y - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: startPoint.y - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding,
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding,
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + arrowLength
        });
      }
      lineEndPoint.x = padding;
      lineEndPoint.y = padding + arrowLength
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
      result.x = stickyArea.rightArea.pointX - padding;
      result.y = stickyArea.rightArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding - breakLineOffsetNode,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + arrowLength,
        y: padding
      });
      lineEndPoint.x = padding + arrowLength;
      lineEndPoint.y = padding;
      result.isConnectedNode = true
      result.connectedPosition = 'right';
    }
    if (result.isConnectedNode) {
      result.connectedNodeId = clonedToNode.id;
      const arrowList = getDrawArrowInfo({
        x: lineEndPoint.x,
        y: lineEndPoint.y
      }, {
        position: getContraryPosition(result.connectedPosition),
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: lineEndPoint.x - padding,
        y: lineEndPoint.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: lineEndPoint.x + padding,
        y: lineEndPoint.y + padding
      }
    }
    if (stickyNodePosition != null) {
      break;
    }
  }
}
//当上侧线条与其他节点吸附时候，改变线条绘制路径
const drawTopLineWhenStick = (result: DrawInfo, options: Options) => {
  const nodesSotre = useFlowNodesStore()
  const toNodes = nodesSotre.nodeList
  const configStore = useFlowConfigStore()
  const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint } = options;
  for (let i = 0; i < toNodes.length; i += 1) {
    const toNode = toNodes[i]
    if (toNode.id === options.fromNode.id) {
      continue;
    }
    const clonedToNode = cloneDeep(toNode)
    clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
    clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
    clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
    clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
    const stickyArea = getNodeStickyArea(clonedToNode, {
      startPoint,
    });
    const stickyNodePosition = getLineStickyPosition({
      x: endPoint.x,
      y: endPoint.y
    }, stickyArea);
    const lineEndPoint: Coordinate = {
      x: 0,
      y: 0,
    };
    if (stickyNodePosition === 'left') {
      result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(clonedToNode.styleInfo.offsetY - startPoint.y) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.y = clonedToNode.styleInfo.offsetY - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: Math.abs(result.y - stickyArea.leftArea.pointY)
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode - arrowLength,
        y: Math.abs(result.y - stickyArea.leftArea.pointY)
      });
      lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
      lineEndPoint.y = Math.abs(result.y - stickyArea.leftArea.pointY);
      result.isConnectedNode = true
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.topArea.pointX - padding;
      result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding + breakLineOffsetNode - arrowLength
      });
      lineEndPoint.x = padding;
      lineEndPoint.y = padding + breakLineOffsetNode - arrowLength;
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.y = stickyArea.bottomArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height / 2
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height / 2
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding + arrowLength
      });
      lineEndPoint.x = padding;
      lineEndPoint.y = padding + arrowLength
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
      result.x = stickyArea.rightArea.pointX - padding;
      result.y = stickyArea.rightArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + arrowLength,
        y: padding
      });
      lineEndPoint.x = padding + arrowLength;
      lineEndPoint.y = padding;
      result.isConnectedNode = true
      result.connectedPosition = 'right';
    }
    if (result.isConnectedNode) {
      result.connectedNodeId = clonedToNode.id;
      const arrowList = getDrawArrowInfo({
        x: lineEndPoint.x,
        y: lineEndPoint.y
      }, {
        position: getContraryPosition(result.connectedPosition),
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: lineEndPoint.x - padding,
        y: lineEndPoint.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: lineEndPoint.x + padding,
        y: lineEndPoint.y + padding
      }
    }
    if (stickyNodePosition != null) {
      break;
    }
  }
}
//当左侧线条与其他节点吸附时候，改变线条绘制路径
const drawLeftLineWhenStick = (result: DrawInfo, options: Options) => {
  const nodesSotre = useFlowNodesStore()
  const toNodes = nodesSotre.nodeList
  const configStore = useFlowConfigStore()
  const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint } = options;
  for (let i = 0; i < toNodes.length; i += 1) {
    const toNode = toNodes[i]
    if (toNode.id === options.fromNode.id) {
      continue;
    }
    const clonedToNode = cloneDeep(toNode)
    clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
    clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
    clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
    clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
    const stickyArea = getNodeStickyArea(clonedToNode, {
      startPoint,
    });
    const stickyNodePosition = getLineStickyPosition({
      x: endPoint.x,
      y: endPoint.y
    }, stickyArea);
    const lineEndPoint: Coordinate = {
      x: 0,
      y: 0,
    };
    if (stickyNodePosition === 'left') {
      result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.y = stickyArea.leftArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode - arrowLength,
        y: padding
      });
      lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
      lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
      result.isConnectedNode = true
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      const gapX = startPoint.x - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width;
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.topArea.pointX - padding;
      result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      if (gapX >= 2 * breakLineOffsetNode) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding - breakLineOffsetNode,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding - breakLineOffsetNode,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + breakLineOffsetNode - arrowLength
        });
      } else if (gapX > 0 && gapX <= 2 * breakLineOffsetNode) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - gapX / 2 - padding,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width - gapX / 2 - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + breakLineOffsetNode - arrowLength
        });
      } else {
        result.width = Math.abs(clonedToNode.styleInfo.offsetX - startPoint.x) + 2 * padding + breakLineOffsetNode;
        result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
        result.x = clonedToNode.styleInfo.offsetX - padding - breakLineOffsetNode;
        result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: stickyArea.topArea.pointX - result.x,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: stickyArea.topArea.pointX - result.x,
          y: padding + breakLineOffsetNode - arrowLength
        });
      }
      lineEndPoint.x = stickyArea.topArea.pointX - result.x;
      lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.y = stickyArea.bottomArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding + arrowLength
      })
      lineEndPoint.x = padding;
      lineEndPoint.y = padding + arrowLength
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
      result.x = stickyArea.rightArea.pointX - padding;
      result.y = stickyArea.rightArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width / 2,
        y: result.height - padding
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width / 2,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + arrowLength,
        y: padding
      });
      lineEndPoint.x = padding + arrowLength;
      lineEndPoint.y = padding;
      result.isConnectedNode = true
      result.connectedPosition = 'right';
    }
    if (result.isConnectedNode) {
      result.connectedNodeId = clonedToNode.id;
      const arrowList = getDrawArrowInfo({
        x: lineEndPoint.x,
        y: lineEndPoint.y
      }, {
        position: getContraryPosition(result.connectedPosition),
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: lineEndPoint.x - padding,
        y: lineEndPoint.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: lineEndPoint.x + padding,
        y: lineEndPoint.y + padding
      }
    }
    if (stickyNodePosition != null) {
      break;
    }
  }
}
//当底部线条与其他节点吸附时候，改变线条绘制路径
const drawBottomLineWhenStick = (result: DrawInfo, options: Options) => {
  const nodesSotre = useFlowNodesStore()
  const toNodes = nodesSotre.nodeList
  const configStore = useFlowConfigStore()
  const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
  for (let i = 0; i < toNodes.length; i += 1) {
    const toNode = toNodes[i]
    if (toNode.id === options.fromNode.id) {
      continue;
    }
    const clonedToNode = cloneDeep(toNode)
    clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
    clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
    clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
    clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
    const stickyArea = getNodeStickyArea(clonedToNode, {
      startPoint,
    });
    const stickyNodePosition = getLineStickyPosition({
      x: endPoint.x,
      y: endPoint.y
    }, stickyArea);
    const lineEndPoint: Coordinate = {
      x: 0,
      y: 0,
    };
    if (stickyNodePosition === 'left') {
      result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.y = stickyArea.leftArea.pointY - padding;
      const gapY = startPoint.y - clonedToNode.styleInfo.offsetY - clonedToNode.styleInfo.height;
      if (gapY < 0) {
        result.height = clonedToNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding
      }
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: startPoint.y - result.y
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode - arrowLength,
        y: padding
      });
      lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
      lineEndPoint.y = padding;
      result.isConnectedNode = true
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      const gapX = fromNode.styleInfo.offsetX - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + 2 * breakLineOffsetNode;
      result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
      result.x = stickyArea.topArea.pointX - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapX > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding - breakLineOffsetNode
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width / 2,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width / 2,
          y: padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + breakLineOffsetNode - arrowLength
        })
      } else {
        result.width = Math.abs(fromNode.styleInfo.width + fromNode.styleInfo.offsetX - stickyArea.topArea.pointX) + 2 * padding + breakLineOffsetNode;
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding - breakLineOffsetNode
        })
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding + breakLineOffsetNode - arrowLength
        })
      }
      lineEndPoint.x = padding;
      lineEndPoint.y = padding + breakLineOffsetNode - arrowLength;
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.y = stickyArea.bottomArea.pointY - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: startPoint.y - result.y
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding + arrowLength
      });
      lineEndPoint.x = padding;
      lineEndPoint.y = padding + arrowLength
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      const gapX = fromNode.styleInfo.offsetX - stickyArea.rightArea.pointX
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.y = stickyArea.rightArea.pointY - padding;
      result.x = stickyArea.rightArea.pointX - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapX > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding - breakLineOffsetNode
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + gapX / 2,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding + gapX / 2,
          y: padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding + arrowLength,
          y: padding
        })
      } else {
        result.width = Math.abs(fromNode.styleInfo.offsetX + fromNode.styleInfo.width - stickyArea.rightArea.pointX) + 2 * padding + breakLineOffsetNode;
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding - breakLineOffsetNode
        });
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding + arrowLength,
          y: padding
        })
      }
      lineEndPoint.x = padding + arrowLength;
      lineEndPoint.y = padding;
      result.isConnectedNode = true
      result.connectedPosition = 'right';
    }
    if (result.isConnectedNode) {
      result.connectedNodeId = clonedToNode.id;
      const arrowList = getDrawArrowInfo({
        x: lineEndPoint.x,
        y: lineEndPoint.y
      }, {
        position: getContraryPosition(result.connectedPosition),
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: lineEndPoint.x - padding,
        y: lineEndPoint.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: lineEndPoint.x + padding,
        y: lineEndPoint.y + padding
      }
    }
    if (stickyNodePosition != null) {
      break;
    }
  }
}
/*
|--------------------------------------------------------------------------
| fromNode四个点引出线条绘制
|--------------------------------------------------------------------------
*/
//右侧线条
const drawRightLineWhenDrag = (result: DrawInfo, options: Options) => {
  const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endPoint, startPoint } = options;
  /*
        示例如下：A点到B点范围内，线条方向共2种
                        A
                        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                                 |‾‾‾‾‾‾‾‾‾‾‾|                             |‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
                        |                     |                                 |           |                             |              |
        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|   |        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾|  |       |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾|  |
        |                                 |   |        |                        |        |  |       |                     |           |  |
        |                                 |   |        |                        |        |  |       |                     |           |  |
        |                                 |   |        |                        |        |  |       |                _____|           |  |
        |                                 |   |        |               case1             |  |       |             case2               |  |
        |                                 |   |        |                                 |  |       |                                 |  |
        |                               C |‾‾‾B        |                                 |‾‾‾       |                                 |‾‾‾
        |                                 |            |                                 |          |                                 |
        |                                 |            |                                 |          |                                 |
        |_________________________________|            |_________________________________|          |_________________________________|
    */
  const A = {
    x: endPoint.x,
    y: fromNode.styleInfo.offsetY - breakLineOffsetNode
  }
  if (endPoint.y > A.y) {
    result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding + breakLineOffsetNode;
    result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode
    if (fromNode.styleInfo.offsetX + fromNode.styleInfo.width - endPoint.x < breakLineOffsetNode) { //case1
      result.lineInfo.brokenLinePoints.push({
        x: result.width - breakLineOffsetNode - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: endPoint.y - result.y - arrowLength,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: endPoint.y - result.y - arrowLength
      }, {
        position: 'bottom',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      //修正可拖拽区域
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: 0,
        y: endPoint.y - result.y - arrowLength - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: 2 * padding,
        y: endPoint.y - result.y - arrowLength + padding
      }
    } else {
      result.lineInfo.brokenLinePoints.push({
        x: result.width - breakLineOffsetNode - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode,
        y: endPoint.y - result.y,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: endPoint.y - result.y,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: endPoint.y - result.y
      }, {
        position: 'left',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      //修正可拖拽区域
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: 0,
        y: endPoint.y - result.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: 2 * padding,
        y: endPoint.y - result.y + padding
      }
    }
  } else {
    /*
            示例如下
                                        |                            ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
                                        |                                                       |
                                        |                                                       |
                                        ‾‾‾‾‾‾‾‾‾‾|                                             |
                                                  |                                             |
            |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|   |        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|  |
            |                                 |   |        |                                 |  |
            |                                 |   |        |                                 |  |
            |                                 |   |        |                                 |  |
            |               case1             |   |        |               case2             |  |
            |                               C |   |        |                                 |  |
            |                                 |‾‾‾         |                                 |‾‾‾
            |                                 |            |                                 |
            |                                 |            |                                 |
            |_________________________________|            |_________________________________|
        */
    result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding + breakLineOffsetNode;
    result.height = Math.abs(endPoint.y - startPoint.y) + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = endPoint.y - padding
    if (result.width < result.height + breakLineOffsetNode) { //case1
      result.lineInfo.brokenLinePoints.push({
        x: result.width - breakLineOffsetNode - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding + breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding + breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: padding
      }, {
        position: 'top',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      //修正可拖拽区域
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: 0,
        y: endPoint.y - result.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: 2 * padding,
        y: endPoint.y - result.y + padding
      }
    } else {
      result.lineInfo.brokenLinePoints.push({
        x: result.width - breakLineOffsetNode - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode,
        y: endPoint.y - result.y,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: endPoint.y - result.y,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: endPoint.y - result.y
      }, {
        position: 'left',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      //修正可拖拽区域
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: 0,
        y: endPoint.y - result.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: 2 * padding,
        y: endPoint.y - result.y + padding
      }
    }
  }
}
//顶部线条
const drawTopLineWhenDrag = (result: DrawInfo, options: Options) => {
  const { lineConfig: { padding, arrowLength, arrowWidth }, endPoint, startPoint } = options;
  /*
        示例如下：
                                                |
              ‾‾‾‾‾‾‾|                          |
                     |                          ‾‾‾‾‾‾‾‾|
                     |                                  |
                     |                                  |
               |‾‾‾‾‾‾‾‾‾‾‾‾|                     |‾‾‾‾‾‾‾‾‾‾‾‾‾|
               |            |                     |             |
               |    case1   |                     |    case2    |
               |            |                     |             |
               |____________|                     |_____________|
    */
  result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding;
  result.height = Math.abs(endPoint.y - startPoint.y) + 2 * padding;
  result.x = endPoint.x - padding;
  result.y = endPoint.y - padding;
  result.lineInfo.brokenLinePoints = [];
  if (result.width > result.height) { //case1
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: padding,
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: padding
    }, {
      position: 'left',
      arrowLength,
      arrowWidth
    });
    result.lineInfo.arrowInfo.p1 = arrowList[0];
    result.lineInfo.arrowInfo.p2 = arrowList[1];
    result.lineInfo.arrowInfo.p3 = arrowList[2];
  } else {
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: result.height / 2,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: result.height / 2,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: padding + arrowLength,
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: padding + arrowLength
    }, {
      position: 'top',
      arrowLength,
      arrowWidth
    });
    result.lineInfo.arrowInfo.p1 = arrowList[0];
    result.lineInfo.arrowInfo.p2 = arrowList[1];
    result.lineInfo.arrowInfo.p3 = arrowList[2];
  }
  //修正可拖拽区域
  result.lineInfo.arrowInfo.leftTopPoint = {
    x: padding + arrowLength - padding * 2,
    y: 0
  }
  result.lineInfo.arrowInfo.rightBottomPoint = {
    x: padding + arrowLength,
    y: padding * 2
  }
}
//左侧线条
const drawLeftLineWhenDrag = (result: DrawInfo, options: Options) => {
  const { lineConfig: { padding, arrowLength, arrowWidth }, endPoint, startPoint } = options;
  /*
        示例如下：

        ‾‾‾|                                  |
           |                                  |
           |   |‾‾‾‾‾‾‾‾‾‾‾‾|                 |   |‾‾‾‾‾‾‾‾‾‾‾‾‾|
           |   |            |                 |   |             |
           |---|    case1   |                 |---|    case2    |
               |            |                     |             |
               |____________|                     |_____________|
    */
  result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding;
  result.height = Math.abs(endPoint.y - startPoint.y) + 2 * padding;
  result.x = endPoint.x - padding;
  result.y = endPoint.y - padding;
  result.lineInfo.brokenLinePoints = [];
  if (result.width > result.height) { //case1
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width / 2,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width / 2,
      y: padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: padding,
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: padding
    }, {
      position: 'left',
      arrowLength,
      arrowWidth
    });
    result.lineInfo.arrowInfo.p1 = arrowList[0];
    result.lineInfo.arrowInfo.p2 = arrowList[1];
    result.lineInfo.arrowInfo.p3 = arrowList[2];
  } else {
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: padding + arrowLength,
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: padding + arrowLength
    }, {
      position: 'top',
      arrowLength,
      arrowWidth
    });
    result.lineInfo.arrowInfo.p1 = arrowList[0];
    result.lineInfo.arrowInfo.p2 = arrowList[1];
    result.lineInfo.arrowInfo.p3 = arrowList[2];
  }
  //修正可拖拽区域
  result.lineInfo.arrowInfo.leftTopPoint = {
    x: padding + arrowLength - padding * 2,
    y: 0
  }
  result.lineInfo.arrowInfo.rightBottomPoint = {
    x: padding + arrowLength,
    y: padding * 2
  }
}
//底部线条
const drawBottomLineWhenDrag = (result: DrawInfo, options: Options) => {
  const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endPoint, startPoint } = options;
  /*
        示例如下：
                            A
         |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
         |
         |   |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|           |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|          |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
         |   |                                 |           |                                 |          |                                 |
         |   |                                 |           |                                 |          |                                 |
         |   |                                 |           |                                 |          |                                 |
         |   |                                 |       |‾‾‾|‾‾‾‾‾          case1             |          |           |  case2              |
         |   |                                 |       |   |                                 |          |           |                     |
         |   |                                 |       |   |                                 |      |‾‾‾|‾‾‾‾‾‾‾‾‾‾‾‾                     |
         |   |               p1                |       |   |                                 |      |   |                                 |
         |   |_________________________________|       |   |_________________________________|      |   |_________________________________|
         |                   |                         |                   |                        |                   |
         |___________________|                         |___________________|                        |___________________|

    */
  const p1 = {
    x: fromNode.styleInfo.width / 2 + fromNode.styleInfo.offsetX,
    y: fromNode.styleInfo.height + fromNode.styleInfo.offsetY
  }
  if (Math.abs(endPoint.x - p1.x) < fromNode.styleInfo.width / 2 + breakLineOffsetNode && endPoint.y > fromNode.styleInfo.offsetY - breakLineOffsetNode) {
    result.width = fromNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode;
    result.height = Math.abs(endPoint.y - startPoint.y) + breakLineOffsetNode + 2 * padding;
    result.x = fromNode.styleInfo.offsetX - padding - breakLineOffsetNode;
    result.y = endPoint.y - padding
    if (Math.abs(endPoint.x - startPoint.x) > Math.abs(endPoint.y - startPoint.y)) { //如图case1
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: endPoint.x - result.x,
        y: padding,
      })
      const arrowList = getDrawArrowInfo({
        x: endPoint.x - result.x,
        y: padding
      }, {
        position: 'right',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
    } else {
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding + breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: endPoint.x - result.x,
        y: padding + breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: endPoint.x - result.x,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: endPoint.x - result.x,
        y: padding,
      })
      const arrowList = getDrawArrowInfo({
        x: endPoint.x - result.x,
        y: padding
      }, {
        position: 'top',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
    }
    //修正可拖拽区域
    result.lineInfo.arrowInfo.leftTopPoint = {
      x: endPoint.x - result.x - padding,
      y: 0
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
      x: endPoint.x - result.x + padding,
      y: padding * 2
    }
  } else {
    result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - startPoint.y) + breakLineOffsetNode + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = endPoint.y - padding;
    if (Math.abs(endPoint.x - startPoint.x) > Math.abs(endPoint.y - startPoint.y)) {
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: breakLineOffsetNode + padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: breakLineOffsetNode + padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: padding
      }, {
        position: 'left',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
    } else {
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: padding,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: padding
      }, {
        position: 'top',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
    }
    //修正可拖拽区域
    result.lineInfo.arrowInfo.leftTopPoint = {
      x: 0,
      y: 0
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
      x: padding * 2,
      y: padding * 2
    }
  }
}
/*
|--------------------------------------------------------------------------
|
|--------------------------------------------------------------------------
*/
export const getQuardantInfo2 = (result: DrawInfo, options: Options): void => {
  const { startPoint, endPoint, lineConfig: { padding }, fromPosition } = options;
  const selectionStore = useFlowSelectionStore()
  //第一步，确定canvas位置和宽高
  result.x = endPoint.x - padding;
  result.y = endPoint.y - padding
  result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding;
  result.height = Math.abs(endPoint.y - startPoint.y) + 2 * padding;
  //第二步，确定箭头可拖拽区域
  result.lineInfo.arrowInfo.leftTopPoint = {
    x: result.width - padding * 2,
    y: 0
  }
  result.lineInfo.arrowInfo.rightBottomPoint = {
    x: result.width,
    y: padding * 2
  }
  //第三步，根据线条引出时候位置，绘制线条
  if (fromPosition === 'right') { //第一象限，从节点右侧引出线条
    drawRightLineWhenDrag(result, options);
    if (!selectionStore.isMouseDownSelectedArea) {
      drawRightLineWhenStick(result, options);
    }
  } else if (fromPosition === 'top') { //第一象限，从节点顶部引出线条
    drawTopLineWhenDrag(result, options);
    if (!selectionStore.isMouseDownSelectedArea) {
      drawTopLineWhenStick(result, options);
    }
  } else if (fromPosition === 'left') { //第一象限，从节点左侧引出线条
    drawLeftLineWhenDrag(result, options);
    if (!selectionStore.isMouseDownSelectedArea) {
      drawLeftLineWhenStick(result, options);
    }
  } else if (fromPosition === 'bottom') { //第一象限，从节点下侧引出线条
    drawBottomLineWhenDrag(result, options);
    if (!selectionStore.isMouseDownSelectedArea) {
      drawBottomLineWhenStick(result, options);
    }
  }
}
