<template>
  <div class="s-array-view">
    <div class="header">
      <slot name="header" />
    </div>
    <div class="content">
      <div class="code-banner" :class="{ 'mr-4': plain }">
        <template v-for="(item, index) in astData">
          <div v-if="!item._hidden" :key="index" class="banner-wrap">
            <span class="number-line">{{ item.line }}</span>
            <el-icon v-if="item.leftCurlBrace.value || item.leftBracket.value" class="collapse"
              :class="{ close: item._close }" @click="toggleCollapse(item, index)">
              <arrow-down />
            </el-icon>
          </div>
        </template>
      </div>
      <div class="code-wrap">
        <template v-for="(item) in astData" :key="index">
          <span v-show="!item._hidden" class="line" :class="{ active: item._close }"
            @click.stop="handleCheckBraceMatch(item)">
            <span v-for="(indent) in item.indent" :key="indent" class="indent"></span>
            <span class="path">
              <s-emphasize :value="item.path.value" :keyword="queryString"></s-emphasize>
            </span>
            <span v-if="item.colon && item.path.value" class="colon">{{ item.colon }}</span>
            <span v-if="item.leftBracket.value" class="bracket"
              :class="{ active: activeBracketId && item.leftBracket.pairId === activeBracketId }">{{
                item.leftBracket.value }}</span>
            <span v-if="item.leftCurlBrace.value" class="curly-brace"
              :class="{ active: activeCurlyBraceId && item.leftCurlBrace.pairId === activeCurlyBraceId }">{{
                item.leftCurlBrace.value }}</span>
            <el-tooltip v-if="item.valueType === 'string'" :effect="Effect.LIGHT" :show-after="1500"
              :content="item.value" placement="bottom-start">
              <s-emphasize class="string-value" :value="item.value" :keyword="queryString"></s-emphasize>
            </el-tooltip>
            <span>
              <span v-if="item.valueType === 'number'" class="number-value">{{ item.value }}</span>
              <span v-if="item.valueType === 'boolean'" class="boolean-value">{{ item.value }}</span>
              <span v-if="item.valueType === 'null'" class="null-value">null</span>
              <span v-if="item.valueType === 'undefined'" class="undefined-value">undefined</span>
              <span v-if="item.valueType === 'file'" class="file-value">{{ item.value }}</span>
            </span>
            <span v-if="item.rightCurlBrace.value" class="curly-brace"
              :class="{ active: activeCurlyBraceId && item.rightCurlBrace.pairId === activeCurlyBraceId }">{{
                item.rightCurlBrace.value }}</span>
            <span class="bracket" :class="{ active: activeBracketId && item.rightBracket.pairId === activeBracketId }">{{
              item.rightBracket.value }}</span>
            <span class="comma">{{ item.comma }}</span>
            <span v-if="item.comma" class="orange ml-1">{{ item.required ? "" : `(${t('可选')})` }}</span>
            <el-tooltip v-if="item.description" :effect="Effect.LIGHT" :show-after="1500" :content="item.description"
              placement="bottom-start">
              <span class="description ml-1">
                //<s-emphasize :value="item.description" :keyword="queryString"></s-emphasize>
              </span>
            </el-tooltip>
            <span v-show="item._close" class="number-value"></span>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  PropType, watch, ref, Ref
} from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { Effect } from 'element-plus';
import { ApidocProperty, ApidocASTInfo } from '@src/types/global'
import { astJson } from './composables/astJson'
import { t } from 'i18next'

const props = defineProps({
  /**
     * 参数数据
     */
  data: {
    type: Array as PropType<ApidocProperty[]>,
    default: () => [],
  },
  /**
     * 是否为非复杂类型数据
     */
  plain: {
    type: Boolean,
    default: false,
  },
});
const astData: Ref<ApidocASTInfo[]> = ref([]);
const queryString = ref(''); //查询字符串
const activeCurlyBraceId = ref(''); //当前匹配的大括号id
const activeBracketId = ref(''); //当前匹配的中括号id
watch(() => props.data, (data) => {
  astData.value = astJson(data);
}, {
  deep: true,
  immediate: true,
});
//折叠代码块
const toggleCollapse = (item: ApidocASTInfo, index: number) => {
  if (!item._close) {
    item._close = true;
  } else {
    item._close = false;
  }
  const pairId = item.leftBracket.pairId || item.leftCurlBrace.pairId;
  for (let i = index + 1; i < astData.value.length; i += 1) {
    const astItem = astData.value[i];
    if (astItem.rightBracket.pairId === pairId || astItem.rightCurlBrace.pairId === pairId) {
      break;
    }
    if (item._close) {
      astItem._hidden = true;
    } else {
      astItem._hidden = false;
    }
  }
}
//点击进行括号匹配
const handleCheckBraceMatch = (item: ApidocASTInfo) => {
  const pairId = item.leftCurlBrace.pairId || item.rightCurlBrace.pairId;
  const bracketPairId = item.leftBracket.pairId || item.rightBracket.pairId;
  activeCurlyBraceId.value = pairId;
  activeBracketId.value = bracketPairId;
}

