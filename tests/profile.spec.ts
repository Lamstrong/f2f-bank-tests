import { test, expect } from './fixtures/auth.fixture';

test.describe('Профиль пользователя', () => {

  test('PROF-01 [Высокий]: Корректное отображение данных профиля пользователя', async ({ profilePage, authSetup }) => {
    // 1. Что тестируется: Вывод личной информации текущего авторизованного пользователя
    // 2. Входные данные: зарегистрированный пользователь с определенными Name, Surname, Email
    // 3. Ожидаемый результат: страница /profile отображает правильные имя, фамилию и email
    await authSetup.loginViaUI();
    await profilePage.goto();

    await profilePage.expectProfileData({
      name: authSetup.user.name,
      surname: authSetup.user.surname,
      email: authSetup.user.email,
    });
  });

  test('PROF-02 [Средний]: Сохранение отображения данных профиля после перезагрузки страницы', async ({ profilePage, authSetup, page }) => {
    // 1. Что тестируется: Сохранение сессии и данных профиля при обновлении страницы браузером
    // 2. Входные данные: открытая страница /profile, перезагрузка страницы
    // 3. Ожидаемый результат: после перезагрузки пользователь остается авторизован, данные профиля отображаются корректно
    await authSetup.loginViaUI();
    await profilePage.goto();

    await page.reload();

    await profilePage.expectProfileData({
      name: authSetup.user.name,
      surname: authSetup.user.surname,
      email: authSetup.user.email,
    });
    await profilePage.header.expectLoggedIn();
  });

});
