import type { TestCase } from './types'

// appWorkbench modules
import logo from './appWorkbench/workbenchTop/logo'
import navigation from './appWorkbench/workbenchTop/navigation'
import navControl from './appWorkbench/workbenchTop/navControl'
import quickIcons from './appWorkbench/workbenchTop/quickIcons'
import windowControl from './appWorkbench/workbenchTop/windowControl'

// projectManager modules
import projectList from './projectManager/projectList'
import createProject from './projectManager/createProject'
import searchProject from './projectManager/searchProject'

// projectAddon modules
import apiflowImport from './projectAddon/import/apiflowImport'
import openapiImport from './projectAddon/import/openapiImport'
import postmanImport from './projectAddon/import/postmanImport'
import aiDataImport from './projectAddon/import/aiDataImport'
import codeRepoImport from './projectAddon/import/codeRepoImport'
import exportModule from './projectAddon/export'
import variable from './projectAddon/variable'
import globalCommonHeaders from './projectAddon/commonHeader/globalCommonHeaders'

// projectWorkbench - banner
import search from './projectWorkbench/banner/search'
import projectToggle from './projectWorkbench/banner/projectToggle'
import tools from './projectWorkbench/banner/tools'
import bannerOtherFeatures from './projectWorkbench/banner/bannerOtherFeatures'

// projectWorkbench - banner - bannerDetails - nodeOperation - addNode
import addHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/addNode/addHttpNode'
import folderNode from './projectWorkbench/banner/bannerDetails/nodeOperation/addNode/folderNode'
import websocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/addNode/websocketNode'
import httpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/addNode/httpMockNode'
import websocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/addNode/websocketMockNode'
import boundaryTest from './projectWorkbench/banner/bannerDetails/nodeOperation/addNode/boundaryTest'

// projectWorkbench - banner - bannerDetails - nodeOperation - deleteNode
import deleteHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/deleteNode/deleteHttpNode'
import deleteWebsocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/deleteNode/deleteWebsocketNode'
import deleteHttpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/deleteNode/deleteHttpMockNode'
import deleteWebsocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/deleteNode/deleteWebsocketMockNode'
import deleteMixedNodes from './projectWorkbench/banner/bannerDetails/nodeOperation/deleteNode/deleteMixedNodes'
import deleteFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/deleteNode/deleteFolder'

// projectWorkbench - banner - bannerDetails - nodeOperation - renameNode
import renameHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/renameNode/renameHttpNode'
import renameWebsocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/renameNode/renameWebsocketNode'
import renameHttpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/renameNode/renameHttpMockNode'
import renameWebsocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/renameNode/renameWebsocketMockNode'
import renameFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/renameNode/renameFolder'

// projectWorkbench - banner - bannerDetails - nodeOperation - copyNode
import copySingleHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyHttpNode/copySingleHttpNode'
import copyMultipleHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyHttpNode/copyMultipleHttpNode'
import copySingleWebsocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyWebsocketNode/copySingleWebsocketNode'
import copyMultipleWebsocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyWebsocketNode/copyMultipleWebsocketNode'
import copySingleHttpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyHttpMockNode/copySingleHttpMockNode'
import copyMultipleHttpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyHttpMockNode/copyMultipleHttpMockNode'
import copySingleWebsocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyWebsocketMockNode/copySingleWebsocketMockNode'
import copyMultipleWebsocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyWebsocketMockNode/copyMultipleWebsocketMockNode'
import copySingleFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyFolder/copySingleFolder'
import copyMultipleFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyFolder/copyMultipleFolder'
import copyMixedNodeTypes from './projectWorkbench/banner/bannerDetails/nodeOperation/copyNode/copyMixedNodes/copyMixedNodeTypes'

// projectWorkbench - banner - bannerDetails - nodeOperation - cutNode
import cutSingleHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutHttpNode/cutSingleHttpNode'
import cutMultipleHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutHttpNode/cutMultipleHttpNode'
import cutSingleWebsocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutWebsocketNode/cutSingleWebsocketNode'
import cutMultipleWebsocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutWebsocketNode/cutMultipleWebsocketNode'
import cutSingleHttpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutHttpMockNode/cutSingleHttpMockNode'
import cutMultipleHttpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutHttpMockNode/cutMultipleHttpMockNode'
import cutSingleWebsocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutWebsocketMockNode/cutSingleWebsocketMockNode'
import cutMultipleWebsocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutWebsocketMockNode/cutMultipleWebsocketMockNode'
import cutSingleFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutFolder/cutSingleFolder'
import cutMultipleFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutFolder/cutMultipleFolder'
import cutMixedNodeTypes from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutMixedNodes/cutMixedNodeTypes'
import cutWithoutPaste from './projectWorkbench/banner/bannerDetails/nodeOperation/cutNode/cutSpecialCases/cutWithoutPaste'

