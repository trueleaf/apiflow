import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { useFlowConfigStore } from '@/store/apiflow/config';
import { cloneDeep } from '@/helper';
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
  const configStore = useFlowConfigStore()
  const toNodes = nodesSotre.nodeList
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
      startPoint
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
      const gapY = clonedToNode.styleInfo.offsetY - fromNode.styleInfo.offsetY - fromNode.styleInfo.height;
      const gapX = fromNode.styleInfo.offsetX + fromNode.styleInfo.width - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width
      result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode * 2;
      result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding;
      result.y = startPoint.y - padding;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      if (gapX < 0 && gapY < 0) {
        result.width = clonedToNode.styleInfo.width + 2 * padding + 2 * breakLineOffsetNode
      }
      if (gapY > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: startPoint.y - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: startPoint.y - result.y
        })
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
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode - arrowLength,
          y: result.height - padding
        });
        lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
        lineEndPoint.y = result.height - padding;
      } else {
        result.height = Math.abs(clonedToNode.styleInfo.offsetY + clonedToNode.styleInfo.height - startPoint.y) + 2 * padding + breakLineOffsetNode;
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: startPoint.y - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: startPoint.y - result.y
        })
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
          y: stickyArea.leftArea.pointY - result.y
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode - arrowLength,
          y: stickyArea.leftArea.pointY - result.y
        })
        lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
        lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
      }
      result.isConnectedNode = true
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      const gapX = fromNode.styleInfo.width + fromNode.styleInfo.offsetX - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width;
      const gapY = clonedToNode.styleInfo.offsetY - fromNode.styleInfo.offsetY - fromNode.styleInfo.height
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding;
      result.x = stickyArea.topArea.pointX - padding;
      result.y = fromNode.styleInfo.offsetY + fromNode.styleInfo.height / 2 - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapX < 0 && gapY < 0) {
        result.width = clonedToNode.styleInfo.width / 2 + breakLineOffsetNode + padding * 2
      }
      if (gapY > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: startPoint.y - fromNode.styleInfo.offsetY + padding + gapY / 2
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: startPoint.y - fromNode.styleInfo.offsetY + padding + gapY / 2
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding - arrowLength
        });
      } else {
        result.height = Math.abs(fromNode.styleInfo.offsetY - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
        result.y = fromNode.styleInfo.offsetY - breakLineOffsetNode - padding;
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
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding - arrowLength
        });
      }
      lineEndPoint.x = padding;
      lineEndPoint.y = result.height - padding - arrowLength;
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      const gapY = fromNode.styleInfo.offsetY + fromNode.styleInfo.height - clonedToNode.styleInfo.offsetY - clonedToNode.styleInfo.height;
      const gapX = fromNode.styleInfo.offsetX + fromNode.styleInfo.width - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(stickyArea.bottomArea.pointY - startPoint.y) + 2 * padding + breakLineOffsetNode;
      result.y = startPoint.y - padding;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapX < 0) {
        result.width = clonedToNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode
      }
      if (gapY > 0) {
        result.height = fromNode.styleInfo.height / 2 + 2 * padding + breakLineOffsetNode
        // result.y =
      }
      result.lineInfo.brokenLinePoints.push({
        x: startPoint.x - result.x,
        y: startPoint.y - result.y
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: startPoint.y - result.y
      })
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
        y: stickyArea.bottomArea.pointY - result.y + arrowLength
      })
      lineEndPoint.x = padding;
      lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
      result.x = stickyArea.rightArea.pointX - padding;
      result.y = fromNode.styleInfo.offsetY + fromNode.styleInfo.height / 2 - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: startPoint.x - result.x,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + arrowLength,
        y: result.height - padding
      });
      lineEndPoint.x = padding + arrowLength;
      lineEndPoint.y = result.height - padding;
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
  const configStore = useFlowConfigStore()
  const toNodes = nodesSotre.nodeList
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
      startPoint
    });
    const stickyNodePosition = getLineStickyPosition({
      x: endPoint.x,
      y: endPoint.y
    }, stickyArea);
    // console.log(stickyArea, stickyNodePosition)
    const lineEndPoint: Coordinate = {
      x: 0,
      y: 0,
    };
    if (stickyNodePosition === 'left') {
      const gapY = clonedToNode.styleInfo.offsetY - fromNode.styleInfo.offsetY;
      const gapX = fromNode.styleInfo.offsetX - clonedToNode.styleInfo.offsetX;
      result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(startPoint.y - stickyArea.leftArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.y = startPoint.y - padding - breakLineOffsetNode;
      if (gapX < 0) {
        result.x = fromNode.styleInfo.offsetX - breakLineOffsetNode - padding;
        result.width = fromNode.styleInfo.width / 2 + breakLineOffsetNode + padding * 2;
      }
      result.lineInfo.brokenLinePoints = [];
      if (gapY < 0) {
        result.y = clonedToNode.styleInfo.offsetY - breakLineOffsetNode - padding;
        result.height = clonedToNode.styleInfo.height / 2 + 2 * padding + breakLineOffsetNode;
      }
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: startPoint.y - result.y
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
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: stickyArea.leftArea.pointX - result.x - arrowLength,
        y: result.height - padding
      });
      lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
      lineEndPoint.y = result.height - padding;
      result.isConnectedNode = true
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.topArea.pointX - padding;
      result.y = startPoint.y - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: startPoint.y - result.y
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
        y: result.height - padding - arrowLength
      });
      lineEndPoint.x = padding;
      lineEndPoint.y = result.height - padding - arrowLength;
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      const gapX = fromNode.styleInfo.offsetX - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width
      const gapY = clonedToNode.styleInfo.offsetY - fromNode.styleInfo.offsetY
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode * 2;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.y = startPoint.y - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      if (gapX > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: startPoint.y - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width / 2,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width / 2,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding - breakLineOffsetNode + arrowLength
        });
        lineEndPoint.x = padding;
        lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength;
      } else {
        if (gapY < 0) {
          result.height = clonedToNode.styleInfo.height + 2 * padding + 2 * breakLineOffsetNode;
          result.y = clonedToNode.styleInfo.offsetY - breakLineOffsetNode - padding;
        }
        result.width = Math.abs(startPoint.x - clonedToNode.styleInfo.offsetX + breakLineOffsetNode) + 2 * padding;
        result.x = clonedToNode.styleInfo.offsetX - breakLineOffsetNode - padding;
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: startPoint.y - result.y
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
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: stickyArea.bottomArea.pointX - result.x,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: stickyArea.bottomArea.pointX - result.x,
          y: result.height - padding - breakLineOffsetNode + arrowLength
        });
        lineEndPoint.x = stickyArea.bottomArea.pointX - result.x;
        lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength;
      }
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      const gapX = fromNode.styleInfo.offsetX - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width;
      const gapY = clonedToNode.styleInfo.offsetY - fromNode.styleInfo.offsetY;
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.rightArea.pointX - padding;
      result.y = startPoint.y - padding - breakLineOffsetNode;
      result.lineInfo.brokenLinePoints = [];
      if (gapX > 2 * (breakLineOffsetNode + arrowLength)) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: breakLineOffsetNode + padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode + arrowLength,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode + arrowLength,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + arrowLength,
          y: result.height - padding
        });
        lineEndPoint.x = padding + arrowLength;
        lineEndPoint.y = result.height - padding;
      } else if (gapX > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: breakLineOffsetNode + padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + gapX / 2,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + gapX / 2,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + arrowLength,
          y: result.height - padding
        });
        lineEndPoint.x = padding + arrowLength;
        lineEndPoint.y = result.height - padding;
      } else {
        result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + fromNode.styleInfo.width / 2 + breakLineOffsetNode + 2 * padding;
        result.x = stickyArea.rightArea.pointX - padding;
        if (gapY < 0) {
          result.y = clonedToNode.styleInfo.offsetY - padding - breakLineOffsetNode;
          result.height = clonedToNode.styleInfo.height / 2 + 2 * padding + breakLineOffsetNode;
          result.lineInfo.brokenLinePoints.push({
            x: startPoint.x - result.x,
            y: fromNode.styleInfo.offsetY - result.y
          });
        } else {
          result.lineInfo.brokenLinePoints.push({
            x: startPoint.x - result.x,
            y: breakLineOffsetNode + padding
          });
        }
        result.lineInfo.brokenLinePoints.push({
          x: startPoint.x - result.x,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + arrowLength,
          y: result.height - padding
        });
        lineEndPoint.x = padding + arrowLength;
        lineEndPoint.y = result.height - padding;
      }
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
  const configStore = useFlowConfigStore()
  const toNodes = nodesSotre.nodeList
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
      startPoint
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
      result.height = Math.abs(startPoint.y - stickyArea.leftArea.pointY) + 2 * padding;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = [];
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
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode - arrowLength,
        y: result.height - padding
      });
      lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
      lineEndPoint.y = result.height - padding;
      result.isConnectedNode = true;
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding;
      result.x = stickyArea.topArea.pointX - padding;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = []
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
        y: result.height - padding - arrowLength
      })
      lineEndPoint.x = padding;
      lineEndPoint.y = result.height - padding - arrowLength;
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      const gapX = fromNode.styleInfo.offsetX - clonedToNode.styleInfo.offsetX - clonedToNode.styleInfo.width;
      // const gapY = stickyArea.bottomArea.pointY - startPoint.y;
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapX > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: clonedToNode.styleInfo.width / 2 + gapX / 2 + padding,
          y: padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: clonedToNode.styleInfo.width / 2 + gapX / 2 + padding,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: padding,
          y: result.height - padding - breakLineOffsetNode + arrowLength
        });
        lineEndPoint.x = padding;
        lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength
      } else if (gapX <= 0) {
        result.x = clonedToNode.styleInfo.offsetX - breakLineOffsetNode - padding;
        result.width = Math.abs(fromNode.styleInfo.offsetX - clonedToNode.styleInfo.offsetX) + 2 * padding + breakLineOffsetNode;
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
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: stickyArea.bottomArea.pointX - result.x,
          y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
          x: stickyArea.bottomArea.pointX - result.x,
          y: result.height - padding - breakLineOffsetNode + arrowLength
        })
        lineEndPoint.x = stickyArea.bottomArea.pointX - result.x;
        lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength
      }
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
      result.x = stickyArea.rightArea.pointX - padding;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width / 2,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width / 2,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + arrowLength,
        y: result.height - padding
      });
      lineEndPoint.x = padding + arrowLength;
      lineEndPoint.y = result.height - padding;
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
  const configStore = useFlowConfigStore()
  const toNodes = nodesSotre.nodeList
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
    const stickyArea = getNodeStickyArea(toNode, {
      startPoint
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
      const gapY = toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY - fromNode.styleInfo.height
      result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
      result.height = Math.abs(startPoint.y - stickyArea.leftArea.pointY) + 2 * padding;
      result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = [];
      if (gapY > 0) {
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
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
          y: result.height - padding
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode - arrowLength,
          y: result.height - padding
        });
      } else {
        result.height = Math.abs(toNode.styleInfo.offsetY + toNode.styleInfo.height + breakLineOffsetNode - startPoint.y) + 2 * padding;
        result.y = startPoint.y - padding;
        result.lineInfo.brokenLinePoints.push({
          x: result.width - padding,
          y: padding
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
          y: stickyArea.leftArea.pointY - result.y
        });
        result.lineInfo.brokenLinePoints.push({
          x: padding + breakLineOffsetNode - arrowLength,
          y: stickyArea.leftArea.pointY - result.y
        });
      }
      lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
      lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
      result.isConnectedNode = true
      result.connectedPosition = 'left';
    } else if (stickyNodePosition === 'top') {
      result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding;
      result.x = stickyArea.topArea.pointX - padding;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
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
        y: result.height - padding - arrowLength
      })
      lineEndPoint.x = padding;
      lineEndPoint.y = result.height - padding - arrowLength;
      result.isConnectedNode = true
      result.connectedPosition = 'top';
    } else if (stickyNodePosition === 'bottom') {
      result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode;
      result.x = stickyArea.bottomArea.pointX - padding;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
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
        y: result.height - padding - breakLineOffsetNode + arrowLength,
      });
      lineEndPoint.x = padding;
      lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength
      result.isConnectedNode = true
      result.connectedPosition = 'bottom';
    } else if (stickyNodePosition === 'right') {
      result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
      result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
      result.x = stickyArea.rightArea.pointX - padding;
      result.y = startPoint.y - padding;
      result.lineInfo.brokenLinePoints = [];
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding
      });
      result.lineInfo.brokenLinePoints.push({
        x: padding + arrowLength,
        y: result.height - padding
      })
      lineEndPoint.x = padding + arrowLength;
      lineEndPoint.y = result.height - padding;
      result.isConnectedNode = true
      result.connectedPosition = 'right';
    }
    if (result.isConnectedNode) {
      result.connectedNodeId = toNode.id;
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
  const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endPoint } = options;
  /*
        示例如下：A点到B点范围外，线条方向共2种

           |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|         |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|           |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
           |                                 |         |                                 |           |                                 |
           |                                 |         |               case1             |           |                                 |
           |                                 |         |                                 |           |                                 |
           |                                 |         |                               p |____       |               case2           p |____
           |                               p |____     |                end ______       |    |      |                         end     |    |
           |                                 |   |     |                         |       |    |      |                          |      |    |
           |                                 |   |     |                         |       |    |      |                          |      |    |
           |                                 |   |     |                         |       |    |      |                          |      |    |
           |_________________________________|   |     |_________________________|_______|    |      |__________________________|______|    |
                           |                     |                               |            |                                 |           |
                           |_____________________|                               |____________|                                 |___________|
                           B
    */
  const p = {
    x: fromNode.styleInfo.width + fromNode.styleInfo.offsetX,
    y: fromNode.styleInfo.height / 2 + fromNode.styleInfo.offsetY
  }
  const endPWidth = Math.abs(endPoint.x - p.x);
  const endPHeight = Math.abs(endPoint.y - p.y);
  const B = {
    y: fromNode.styleInfo.offsetY + fromNode.styleInfo.height + breakLineOffsetNode
  }
  if (endPoint.y < B.y) {
    result.width = Math.abs(endPoint.x - p.x) + 2 * padding + breakLineOffsetNode;
    result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = p.y - padding
    if (endPWidth > breakLineOffsetNode) { //case1
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding - breakLineOffsetNode,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding + breakLineOffsetNode,
        y: result.height - padding,
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
        y: endPoint.y - result.y,
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
        x: padding * 2,
        y: endPoint.y - result.y + padding
      }
    } else {
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding - breakLineOffsetNode,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
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
        y: endPoint.y - result.y,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: endPoint.y - result.y,
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
        x: padding * 2,
        y: endPoint.y - result.y + padding
      }
    }
  } else {
    /*
            示例如下：A点到B点范围外，线条方向共2种

            |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|         |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|           |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
            |                                 |         |                                 |           |                                 |
            |                                 |         |                                 |           |                                 |
            |                                 |         |                                 |           |                                 |
            |                                 |         |                               p |____       |                               p |____
            |                               p |____     |              case1              |    |      |              case2              |    |
            |                                 |   |     |                                 |    |      |                                 |    |
            |                                 |   |     |                                 |    |      |                                 |    |
            |                                 |   |     |                                 |    |      |                                 |    |
            |_________________________________|   |     |_________________________________|    |      |_________________________________|    |
                            |                     |                                            |                                             |
                            |_____________________|                             _______________|                     end  ___________________|
                            B                                                   |
                                                                                |
                                                                                |
                                                                               end

        */
    result.width = Math.abs(endPoint.x - p.x) + 2 * padding + breakLineOffsetNode;
    result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = p.y - padding
    if (endPWidth < endPHeight) { //case1
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding - breakLineOffsetNode,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: result.height - padding,
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
        y: endPoint.y - result.y - padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: padding * 2,
        y: endPoint.y - result.y + padding
      }
    } else {
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding - breakLineOffsetNode,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
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
        y: endPoint.y - result.y,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: endPoint.y - result.y,
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
        x: padding * 2,
        y: endPoint.y - result.y + padding
      }
    }
  }
}
//顶部线条
const drawTopLineWhenDrag = (result: DrawInfo, options: Options) => {
  const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endPoint } = options;
  /*
                示例如下：A点到B点范围外，线条方向共2种
       A
       |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                          |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                             |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
       |                    |                          |                      |                             |                      |
       |    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|        |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|            |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
       |    |               p                 |        |     |                p                |            |     |                p                |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |               case1             |            |     |               case2             |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |                                 |            |     |                                 |
       |    |                                 |        |     |                                 |    ________|     |                                 |
       |    |                                 |       end    |                                 |   end            |                                 |
       |    |_________________________________|              |_________________________________|                  |_________________________________|
       |                    |
       |____________________|
                            B

    */
  const p = {
    x: fromNode.styleInfo.width / 2 + fromNode.styleInfo.offsetX,
    y: fromNode.styleInfo.offsetY
  }
  const endPWidth = Math.abs(endPoint.x - p.x);
  const endPHeight = Math.abs(endPoint.y - p.y);
  if (endPWidth > fromNode.styleInfo.width / 2 + breakLineOffsetNode) {
    result.width = endPWidth + 2 * padding;
    result.height = endPHeight + breakLineOffsetNode + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = p.y - breakLineOffsetNode - padding
    if (endPWidth < endPHeight) { //如图case1
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding + breakLineOffsetNode,
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
        y: result.height - padding,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: result.height - padding,
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
        y: result.height - 2 * padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: 2 * padding,
        y: result.height
      }
    } else { //如同case2
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding + breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: breakLineOffsetNode + padding,
        y: padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: breakLineOffsetNode + padding,
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: padding,
        y: result.height - padding,
      })
      const arrowList = getDrawArrowInfo({
        x: padding,
        y: result.height - padding,
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
        y: result.height - 2 * padding
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: 2 * padding,
        y: result.height
      }
    }
  } else {
    /*
                示例如下：A点到B点范围内，线条方向共2种
            A
            |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                          |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                             |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
            |                    |                          |                      |                             |                      |
            |    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|        |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|            |     |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
            |    |               p                 |        |     |                p                |            |     |                p                |
            |    |                                 |        |     |                                 |            |     |                                 |
            |    |                                 |        |_____|____end                          |            |_____|____________                     |
            |    |                                 |              |               case1             |                  |            |  case2             |
            |    |                                 |              |                                 |                  |            |                    |
            |    |                                 |              |                                 |                  |            |                    |
            |    |                                 |              |                                 |                  |           end                   |
            |    |                                 |              |                                 |                  |                                 |
            |    |_________________________________|              |_________________________________|                  |_________________________________|
            |                    |
            |____________________|
                                    B

        */
    result.width = fromNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode;
    result.height = endPHeight + breakLineOffsetNode + 2 * padding;
    result.x = fromNode.styleInfo.offsetX - breakLineOffsetNode - padding;
    result.y = fromNode.styleInfo.offsetY - breakLineOffsetNode - padding;
    if (endPWidth > endPHeight) { //如图case1
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding + breakLineOffsetNode,
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
        y: result.height - padding,
      })
      result.lineInfo.brokenLinePoints.push({
        x: endPoint.x - result.x,
        y: result.height - padding,
      })
      const arrowList = getDrawArrowInfo({
        x: endPoint.x - result.x,
        y: result.height - padding
      }, {
        position: 'right',
        arrowLength,
        arrowWidth
      });
      result.lineInfo.arrowInfo.p1 = arrowList[0];
      result.lineInfo.arrowInfo.p2 = arrowList[1];
      result.lineInfo.arrowInfo.p3 = arrowList[2];
      //修正可拖拽区域
      result.lineInfo.arrowInfo.leftTopPoint = {
        x: endPoint.x - result.x - padding,
        y: result.height - padding * 2
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: endPoint.x - result.x + padding,
        y: result.height
      }
    } else { //如图case2
      result.lineInfo.brokenLinePoints.push({
        x: result.width - padding,
        y: padding + breakLineOffsetNode,
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
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: endPoint.x - result.x,
        y: result.height - padding - breakLineOffsetNode,
      })
      result.lineInfo.brokenLinePoints.push({
        x: endPoint.x - result.x,
        y: result.height - padding,
      })
      const arrowList = getDrawArrowInfo({
        x: endPoint.x - result.x,
        y: result.height - padding,
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
        x: endPoint.x - result.x - padding,
        y: result.height - padding * 2
      }
      result.lineInfo.arrowInfo.rightBottomPoint = {
        x: endPoint.x - result.x + padding,
        y: result.height
      }
    }
  }
}
//左侧线条
const drawLeftLineWhenDrag = (result: DrawInfo, options: Options) => {
  const { lineConfig: { padding, arrowLength, arrowWidth }, fromNode, endPoint } = options;
  /*
                 示例如下：
                 |‾‾‾‾‾‾‾‾‾‾‾‾‾|                      |‾‾‾‾‾‾‾‾‾‾‾‾‾|
                 |             |                      |             |
           |-----| p  case1    |                |-----| p  case2    |
           |     |             |                |     |             |
           |     |_____________|          ______|     |_____________|
           |                             end
           |
          end
    */
  const p = {
    x: fromNode.styleInfo.offsetX,
    y: fromNode.styleInfo.height / 2 + fromNode.styleInfo.offsetY
  }
  const endPWidth = Math.abs(endPoint.x - p.x);
  const endPHeight = Math.abs(endPoint.y - p.y);
  if (endPHeight > endPWidth) { //case1
    result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = p.y - padding
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
      y: result.height - padding - arrowLength
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: result.height - padding - arrowLength
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
      y: result.height - 2 * padding
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
      x: 2 * padding,
      y: result.height
    }
  } else {
    result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = p.y - padding
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width / 2,
      y: padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width / 2,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: result.height - padding
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: result.height - padding
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
      y: result.height - 2 * padding
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
      x: 2 * padding,
      y: result.height
    }
  }
}
//底部线条
const drawBottomLineWhenDrag = (result: DrawInfo, options: Options) => {
  const { lineConfig: { padding, arrowLength, arrowWidth }, fromNode, endPoint } = options;
  /*
        示例如下：

               |‾‾‾‾‾‾‾‾‾‾‾‾|                     |‾‾‾‾‾‾‾‾‾‾‾‾‾|
               |            |                     |             |
               |    case1   |                     |    case2    |
               |            |                     |             |
               |______p_____|                     |______p______|
                      |                                  |
        ______________|                                  |
       end                                               |
                                           ______________|
                                           |
                                           |
                                           |
                                          end
    */
  const p = {
    x: fromNode.styleInfo.offsetX + fromNode.styleInfo.width / 2,
    y: fromNode.styleInfo.height + fromNode.styleInfo.offsetY
  }
  const endPWidth = Math.abs(endPoint.x - p.x);
  const endPHeight = Math.abs(endPoint.y - p.y);
  if (endPWidth * 0.618 > endPHeight) { //case1
    result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = p.y - padding
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: result.height - padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: result.height - padding
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: result.height - padding
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
      y: result.height - 2 * padding
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
      x: 2 * padding,
      y: result.height
    }
  } else {
    result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
    result.x = endPoint.x - padding;
    result.y = p.y - padding
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: padding,
    })
    result.lineInfo.brokenLinePoints.push({
      x: result.width - padding,
      y: result.height / 2,
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: result.height / 2
    })
    result.lineInfo.brokenLinePoints.push({
      x: padding,
      y: result.height - padding
    })
    const arrowList = getDrawArrowInfo({
      x: padding,
      y: result.height - padding
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
      y: result.height - 2 * padding
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
      x: 2 * padding,
      y: result.height
    }
  }
}
/*
|--------------------------------------------------------------------------
|
|--------------------------------------------------------------------------
*/
export const getQuardantInfo3 = (result: DrawInfo, options: Options): void => {
  const { startPoint, endPoint, lineConfig: { padding }, fromPosition } = options;
  const selectionStore = useFlowSelectionStore()
  //第一步，确定canvas位置和宽高
  result.x = startPoint.x - padding;
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
