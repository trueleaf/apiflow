import {  VNode, Slots } from 'vue'
import { forEachForest } from '@/helper/index'

const initRules = (slots: Slots): Record<string, unknown> => {
  const rules: Record<string, unknown[]> = {};
  if (slots.default) {
    const allSlots = slots.default();
    let rulePath: string;
    forEachForest<VNode>(allSlots, (slot: VNode) => {
      const slotType = slot.type;
      const propsData = slot.props;
      if (typeof slotType === 'object' && (slotType as Record<string, unknown>).__name === 'g-form-item') {
        if (propsData && propsData.prop) {
          rules[propsData.prop] = [];
          rulePath = propsData.prop;
        }
        //填充必填项目rule规则
        if (propsData && (propsData.required === '' || propsData.required)) {
          const inputType = propsData.type;
          if (inputType == null || inputType === 'input' || inputType === 'textarea' || inputType === 'remarks' || inputType === 'password' || inputType === 'number') { //普通输入框blur触发验证
            rules[rulePath].push({ required: true, message: `请输入${propsData.label}`, trigger: 'blur' });
          } else if (inputType === 'select' || inputType === 'date' || inputType === 'daterange') { //日期，单选，多选触发 blur
            rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: 'change' });
            rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: 'blur' });
          } else if (inputType === 'upload') {
            rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: 'change' });
          } else if (inputType === 'boolean') {
            rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: ['blur', 'change'] });
          } else if (inputType === 'radio') {
            rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: ['blur', 'change'] });
          }
        }
        //填充字符最小长度规则
        if (propsData && propsData.minLen) {
          const inputType = propsData.type;
          if (inputType == null || inputType === 'input' || inputType === 'password') { //普通输入框blur触发验证
            rules[rulePath].push({ min: propsData.minLen, message: `${propsData.label}至少${propsData.minLen}位`, trigger: 'blur' });
          }
        }
        //填充字符最大度规则
        if (propsData && propsData.maxLen) {
          const inputType = propsData.type;
          if (inputType == null || inputType === 'input' || inputType === 'password') { //普通输入框blur触发验证
            rules[rulePath].push({ max: propsData.maxLen, message: `${propsData.label}最多${propsData.maxLen}位`, trigger: 'blur' });
          }
        }
        //填充字符长度规则
        if (propsData && propsData.len) {
          const inputType = propsData.type;
          if (inputType == null || inputType === 'input' || inputType === 'password') { //普通输入框blur触发验证
            rules[rulePath].push({ len: propsData.len, message: `${propsData.label}应该为${propsData.len}位`, trigger: 'blur' });
          }
        }
        //填充email规则
        const validateEmail = (_: unknown, value: string, callback: (err?: Error) => void) => {
          if (value === null || value.match(/\w+@.*\.\w+/)) {
            callback();
          } else {
            callback(new Error('请填写正确邮箱'));
          }
        };
        if (propsData && (propsData.email || propsData.email === '')) {
          const inputType = propsData.type;
          if (inputType == null || inputType === 'input') { //普通输入框才能填充email规则
            rules[rulePath].push({ validator: validateEmail, trigger: 'blur' });
          }
        }
        //填充手机号规则
        const validatePhone = (_: unknown, value: string, callback: (err?: Error) => void) => {
          if (value === null || value.match(/^\d{11}$/)) {
            callback();
          } else {
            callback(new Error('请填写正确手机号'));
          }
        };
        if (propsData && (propsData.phone || propsData.phone === '')) {
          const inputType = propsData.type;
          if (inputType == null || inputType === 'input') { //普通输入框才能填充手机号规则
            rules[rulePath].push({ validator: validatePhone, trigger: 'blur' });
          }
        }
      }
    })
  }
  return rules;
}
export default initRules;
