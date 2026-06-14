import { test, expect } from '@playwright/test';

let eventTypeTitle: string;

test.describe('Booking flow', () => {
  test.beforeEach(async ({ request }) => {
    eventTypeTitle = `Consultation-${Date.now()}`;
    const response = await request.post('http://localhost:4010/admin/event-types', {
      data: {
        title: eventTypeTitle,
        description: 'A 60-minute consultation session',
        durationMinutes: 60,
      },
    });
    const body = await response.json();
    expect(response.ok()).toBeTruthy();
    eventTypeTitle = body.title;
  });

  test('completes full booking flow from homepage to confirmation', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Event Types' })).toBeVisible();
    await expect(page.getByText(eventTypeTitle)).toBeVisible();

    await page.locator('[data-slot="card"]', { hasText: eventTypeTitle }).getByRole('link', { name: 'View' }).click();

    await expect(page.getByText(eventTypeTitle)).toBeVisible();
    await expect(page.getByText('Available Slots')).toBeVisible();

    const slotButton = page.getByRole('button').filter({ hasText: /\d{1,2}:\d{2}/ }).first();
    await slotButton.waitFor({ state: 'visible', timeout: 10000 });
    await slotButton.click();

    await expect(page.getByText(`Book: ${eventTypeTitle}`)).toBeVisible();
    await expect(page.getByText(/Selected time:/)).toBeVisible();

    await page.fill('#guestName', 'John Doe');
    await page.fill('#guestEmail', 'john@example.com');
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible();
    await expect(page.getByText('Your booking has been created successfully.')).toBeVisible();
    await expect(page.locator('code')).toBeVisible();
  });
});
