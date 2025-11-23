import type { MockItem, MockCategory } from '@src/types';

export const mockCategories: MockCategory[] = [
  { key: 'common', label: '常用' },
  { key: 'person', label: '人员' },
  { key: 'text', label: '文本' },
  { key: 'datetime', label: '日期时间' },
  { key: 'number', label: '数字' },
  { key: 'address', label: '地址' },
  { key: 'image', label: '图片' },
  { key: 'color', label: '颜色' },
  { key: 'network', label: '网络' },
  { key: 'other', label: '其他' },
];

// Mock.js 数据
const mockjsData: MockItem[] = [
  // 常用
  { name: '中文名称', value: 'cname', tags: ['常用', '人员'], source: 'mockjs', category: 'common' },
  { name: '布尔值', value: 'boolean', tags: ['常用'], source: 'mockjs', category: 'common' },
  { name: '时间戳(13位)', value: 'timestamp', tags: ['常用', '日期时间'], source: 'mockjs', category: 'common' },
  { name: '图片(150x100)', value: 'image(150,100)', tags: ['常用', '图片'], source: 'mockjs', category: 'common' },
  { name: 'base64图片(100x100)', value: 'dataImage(100x100)', tags: ['常用', '图片'], source: 'mockjs', category: 'common' },
  { name: 'GUID', value: 'guid', tags: ['常用'], source: 'mockjs', category: 'common' },

  // 人员
  { name: '中文名称', value: 'cname', tags: ['人员'], source: 'mockjs', category: 'person' },
  { name: '英文名称', value: 'name', tags: ['人员'], source: 'mockjs', category: 'person' },

  // 文本
  { name: '中文单词', value: 'cword', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '中文句子', value: 'csentence', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '中文段落', value: 'cparagraph', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '中文标题', value: 'ctitle', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '英文段落', value: 'paragraph', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '英文句子', value: 'sentence', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '英文单词', value: 'word', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '英文标题', value: 'title', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '字符串', value: 'string', tags: ['文本'], source: 'mockjs', category: 'text' },
  { name: '字符串(长度5)', value: 'string(5)', tags: ['文本'], source: 'mockjs', category: 'text' },

  // 日期时间
  { name: '时间戳(13位)', value: 'timestamp', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },
  { name: '时间戳(10位)', value: 'timestamp2', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },
  { name: '开始时间', value: 'startTime', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },
  { name: '结束时间', value: 'endTime', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },
  { name: '日期', value: 'date', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },
  { name: '时间', value: 'time', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },
  { name: '日期时间', value: 'datetime', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },
  { name: '当前时间', value: 'now', tags: ['日期时间'], source: 'mockjs', category: 'datetime' },

  // 数字
  { name: '自然数', value: 'natural', tags: ['数字'], source: 'mockjs', category: 'number' },
  { name: '自然数(>100)', value: 'natural(100)', tags: ['数字'], source: 'mockjs', category: 'number' },
  { name: '自然数(100-200)', value: 'natural(100,200)', tags: ['数字'], source: 'mockjs', category: 'number' },
  { name: '整数', value: 'int', tags: ['数字'], source: 'mockjs', category: 'number' },
  { name: '整数(>100)', value: 'int(100)', tags: ['数字'], source: 'mockjs', category: 'number' },
  { name: '整数(100-200)', value: 'int(100,200)', tags: ['数字'], source: 'mockjs', category: 'number' },
  { name: '浮点数', value: 'float', tags: ['数字'], source: 'mockjs', category: 'number' },

  // 地址
  { name: '省', value: 'province', tags: ['地址'], source: 'mockjs', category: 'address' },
  { name: '市', value: 'city', tags: ['地址'], source: 'mockjs', category: 'address' },
  { name: '区', value: 'county', tags: ['地址'], source: 'mockjs', category: 'address' },

  // 图片
  { name: '图片', value: 'image', tags: ['图片'], source: 'mockjs', category: 'image' },
  { name: '图片(150x100)', value: 'image(150,100)', tags: ['图片'], source: 'mockjs', category: 'image' },
  { name: 'base64图片', value: 'dataImage', tags: ['图片'], source: 'mockjs', category: 'image' },
  { name: 'base64图片(100x100)', value: 'dataImage(100x100)', tags: ['图片'], source: 'mockjs', category: 'image' },

  // 颜色
  { name: '颜色(hex)', value: 'color', tags: ['颜色'], source: 'mockjs', category: 'color' },
  { name: 'hex', value: 'hex', tags: ['颜色'], source: 'mockjs', category: 'color' },
  { name: 'rgb', value: 'rgb', tags: ['颜色'], source: 'mockjs', category: 'color' },
  { name: 'rgba', value: 'rgba', tags: ['颜色'], source: 'mockjs', category: 'color' },
  { name: 'hsl', value: 'hsl', tags: ['颜色'], source: 'mockjs', category: 'color' },

  // 网络
  { name: 'URL', value: 'url', tags: ['网络'], source: 'mockjs', category: 'network' },
  { name: '域名', value: 'domain', tags: ['网络'], source: 'mockjs', category: 'network' },
  { name: 'Email', value: 'email', tags: ['网络'], source: 'mockjs', category: 'network' },
  { name: 'IP', value: 'ip', tags: ['网络'], source: 'mockjs', category: 'network' },

  // 其他
  { name: 'GUID', value: 'guid', tags: ['其他'], source: 'mockjs', category: 'other' },
  { name: 'ID', value: 'id', tags: ['其他'], source: 'mockjs', category: 'other' },
];

