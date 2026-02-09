#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TESTS_DIR = path.resolve(__dirname, '../e2e/offline');
const MAPPING_FILE = path.resolve(__dirname, '../test-code-mapping.json');
const OUTPUT_FILE = path.resolve(__dirname, '../offline-test-batches.json');

// 读取映射配置
const loadMapping = () => {
  const content = fs.readFileSync(MAPPING_FILE, 'utf-8');
  return JSON.parse(content);
};

// 递归扫描目录查找所有 .spec.ts 文件
const scanTestFiles = (dir, baseDir = dir) => {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...scanTestFiles(fullPath, baseDir));
    } else if (item.endsWith('.spec.ts')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      files.push({
        absolutePath: fullPath,
        relativePath: `tests/e2e/offline/${relativePath}`,
      });
    }
  }

  return files;
};

// 解析测试文件提取测试案例
const parseTestFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const testCases = [];

  // 匹配 test('...') 或 test("...") 或 test(`...`)
  const testRegex = /test\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = testRegex.exec(content)) !== null) {
    testCases.push(match[1]);
  }

  // 匹配 describe('...') 获取测试分组
  const describeRegex = /describe\s*\(\s*['"`]([^'"`]+)['"`]/g;
  const describes = [];
  while ((match = describeRegex.exec(content)) !== null) {
    describes.push(match[1]);
  }

  return {
    testCases,
    testCount: testCases.length,
    describes,
  };
};

// 匹配映射规则
const matchMappingRule = (testPath, mappingRules) => {
  const normalizedPath = testPath.replace('tests/e2e/offline/', '');

  for (const rule of mappingRules) {
    const pattern = rule.testPattern;

    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '[^/]+').replace(/\//g, '\\/');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(normalizedPath)) {
        return rule;
      }
    } else {
      if (normalizedPath === pattern) {
        return rule;
      }
    }
  }

  return null;
};

// 根据目录结构自动分类
const categorizeByPath = (testPath) => {
  const parts = testPath.replace('tests/e2e/offline/', '').split('/');

  if (parts[0] === 'app-shell') {
    if (parts[1] === 'topbar') {
      return { level1: '应用程序外壳', level2: '顶部栏功能', level3: parts[2] };
    }
    return { level1: '应用程序外壳', level2: 'IPC通信', level3: parts[1] };
  }

  if (parts[0] === 'project') {
    return { level1: '项目管理', level2: '', level3: parts[1] };
  }

  if (parts[0] === 'workbench') {
    if (parts[1] === 'nodes') {
      const nodeType = parts[2]; // http, websocket, http-mock, websocket-mock
      const subModule = parts[3]; // body, operation, params, etc.
      return {
        level1: nodeType === 'http' ? 'HTTP节点' : nodeType === 'websocket' ? 'WebSocket节点' : nodeType,
        level2: subModule || '',
        level3: parts[4] || '',
      };
    }

    if (parts[1] === 'banner') {
      return {
        level1: '工作台横幅',
        level2: parts[2] === 'banner-details' ? parts[3] || '横幅详情' : '横幅功能',
        level3: parts[parts.length - 1],
      };
    }

    if (parts[1] === 'nav') {
      return { level1: '导航功能', level2: '', level3: parts[2] };
    }

    if (parts[1] === 'addons') {
      return { level1: '附加功能', level2: parts[2] || '', level3: parts[3] || '' };
    }
  }

  return { level1: '其他', level2: '', level3: '' };
};

// 根据分类名称生成批次名称
const generateBatchName = (category, subModuleName) => {
  const parts = [category.level1];
  if (category.level2) {
    parts.push(category.level2);
  }
  if (subModuleName) {
    parts.push(subModuleName);
  }
  return parts.join(' - ');
};

// 将测试文件分批
const createBatches = (testFiles, mappingRules) => {
  const grouped = {};

  // 按子模块分组
  for (const file of testFiles) {
    const category = categorizeByPath(file.relativePath);
    const key = `${category.level1}|${category.level2}`;

    if (!grouped[key]) {
      grouped[key] = {
        category,
        files: [],
      };
    }

    const matchedRule = matchMappingRule(file.relativePath, mappingRules);
    const parsedData = parseTestFile(file.absolutePath);

    grouped[key].files.push({
      path: file.relativePath,
      relatedBusinessCode: matchedRule ? matchedRule.businessCode : [],
      testCases: parsedData.testCases,
      testCount: parsedData.testCount,
    });
  }

  // 将大的分组拆分成批次（每批5-8个文件）
  const batches = [];
  let batchId = 1;

  for (const key in grouped) {
    const group = grouped[key];
    const files = group.files;

    if (files.length <= 8) {
      batches.push({
        id: `batch-${String(batchId).padStart(3, '0')}`,
        name: generateBatchName(group.category, ''),
        status: 'pending',
        lastUpdated: null,
        category: {
          level1: group.category.level1,
          level2: group.category.level2,
        },
        files,
        stats: {
          fileCount: files.length,
          testCount: files.reduce((sum, f) => sum + f.testCount, 0),
        },
      });
      batchId++;
    } else {
      // 拆分成多个批次
      const chunkSize = 6;
      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        const batchIndex = Math.floor(i / chunkSize) + 1;
        batches.push({
          id: `batch-${String(batchId).padStart(3, '0')}`,
          name: `${generateBatchName(group.category, '')} (批次${batchIndex})`,
          status: 'pending',
          lastUpdated: null,
          category: {
            level1: group.category.level1,
            level2: group.category.level2,
          },
          files: chunk,
          stats: {
            fileCount: chunk.length,
            testCount: chunk.reduce((sum, f) => sum + f.testCount, 0),
          },
        });
        batchId++;
      }
    }
  }

  return batches;
};

// 生成批次索引文件
const generateBatchIndex = () => {
  console.log('🔍 扫描测试文件...');
  const testFiles = scanTestFiles(TESTS_DIR);
  console.log(`   找到 ${testFiles.length} 个测试文件`);

  console.log('\n📖 读取映射配置...');
  const mapping = loadMapping();
  console.log(`   加载 ${mapping.mappingRules.length} 条映射规则`);

  console.log('\n🔨 生成批次...');
  const batches = createBatches(testFiles, mapping.mappingRules);
  console.log(`   创建 ${batches.length} 个批次`);

  const totalTests = batches.reduce((sum, b) => sum + b.stats.testCount, 0);

  const output = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: testFiles.length,
      totalBatches: batches.length,
      totalTests,
      completedBatches: 0,
      inProgressBatches: 0,
      pendingBatches: batches.length,
    },
    batches,
  };

  console.log('\n💾 保存批次索引...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`   已保存到: ${OUTPUT_FILE}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 批次生成完成！');
  console.log(`   总文件数: ${testFiles.length}`);
  console.log(`   总批次数: ${batches.length}`);
  console.log(`   总测试数: ${totalTests}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// 执行
try {
  generateBatchIndex();
} catch (error) {
  console.error('❌ 生成失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}
