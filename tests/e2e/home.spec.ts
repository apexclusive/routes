import { test, expect, type Locator } from "@playwright/test";

/**
 * Kritieke gebruikersflows, end-to-end. Draait tegen de productie-build
 * (zie playwright.config.ts — de server start vanzelf).
 */

test("homepage laadt met hero, ticker en alle navigatie", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Apex Routes/i);
  // hero spreekt en de data-ticker met corridor-namen staat er
  await expect(page.locator("h1")).toContainText("route");
  await expect(page.locator(".marquee, .ticker").first()).toBeVisible();
  // nav-links naar de toolpagina's
  for (const href of ["/ontdek", "/advies", "/kalender", "/ritbank", "/forum"]) {
    await expect(page.locator(`nav a[href="${href}"]`).first()).toBeVisible();
  }
});

test("taalwissel NL -> EN vertaalt de hero live", async ({ page }) => {
  await page.goto("/");
  const nlSub = await page.locator("h1").textContent();
  await page.locator("button[title], .glass button", { hasText: "EN" }).first().click();
  await expect(page.locator("h1")).not.toHaveText(nlSub ?? "", { timeout: 5000 });
  // html-lang schakelt mee (toegankelijkheid)
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("open de planner: chat staat klaar en /-sneltoets focust het veld", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Open app|app openen/i }).first().click();
  const input = page.locator("#apex-chat-input");
  await expect(input).toBeVisible({ timeout: 10_000 });
  await page.keyboard.press("/");
  await expect(input).toBeFocused();
});

test("checklist: vinken en eigen items blijven bewaard", async ({ page }) => {
  await page.goto("/checklist");
  const eerste = page.locator("main section button[aria-pressed]").first();
  await eerste.click();
  await expect(page.locator("text=/\\d+%/").first()).toBeVisible();
  // eigen item toevoegen (Enter volstaat)
  await page.getByLabel("Nieuw eigen item").fill("E2E tankpas");
  await page.keyboard.press("Enter");
  await expect(page.getByText("E2E tankpas")).toBeVisible();
  // herladen: vink én eigen item staan er nog (localStorage)
  await page.reload();
  await expect(eerste).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("E2E tankpas")).toBeVisible();
});

test("forum: nieuw gesprek starten verschijnt direct", async ({ page }) => {
  await page.goto("/forum");
  await page.getByRole("button", { name: /Nieuw gesprek/i }).first().click();
  await page.getByLabel("Titel").fill("E2E-testdraad Mergelland");
  await page.getByLabel("Je naam").first().fill("E2E");
  await page.getByLabel("Bericht").fill("Playwright was hier — mooie wegen!");
  await page.getByRole("button", { name: /Gesprek starten/i }).click();
  await expect(page.getByText("E2E-testdraad Mergelland")).toBeVisible({ timeout: 5000 });
});

test("gpx-gids: FAQ klapt open met antwoord", async ({ page }) => {
  await page.goto("/gpx");
  const eersteVraag = page.locator("details").first();
  await eersteVraag.locator("summary").click();
  await expect(eersteVraag.locator("p")).toBeVisible();
  const pijl: Locator = eersteVraag.locator("summary svg").last();
  await expect(pijl).toBeVisible();
});