// Faker.js 数据
const fakerData: MockItem[] = [
  // 常用
  { name: '全名', value: 'person.fullName', tags: ['常用', '人员'], source: 'faker', category: 'common' },
  { name: '整数', value: 'number.int', tags: ['常用', '数字'], source: 'faker', category: 'common' },
  { name: '最近日期', value: 'date.recent', tags: ['常用', '日期时间'], source: 'faker', category: 'common' },
  { name: 'UUID', value: 'string.uuid', tags: ['常用'], source: 'faker', category: 'common' },
  { name: 'Email', value: 'internet.email', tags: ['常用', '网络'], source: 'faker', category: 'common' },
  { name: '手机号', value: 'phone.number', tags: ['常用'], source: 'faker', category: 'common' },

  // 人员
  { name: '全名', value: 'person.fullName', tags: ['人员'], source: 'faker', category: 'person' },
  { name: '名', value: 'person.firstName', tags: ['人员'], source: 'faker', category: 'person' },
  { name: '姓', value: 'person.lastName', tags: ['人员'], source: 'faker', category: 'person' },
  { name: '性别', value: 'person.sex', tags: ['人员'], source: 'faker', category: 'person' },
  { name: '职位', value: 'person.jobTitle', tags: ['人员'], source: 'faker', category: 'person' },
  { name: '职业类型', value: 'person.jobType', tags: ['人员'], source: 'faker', category: 'person' },
  { name: '生物特征', value: 'person.bio', tags: ['人员'], source: 'faker', category: 'person' },

  // 文本
  { name: '单词', value: 'lorem.word', tags: ['文本'], source: 'faker', category: 'text' },
  { name: '多个单词', value: 'lorem.words', tags: ['文本'], source: 'faker', category: 'text' },
  { name: '句子', value: 'lorem.sentence', tags: ['文本'], source: 'faker', category: 'text' },
  { name: '多个句子', value: 'lorem.sentences', tags: ['文本'], source: 'faker', category: 'text' },
  { name: '段落', value: 'lorem.paragraph', tags: ['文本'], source: 'faker', category: 'text' },
  { name: '多个段落', value: 'lorem.paragraphs', tags: ['文本'], source: 'faker', category: 'text' },
  { name: '文本', value: 'lorem.text', tags: ['文本'], source: 'faker', category: 'text' },
  { name: '行', value: 'lorem.lines', tags: ['文本'], source: 'faker', category: 'text' },

  // 日期时间
  { name: '过去日期', value: 'date.past', tags: ['日期时间'], source: 'faker', category: 'datetime' },
  { name: '未来日期', value: 'date.future', tags: ['日期时间'], source: 'faker', category: 'datetime' },
  { name: '最近日期', value: 'date.recent', tags: ['日期时间'], source: 'faker', category: 'datetime' },
  { name: '即将到来', value: 'date.soon', tags: ['日期时间'], source: 'faker', category: 'datetime' },
  { name: '出生日期', value: 'date.birthdate', tags: ['日期时间'], source: 'faker', category: 'datetime' },
  { name: '月份', value: 'date.month', tags: ['日期时间'], source: 'faker', category: 'datetime' },
  { name: '星期', value: 'date.weekday', tags: ['日期时间'], source: 'faker', category: 'datetime' },

  // 数字
  { name: '整数', value: 'number.int', tags: ['数字'], source: 'faker', category: 'number' },
  { name: '浮点数', value: 'number.float', tags: ['数字'], source: 'faker', category: 'number' },
  { name: '二进制', value: 'number.binary', tags: ['数字'], source: 'faker', category: 'number' },
  { name: '八进制', value: 'number.octal', tags: ['数字'], source: 'faker', category: 'number' },
  { name: '十六进制', value: 'number.hex', tags: ['数字'], source: 'faker', category: 'number' },

  // 地址
  { name: '城市', value: 'location.city', tags: ['地址'], source: 'faker', category: 'address' },
  { name: '国家', value: 'location.country', tags: ['地址'], source: 'faker', category: 'address' },
  { name: '街道地址', value: 'location.streetAddress', tags: ['地址'], source: 'faker', category: 'address' },
  { name: '邮编', value: 'location.zipCode', tags: ['地址'], source: 'faker', category: 'address' },
  { name: '纬度', value: 'location.latitude', tags: ['地址'], source: 'faker', category: 'address' },
  { name: '经度', value: 'location.longitude', tags: ['地址'], source: 'faker', category: 'address' },
  { name: '时区', value: 'location.timeZone', tags: ['地址'], source: 'faker', category: 'address' },

  // 图片
  { name: '图片URL', value: 'image.url', tags: ['图片'], source: 'faker', category: 'image' },
  { name: '头像', value: 'image.avatar', tags: ['图片'], source: 'faker', category: 'image' },
  { name: '头像(GitHub)', value: 'image.avatarGitHub', tags: ['图片'], source: 'faker', category: 'image' },
  { name: 'URL占位图', value: 'image.urlPlaceholder', tags: ['图片'], source: 'faker', category: 'image' },

  // 颜色
  { name: 'RGB', value: 'color.rgb', tags: ['颜色'], source: 'faker', category: 'color' },
  { name: 'HSL', value: 'color.hsl', tags: ['颜色'], source: 'faker', category: 'color' },
  { name: '颜色名称', value: 'color.human', tags: ['颜色'], source: 'faker', category: 'color' },
  { name: 'CMYK', value: 'color.cmyk', tags: ['颜色'], source: 'faker', category: 'color' },
  { name: 'HWB', value: 'color.hwb', tags: ['颜色'], source: 'faker', category: 'color' },
  { name: 'LAB', value: 'color.lab', tags: ['颜色'], source: 'faker', category: 'color' },

  // 网络
  { name: 'Email', value: 'internet.email', tags: ['网络'], source: 'faker', category: 'network' },
  { name: '用户名', value: 'internet.username', tags: ['网络'], source: 'faker', category: 'network' },
  { name: 'URL', value: 'internet.url', tags: ['网络'], source: 'faker', category: 'network' },
  { name: '域名', value: 'internet.domainName', tags: ['网络'], source: 'faker', category: 'network' },
  { name: 'IP', value: 'internet.ip', tags: ['网络'], source: 'faker', category: 'network' },
  { name: 'IPv6', value: 'internet.ipv6', tags: ['网络'], source: 'faker', category: 'network' },
  { name: 'MAC地址', value: 'internet.mac', tags: ['网络'], source: 'faker', category: 'network' },
  { name: '端口', value: 'internet.port', tags: ['网络'], source: 'faker', category: 'network' },
  { name: 'User-Agent', value: 'internet.userAgent', tags: ['网络'], source: 'faker', category: 'network' },

  // 其他
  { name: 'UUID', value: 'string.uuid', tags: ['其他'], source: 'faker', category: 'other' },
  { name: '手机号', value: 'phone.number', tags: ['其他'], source: 'faker', category: 'other' },
  { name: '公司名', value: 'company.name', tags: ['其他'], source: 'faker', category: 'other' },
  { name: '商品名', value: 'commerce.productName', tags: ['其他'], source: 'faker', category: 'other' },
  { name: '价格', value: 'commerce.price', tags: ['其他'], source: 'faker', category: 'other' },
  { name: '航班号', value: 'airline.flightNumber', tags: ['其他'], source: 'faker', category: 'other' },
  { name: '文件名', value: 'system.fileName', tags: ['其他'], source: 'faker', category: 'other' },
  { name: 'MIME类型', value: 'system.mimeType', tags: ['其他'], source: 'faker', category: 'other' },
];

export const mockjsList = mockjsData;
export const fakerList = fakerData;
export default [...mockjsData, ...fakerData];
