import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.pom';

export class ProfilePage extends BasePage {
  readonly profileCard: Locator;
  readonly avatar: Locator;
  readonly infoBlock: Locator;
  readonly nameText: Locator;
  readonly surnameText: Locator;
  readonly emailText: Locator;

  constructor(page: Page) {
    super(page);
    this.profileCard = page.locator('.profile__card');
    this.avatar = page.locator('.avatar');
    this.infoBlock = page.locator('.profile__info');
    this.nameText = page.locator('.profile__info p:has-text("Name:")');
    this.surnameText = page.locator('.profile__info p:has-text("Surname:")');
    this.emailText = page.locator('.profile__info p:has-text("Email:")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/profile');
    await expect(this.profileCard).toBeVisible();
  }

  async expectProfileData(expected: { name: string; surname: string; email: string }): Promise<void> {
    await expect(this.nameText).toContainText(expected.name);
    await expect(this.surnameText).toContainText(expected.surname);
    await expect(this.emailText).toContainText(expected.email);
  }
}
