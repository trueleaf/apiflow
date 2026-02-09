#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_FILE = path.resolve(__dirname, '../offline-test-batches.json');

// 读取批次索引
const loadBatches = () => {
  if (!fs.existsSync(BATCH_FILE)) {
    console.error('❌ 批次索引文件不存在！');
    console.error('   请先运行: npm run test:gen-batches');
    process.exit(1);
  }
  const content = fs.readFileSync(BATCH_FILE, 'utf-8');
  return JSON.parse(content);
};

// 保存批次索引
const saveBatches = (data) => {
  fs.writeFileSync(BATCH_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// 更新统计信息
const updateSummary = (data) => {
  const completed = data.batches.filter((b) => b.status === 'completed').length;
  const inProgress = data.batches.filter((b) => b.status === 'in-progress').length;
  const pending = data.batches.filter((b) => b.status === 'pending').length;

  data.summary.completedBatches = completed;
  data.summary.inProgressBatches = inProgress;
  data.summary.pendingBatches = pending;
};

// 显示下一个待处理批次
const showNextBatch = () => {
  const data = loadBatches();
  const nextBatch = data.batches.find((b) => b.status === 'pending');

  if (!nextBatch) {
    console.log('\n🎉 所有批次已处理完成！\n');
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 下一个待处理批次\n');
  console.log(`批次ID: ${nextBatch.id}`);
  console.log(`批次名称: ${nextBatch.name}`);
  console.log(`状态: ${nextBatch.status}`);
  console.log(`文件数: ${nextBatch.stats.fileCount} 个`);
  console.log(`测试案例数: ${nextBatch.stats.testCount} 个`);
  console.log(`\n📄 测试文件:`);
  nextBatch.files.forEach((file) => {
    console.log(`  - ${file.path}`);
  });

  if (nextBatch.files.length > 0 && nextBatch.files[0].relatedBusinessCode.length > 0) {
    console.log(`\n🔗 相关业务代码:`);
    const businessCodes = new Set();
    nextBatch.files.forEach((file) => {
      file.relatedBusinessCode.forEach((code) => businessCodes.add(code));
    });
    businessCodes.forEach((code) => {
      console.log(`  - ${code}`);
    });
  }

  console.log(`\n📋 测试案例预览:`);
  const allTestCases = nextBatch.files.flatMap((f) => f.testCases);
  const preview = allTestCases.slice(0, 10);
  preview.forEach((tc, idx) => {
    console.log(`  ${idx + 1}. ${tc}`);
  });
  if (allTestCases.length > 10) {
    console.log(`  ... 还有 ${allTestCases.length - 10} 个测试案例`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 提示：将上述信息提供给大模型进行处理');
  console.log(`处理完成后运行: npm run test:mark-done ${nextBatch.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// 标记批次完成
const markDone = (batchId) => {
  const data = loadBatches();
  const batch = data.batches.find((b) => b.id === batchId);

  if (!batch) {
    console.error(`❌ 未找到批次: ${batchId}`);
    process.exit(1);
  }

  if (batch.status === 'completed') {
    console.log(`⚠️  批次 ${batchId} 已经是完成状态`);
    return;
  }

  batch.status = 'completed';
  batch.lastUpdated = new Date().toISOString();

  updateSummary(data);
  saveBatches(data);

  console.log(`\n✅ 批次 ${batchId} 已标记为完成`);
  console.log(`   批次名称: ${batch.name}`);
  console.log(`   更新时间: ${batch.lastUpdated}\n`);

  const remaining = data.summary.pendingBatches;
  if (remaining > 0) {
    console.log(`📊 剩余 ${remaining} 个批次待处理`);
    console.log(`💡 运行 npm run test:next-batch 查看下一批次\n`);
  } else {
    console.log('🎉 所有批次已处理完成！\n');
  }
};

// 显示整体进度
const showStatus = () => {
  const data = loadBatches();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 测试批次处理进度\n');
  console.log(`总批次数: ${data.summary.totalBatches}`);
  console.log(`总文件数: ${data.summary.totalFiles}`);
  console.log(`总测试数: ${data.summary.totalTests}`);
  console.log(`已完成: ${data.summary.completedBatches} (${((data.summary.completedBatches / data.summary.totalBatches) * 100).toFixed(1)}%)`);
  console.log(`进行中: ${data.summary.inProgressBatches} (${((data.summary.inProgressBatches / data.summary.totalBatches) * 100).toFixed(1)}%)`);
  console.log(`待处理: ${data.summary.pendingBatches} (${((data.summary.pendingBatches / data.summary.totalBatches) * 100).toFixed(1)}%)`);

  const completed = data.batches.filter((b) => b.status === 'completed');
  if (completed.length > 0) {
    console.log(`\n✅ 已完成批次 (最近5个):`);
    completed.slice(-5).forEach((b) => {
      console.log(`  - ${b.id}: ${b.name}`);
    });
  }

  const inProgress = data.batches.filter((b) => b.status === 'in-progress');
  if (inProgress.length > 0) {
    console.log(`\n🔄 进行中批次:`);
    inProgress.forEach((b) => {
      console.log(`  - ${b.id}: ${b.name}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// 重置批次状态
const resetBatch = (batchId) => {
  const data = loadBatches();
  const batch = data.batches.find((b) => b.id === batchId);

  if (!batch) {
    console.error(`❌ 未找到批次: ${batchId}`);
    process.exit(1);
  }

  batch.status = 'pending';
  batch.lastUpdated = null;

  updateSummary(data);
  saveBatches(data);

  console.log(`\n✅ 批次 ${batchId} 已重置为待处理状态`);
  console.log(`   批次名称: ${batch.name}\n`);
};

// 设置批次为进行中
const markInProgress = (batchId) => {
  const data = loadBatches();
  const batch = data.batches.find((b) => b.id === batchId);

  if (!batch) {
    console.error(`❌ 未找到批次: ${batchId}`);
    process.exit(1);
  }

  batch.status = 'in-progress';
  batch.lastUpdated = new Date().toISOString();

  updateSummary(data);
  saveBatches(data);

  console.log(`\n✅ 批次 ${batchId} 已标记为进行中`);
  console.log(`   批次名称: ${batch.name}\n`);
};

// 命令行参数处理
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'next':
    showNextBatch();
    break;
  case 'mark-done':
    if (!arg) {
      console.error('❌ 请提供批次ID');
      console.error('   用法: npm run test:mark-done <batchId>');
      process.exit(1);
    }
    markDone(arg);
    break;
  case 'status':
    showStatus();
    break;
  case 'reset':
    if (!arg) {
      console.error('❌ 请提供批次ID');
      console.error('   用法: node test-batch-manager.mjs reset <batchId>');
      process.exit(1);
    }
    resetBatch(arg);
    break;
  case 'mark-progress':
    if (!arg) {
      console.error('❌ 请提供批次ID');
      console.error('   用法: node test-batch-manager.mjs mark-progress <batchId>');
      process.exit(1);
    }
    markInProgress(arg);
    break;
  default:
    console.log('\n测试批次管理工具\n');
    console.log('可用命令:');
    console.log('  next           - 显示下一个待处理批次');
    console.log('  mark-done <id> - 标记批次完成');
    console.log('  status         - 显示整体进度');
    console.log('  reset <id>     - 重置批次状态');
    console.log('  mark-progress  - 标记批次为进行中\n');
    process.exit(1);
}