// projectWorkbench - banner - bannerDetails - nodeOperation - moveNode
import moveSingleHttpNode from './projectWorkbench/banner/bannerDetails/nodeOperation/moveNode/moveHttpNode/moveSingleHttpNode'
import moveSingleWebsocketNode from './projectWorkbench/banner/bannerDetails/nodeOperation/moveNode/moveWebsocketNode/moveSingleWebsocketNode'
import moveSingleHttpMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/moveNode/moveHttpMockNode/moveSingleHttpMockNode'
import moveSingleWebsocketMockNode from './projectWorkbench/banner/bannerDetails/nodeOperation/moveNode/moveWebsocketMockNode/moveSingleWebsocketMockNode'
import moveSingleFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/moveNode/moveFolder/moveSingleFolder'
import movePerformance from './projectWorkbench/banner/bannerDetails/nodeOperation/moveNode/moveSpecialCases/movePerformance'

// projectWorkbench - banner - bannerDetails - nodeOperation - contextMenu
import contextMenuFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/contextMenu/contextMenuFolder'
import contextMenuNonFolder from './projectWorkbench/banner/bannerDetails/nodeOperation/contextMenu/contextMenuNonFolder'
import contextMenuBlank from './projectWorkbench/banner/bannerDetails/nodeOperation/contextMenu/contextMenuBlank'

// projectWorkbench - banner - bannerDetails - nodeOperation - otherCases
import otherCases from './projectWorkbench/banner/bannerDetails/nodeOperation/otherCases'

// projectWorkbench - nav
import bannerNavInteraction from './projectWorkbench/nav/bannerNavInteraction'
import tabDrag from './projectWorkbench/nav/tabDrag'

// projectWorkbench - httpNodeWorkbench - operation
import requestUrlInput from './projectWorkbench/httpNodeWorkbench/operation/requestUrlInput'
import requestUrlDisplay from './projectWorkbench/httpNodeWorkbench/operation/requestUrlDisplay'
import requestMethodInput from './projectWorkbench/httpNodeWorkbench/operation/requestMethodInput'
import sendButton from './projectWorkbench/httpNodeWorkbench/operation/requestOperation/sendButton'
import saveButton from './projectWorkbench/httpNodeWorkbench/operation/requestOperation/saveButton'
import refreshButton from './projectWorkbench/httpNodeWorkbench/operation/requestOperation/refreshButton'
import layoutOperation from './projectWorkbench/httpNodeWorkbench/operation/layoutOperation'
import nodeHistory from './projectWorkbench/httpNodeWorkbench/operation/nodeHistory'
import variableCrud from './projectWorkbench/httpNodeWorkbench/operation/variableOperation/variableCrud'
import variableDialog from './projectWorkbench/httpNodeWorkbench/operation/variableOperation/variableDialog'
import variableUsage from './projectWorkbench/httpNodeWorkbench/operation/variableOperation/variableUsage'

// projectWorkbench - httpNodeWorkbench - operation - undoOperation
import requestUrlUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/requestUrlUndo'
import requestMethodUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/requestMethodUndo'
import queryKeyUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/queryParamsUndo/queryKeyUndo'
import queryValueUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/queryParamsUndo/queryValueUndo'
import queryDescriptionUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/queryParamsUndo/queryDescriptionUndo'
import querySendCheckboxUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/queryParamsUndo/querySendCheckboxUndo'
import queryRequiredCheckboxUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/queryParamsUndo/queryRequiredCheckboxUndo'
import queryDragUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/queryParamsUndo/queryDragUndo'
import urlQueryLinkUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/queryParamsUndo/urlQueryLinkUndo'
import pathKeyUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/pathParamsUndo/pathKeyUndo'
import pathValueUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/pathParamsUndo/queryValueUndo'
import pathDescriptionUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/pathParamsUndo/queryDescriptionUndo'
import pathSendCheckboxUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/pathParamsUndo/querySendCheckboxUndo'
import pathRequiredCheckboxUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/pathParamsUndo/queryRequiredCheckboxUndo'
import pathDragUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/pathParamsUndo/pathDragUndo'
import urlPathLinkUndo from './projectWorkbench/httpNodeWorkbench/operation/undoOperation/pathParamsUndo/urlPathLinkUndo'

