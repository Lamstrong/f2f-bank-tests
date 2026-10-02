import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.pom';
import type { UserData } from '../factories/user.factory';

export class RegisterPage extends BasePage {
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly surnameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly registerButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h2:has-text("Register to F2F Bank")');
    this.nameInput = page.locator('input[name="name"]');
    this.surnameInput = page.locator('input[name="surname"]');
    // Notice in RegisterView.vue: name="login" for email input
    this.emailInput = page.locator('input[name="login"]');
    // Notice in RegisterView.vue: name="Type your password" for password input
    this.passwordInput = page.locator('input[name="Type your password"]');
    this.registerButton = page.locator('button[type="submit"]:has-text("Register")');
    this.errorMessage = page.locator('p.error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
    await expect(this.title).toBeVisible();
  }

  async registerUser(user: Partial<UserData>): Promise<void> {
    if (user.name !== undefined) await this.nameInput.fill(user.name);
    if (user.surname !== undefined) await this.surnameInput.fill(user.surname);
    if (user.email !== undefined) await this.emailInput.fill(user.email);
    if (user.password !== undefined) await this.passwordInput.fill(user.password);
    await this.registerButton.click();
  }

  async expectRegistrationSuccess(): Promise<void> {
    await this.expectSnackbarSuccess('Registration successful! Please log in.');
    await expect(this.page).toHaveURL(/\/login/, { timeout: 5000 });
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    await expect(this.errorMessage).toContainText(message);
  }
}
