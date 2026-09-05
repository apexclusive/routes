import { test, expect } from "@playwright/test";

test("prijzen: jaarlijkse waarde, maandkeuze en veilige checkoutfout", async ({ page }) => {
  await page.route("**/api/billing/checkout", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Checkouttest: niet geconfigureerd." }),
    })
  );
  await page.goto("/prijzen");
  await expect(page).toHaveTitle(/Prijzen/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("vrijheid");
  await expect(page.getByText("€32,88 voordeel")).toBeVisible();

  await page.getByRole("button", { name: "Maand", exact: true }).click();
  await expect(page.getByText("€5,99", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: /Kies Pro Maand/i }).click();
  await expect(page.getByRole("alert")).toContainText("Checkouttest");
});

test("prijzen: mobiel blijft binnen viewport en menu sluit met Escape", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await page.goto("/prijzen");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const trigger = page.getByRole("button", { name: "Site-menu" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Sitenavigatie" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Sitenavigatie" })).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("billing return: annuleren toont eerlijke melding en ruimt URL op", async ({ page }) => {
  await page.goto("/prijzen?billing=cancelled");
  await expect(page.getByRole("status")).toContainText("niets afgeschreven");
  await expect(page).toHaveURL(/\/prijzen$/);
});

test("herroeping: werkt zonder account en bevestigt ontvangst", async ({ page }) => {
  await page.route("**/api/withdrawal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        submittedAt: "2026-09-04T12:00:00.000Z",
        requestId: "123e4567-e89b-12d3-a456-426614174000",
      }),
    })
  );
  await page.goto("/herroepen");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("terugdraaien");
  await page.getByLabel("E-mail bij de betaling").fill("klant@example.nl");
  await page.getByRole("button", { name: "Aankoop herroepen" }).click();
  await expect(page.getByRole("status")).toContainText("Herroeping ontvangen");
  await expect(page.getByRole("status")).toContainText("klant@example.nl");
});

test("privacy en voorwaarden zijn vindbaar en onderling gekoppeld", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Jouw route");
  await expect(page.getByText("Analytics zonder route-inhoud")).toBeVisible();
  await page.getByRole("link", { name: "Voorwaarden", exact: true }).last().click();
  await expect(page).toHaveURL(/\/voorwaarden$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("bestuurder");
});