</script>

<style lang='scss' scoped>
.s-array-view {
  min-width: 100%;
  background: var(--gray-200);
  position: relative;
  font-size: 14px;
  background: #282c34;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;

  .header {
    padding: 0 20px;
    height: 30px;
    color: var(--gray-300);
    display: flex;
    align-items: center;
    position: relative;
    justify-content: flex-end;

    .search {
      &>input {
        height: 20px;
        line-height: 20px;
        margin-right: 20px;
        border: #434857;
        background: #5e637a;
        color: var(--gray-300);
        text-indent: 5px;

        &::placeholder {
          color: var(--gray-300);
          font-size: 12px;
        }
      }
    }
  }

  .content {
    display: inline-flex;
    width: 100%;
    overflow-y: auto;
    max-height: 400px;
    padding-bottom: 15px;

    &::-webkit-scrollbar {
      background: #797e9d;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--gray-600);
    }

    &::-webkit-scrollbar-track {
      background: #282c34;
    }

    .code-banner {
      flex: 0 0 auto;
      width: 50px;
      border-right: 1px solid var(--gray-600);
      height: 100%;

      &:hover {
        .collapse {
          display: inline-flex !important;
        }
      }

      .banner-wrap {
        position: relative;
        display: flex;
        align-items: center;

        .number-line {
          flex: 0 0 auto;
          width: 30px;
          height: 20px;
          color: var(--gray-500);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace;
        }

        .collapse {
          width: 20px;
          height: 20px;
          color: var(--gray-300);
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          transition: color .4s;
          user-select: none;

          &.close {
            transform: rotate(-90deg);
            display: inline-flex !important;
          }

          &:hover {
            color: var(--gray-100);
          }
        }
      }
    }

    .code-wrap {
      flex: 1;
      width: 0;

      .line {
        min-height: 20px;
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:hover {
          background: #434857;
        }

        &.active {
          background: var(--gray-700);
        }

        &.error {
          animation: blink 4s infinite alternate;
        }

        @keyframes blink {
          0% {
            opacity: 1;
            background: rgb(116, 116, 67);
          }

          100% {
            background: inherit;
          }
        }
      }

      .checkbox {
        display: inline-flex;
        width: 12px;
        height: 12px;
        margin-right: 5px;
        background: var(--gray-800);
        border: 1px solid var(--gray-500);
        cursor: pointer;

        &:hover {
          border: 1px solid var(--gray-300);
        }

        input[type=checkbox] {
          display: none;
        }

        .icon {
          font-size: 10px;
          color: var(--white);
        }
      }

      .indent {
        user-select: text;
        height: 20px;
        flex: 0 0 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .path {
        color: #f8c555,
      }

      .description {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #6A9955;
        cursor: text;
      }

      .colon {
        margin-right: 5px;
      }

      .colon,
      .bracket,
      .comma,
      .curly-brace {
        color: #ccc;
        font-family: source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace;
      }

      .curly-brace {
        border: 1px solid transparent;

        &.active {
          color: var(--red);
          border: 1px solid var(--gray-400);
        }
      }

      .bracket {
        border: 1px solid transparent;

        &.active {
          color: var(--orange);
          border: 1px solid var(--gray-400);
        }
      }

      .string-value {
        color: #7ec699;
        font-size: .9em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 50%;
        flex: 0 0 auto;
      }

      .boolean-value {
        color: #cc99cd;
        font-size: .9em;
      }

      .number-value {
        color: #ccc;
        font-size: .9em;
      }

      .null-value {
        color: #f60;
        font-size: .9em;
      }

      .file-value {
        color: #7ec699;
        font-size: .9em;
      }
    }
  }
}
</style>
