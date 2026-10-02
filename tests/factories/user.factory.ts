export interface UserData {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
}

/**
 * Фабрика генерации динамических данных пользователя (Слой 2: Data Factory).
 * Позволяет тесту получить валидный или кастомизированный пейлоад в одну строчку.
 */
export function createUserData(overrides: Partial<UserData> = {}): UserData {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const randomPhoneDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();

  return {
    name: `User_${randomSuffix}`,
    surname: `LastName_${randomSuffix}`,
    email: `test_${timestamp}_${randomSuffix}@f2fbank.com`,
    password: `Pass_${randomSuffix}!123`,
    phone: `+7${randomPhoneDigits}`,
    ...overrides,
  };
}
