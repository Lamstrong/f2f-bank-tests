import { test, expect } from './fixtures/auth.fixture';

test.describe('Пополнение и отображение баланса', () => {

  test('BAL-01 [Критический]: Успешное пополнение баланса через модальное окно', async ({ transactionsPage, authSetup }) => {
    // 1. Что тестируется: Пополнение счета через модальное окно на странице /transactions
    // 2. Входные данные: положительная сумма 1500.50
    // 3. Ожидаемый результат: баланс увеличивается на 1500.50, модальное окно закрывается, в таблице появляется транзакция
    await authSetup.loginViaUI();
    await transactionsPage.goto();

    const initialBalance = await transactionsPage.header.getBalanceValue();
    const depositAmount = 1500.5;

    await transactionsPage.topUpBalance(depositAmount);

    // Проверяем обновление баланса в Header
    const newBalance = await transactionsPage.header.getBalanceValue();
    expect(newBalance).toBeCloseTo(initialBalance + depositAmount, 2);

    // Проверяем отображение операции в таблице
    const count = await transactionsPage.getTransactionsCount();
    expect(count).toBeGreaterThan(0);

    const latestTx = await transactionsPage.getLatestTransaction();
    expect(latestTx.amount).toBe(depositAmount);
  });

  test('BAL-02 [Высокий]: Синхронизация баланса при переходах между разделами', async ({ transactionsPage, transferPage, profilePage, authSetup }) => {
    // 1. Что тестируется: Единое и актуальное состояние баланса на всех экранах приложения
    // 2. Входные данные: пополнение на 500 рублей, переходы между разделами
    // 3. Ожидаемый результат: баланс одинаков в Header на Главной, в Профиле и в Транзакциях, а также в Balance hint на Главной
    await authSetup.loginViaUI();
    await transactionsPage.goto();
    await transactionsPage.topUpBalance(500);

    // Проверяем баланс на странице транзакций
    const txBalance = await transactionsPage.header.getBalanceValue();
    expect(txBalance).toBe(500);

    // Переходим на Главную
    await transactionsPage.header.goToMain();
    const mainHeaderBalance = await transferPage.header.getBalanceValue();
    const mainHintBalance = await transferPage.getHintBalanceValue();
    expect(mainHeaderBalance).toBe(500);
    expect(mainHintBalance).toBe(500);

    // Переходим в Профиль
    await transferPage.header.goToProfile();
    const profileHeaderBalance = await profilePage.header.getBalanceValue();
    expect(profileHeaderBalance).toBe(500);
  });

  test('BAL-03 [Средний]: Отмена пополнения баланса через кнопку Cancel', async ({ transactionsPage, authSetup }) => {
    // 1. Что тестируется: Закрытие модального окна по кнопке Cancel без изменения баланса
    // 2. Входные данные: ввод суммы 999 и клик по "Cancel"
    // 3. Ожидаемый результат: модальное окно скрыто, баланс не изменился
    await authSetup.loginViaUI();
    await transactionsPage.goto();

    const initialBalance = await transactionsPage.header.getBalanceValue();

    await transactionsPage.openAddBalanceModal();
    await transactionsPage.addBalanceModal.fillAmount(999);
    await transactionsPage.addBalanceModal.clickCancel();
    await transactionsPage.addBalanceModal.expectClosed();

    const currentBalance = await transactionsPage.header.getBalanceValue();
    expect(currentBalance).toBe(initialBalance);
  });

  test('BAL-04 [Средний]: Валидация нулевой или отрицательной суммы пополнения', async ({ transactionsPage, authSetup }) => {
    // 1. Что тестируется: Защита от пополнения счета на 0 или отрицательную величину
    // 2. Входные данные: сумма 0 или отрицательная сумма
    // 3. Ожидаемый результат: модальное окно не отправляет запрос, баланс остается прежним
    await authSetup.loginViaUI();
    await transactionsPage.goto();

    const initialBalance = await transactionsPage.header.getBalanceValue();

    await transactionsPage.openAddBalanceModal();
    await transactionsPage.addBalanceModal.fillAmount(0);
    await transactionsPage.addBalanceModal.clickConfirm();

    // Модальное окно не закрывается при некорректном значении (в AddBalanceModal.vue: if (amount.value > 0))
    await transactionsPage.addBalanceModal.expectOpen();

    await transactionsPage.addBalanceModal.clickCancel();
    const currentBalance = await transactionsPage.header.getBalanceValue();
    expect(currentBalance).toBe(initialBalance);
  });

});
