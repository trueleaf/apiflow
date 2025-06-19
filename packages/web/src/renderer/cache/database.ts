/**
 * @description        数据库和数据表定义
 * @author             shuxiaokai
 * @create             2021-7-13 22:50
 */
import Dexie from 'dexie';

type ScriptInfo = {
  id?: number,
  name: string,
  code: string
}
class MoyuDatabase extends Dexie {
  scriptList!: Dexie.Table<ScriptInfo>

  public constructor() {
    super('moyuDataBase');
    this.version(1).stores({
      scriptList: '++id, name, code'
    });
  }
}

const db = new MoyuDatabase();

export default db;
