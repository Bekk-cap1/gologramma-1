import { expect, test, type Page } from "@playwright/test";

const profiles = [
  { name: "desktop", viewport: { width: 1440, height: 1000 } },
  { name: "tablet", viewport: { width: 820, height: 1180 } }
];

test("lab renders, calculates, and 3D canvas is nonblank across viewports", async ({ page }) => {
  for (const profile of profiles) {
    await page.setViewportSize(profile.viewport);
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Transmission Hologram Lab" }).first()).toBeVisible();
    await page.getByLabel("Language").selectOption("en");
    await expect(page.getByText("Ordinary photograph")).toBeVisible();

    await page.getByRole("link", { name: "Calculator" }).click();
    await page.getByLabel("Wavelength λ").fill("532");
    await expect(page.getByText("N = 1 / d(mm)")).toBeVisible();

    await page.getByRole("link", { name: "3D" }).click();
    await expectVisibleWebGlPixels(page, "#visualization canvas");
    await page.getByRole("button", { name: /Interference Mode/ }).click();
    await expectVisibleWebGlPixels(page, "#visualization canvas");
    await page.getByRole("button", { name: /Reconstruction Mode/ }).click();
    await expectVisibleWebGlPixels(page, "#visualization canvas");

    await page.screenshot({ path: `test-results/${profile.name}-hologram-lab.png`, fullPage: false });
  }
});

async function expectVisibleWebGlPixels(page: Page, selector: string) {
  await page.locator(selector).waitFor({ state: "visible" });
  await expect
    .poll(async () => page.locator(selector).evaluate(readCanvasVisibleSamples), { timeout: 10_000 })
    .toBeGreaterThan(25);
}

function readCanvasVisibleSamples(canvas: SVGElement | HTMLElement) {
  if (!(canvas instanceof HTMLCanvasElement) || canvas.width < 100 || canvas.height < 100) return 0;

  const probe = document.createElement("canvas");
  probe.width = 180;
  probe.height = 100;
  const context = probe.getContext("2d");
  if (!context) return 0;

  context.drawImage(canvas, 0, 0, probe.width, probe.height);
  const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
  let visibleSamples = 0;
  for (let index = 0; index < pixels.length; index += 16) {
    if (pixels[index] + pixels[index + 1] + pixels[index + 2] > 45 && pixels[index + 3] > 0) {
      visibleSamples += 1;
    }
  }

  return visibleSamples;
}
