import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage.pom';
import { AddBalanceModalComponent } from '../components/AddBalanceModalComponent.pom';

export interface ParsedTransaction {
  id: string;
  date: string;
  typeCol: string; // Header is "Operation Type", contains transactionStatus in bug
  statusCol: string; // Header is "Operation Status", contains transactionType in bug
  amount: number;
}

export class TransactionsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly addBalanceButton: Locator;
  readonly addBalanceModal: AddBalanceModalComponent;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly emptyNotice: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h2:has-text("Transactions")');
    this.addBalanceButton = page.locator('.header button:has-text("Add balance")');
    this.addBalanceModal = new AddBalanceModalComponent(page);
    this.table = page.locator('table.transactions__table');
    this.tableRows = page.locator('table.transactions__table tbody tr');
    this.emptyNotice = page.locator('p.empty:has-text("No transactions yet")');
  }

  async goto(): Promise<void> {
    await this.page.goto('/transactions');
    await expect(this.pageTitle).toBeVisible();
  }

  async openAddBalanceModal(): Promise<void> {
    await this.addBalanceButton.click();
    await this.addBalanceModal.expectOpen();
  }

  async topUpBalance(amount: number): Promise<void> {
    await this.openAddBalanceModal();
    await this.addBalanceModal.addBalance(amount);
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyNotice).toBeVisible();
    await expect(this.tableRows).toHaveCount(0);
  }

  async getTransactionsCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getLatestTransaction(): Promise<ParsedTransaction> {
    await expect(this.tableRows.first()).toBeVisible({ timeout: 5000 });
    const firstRow = this.tableRows.first();
    const cells = firstRow.locator('td');
    
    const id = await cells.nth(0).innerText();
    const date = await cells.nth(1).innerText();
    const typeCol = await cells.nth(2).innerText();
    const statusCol = await cells.nth(3).innerText();
    const amountText = await cells.nth(4).innerText();

    return {
      id,
      date,
      typeCol,
      statusCol,
      amount: parseFloat(amountText),
    };
  }
}
