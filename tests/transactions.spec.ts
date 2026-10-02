import { test, expect } from './fixtures/auth.fixture';
import { createTransferData } from './factories/transfer.factory';

test.describe('История транзакций', () => {

  test('TX-01 [Высокий]: Отображение пустого состояния для нового пользователя', async ({ transactionsPage, authSetup }) => {
    // 1. Что тестируется: Начальное состояние истории транзакций для нового аккаунта
    // 2. Входные данные: новый зарегистрированный пользователь без операций
    // 3. Ожидаемый результат: надпись "No transactions yet", таблица не содержит строк
    await authSetup.loginViaUI();
    await transactionsPage.goto();

    await transactionsPage.expectEmpty();
    expect(await transactionsPage.getTransactionsCount()).toBe(0);
  });

  test('TX-02 [Высокий]: Отображение операций пополнения и списания в таблице', async ({ transactionsPage, transferPage, authSetup }) => {
    // 1. Что тестируется: Фиксация нескольких финансовых операций в таблице
    // 2. Входные данные: пополнение на 1000, затем перевод на 350
    // 3. Ожидаемый результат: в таблице отображаются 2 записи, последняя операция (перевод) вверху
    await authSetup.loginViaUI();

    // 1. Пополнение
    await transactionsPage.goto();
    await transactionsPage.topUpBalance(1000);

    // 2. Списание через Data Factory
    const transferPayload = createTransferData({ amount: 350, purpose: 'Перевод коллеге' });
    await transferPage.goto();
    await transferPage.performTransfer(transferPayload);
    await transferPage.expectTransferSuccess();

    // 3. Проверка истории
    await transactionsPage.goto();
    const count = await transactionsPage.getTransactionsCount();
    expect(count).toBe(2);

    const firstTx = await transactionsPage.getLatestTransaction();
    expect(firstTx.amount).toBe(350);
  });

  test('TX-03 [Средний]: Выявление несоответствия колонок "Operation Type" и "Operation Status" в заголовках таблицы', async ({ transactionsPage, authSetup }) => {
    // 1. Что тестируется: Проверка соответствия заголовков колонок выводимым данным в TransactionsTable.vue
    // 2. Входные данные: выполненная операция пополнения счета
    // 3. Ожидаемый результат / Дефект: В коде шаблона колонка 3 имеет заголовок "Operation Type", но выводит transactionStatus ('completed'),
    //    а колонка 4 имеет заголовок "Operation Status", но выводит transactionType ('deposit').
    await authSetup.loginViaUI();
    await transactionsPage.goto();
    await transactionsPage.topUpBalance(250);

    const tx = await transactionsPage.getLatestTransaction();

    // Документируем зафиксированное поведение UI таблицы:
    // tx.typeCol (3-я колонка таблицы) содержит статус 'completed'
    // tx.statusCol (4-я колонка таблицы) содержит тип 'deposit'
    expect(tx.typeCol.toLowerCase()).toContain('completed');
    expect(tx.statusCol.toLowerCase()).toContain('deposit');
  });

});
