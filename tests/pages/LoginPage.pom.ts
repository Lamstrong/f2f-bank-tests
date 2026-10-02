import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.pom';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h2:has-text("Login to F2F Bank")');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]:has-text("Login")');
    this.registerLink = page.locator('a[href="/register"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.title).toBeVisible();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async goToRegister(): Promise<void> {
    await this.registerLink.click();
    await this.page.waitForURL('/register');
  }

  async expectLoginFailed(): Promise<void> {
    await this.expectSnackbarError('Login failed');
    await expect(this.page).toHaveURL(/\/login/);
  }

  async expectAllFieldsRequired(): Promise<void> {
    await this.waitForSnackbar('All fields are required');
  }
}
