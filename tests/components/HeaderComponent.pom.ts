import { type Page, type Locator, expect } from '@playwright/test';

export class HeaderComponent {
  readonly page: Page;
  readonly logo: Locator;
  readonly navigation: Locator;
  readonly balanceText: Locator;
  readonly mainLink: Locator;
  readonly profileLink: Locator;
  readonly transactionsLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('.header__title-container');
    this.navigation = page.locator('.header__navigation');
    this.balanceText = page.locator('.header__link:has-text("Balance:")');
    this.mainLink = page.locator('.header__link[href="/"]');
    this.profileLink = page.locator('.header__link[href="/profile"]');
    this.transactionsLink = page.locator('.header__link[href="/transactions"]');
    this.logoutButton = page.locator('.header__navigation button');
  }

  async expectLoggedIn(): Promise<void> {
    await expect(this.navigation).toBeVisible({ timeout: 5000 });
  }

  async expectNotLoggedIn(): Promise<void> {
    await expect(this.navigation).not.toBeVisible({ timeout: 5000 });
  }

  async getBalanceValue(): Promise<number> {
    await expect(this.balanceText).toBeVisible();
    const text = await this.balanceText.innerText();
    // Format is "Balance: 100" or "Balance: 0"
    const match = text.match(/Balance:\s*(-?\d+(\.\d+)?)/);
    if (!match || !match[1]) {
      throw new Error(`Failed to parse balance from string: "${text}"`);
    }
    return parseFloat(match[1]);
  }

  async expectBalance(expectedAmount: number): Promise<void> {
    await expect(this.balanceText).toContainText(`Balance: ${expectedAmount}`);
  }

  async goToMain(): Promise<void> {
    await this.mainLink.click();
    await this.page.waitForURL('/');
  }

  async goToProfile(): Promise<void> {
    await this.profileLink.click();
    await this.page.waitForURL('/profile');
  }

  async goToTransactions(): Promise<void> {
    await this.transactionsLink.click();
    await this.page.waitForURL('/transactions');
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForURL('/login');
  }
}
