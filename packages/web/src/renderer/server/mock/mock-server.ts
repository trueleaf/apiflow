// import type Koa from 'koa'
// import FileType from 'file-type/browser';
// import cors from '@koa/cors'
// import { config } from '@/../config/config'
// import { store } from '@/store/index'
// import { apidocConvertValue, event, sleep } from '@/helper/index'
// import { request } from '@/api/api'
// import { ApidocDetail } from '@src/types'
// import apidocConverter from '../request/utils'
// // import Mock from "./mock"

// let app: Koa | null = null;

// export const mockServer = (): void => {
//   if (!config.renderConfig.mock.isEnabled) {
//     return;
//   }
//   if (!window.require) {
//     return;
//   }
//   console.log('初始化mock服务器')
//   if (!app) {
//     const KoaModel = window.require('koa')
//     app = new KoaModel();
//     let serverPort = config.renderConfig.mock.port;
//     if (app) {
//       app.use(cors());
//       store.commit('apidoc/mock/changeMockServerState', 'connecting')
//       store.commit('apidoc/mock/changeMockServerPort', serverPort)
//       let appInstance = app.listen(serverPort, () => {
//         store.commit('apidoc/mock/changeMockServerState', 'connection')
//       });
//       //错误处理
//       appInstance.on('error', (err: { code: string }) => {
//         console.error(err)
//         if (err.code === 'EADDRINUSE') {
//           serverPort += 1;
//                     app?.listen(serverPort);
//                     store.commit('apidoc/mock/changeMockServerPort', serverPort)
//         }
//       });
//       //服务器端口
//       appInstance.on('close', () => {
//         store.commit('apidoc/mock/changeMockServerState', 'disconnection')
//       })
//       //关闭服务器
//       event.on('apidoc/mock/closeMockServer', () => {
//         store.commit('apidoc/mock/changeMockServerState', 'closing')
//         appInstance.close((err) => {
//           if (err) {
//             store.commit('apidoc/mock/changeMockServerState', 'error')
//             console.error(err)
//           } else {
//             store.commit('apidoc/mock/changeMockServerState', 'disconnection')
//           }
//         })
//       })
//       //打开服务器
//       event.on('apidoc/mock/openMockServer', () => {
//         if (app) {
//           store.commit('apidoc/mock/changeMockServerState', 'connecting');
//           appInstance = app.listen(serverPort, () => {
//             store.commit('apidoc/mock/changeMockServerState', 'connection')
//           });
//         }
//       })
//       //重启服务器
//       event.on('apidoc/mock/restartMockServer', () => {
//         appInstance.close((err) => {
//           if (err) {
//             store.commit('apidoc/mock/changeMockServerState', 'error')
//             console.error(err)
//           } else {
//             store.commit('apidoc/mock/changeMockServerState', 'disconnection')
//             const port = store.state['apidoc/mock'].mockServerPort
//             if (app) {
//               store.commit('apidoc/mock/changeMockServerState', 'connecting');
//               appInstance = app.listen(port, () => {
//                 store.commit('apidoc/mock/changeMockServerState', 'connection')
//               });
//             }
//           }
//         })
//       })
//     }
//   }
//   if (!app) {
//     return;
//   }
//   app.use(async (ctx) => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     let fs: any = null;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     let path: any = null;
//     if (window.require) {
//       // eslint-disable-next-line prefer-destructuring
//       fs = window.require('fs-extra');
//       // eslint-disable-next-line prefer-destructuring
//       path = window.require('path');
//     } else {
//       console.error('web端无法发送文件');
//     }
//     const url = ctx.request.url.replace(/(?<=)\?.*/, '');
//     const method = ctx.request.method.toLowerCase();
//     const { mockInfo } = store.state['apidoc/apidoc'].apidoc;
//     const realMockInfo = {} as ApidocDetail['mockInfo']; //最终的mock数据
//     const matchedReuqest = store.state['apidoc/mock'].urlMap.find((data) => {
//       const isSameMethod = data.method.toLocaleLowerCase() === method.toLocaleLowerCase();
//       return (data.url === url || data.customMockUrl === url) && isSameMethod;
//     });
//     if (matchedReuqest) {
//       const params = {
//         projectId: matchedReuqest.projectId,
//         _id: matchedReuqest.id,
//       };
//       try {
//         const localApis = JSON.parse(localStorage.getItem('apidoc/apidoc') || '{}');
//         const localApi = localApis[matchedReuqest.id];
//         let remoteMockInfo = null;
//         let realApidocDetail: ApidocDetail;
//         if (localApi) {
//           remoteMockInfo = localApi.mockInfo;
//           realApidocDetail = localApi
//         } else {
//           const res = await request.get('/api/project/doc_detail', { params });
//           realApidocDetail = res.data as ApidocDetail;
//           remoteMockInfo = res.data.mockInfo
//         }
//         if (realApidocDetail.item.responseParams.every(v => !v.isMock)) {
//           realApidocDetail.item.responseParams[0].isMock = true;
//         }
//         //若全部返回数据isMock都为false，则取第一条数据为mock数据
//         const matchedRawBody = realApidocDetail.item.responseParams.find(v => v.isMock);
//         const responseStrJson = matchedRawBody?.value.strJson || realApidocDetail.item.responseParams[0]?.value.strJson;
//         mockInfo.responseHeaders.filter(v => v.key && v.value && v.select).forEach(header => {
//           const realValue = apidocConvertValue(header.value);
//           if (realValue.match(/[\u4E00-\u9FA5]/)) {
//             throw new Error('不允许请求头值为中文')
//           }
//           ctx.set(header.key, realValue)
//         })
//         Object.assign(realMockInfo, remoteMockInfo, mockInfo)
//         const { responseType, json, image, file, text } = realMockInfo;
//         await sleep(realMockInfo.responseDelay)
//         ctx.set('connection', 'close'); //防止keep-alive无法立即结束http链接
//         ctx.status = realMockInfo.httpStatusCode;
//         if (responseType === 'json' && json) {
//           const realJson = apidocConverter.convertMockJsonToRealJson(json);
//           ctx.body = JSON.parse(realJson);
//         } else if (responseType === 'json' && !json) {
//           ctx.body = JSON.parse(apidocConverter.convertMockJsonToRealJson(responseStrJson));
//         } else if (responseType === 'image') {
//           const imageBase64 = await apidocConverter.createMockImage(image);
//           const base64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
//           const buffer = window.Buffer.from(`${btoa(`${atob(base64)}${'x'.repeat(image.size * 1024)}`)}`, 'base64');
//           ctx.set('Content-Type', `image/${image.type}`);
//           ctx.body = buffer
//         } else if (responseType === 'file' && file.type === 'doc') {
//           const fileData = await fs.readFile(path.resolve('public/mock-file/mock.doc'));
//           ctx.set('Content-Type', 'application/msword');
//           ctx.body = fileData
//         } else if (responseType === 'file' && file.type === 'docx') {
//           const fileData = await fs.readFile(path.resolve('public/mock-file/mock.docx'));
//           ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//           ctx.body = fileData
//         } else if (responseType === 'file' && file.type === 'xls') {
//           const fileData = await fs.readFile(path.resolve('public/mock-file/mock.xls'));
//           ctx.set('Content-Type', 'application/vnd.ms-excel');
//           ctx.body = fileData
//         } else if (responseType === 'file' && file.type === 'xlsx') {
//           const fileData = await fs.readFile(path.resolve('public/mock-file/mock.xlsx'));
//           ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//           ctx.body = fileData
//         } else if (responseType === 'file' && file.type === 'pdf') {
//           const fileData = await fs.readFile(path.resolve('public/mock-file/mock.pdf'));
//           ctx.set('Content-Type', 'application/pdf');
//           ctx.body = fileData
//         } else if (responseType === 'file' && file.type === 'zip') {
//           const fileData = await fs.readFile(path.resolve('public/mock-file/mock.zip'));
//           ctx.set('Content-Type', 'application/x-zip-compressed');
//           ctx.body = fileData
//         } else if (responseType === 'file' && file.type === 'custom' && file.filePath) {
//           const bufferFile = await fs.readFile(file.filePath);
//           const fileTypeInfo = await FileType.fileTypeFromBuffer(bufferFile);
//           ctx.set('Content-Type', fileTypeInfo?.mime || '');
//           ctx.body = bufferFile;
//         } else if (responseType === 'file' && file.type === 'custom' && !file.filePath) {
//           ctx.body = '未选择自定义文件';
//         } else if (responseType === 'text') {
//           ctx.set('Content-Type', 'text/plain; charset=utf-8');
//           ctx.body = text;
//         } else {
//           ctx.body = '';
//         }
//       } catch (error) {
//         console.error(error)
//         ctx.body = `Error: ${(error as Error).message}`;
//       }
//     } else {
//       ctx.body = {
//         code: -1,
//         Info: {
//           msg: '未匹配到相关的Mock接口',
//           url,
//           method,
//           urlList: store.state['apidoc/mock'].urlMap,
//         },
//       };
//     }
//   });
// }
