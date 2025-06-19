<template>
  <el-button :disabled="disableBtn" @click="handleClickButton">{{ tip }}</el-button>
</template>

<script lang="ts" setup>
import { t } from 'i18next'
import { onUnmounted, ref } from 'vue';

const props = defineProps({
  startLabel: {
    type: String,
    default: t('获取验证码'),
  },
  waitLabel: {
    type: String,
    default: t('重新发送')
  },
  endLabel: {
    type: String,
    default: t('重新获取')
  },
  hook: {
    type: Function,
    default: null
  },
  countdown: {
    type: Number,
    default: 60
  },
})
const emits = defineEmits(['click'])
const tip = ref(props.startLabel);
const disableBtn = ref(false);
const time = ref(props.countdown);
const timer = ref(0);
/*
|--------------------------------------------------------------------------
| 函数定义
|--------------------------------------------------------------------------
*/
//点击按钮
const handleClickButton = () => {
  if (props.hook && props.hook()) {
    changeState();
  } else if (!props.hook) {
    changeState();
  }
}
//处理倒计时
const changeState = () => {
  const speed = process.env.NODE_ENV === 'development' ? 100 : 1000;
  clearInterval(timer.value); //清除上次的定时器
  disableBtn.value = true;
  emits('click');
  tip.value = `${time.value}秒后${props.endLabel}`
  timer.value = window.setInterval(() => {
    time.value -= 1;
    if (time.value === 0) {
      tip.value = props.endLabel;
      disableBtn.value = false;
      clearInterval(timer.value);
      time.value = props.countdown;
    } else {
      tip.value = `${time.value}秒后${props.endLabel}`
    }
  }, speed);
}
const resetState = () => {
  tip.value = props.startLabel;
  disableBtn.value = false;
  time.value = props.countdown;
  clearInterval(timer.value);
}
defineExpose({
  resetState
})

onUnmounted(() => {
  clearInterval(timer.value);
})

</script>