// projectWorkbench - httpNodeWorkbench - operation - redoOperation
import requestUrlRedo from './projectWorkbench/httpNodeWorkbench/operation/redoOperation/requestUrlRedo'
import requestMethodRedo from './projectWorkbench/httpNodeWorkbench/operation/redoOperation/requestMethodRedo'
import queryParamsRedo from './projectWorkbench/httpNodeWorkbench/operation/redoOperation/queryParamsRedo'
import redoBoundary from './projectWorkbench/httpNodeWorkbench/operation/redoOperation/redoBoundary'

// projectWorkbench - httpNodeWorkbench - inputArea
import query from './projectWorkbench/httpNodeWorkbench/inputArea/query'
import customHeaders from './projectWorkbench/httpNodeWorkbench/inputArea/header/customHeaders'
import defaultHeaders from './projectWorkbench/httpNodeWorkbench/inputArea/header/defaultHeaders'
import headerPriority from './projectWorkbench/httpNodeWorkbench/inputArea/header/headerPriority'
import noneParams from './projectWorkbench/httpNodeWorkbench/inputArea/body/noneParams'
import stringOnlyFormdata from './projectWorkbench/httpNodeWorkbench/inputArea/body/formDataParams/stringOnlyFormdata'
import fileOnlyFormdata from './projectWorkbench/httpNodeWorkbench/inputArea/body/formDataParams/fileOnlyFormdata'
import mixedFormdata from './projectWorkbench/httpNodeWorkbench/inputArea/body/formDataParams/mixedFormdata'
import urlencodedParams from './projectWorkbench/httpNodeWorkbench/inputArea/body/urlencodedParams'
import json from './projectWorkbench/httpNodeWorkbench/inputArea/body/json'
import rawParams from './projectWorkbench/httpNodeWorkbench/inputArea/body/rawParams'
import binaryParams from './projectWorkbench/httpNodeWorkbench/inputArea/body/binaryParams'
import preScriptExecution from './projectWorkbench/httpNodeWorkbench/inputArea/preScript/scriptExecution'
import preScriptEditor from './projectWorkbench/httpNodeWorkbench/inputArea/preScript/editorFeatures'
import preScriptEnvVariable from './projectWorkbench/httpNodeWorkbench/inputArea/preScript/envVariableAccess'
import preScriptAfHttp from './projectWorkbench/httpNodeWorkbench/inputArea/preScript/af.http-API'
import preScriptAfRequest from './projectWorkbench/httpNodeWorkbench/inputArea/preScript/af.request-API'
import afterScriptExecution from './projectWorkbench/httpNodeWorkbench/inputArea/afterScript/scriptExecution'
import afterScriptEditor from './projectWorkbench/httpNodeWorkbench/inputArea/afterScript/editorFeatures'
import afterScriptAfResponse from './projectWorkbench/httpNodeWorkbench/inputArea/afterScript/af.response-API'
import afterScriptAfVariables from './projectWorkbench/httpNodeWorkbench/inputArea/afterScript/af.variables-API'
import afterScriptAfCookies from './projectWorkbench/httpNodeWorkbench/inputArea/afterScript/af.cookies-API'
import afterScriptAfLocalStorage from './projectWorkbench/httpNodeWorkbench/inputArea/afterScript/af.localStorage-API'
import afterScriptAfSessionStorage from './projectWorkbench/httpNodeWorkbench/inputArea/afterScript/af.sessionStorage-API'
import responseParams from './projectWorkbench/httpNodeWorkbench/inputArea/responseParams'
import remark from './projectWorkbench/httpNodeWorkbench/inputArea/remark'
import requestConfig from './projectWorkbench/httpNodeWorkbench/inputArea/httpNodeSettings/requestConfig'
import redirectConfig from './projectWorkbench/httpNodeWorkbench/inputArea/httpNodeSettings/redirectConfig'
import displayOrderConfig from './projectWorkbench/httpNodeWorkbench/inputArea/httpNodeSettings/displayOrderConfig'
import restoreDefault from './projectWorkbench/httpNodeWorkbench/inputArea/httpNodeSettings/restoreDefault'

