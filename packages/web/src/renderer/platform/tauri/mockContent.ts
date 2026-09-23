import { fakerZH_CN, fakerEN, fakerJA } from '@faker-js/faker';
import { i18n } from '@/i18n';

export class MockContent {
  public generateRandomText(size: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    let result = '';
    if (size <= 50) {
      const sentence = fakerInstance.lorem.sentence();
      return sentence.substring(0, size);
    }
    while (result.length < size) {
      const randomType = Math.random();
      if (randomType < 0.4) {
        // 40% 概率生成句子
        result += fakerInstance.lorem.sentence() + ' ';
      } else if (randomType < 0.7) {
        // 30% 概率生成段落的一部分
        result += fakerInstance.lorem.paragraph().substring(0, 100) + ' ';
      } else if (randomType < 0.85) {
        // 15% 概率生成单词组合
        result += fakerInstance.lorem.words(Math.floor(Math.random() * 5) + 3) + '. ';
      } else {
        // 15% 概率生成其他类型的内容
        const contentTypes = [
          () => `${fakerInstance.person.fullName()}: ${fakerInstance.lorem.sentence()}`,
          () => `${fakerInstance.company.name()} - ${fakerInstance.company.catchPhrase()}`,
          () => `${fakerInstance.date.recent().toLocaleDateString()} ${fakerInstance.lorem.words(5)}`,
          () => fakerInstance.lorem.lines()
        ];
        const randomContent = contentTypes[Math.floor(Math.random() * contentTypes.length)]();
        result += randomContent + ' ';
      }
    }
    
    return result.substring(0, size).trim();
  }
  // 生成随机HTML内容（body片段）
  public generateRandomHtml(tagCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeTagCount = Math.max(1, Math.min(tagCount, 100)); // 限制1-100个标签
    // HTML标签模板
    const tagTemplates = [
      () => `<h1>${fakerInstance.lorem.words(3)}</h1>`,
      () => `<h2>${fakerInstance.lorem.words(4)}</h2>`,
      () => `<h3>${fakerInstance.lorem.words(3)}</h3>`,
      () => `<p>${fakerInstance.lorem.paragraph()}</p>`,
      () => `<div class="${fakerInstance.lorem.word()}">${fakerInstance.lorem.sentence()}</div>`,
      () => `<span>${fakerInstance.lorem.words(5)}</span>`,
      () => `<a href="${fakerInstance.internet.url()}">${fakerInstance.lorem.words(2)}</a>`,
      () => `<ul>\n  <li>${fakerInstance.lorem.sentence()}</li>\n  <li>${fakerInstance.lorem.sentence()}</li>\n  <li>${fakerInstance.lorem.sentence()}</li>\n</ul>`,
      () => `<ol>\n  <li>${fakerInstance.lorem.sentence()}</li>\n  <li>${fakerInstance.lorem.sentence()}</li>\n</ol>`,
      () => `<blockquote>${fakerInstance.lorem.paragraph()}</blockquote>`,
      () => `<img src="${fakerInstance.image.url()}" alt="${fakerInstance.lorem.words(2)}" />`,
      () => `<strong>${fakerInstance.lorem.words(3)}</strong>`,
      () => `<em>${fakerInstance.lorem.words(3)}</em>`,
      () => `<code>${fakerInstance.lorem.word()}.${fakerInstance.lorem.word()}()</code>`,
    ];
    
    let html = '';
    for (let i = 0; i < safeTagCount; i++) {
      const template = fakerInstance.helpers.arrayElement(tagTemplates);
      html += template() + '\n';
    }
    
    return html.trim();
  }
  // 生成随机XML内容
  public generateRandomXml(nodeCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeNodeCount = Math.max(1, Math.min(nodeCount, 100)); // 限制1-100个节点
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    
    for (let i = 0; i < safeNodeCount; i++) {
      const nodeName = fakerInstance.lorem.word();
      const nodeValue = fakerInstance.helpers.arrayElement([
        fakerInstance.lorem.sentence(),
        fakerInstance.person.fullName(),
        fakerInstance.internet.email(),
        fakerInstance.number.int({ min: 1, max: 1000 }).toString(),
        fakerInstance.date.recent().toISOString(),
      ]);
      xml += `  <${nodeName}>${nodeValue}</${nodeName}>\n`;
    }
    
    xml += '</root>';
    return xml;
  }
  // 生成随机YAML内容
  public generateRandomYaml(keyCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeKeyCount = Math.max(1, Math.min(keyCount, 100)); // 限制1-100个键值对
    
    let yaml = '';
    
    for (let i = 0; i < safeKeyCount; i++) {
      const key = fakerInstance.lorem.word();
      const valueType = Math.random();
      
      let value: string;
      if (valueType < 0.3) {
        // 字符串值
        value = `"${fakerInstance.lorem.sentence()}"`;
      } else if (valueType < 0.5) {
        // 数字值
        value = fakerInstance.number.int({ min: 1, max: 1000 }).toString();
      } else if (valueType < 0.6) {
        // 布尔值
        value = fakerInstance.datatype.boolean().toString();
      } else if (valueType < 0.8) {
        // 简单数组
        value = `\n  - ${fakerInstance.lorem.word()}\n  - ${fakerInstance.lorem.word()}\n  - ${fakerInstance.lorem.word()}`;
      } else {
        // 嵌套对象
        value = `\n  name: "${fakerInstance.person.fullName()}"\n  email: "${fakerInstance.internet.email()}"`;
      }
      
      yaml += `${key}: ${value}\n`;
    }
    
    return yaml.trim();
  }
  // 生成随机CSV内容
  public generateRandomCsv(rowCount: number): string {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const safeRowCount = Math.max(1, Math.min(rowCount, 100)); // 限制1-100行
    // CSV表头
    let csv = 'id,name,email,phone,company,city,status\n';
    // 生成数据行
    for (let i = 0; i < safeRowCount; i++) {
      const row = [
        i + 1,
        `"${fakerInstance.person.fullName()}"`,
        fakerInstance.internet.email(),
        `"${fakerInstance.phone.number()}"`,
        `"${fakerInstance.company.name()}"`,
        `"${fakerInstance.location.city()}"`,
        fakerInstance.helpers.arrayElement(['active', 'inactive', 'pending'])
      ];
      csv += row.join(',') + '\n';
    }
    
    return csv.trim();
  }
  // 根据语言环境获取对应的 faker 实例
  public getFakerInstance(language: 'zh-cn' | 'zh-tw' | 'en' | 'ja') {
    try {
      switch (language) {
        case 'zh-cn':
          return fakerZH_CN;
        case 'zh-tw':
          // 繁体中文使用简体中文的 faker，内容类似
          return fakerZH_CN;
        case 'en':
          return fakerEN;
        case 'ja':
          return fakerJA;
        default:
          return fakerEN; // 默认使用英文
      }
    } catch (error) {
      return fakerEN;
    }
  }
  // 生成随机JSON数据
  public generateRandomJson(size: number): Record<string, unknown> {
    const currentLanguage = this.getCurrentLanguage();
    const fakerInstance = this.getFakerInstance(currentLanguage);
    const complexity = Math.min(Math.max(size, 1), 9999); // 1-9999个字段

    type RandomFieldGenerator = {
      baseKey: string;
      createValue: () => unknown;
    };

    const fieldTemplates: RandomFieldGenerator[] = [
      // 基础信息字段
      { baseKey: 'id', createValue: () => fakerInstance.string.uuid() },
      { baseKey: 'name', createValue: () => fakerInstance.person.fullName() },
      { baseKey: 'email', createValue: () => fakerInstance.internet.email() },
      { baseKey: 'phone', createValue: () => fakerInstance.phone.number() },
      { baseKey: 'address', createValue: () => fakerInstance.location.streetAddress() },
      { baseKey: 'city', createValue: () => fakerInstance.location.city() },
      { baseKey: 'country', createValue: () => fakerInstance.location.country() },
      { baseKey: 'company', createValue: () => fakerInstance.company.name() },
      { baseKey: 'department', createValue: () => fakerInstance.commerce.department() },
      { baseKey: 'jobTitle', createValue: () => fakerInstance.person.jobTitle() },
      // 数字和日期字段
      { baseKey: 'age', createValue: () => fakerInstance.number.int({ min: 18, max: 80 }) },
      { baseKey: 'score', createValue: () => fakerInstance.number.float({ min: 0, max: 100, fractionDigits: 2 }) },
      { baseKey: 'price', createValue: () => fakerInstance.commerce.price() },
      { baseKey: 'createdAt', createValue: () => fakerInstance.date.past().toISOString() },
      { baseKey: 'updatedAt', createValue: () => fakerInstance.date.recent().toISOString() },
      { baseKey: 'birthDate', createValue: () => fakerInstance.date.birthdate().toISOString() },
      // 布尔和状态字段
      { baseKey: 'isActive', createValue: () => fakerInstance.datatype.boolean() },
      { baseKey: 'isVerified', createValue: () => fakerInstance.datatype.boolean() },
      { baseKey: 'status', createValue: () => fakerInstance.helpers.arrayElement(['active', 'inactive', 'pending', 'completed']) },
      { baseKey: 'priority', createValue: () => fakerInstance.helpers.arrayElement(['low', 'medium', 'high', 'urgent']) },
      // 文本内容字段
      { baseKey: 'description', createValue: () => fakerInstance.lorem.sentence() },
      { baseKey: 'content', createValue: () => fakerInstance.lorem.paragraph() },
      { baseKey: 'notes', createValue: () => fakerInstance.lorem.words(10) },
      { baseKey: 'tags', createValue: () => fakerInstance.lorem.words(3).split(' ') },
      // 网络和技术字段
      { baseKey: 'website', createValue: () => fakerInstance.internet.url() },
      { baseKey: 'avatar', createValue: () => fakerInstance.image.avatar() },
      { baseKey: 'ipAddress', createValue: () => fakerInstance.internet.ip() },
      { baseKey: 'userAgent', createValue: () => fakerInstance.internet.userAgent() }
    ];

    const requiredFields: RandomFieldGenerator[] = [];
    if (complexity >= 5) {
      requiredFields.push({
        baseKey: 'metadata',
        createValue: () => ({
          version: fakerInstance.system.semver(),
          source: fakerInstance.helpers.arrayElement(['api', 'import', 'manual', 'system']),
          lastModified: fakerInstance.date.recent().toISOString(),
          permissions: fakerInstance.helpers.arrayElements(['read', 'write', 'delete', 'admin'], 2)
        })
      });
    }
    if (complexity >= 8) {
      requiredFields.push({
        baseKey: 'items',
        createValue: () => {
          const itemCount = Math.min(Math.floor(complexity / 4), 5);
          return Array.from({ length: itemCount }, () => ({
            id: fakerInstance.string.uuid(),
            name: fakerInstance.commerce.productName(),
            price: fakerInstance.commerce.price(),
            category: fakerInstance.commerce.department(),
            available: fakerInstance.datatype.boolean()
          }));
        }
      });
    }

    const jsonData: Record<string, unknown> = {};
    const keyCount: Record<string, number> = {};

    requiredFields.forEach(field => {
      jsonData[field.baseKey] = field.createValue();
      keyCount[field.baseKey] = 1;
    });

    for (let index = requiredFields.length; index < complexity; index += 1) {
      const template = fakerInstance.helpers.arrayElement(fieldTemplates);
      const currentCount = keyCount[template.baseKey] ?? 0;
      const suffix = currentCount === 0 ? '' : `_${currentCount}`;
      jsonData[`${template.baseKey}${suffix}`] = template.createValue();
      keyCount[template.baseKey] = currentCount + 1;
    }

    return jsonData;
  }
  // 获取当前内容语言
  public getCurrentLanguage(): 'zh-cn' | 'zh-tw' | 'en' | 'ja' {
    const locale = i18n.global.locale.value;
    return locale === 'zh-cn' ? 'zh-cn' : locale === 'zh-tw' || locale === 'ja' ? locale : 'en';
  }
}
