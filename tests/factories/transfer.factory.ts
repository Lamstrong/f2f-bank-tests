export interface TransferData {
  phone: string;
  amount: number;
  purpose: string;
}

/**
 * Фабрика данных для операций перевода (Слой 2: Data Factory).
 */
export function createTransferData(overrides: Partial<TransferData> = {}): TransferData {
  const randomPhoneDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();

  return {
    phone: `+7${randomPhoneDigits}`,
    amount: 500,
    purpose: 'Перевод средств по СБП',
    ...overrides,
  };
}

export const INVALID_PHONE_CASES = {
  NO_PLUS: '89991234567',
  TOO_SHORT: '+799912',
  TOO_LONG: '+79991234567890123456',
  EMPTY: '',
} as const;
