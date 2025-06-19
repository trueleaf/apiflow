module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  files: ['src/**/*'],
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
    config: "readonly",
    $t: "readonly",
  },
  extends: [
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "@vue/airbnb",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {},
};
