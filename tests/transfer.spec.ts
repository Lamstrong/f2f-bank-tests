import { test, expect } from './fixtures/auth.fixture';
import { createTransferData, INVALID_PHONE_CASES } from './factories/transfer.factory';

test.describe('Переводы по номеру телефона (СБП)', () => {

  test('TRF-01 [Критический]: Успешный перевод средств по номеру телефона', async ({ transferPage, createSession }) => {
    // 1. Слой 3 (SPEC) передает параметры в фикстуру-фабрику (Слой 2) для создания пользователя с балансом
    const { loginViaUI } = await createSession({ initialBalance: 1000 });
    await loginViaUI();

    // 2. Получение динамического DTO перевода из фабрики данных (Слой 2)
    const transferPayload = createTransferData({ amount: 400 });

    // 3. Передача DTO в методы POM (Слой 1)
    await transferPage.goto();
    await transferPage.performTransfer(transferPayload);

    // 4. Assertions соответствия бизнес-требованиям
    await transferPage.expectTransferSuccess();

    // Проверяем списание средств с баланса (1000 - 400 = 600)
    const updatedHeaderBalance = await transferPage.header.getBalanceValue();
    expect(updatedHeaderBalance).toBe(600);

    // Проверяем, что кнопка "New transfer" возвращает к чистой форме
    await transferPage.clickNewTransfer();
    await transferPage.expectFormCleared();
  });

  test('TRF-02 [Критический]: Ошибка при попытке перевода с недостаточным балансом', async ({ transferPage, authSetup }) => {
    // Пользователь с нулевым балансом
    await authSetup.loginViaUI();
    await transferPage.goto();

    const transferPayload = createTransferData({ amount: 500 });
    await transferPage.performTransfer(transferPayload);
    await transferPage.expectInsufficientFundsError();

    const balance = await transferPage.header.getBalanceValue();
    expect(balance).toBe(0);
  });

  test('TRF-03 [Высокий]: Валидация формата номера телефона (без префикса "+")', async ({ transferPage, authSetup }) => {
    await authSetup.loginViaUI();
    await transferPage.goto();

    await transferPage.phoneInput.fill(INVALID_PHONE_CASES.NO_PLUS);
    await transferPage.phoneInput.blur();

    await transferPage.expectPhoneError('Must start with + and country code');
  });

  test('TRF-04 [Высокий]: Валидация длины номера телефона (слишком короткий)', async ({ transferPage, authSetup }) => {
    await authSetup.loginViaUI();
    await transferPage.goto();

    await transferPage.phoneInput.fill(INVALID_PHONE_CASES.TOO_SHORT);
    await transferPage.phoneInput.blur();

    await transferPage.expectPhoneError('Phone must contain 10–15 digits');
  });

  test('TRF-05 [Высокий]: Валидация отрицательной или нулевой суммы перевода', async ({ transferPage, createSession }) => {
    const { loginViaUI } = await createSession({ initialBalance: 200 });
    await loginViaUI();

    await transferPage.goto();
    const zeroTransfer = createTransferData({ amount: 0 });
    await transferPage.performTransfer(zeroTransfer);

    await transferPage.waitForSnackbar('Amount must be greater than zero');
  });

  test('TRF-06 [Средний]: Кнопка Cancel очищает поля формы перевода', async ({ transferPage, authSetup }) => {
    await authSetup.loginViaUI();
    await transferPage.goto();

    const transferPayload = createTransferData({ amount: 250 });
    await transferPage.fillTransferForm(transferPayload);
    await transferPage.clickCancel();

    await transferPage.expectFormCleared();
  });

  test('TRF-07 [Высокий]: Отображение операции перевода (списания) в истории транзакций', async ({ transferPage, transactionsPage, createSession }) => {
    const { loginViaUI } = await createSession({ initialBalance: 300 });
    await loginViaUI();

    await transferPage.goto();
    const transferPayload = createTransferData({ amount: 100 });
    await transferPage.performTransfer(transferPayload);
    await transferPage.expectTransferSuccess();

    await transactionsPage.goto();
    const latestTx = await transactionsPage.getLatestTransaction();
    expect(latestTx.amount).toBe(100);
  });

});
