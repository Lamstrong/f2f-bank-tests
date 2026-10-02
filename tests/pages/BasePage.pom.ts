import { type Page, type Locator, expect } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent.pom';

export class BasePage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly snackbar: Locator;
  readonly snackbarSuccess: Locator;
  readonly snackbarError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.snackbar = page.locator('.snackbar');
    this.snackbarSuccess = page.locator('.snackbar.success');
    this.snackbarError = page.locator('.snackbar.error');
  }

  async waitForSnackbar(text?: string | RegExp): Promise<void> {
    await expect(this.snackbar).toBeVisible({ timeout: 5000 });
    if (text) {
      await expect(this.snackbar).toContainText(text);
    }
  }

  async expectSnackbarSuccess(text?: string | RegExp): Promise<void> {
    await expect(this.snackbarSuccess).toBeVisible({ timeout: 5000 });
    if (text) {
      await expect(this.snackbarSuccess).toContainText(text);
    }
  }

  async expectSnackbarError(text?: string | RegExp): Promise<void> {
    await expect(this.snackbarError).toBeVisible({ timeout: 5000 });
    if (text) {
      await expect(this.snackbarError).toContainText(text);
    }
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
