import { test, expect } from './fixtures/auth.fixture';
import { createUserData } from './factories/user.factory';

test.describe('Аутентификация и авторизация', () => {

  test('AUTH-01 [Критический]: Успешная регистрация нового пользователя', async ({ registerPage, page }) => {
    // 1. Что тестируется: Регистрация нового пользователя с корректными уникальными данными
    // 2. Входные данные: уникальные Name, Surname, Email, Password
    // 3. Ожидаемый результат: появление снекбара об успехе, редирект на /login
    const newUser = createUserData();

    await registerPage.goto();
    await registerPage.registerUser(newUser);

    await registerPage.expectRegistrationSuccess();
    await expect(page).toHaveURL(/\/login/);
  });

  test('AUTH-02 [Критический]: Успешный вход в систему зарегистрированного пользователя', async ({ loginPage, authSetup }) => {
    // 1. Что тестируется: Вход под существующей учетной записью
    // 2. Входные данные: зарегистрированный email и пароль
    // 3. Ожидаемый результат: редирект на главную страницу, отображение элементов интерфейса и баланса
    await authSetup.loginViaUI();

    await expect(loginPage.page).toHaveURL('/');
    await loginPage.header.expectLoggedIn();
    const balance = await loginPage.header.getBalanceValue();
    expect(balance).toBe(0);
  });

  test('AUTH-03 [Высокий]: Ошибка входа с неверным паролем', async ({ loginPage, authSetup }) => {
    // 1. Что тестируется: Попытка авторизации с валидным email, но неверным паролем
    // 2. Входные данные: правильный email, заведомо неверный пароль
    // 3. Ожидаемый результат: сообщение "Login failed", пользователь остается на /login
    await loginPage.goto();
    await loginPage.login(authSetup.user.email, 'WrongPassword123!');

    await loginPage.expectLoginFailed();
  });

  test('AUTH-04 [Высокий]: Ошибка входа с несуществующим email', async ({ loginPage }) => {
    // 1. Что тестируется: Попытка авторизации незарегистрированного пользователя
    // 2. Входные данные: случайный несуществующий email
    // 3. Ожидаемый результат: сообщение "Login failed"
    await loginPage.goto();
    await loginPage.login('non_existing_user_9999@testbank.com', 'SomePass123!');

    await loginPage.expectLoginFailed();
  });

  test('AUTH-05 [Высокий]: Попытка повторной регистрации с уже занятым email', async ({ registerPage, authSetup }) => {
    // 1. Что тестируется: Контроль уникальности email при регистрации
    // 2. Входные данные: данные пользователя с email, который уже существует в системе
    // 3. Ожидаемый результат: сообщение об ошибке "User with this email already exists"
    await registerPage.goto();
    await registerPage.registerUser({
      name: 'Duplicate',
      surname: 'User',
      email: authSetup.user.email,
      password: 'AnyPassword123!',
    });

    await registerPage.expectErrorMessage('User with this email already exists');
  });

  test('AUTH-06 [Средний]: Валидация пустых полей формы авторизации', async ({ loginPage }) => {
    // 1. Что тестируется: Попытка отправки пустой формы логина
    // 2. Входные данные: пустые поля email и password
    // 3. Ожидаемый результат: валидация блокирует отправку или выдает предупреждение
    await loginPage.goto();
    await loginPage.clickLogin();

    // Проверяем, что форма не отправлена и остаемся на странице /login
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  test('AUTH-07 [Средний]: Валидация обязательных полей при регистрации', async ({ registerPage }) => {
    // 1. Что тестируется: Попытка отправки не полностью заполненной формы регистрации
    // 2. Входные данные: заполнено только имя
    // 3. Ожидаемый результат: форма не отправляется, переход на страницу логина не происходит
    await registerPage.goto();
    await registerPage.nameInput.fill('OnlyName');
    await registerPage.registerButton.click();

    await expect(registerPage.page).toHaveURL(/\/register/);
  });

  test('AUTH-08 [Высокий]: Успешный выход из учетной записи (Logout)', async ({ loginPage, authSetup }) => {
    // 1. Что тестируется: Завершение пользовательской сессии
    // 2. Входные данные: авторизованный пользователь кликает кнопку логаута
    // 3. Ожидаемый результат: редирект на /login, меню навигации скрывается
    await authSetup.loginViaUI();
    await loginPage.header.logout();

    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  test('AUTH-09 [Средний]: Редирект неавторизованного пользователя при попытке прямого доступа к закрытым разделам', async ({ page }) => {
    // 1. Что тестируется: Защита маршрутов приложения от неавторизованного доступа
    // 2. Входные данные: неавторизованный браузер пытается перейти на /transactions
    // 3. Ожидаемый результат: автоматический редирект на /login
    await page.goto('/transactions');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

});