// projectWorkbench - httpNodeWorkbench - responseArea
import responseBasicInfo from './projectWorkbench/httpNodeWorkbench/responseArea/responseBasicInfo'
import requestBasicInfo from './projectWorkbench/httpNodeWorkbench/responseArea/requestBasicInfo'
import responseValue from './projectWorkbench/httpNodeWorkbench/responseArea/responseDetails/responseValue'
import responseHeader from './projectWorkbench/httpNodeWorkbench/responseArea/responseDetails/responseHeader'
import responseCookie from './projectWorkbench/httpNodeWorkbench/responseArea/responseDetails/responseCookie'
import requestInfo from './projectWorkbench/httpNodeWorkbench/responseArea/responseDetails/requestInfo'
import rawValue from './projectWorkbench/httpNodeWorkbench/responseArea/responseDetails/rawValue'

// projectWorkbench - httpNodeWorkbench - httpNodeValidation
import requestUrlValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/requestUrlValidation'
import requestMethodValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/requestMethodValidation'
import queryParamsValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/queryParamsValidation'
import pathParamsValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/pathParamsValidation'
import noneBodyValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/bodyParams/noneBodyValidation'
import formdataBodyValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/bodyParams/formdataBodyValidation'
import formdataFileUploadValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/bodyParams/formdataFileUploadValidation'
import urlencodedBodyValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/bodyParams/urlencodedBodyValidation'
import jsonBodyValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/bodyParams/jsonBodyValidation'
import rawBodyValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/bodyParams/rawBodyValidation'
import binaryBodyValidation from './projectWorkbench/httpNodeWorkbench/httpNodeValidation/bodyParams/binaryBodyValidation'

export { type AtomicFunc, type ModelNode, type TestCase } from './types'

