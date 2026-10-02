import { type Page, type Locator, expect } from '@playwright/test';

export class AddBalanceModalComponent {
  readonly page: Page;
  readonly overlay: Locator;
  readonly modalTitle: Locator;
  readonly amountInput: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.overlay = page.locator('.modal-overlay');
    this.modalTitle = page.locator('.modal h3:has-text("Add balance")');
    this.amountInput = page.locator('.modal input[name="balance"]');
    this.confirmButton = page.locator('.modal button.confirm-btn');
    this.cancelButton = page.locator('.modal button.cancel-btn');
  }

  async expectOpen(): Promise<void> {
    await expect(this.overlay).toBeVisible();
    await expect(this.modalTitle).toBeVisible();
  }

  async expectClosed(): Promise<void> {
    await expect(this.overlay).not.toBeVisible();
  }

  async fillAmount(amount: number | string): Promise<void> {
    await this.amountInput.fill(amount.toString());
  }

  async clickConfirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async addBalance(amount: number | string): Promise<void> {
    await this.expectOpen();
    await this.fillAmount(amount);
    await this.clickConfirm();
    await this.expectClosed();
  }
}
