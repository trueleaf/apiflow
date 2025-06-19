import { randomInt } from '@/helper';
import dayjs from 'dayjs';
import Mock from 'mockjs';
import { config } from '@/../config/config';

const { Random } = Mock;
let startTime = new Date();

Random.extend({
  //时间戳
  timestamp() {
    return Date.now();
  },
  //时间戳精确到秒
  timestamp2() {
    return Date.now().toString().slice(0, 10);
  },
  //开始时间
  startTime(date, rule) {
    const dateParams = date || new Date(`202${randomInt(0, 3)}-0${randomInt(1, 12)}-0${randomInt(1, 12)}`);
    startTime = dateParams;
    const realRule = rule || 'YYYY-MM-DD HH:mm'
    const result = dayjs(dateParams).format(realRule);
    return result;
  },
  //结束时间
  endTime(date, rule) {
    const dateParams = date || new Date(new Date(startTime).getTime() + 24 * 1000 * 60 * 60 * randomInt(1, 30));
    const realRule = rule || 'YYYY-MM-DD HH:mm'
    const result = dayjs(dateParams).format(realRule);
    return result;
  },
  //图片
  image(w: string | number = 200, h: string | number = 200) {
    return `${config.renderConfig.httpRequest.url}/mock/image?w=${w}&h=${h}`;
  },
  // //base64图片
  // dataImage(w: string | number = 200, h: string | number = 200) {
  //     return Mock.dataImage();
  // },
  //文件
  file(type = 'doc') { //xls | xlsx | doc | docx | zip | image
    return `${config.renderConfig.httpRequest.url}/mock/file?type=${type}`
  }
});

export default Mock;
