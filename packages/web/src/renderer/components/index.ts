import { App, defineAsyncComponent } from 'vue'

export function registeGlobalComponent(app: App): void {
  const requireComponent = import.meta.glob('./**/g-*.vue'); ///g-.+\.(vue|js)$/
  Object.keys(requireComponent).forEach((fileName: string) => {
    // 获取组件配置
    const componentConfig = requireComponent[fileName];
    let componentName = '';
    const gName = fileName.match(/\/([^/]*)\.(vue|js)/)
    if (!gName) {
      throw new Error('公共组件必须在components下');
    } else {
      componentName = `s-${gName[1].replace(/g-/, '')}`;
    }
    app.component(componentName, defineAsyncComponent(componentConfig))
  });
}