export const testCase: TestCase = [
  // 应用工作区
  {
    modelName: 'appWorkbench',
    description: '应用工作区',
    children: [
      {
        modelName: 'workbenchTop',
        description: '工作区顶部',
        children: [
          logo,
          navigation,
          navControl,
          quickIcons,
          windowControl,
        ],
      },
    ],
  },

  // 项目管理器
  {
    modelName: 'projectManager',
    description: '项目管理器',
    children: [
      projectList,
      createProject,
      searchProject,
    ],
  },

  // 项目辅助功能
  {
    modelName: 'projectAddon',
    description: '项目辅助功能',
    children: [
      {
        modelName: 'import',
        description: '导入',
        children: [
          apiflowImport,
          openapiImport,
          postmanImport,
          aiDataImport,
          codeRepoImport,
        ],
      },
      exportModule,
      variable,
      {
        modelName: 'commonHeader',
        description: '公共请求头',
        children: [
          globalCommonHeaders,
        ],
      },
    ],
  },

  // 项目工作区
  {
    modelName: 'projectWorkbench',
    description: '项目工作区',
    children: [
      // banner
      {
        modelName: 'banner',
        description: 'banner',
        children: [
          search,
          projectToggle,
          tools,
          {
            modelName: 'bannerDetails',
            description: 'banner详情区',
            children: [
              {
                modelName: 'nodeOperation',
                description: '节点操作区域',
                children: [
                  {
                    modelName: 'addNode',
                    description: '新增节点',
                    children: [
                      addHttpNode,
                      folderNode,
                      websocketNode,
                      httpMockNode,
                      websocketMockNode,
                      boundaryTest,
                    ],
                  },
                  {
                    modelName: 'deleteNode',
                    description: '删除节点',
                    children: [
                      deleteHttpNode,
                      deleteWebsocketNode,
                      deleteHttpMockNode,
                      deleteWebsocketMockNode,
                      deleteMixedNodes,
                      deleteFolder,
                    ],
                  },
                  {
                    modelName: 'renameNode',
                    description: '重命名节点',
                    children: [
                      renameHttpNode,
                      renameWebsocketNode,
                      renameHttpMockNode,
                      renameWebsocketMockNode,
                      renameFolder,
                    ],
                  },
                  {
                    modelName: 'copyNode',
                    description: '复制节点',
                    children: [
                      {
                        modelName: 'copyHttpNode',
                        description: '复制httpNode',
                        children: [
                          copySingleHttpNode,
                          copyMultipleHttpNode,
                        ],
                      },
                      {
                        modelName: 'copyWebsocketNode',
                        description: '复制websocketNode',
                        children: [
                          copySingleWebsocketNode,
                          copyMultipleWebsocketNode,
                        ],
                      },
                      {
                        modelName: 'copyHttpMockNode',
                        description: '复制httpMockNode',
                        children: [
                          copySingleHttpMockNode,
                          copyMultipleHttpMockNode,
                        ],
                      },
                      {
                        modelName: 'copyWebsocketMockNode',
                        description: '复制websocketMockNode',
                        children: [
                          copySingleWebsocketMockNode,
                          copyMultipleWebsocketMockNode,
                        ],
                      },
                      {
                        modelName: 'copyFolder',
                        description: '复制文件夹',
                        children: [
                          copySingleFolder,
                          copyMultipleFolder,
                        ],
                      },
                      {
                        modelName: 'copyMixedNodes',
                        description: '复制混合节点',
                        children: [
                          copyMixedNodeTypes,
                        ],
                      },
                    ],
                  },
                  {
                    modelName: 'cutNode',
                    description: '剪切节点',
                    children: [
                      {
                        modelName: 'cutHttpNode',
                        description: '剪切httpNode',
                        children: [
                          cutSingleHttpNode,
                          cutMultipleHttpNode,
                        ],
                      },
                      {
                        modelName: 'cutWebsocketNode',
                        description: '剪切websocketNode',
                        children: [
                          cutSingleWebsocketNode,
                          cutMultipleWebsocketNode,
                        ],
                      },
                      {
                        modelName: 'cutHttpMockNode',
                        description: '剪切httpMockNode',
                        children: [
                          cutSingleHttpMockNode,
                          cutMultipleHttpMockNode,
                        ],
                      },
                      {
                        modelName: 'cutWebsocketMockNode',
                        description: '剪切websocketMockNode',
                        children: [
                          cutSingleWebsocketMockNode,
                          cutMultipleWebsocketMockNode,
                        ],
                      },
                      {
                        modelName: 'cutFolder',
                        description: '剪切文件夹',
                        children: [
                          cutSingleFolder,
                          cutMultipleFolder,
                        ],
                      },
                      {
                        modelName: 'cutMixedNodes',
                        description: '剪切混合节点',
                        children: [
                          cutMixedNodeTypes,
                        ],
                      },
                      {
                        modelName: 'cutSpecialCases',
                        description: '剪切特殊情况',
                        children: [
                          cutWithoutPaste,
                        ],
                      },
                    ],
                  },
                  {
                    modelName: 'moveNode',
                    description: '移动节点',
                    children: [
                      {
                        modelName: 'moveHttpNode',
                        description: '移动httpNode',
                        children: [
                          moveSingleHttpNode,
                        ],
                      },
                      {
                        modelName: 'moveWebsocketNode',
                        description: '移动websocketNode',
                        children: [
                          moveSingleWebsocketNode,
                        ],
                      },
                      {
                        modelName: 'moveHttpMockNode',
                        description: '移动httpMockNode',
                        children: [
                          moveSingleHttpMockNode,
                        ],
                      },
                      {
                        modelName: 'moveWebsocketMockNode',
                        description: '移动websocketMockNode',
                        children: [
                          moveSingleWebsocketMockNode,
                        ],
                      },
                      {
                        modelName: 'moveFolder',
                        description: '移动文件夹',
                        children: [
                          moveSingleFolder,
                        ],
                      },
                      {
                        modelName: 'moveSpecialCases',
                        description: '移动特殊情况',
                        children: [
                          movePerformance,
                        ],
                      },
                    ],
                  },
                  {
                    modelName: 'contextMenu',
                    description: '鼠标右键',
                    children: [
                      contextMenuFolder,
                      contextMenuNonFolder,
                      contextMenuBlank,
                    ],
                  },
                  otherCases,
                ],
              },
            ],
          },
          bannerOtherFeatures,
        ],
      },

      // nav
      {
        modelName: 'nav',
        description: 'nav',
        children: [
          bannerNavInteraction,
          tabDrag,
        ],
      },

      // httpNodeWorkbench
      {
        modelName: 'httpNodeWorkbench',
        description: 'http节点工作区',
        children: [
          {
            modelName: 'operation',
            description: '操作区',
            children: [
              requestUrlInput,
              requestUrlDisplay,
              requestMethodInput,
              {
                modelName: 'requestOperation',
                description: '请求操作',
                children: [
                  sendButton,
                  saveButton,
                  refreshButton,
                ],
              },
              layoutOperation,
              nodeHistory,
              {
                modelName: 'variableOperation',
                description: '变量操作',
                children: [
                  variableCrud,
                  variableDialog,
                  variableUsage,
                ],
              },
              {
                modelName: 'undoOperation',
                description: '撤销操作',
                children: [
                  requestUrlUndo,
                  requestMethodUndo,
                  {
                    modelName: 'queryParamsUndo',
                    description: 'query参数撤销',
                    children: [
                      queryKeyUndo,
                      queryValueUndo,
                      queryDescriptionUndo,
                      querySendCheckboxUndo,
                      queryRequiredCheckboxUndo,
                      queryDragUndo,
                      urlQueryLinkUndo,
                    ],
                  },
                  {
                    modelName: 'pathParamsUndo',
                    description: 'path参数撤销',
                    children: [
                      pathKeyUndo,
                      pathValueUndo,
                      pathDescriptionUndo,
                      pathSendCheckboxUndo,
                      pathRequiredCheckboxUndo,
                      pathDragUndo,
                      urlPathLinkUndo,
                    ],
                  },
                ],
              },
              {
                modelName: 'redoOperation',
                description: '重做操作',
                children: [
                  requestUrlRedo,
                  requestMethodRedo,
                  queryParamsRedo,
                  redoBoundary,
                ],
              },
            ],
          },
          {
            modelName: 'inputArea',
            description: '输入区域',
            children: [
              query,
              {
                modelName: 'header',
                description: '请求头',
                children: [
                  customHeaders,
                  defaultHeaders,
                  headerPriority,
                ],
              },
              {
                modelName: 'body',
                description: '请求体',
                children: [
                  noneParams,
                  {
                    modelName: 'formDataParams',
                    description: 'form-data参数',
                    children: [
                      stringOnlyFormdata,
                      fileOnlyFormdata,
                      mixedFormdata,
                    ],
                  },
                  urlencodedParams,
                  json,
                  rawParams,
                  binaryParams,
                ],
              },
              {
                modelName: 'preScript',
                description: '前置脚本',
                children: [
                  preScriptExecution,
                  preScriptEditor,
                  preScriptEnvVariable,
                  preScriptAfHttp,
                  preScriptAfRequest,
                ],
              },
              {
                modelName: 'afterScript',
                description: '后置脚本',
                children: [
                  afterScriptExecution,
                  afterScriptEditor,
                  afterScriptAfResponse,
                  afterScriptAfVariables,
                  afterScriptAfCookies,
                  afterScriptAfLocalStorage,
                  afterScriptAfSessionStorage,
                ],
              },
              responseParams,
              remark,
              {
                modelName: 'httpNodeSettings',
                description: 'http节点设置',
                children: [
                  requestConfig,
                  redirectConfig,
                  displayOrderConfig,
                  restoreDefault,
                ],
              },
            ],
          },
          {
            modelName: 'responseArea',
            description: '响应区域',
            children: [
              responseBasicInfo,
              requestBasicInfo,
              {
                modelName: 'responseDetails',
                description: '响应详情',
                children: [
                  responseValue,
                  responseHeader,
                  responseCookie,
                  requestInfo,
                  rawValue,
                ],
              },
            ],
          },
          {
            modelName: 'httpNodeValidation',
            description: 'http节点校验',
            children: [
              requestUrlValidation,
              requestMethodValidation,
              queryParamsValidation,
              pathParamsValidation,
              {
                modelName: 'bodyParams',
                description: '请求体参数校验',
                children: [
                  noneBodyValidation,
                  formdataBodyValidation,
                  formdataFileUploadValidation,
                  urlencodedBodyValidation,
                  jsonBodyValidation,
                  rawBodyValidation,
                  binaryBodyValidation,
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
