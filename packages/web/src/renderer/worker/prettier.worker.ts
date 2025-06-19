import * as prettier from 'prettier/standalone';
import cssPlugin from 'prettier/plugins/postcss';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import htmlPlugin from 'prettier/plugins/html';
self.onmessage = async (event) => {
  const { type, code } = event.data;
  try {
    let formatted = code;
    if (type === 'format-css') {
      formatted = await prettier.format(code, {
        parser: 'css',
        plugins: [cssPlugin],
      });
    } else if (type === 'format-js') {
      formatted = await prettier.format(code, {
        parser: 'babel',
        plugins: [babelPlugin, estreePlugin],
      });
    } else if (type === 'format-html') {
      formatted = await prettier.format(code, {
        parser: 'html',
        plugins: [htmlPlugin],
      });
    } else if (type === 'format-json') {
      formatted = await prettier.format(code, {
        parser: "json",
        plugins: [babelPlugin, estreePlugin],
        printWidth: 50,
        tabWidth: 4
      });
    }
    self.postMessage({ type: `${type}-result`, formatted });
  } catch (err) {
    self.postMessage({ type: `${type}-result`, formatted: code });
  }
};
