import { test, expect } from '../../../../fixtures/electron.fixture';

test.describe('SettingsIndexedDBWorker', () => {
  // 本地数据页覆盖 IndexedDB Worker 全链路：列表、详情、删单条、删整仓、清空全部
  test('离线设置-IndexedDB Worker 通道全链路可用', async ({ contentPage, clearCache, jumpToSettings }) => {
    test.setTimeout(60000);
    await clearCache();
    // 预置一个独立测试数据库，确保列表和详情有稳定可见数据
    await contentPage.evaluate(async () => {
      await new Promise<void>((resolve) => {
        const deleteRequest = indexedDB.deleteDatabase('worker_case_db');
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => resolve();
        deleteRequest.onblocked = () => resolve();
      });
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('worker_case_db', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('worker_case_store')) {
            db.createObjectStore('worker_case_store');
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('worker_case_store', 'readwrite');
          tx.objectStore('worker_case_store').put({ name: 'first', value: 1 }, 'k1');
          tx.objectStore('worker_case_store').put({ name: 'second', value: 2 }, 'k2');
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      });
    });
    await jumpToSettings();
    // 进入本地数据并切换 IndexedDB 卡片，触发 getIndexedDBData
    const localDataMenu = contentPage.locator('[data-testid="settings-menu-local-data"]');
    await localDataMenu.click();
    await expect(localDataMenu).toHaveClass(/active/, { timeout: 5000 });
    const indexedCard = contentPage.locator('.cache-card', { hasText: /IndexedDB 本地数据/ }).first();
    await indexedCard.click();
    await expect(indexedCard).toHaveClass(/selected/, { timeout: 5000 });
    const refreshBtn = indexedCard.locator('.refresh-btn').first();
    await refreshBtn.click();
    const storeRow = contentPage.locator('.indexeddb-detail .el-table__body-wrapper tbody tr', { hasText: /worker_case_db/ }).filter({ hasText: /worker_case_store/ }).first();
    await expect(storeRow).toBeVisible({ timeout: 10000 });
    // 打开详情弹窗，触发 getStoreDetail，并验证初始两条记录
    await storeRow.locator('.el-button').filter({ hasText: /详情/ }).first().click();
    const detailDialog = contentPage.locator('.el-dialog').filter({ hasText: /数据详情/ }).first();
    await expect(detailDialog).toBeVisible({ timeout: 5000 });
    await expect(detailDialog).toContainText('worker_case_db');
    const detailRows = detailDialog.locator('.el-table__body-wrapper tbody tr');
    await expect(detailRows).toHaveCount(2, { timeout: 5000 });
    // 删除一条记录，触发 deleteStoreItem，并校验详情记录数同步减少
    await detailRows.first().locator('.el-button').filter({ hasText: /删除/ }).first().click();
    const deleteItemConfirmDialog = contentPage.locator('.cl-confirm-wrapper:visible').first();
    await expect(deleteItemConfirmDialog).toContainText(/删除确认/, { timeout: 5000 });
    await deleteItemConfirmDialog.locator('.el-button--primary').focus();
    await contentPage.keyboard.press('Enter');
    await expect(deleteItemConfirmDialog).toBeHidden({ timeout: 5000 });
    await expect.poll(async () => {
      return await contentPage.evaluate(async () => {
        return await new Promise<number>((resolve, reject) => {
          const request = indexedDB.open('worker_case_db');
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('worker_case_store', 'readonly');
            const countRequest = tx.objectStore('worker_case_store').count();
            countRequest.onsuccess = () => {
              db.close();
              resolve(countRequest.result);
            };
            countRequest.onerror = () => {
              db.close();
              reject(countRequest.error);
            };
          };
          request.onerror = () => reject(request.error);
        });
      });
    }, { timeout: 10000 }).toBe(1);
    await detailDialog.locator('.el-dialog__headerbtn').click();
    await expect(detailDialog).toBeHidden({ timeout: 5000 });
    // 删除整个 store，触发 deleteStore，并校验数据库中该 store 被清空
    await storeRow.locator('.el-button').filter({ hasText: /删除/ }).first().click();
    const deleteStoreConfirmDialog = contentPage.locator('.cl-confirm-wrapper:visible').first();
    await expect(deleteStoreConfirmDialog).toContainText(/删除确认/, { timeout: 5000 });
    await deleteStoreConfirmDialog.locator('.el-button--primary').focus();
    await contentPage.keyboard.press('Enter');
    await expect(deleteStoreConfirmDialog).toBeHidden({ timeout: 5000 });
    await expect.poll(async () => {
      return await contentPage.evaluate(async () => {
        return await new Promise<number>((resolve, reject) => {
          const request = indexedDB.open('worker_case_db');
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('worker_case_store', 'readonly');
            const countRequest = tx.objectStore('worker_case_store').count();
            countRequest.onsuccess = () => {
              db.close();
              resolve(countRequest.result);
            };
            countRequest.onerror = () => {
              db.close();
              reject(countRequest.error);
            };
          };
          request.onerror = () => reject(request.error);
        });
      });
    }, { timeout: 10000 }).toBe(0);
    // 再写入一条数据后执行“清空所有数据”，触发 clearAllIndexedDB 并验证归零
    await contentPage.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('worker_case_db');
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('worker_case_store', 'readwrite');
          tx.objectStore('worker_case_store').put({ name: 'third', value: 3 }, 'k3');
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      });
    });
    const clearAllBtn = contentPage.locator('.indexeddb-detail .table-title .el-button').filter({ hasText: /清空所有数据/ }).first();
    await clearAllBtn.click();
    const clearDialog = contentPage.locator('.el-message-box').first();
    await expect(clearDialog).toBeVisible({ timeout: 5000 });
    await clearDialog.locator('.el-message-box__input input').fill('清空所有数据');
    await clearDialog.locator('.el-button--primary').click();
    await expect.poll(async () => {
      return await contentPage.evaluate(async () => {
        return await new Promise<number>((resolve, reject) => {
          const request = indexedDB.open('worker_case_db');
          request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('worker_case_store', 'readonly');
            const countRequest = tx.objectStore('worker_case_store').count();
            countRequest.onsuccess = () => {
              db.close();
              resolve(countRequest.result);
            };
            countRequest.onerror = () => {
              db.close();
              reject(countRequest.error);
            };
          };
          request.onerror = () => reject(request.error);
        });
      });
    }, { timeout: 10000 }).toBe(0);
  });
});
