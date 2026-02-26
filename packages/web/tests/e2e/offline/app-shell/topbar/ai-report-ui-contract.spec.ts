import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

test.describe('AiReportUiContract', () => {
  // AI 举报能力需保持入口门禁、弹窗打开、复制邮箱与关闭流程的关键源码契约
  test('AI 报告 UI 核心交互契约稳定', async () => {
    const aiHeaderSource = await fs.readFile(path.resolve('src/renderer/pages/ai/components/aiHeader/AiHeader.vue'), 'utf8');
    const reportDialogSource = await fs.readFile(path.resolve('src/renderer/pages/ai/components/aiReport/ReportAiDialog.vue'), 'utf8');
    // 校验 AppStore 门禁与举报按钮点击后打开弹窗
    expect(aiHeaderSource).toContain('v-if="isAppStore"');
    expect(aiHeaderSource).toContain('@click="handleReport"');
    expect(aiHeaderSource).toContain('showReportDialog.value = true');
    expect(aiHeaderSource).toContain('window.electronAPI?.updateManager?.isAppStore()');
    // 校验举报弹窗核心文案、复制邮箱按钮与关闭动作链路
    expect(reportDialogSource).toContain(":title=\"t('举报 AI 内容')\"");
    expect(reportDialogSource).toContain('2581105856@qq.com');
    expect(reportDialogSource).toContain('@click="handleCopyEmail"');
    expect(reportDialogSource).toContain("await navigator.clipboard.writeText('2581105856@qq.com')");
    expect(reportDialogSource).toContain("message.success(t('已复制到剪贴板'))");
    expect(reportDialogSource).toContain("message.error(t('复制失败，请手动复制'))");
    expect(reportDialogSource).toContain('@close="handleClose"');
    expect(reportDialogSource).toContain("emit('update:modelValue', newVal)");
  });
});

