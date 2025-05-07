/**
 * @description        mock数据
 * @author             shuxiaokai
 * @create             2021-04-29 21:50
 */
import { t } from 'i18next';

export default [
  //=====================================中文文本====================================//
  {
    name: '中文名称',
    value: 'cname',
    tags: ['常用', '中文文本'],
  },
  {
    name: '中文单词',
    value: 'cword',
    tags: ['中文文本'],
  },
  {
    name: '中文句子',
    value: 'csentence',
    tags: ['中文文本'],
  },
  {
    name: '中文段落',
    value: 'cparagraph',
    tags: ['中文文本'],
  },
  {
    name: '中文标题',
    value: 'ctitle',
    tags: ['中文文本'],
  },
  //=====================================英文文本====================================//
  {
    name: '英文名称',
    value: 'name',
    tags: ['英文文本'],
  },
  {
    name: '英文段落',
    value: 'paragraph',
    tags: ['英文文本'],
  },
  {
    name: '英文句子',
    value: 'sentence',
    tags: ['英文文本'],
  },
  {
    name: '英文单词',
    value: 'word',
    tags: ['英文文本'],
  },
  {
    name: '英文标题',
    value: 'title',
    tags: ['英文文本'],
  },
  //=====================================布尔值====================================//
  {
    name: '布尔值',
    value: 'boolean',
    tags: ['常用'],
  },
  //=====================================数字====================================//
  {
    name: '自然数(0,1,2,3,4)',
    value: 'natural',
    tags: ['数字'],
  },
  {
    name: '自然数(大于100)',
    value: 'natural(100)',
    tags: ['数字'],
  },
  {
    name: '自然数(大于100小于200)',
    value: 'natural(100,200)',
    tags: ['数字'],
  },
  {
    name: '整数(-22,1,23)',
    value: 'int',
    tags: ['数字'],
  },
  {
    name: '整数(大于100)',
    value: 'in100)',
    tags: ['数字'],
  },
  {
    name: '整数(大于100小于200)',
    value: 'in100,200)',
    tags: ['数字'],
  },
  {
    name: '浮点数',
    value: 'float',
    tags: ['数字'],
  },
  //=========================================================================//
  {
    name: '字符串',
    value: 'string',
    tags: ['英文文本'],
  },
  {
    name: '字符串(长度为5)',
    value: 'string(5)',
    tags: ['常用', '英文文本'],
  },
  //=====================================日期时间====================================//
  {
    name: '时间戳(精确到毫秒13位)',
    value: 'timestamp',
    tags: ['常用', '日期/时间'],
  },
  {
    name: '时间戳(精确到秒10位)',
    value: 'timestamp2',
    tags: ['常用', '日期/时间'],
  },
  {
    name: '开始时间，可接受两个可选参数startTime(\'2022-xx-xx\', \'YYYY-MM-DD\'',
    value: 'startTime',
    tags: ['常用', '日期/时间'],
  },
  {
    name: '结束时间(结束时间晚于开始时间)',
    value: 'endTime',
    tags: ['常用', '日期/时间'],
  },

  {
    name: '日期(年月日)',
    value: 'date',
    tags: ['日期/时间'],
  },
  {
    name: '时间(时分秒)',
    value: 'time',
    tags: ['日期/时间'],
  },
  {
    name: '日期时间',
    value: 'datetime',
    tags: ['日期/时间'],
  },
  {
    name: '当前日期时间',
    value: 'now',
    tags: ['常用', '日期/时间'],
  },
  //=====================================颜色====================================//
  {
    name: '颜色(#ff6600)',
    value: 'color',
    tags: ['颜色'],
  },
  {
    name: '颜色(#ff6600)',
    value: 'hex',
    tags: ['颜色'],
  },
  {
    name: '颜色(rgb(122,122,122))',
    value: 'rgb',
    tags: ['颜色'],
  },
  {
    name: '颜色rgb(122,122,122, 0.3)',
    value: 'rgba',
    tags: ['颜色'],
  },
  {
    name: '颜色hsl(222, 11, 31)',
    value: 'hsl',
    tags: ['颜色'],
  },
  //=====================================图片====================================//
  {
    name: '图片',
    value: 'image',
    tags: ['图片'],
  },
  {
    name: '图片(150x100)',
    value: 'image(150,100)',
    tags: ['图片', '常用'],
  },
  {
    name: 'base64图片数据',
    value: 'dataImage',
    tags: ['图片'],
  },
  {
    name: 'base64图片数据100x100',
    value: 'dataImage(100x100)',
    tags: ['图片', '常用'],
  },

  {
    name: '省',
    value: 'province',
    tags: ['地区相关'],
  },
  {
    name: '市',
    value: 'city',
    tags: ['地区相关'],
  },
  {
    name: '区',
    value: 'county',
    tags: ['地区相关'],
  },
];
