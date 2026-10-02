import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.pom';

export class TransferPage extends BasePage {
  readonly cardTitle: Locator;
  readonly balanceHint: Locator;
  readonly phoneInput: Locator;
  readonly phoneError: Locator;
  readonly amountInput: Locator;
  readonly purposeInput: Locator;
  readonly sendButton: Locator;
  readonly cancelButton: Locator;

  // Success view elements
  readonly successBlock: Locator;
  readonly successText: Locator;
  readonly newTransferButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cardTitle = page.locator('.card-title:has-text("Transfer by phone number")');
    this.balanceHint = page.locator('.balance-hint');
    this.phoneInput = page.locator('input[name="phone"]');
    this.phoneError = page.locator('.field-error');
    this.amountInput = page.locator('input[name="amount"]');
    this.purposeInput = page.locator('input[name="purpose"]');
    this.sendButton = page.locator('button.btn-primary[type="submit"]');
    this.cancelButton = page.locator('button.btn-outline[type="button"]:has-text("Cancel")');

    this.successBlock = page.locator('.success-block');
    this.successText = page.locator('.success-text');
    this.newTransferButton = page.locator('.success-block button:has-text("New transfer")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.cardTitle).toBeVisible();
  }

  async getHintBalanceValue(): Promise<number> {
    await expect(this.balanceHint).toBeVisible();
    const text = await this.balanceHint.innerText();
    const match = text.match(/Balance:\s*(-?\d+(\.\d+)?)/);
    if (!match || !match[1]) {
      throw new Error(`Failed to parse balance from hint: "${text}"`);
    }
    return parseFloat(match[1]);
  }

  async fillTransferForm(
    payloadOrPhone: { phone: string; amount: number | string; purpose: string } | string,
    amount?: number | string,
    purpose?: string
  ): Promise<void> {
    if (typeof payloadOrPhone === 'object') {
      await this.phoneInput.fill(payloadOrPhone.phone);
      await this.phoneInput.blur();
      await this.amountInput.fill(payloadOrPhone.amount.toString());
      await this.purposeInput.fill(payloadOrPhone.purpose);
    } else {
      await this.phoneInput.fill(payloadOrPhone);
      await this.phoneInput.blur();
      if (amount !== undefined) await this.amountInput.fill(amount.toString());
      if (purpose !== undefined) await this.purposeInput.fill(purpose);
    }
  }

  async submitTransfer(): Promise<void> {
    await this.sendButton.click();
  }

  async performTransfer(
    payloadOrPhone: { phone: string; amount: number | string; purpose: string } | string,
    amount?: number | string,
    purpose?: string
  ): Promise<void> {
    await this.fillTransferForm(payloadOrPhone, amount, purpose);
    await this.submitTransfer();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickNewTransfer(): Promise<void> {
    await this.newTransferButton.click();
    await expect(this.phoneInput).toBeVisible();
  }

  async expectTransferSuccess(): Promise<void> {
    await expect(this.successBlock).toBeVisible({ timeout: 5000 });
    await expect(this.successText).toHaveText('Transfer completed');
    await this.expectSnackbarSuccess('Transfer completed successfully');
  }

  async expectInsufficientFundsError(): Promise<void> {
    await this.waitForSnackbar('Transfer failed. Check your balance.');
    await expect(this.successBlock).not.toBeVisible();
  }

  async expectPhoneError(errorText?: string | RegExp): Promise<void> {
    await expect(this.phoneError).toBeVisible();
    if (errorText) {
      await expect(this.phoneError).toContainText(errorText);
    }
  }

  async expectFormCleared(): Promise<void> {
    await expect(this.phoneInput).toHaveValue('');
    await expect(this.amountInput).toHaveValue('');
    await expect(this.purposeInput).toHaveValue('');
  }
}
