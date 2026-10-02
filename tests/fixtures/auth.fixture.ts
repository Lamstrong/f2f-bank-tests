import { test as base, expect, type Page } from '@playwright/test';
import { createUserData, type UserData } from '../factories/user.factory';
import { LoginPage } from '../pages/LoginPage.pom';
import { RegisterPage } from '../pages/RegisterPage.pom';
import { TransferPage } from '../pages/TransferPage.pom';
import { TransactionsPage } from '../pages/TransactionsPage.pom';
import { ProfilePage } from '../pages/ProfilePage.pom';

export interface AppPages {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  transferPage: TransferPage;
  transactionsPage: TransactionsPage;
  profilePage: ProfilePage;
}

export interface UserSession {
  user: UserData;
  loginViaUI: () => Promise<void>;
}

type Fixtures = {
  // Функции-фабрики для страниц (Слой 2)
  createPom: (customPage?: Page) => AppPages;

  // Инстансы POM по умолчанию
  loginPage: LoginPage;
  registerPage: RegisterPage;
  transferPage: TransferPage;
  transactionsPage: TransactionsPage;
  profilePage: ProfilePage;

  // Фабрика сессий пользователей (Слой 2: управление состоянием и данными)
  createSession: (options?: { user?: UserData; initialBalance?: number }) => Promise<UserSession>;

  // Готовая сессия пользователя для быстрого использования в тесте
  authSetup: UserSession;
};

/**
 * Инициализация всех Page Objects для переданной страницы
 */
export function initPom(page: Page): AppPages {
  return {
    loginPage: new LoginPage(page),
    registerPage: new RegisterPage(page),
    transferPage: new TransferPage(page),
    transactionsPage: new TransactionsPage(page),
    profilePage: new ProfilePage(page),
  };
}

export const test = base.extend<Fixtures>({
  // Фабричная функция для инициализации страниц
  createPom: async ({ page }, use) => {
    await use((customPage?: Page) => initPom(customPage ?? page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  transferPage: async ({ page }, use) => {
    await use(new TransferPage(page));
  },
  transactionsPage: async ({ page }, use) => {
    await use(new TransactionsPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  // Фабрика сессий (Слой 2): регистрирует изолированного пользователя, опционально начисляет баланс
  createSession: async ({ page, request }, use) => {
    const factory = async (options: { user?: UserData; initialBalance?: number } = {}): Promise<UserSession> => {
      const user = options.user ?? createUserData();

      // Регистрация через API
      const registerRes = await request.post('/api/auth/register', {
        data: {
          name: user.name,
          surname: user.surname,
          email: user.email,
          password: user.password,
          role: 'user',
        },
      });

      if (!registerRes.ok()) {
        throw new Error(`[createSession] Не удалось зарегистрировать пользователя: ${await registerRes.text()}`);
      }

      // Если требуется стартовый баланс, пополняем его через API
      if (options.initialBalance && options.initialBalance > 0) {
        const loginRes = await request.post('/api/auth/login', {
          data: { email: user.email, password: user.password },
        });
        if (loginRes.ok()) {
          await request.post('/api/users/balance/add', {
            data: { amount: options.initialBalance },
          });
        }
      }

      const loginViaUI = async () => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(user.email, user.password);
        await page.waitForURL('/');
        await loginPage.header.expectLoggedIn();
      };

      return { user, loginViaUI };
    };

    await use(factory);
  },

  // Готовая изолированная сессия для текущего теста
  authSetup: async ({ createSession }, use) => {
    const session = await createSession();
    await use(session);
  },
});

export { expect };
