// End-to-end Ant Design regression. All /api requests are intercepted in an isolated browser.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dashboardFixture } from "./dashboard-fixture.mjs";
const { chromium } = await import(
  process.env.WORKMEMO_PLAYWRIGHT
    ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href
    : "playwright"
);
const output = new URL("../artifacts/web-ui/qa/", import.meta.url);
const baseUrl = process.env.WORKMEMO_WEB_URL ?? "http://127.0.0.1:1420";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "Asia/Shanghai",
});
if (process.env.WORKMEMO_WEB_URL) {
  // Match the Rust data server's CSP while testing the compiled, local assets.
  await context.route("**/dashboard", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  });
}
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [],
  warnings = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (value) => {
  if (
    value.type() === "error" &&
    !value.text().includes("status of 500") &&
    !value.text().includes("status of 409")
  )
    warnings.push(value.text());
});
const state = await dashboardFixture(page);
const shot = (name) =>
  page.screenshot({
    path: fileURLToPath(new URL(name + ".png", output)),
    fullPage: false,
  });
const result = { baseUrl };
const layoutOnly = process.argv.includes("--layout-only");
const sheet = page.locator(".dc-sheet-root .wm-drawer-section");
const editor = page.locator("#dc-editor");
const report = page.locator(".dc-category-report");
const quantity = page.getByRole("textbox", { name: "工作量", exact: true });
async function open(edit = false, index = 0) {
  await page.locator(".dc-page").waitFor({ state: "visible" });
  const background = await page.locator(".dc-page").boundingBox();
  await page
    .locator(".dc-records")
    .getByRole("button", { name: edit ? "编辑" : "详情", exact: true })
    .nth(index)
    .click();
  await sheet.waitFor();
  await page.waitForTimeout(350);
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".wm-drawer-content-wrapper")
        ?.className.includes("-active"),
  );
  const locked = await page.locator(".dc-page").boundingBox();
  assert.ok(
    Math.abs(background.x - locked.x) < 1 &&
      Math.abs(background.width - locked.width) < 1,
    "opening the sheet must not shift the background",
  );
}
async function close() {
  await sheet.getByRole("button", { name: "关闭", exact: true }).click();
  await sheet.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.querySelector(".dc-page")?.inert === false,
  );
}
async function select(label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page
    .locator(".wm-select-dropdown:visible")
    .getByText(option, { exact: true })
    .last()
    .click();
}
try {
  await page.goto(`${baseUrl}/dashboard#token=isolated-web-ui-fixture`);
  await report.getByText("128.5", { exact: true }).waitFor();
  assert.equal(await page.locator(".dc-kpi").count(), 3);
  assert.equal(await report.locator("tbody tr[data-row-key]").count(), 4);
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(1).textContent(),
    "0",
  );
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(2).textContent(),
    "待补填",
  );
  await shot("overview-desktop");
  await page.screenshot({
    path: fileURLToPath(new URL("overview-full.png", output)),
    fullPage: true,
  });
  if (!layoutOnly) {
    await page.waitForTimeout(350);
    const graph = await page.locator(".dc-trend .dc-chart").screenshot();
    await page.waitForTimeout(2400);
    assert.deepEqual(
      await page.locator(".dc-trend .dc-chart").screenshot(),
      graph,
      "unchanged polling must not redraw a different chart",
    );
    result.stablePolling = true;

    await open(true);
    assert.equal(state.saves, 0, "entering edit must not submit");
    await page.waitForFunction(
      () => document.activeElement?.id === "dc-quantity",
    );
    await shot("edit-desktop");
    const geometry = await sheet.boundingBox();
    assert.ok(
      geometry.width <= 761 && geometry.height <= 881,
      JSON.stringify(geometry),
    );
    assert.ok(
      Math.abs(geometry.y + geometry.height / 2 - 500) < 2 && Math.abs(geometry.x + geometry.width / 2 - 720) < 2,
      JSON.stringify(geometry),
    );
    const scrollY = await page.evaluate(() => scrollY);
    await page.mouse.move(80, 200);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(180);
    assert.equal(
      await page.evaluate(() => window.scrollY),
      scrollY,
      "background wheel is locked",
    );
    await quantity.fill("0");
    for (const status of [500, 409]) {
      state.saveFailure = status;
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet
        .getByRole("alert")
        .filter({
          hasText: status === 409 ? "记录已被其他窗口修改" : "隔离保存失败",
        })
        .waitFor();
      assert.equal(await quantity.inputValue(), "0");
    }
    state.saveFailure = null;
    state.queryDelay = 900;
    await page.evaluate(() => {
      window.webFrames = [];
      window.webSample = true;
      const sample = () => {
        if (!window.webSample) return;
        window.webFrames.push({
          report: !!document.querySelector(".dc-report-table tbody"),
          kpi: document.querySelector(".dc-kpi strong")?.textContent,
          y: scrollY,
          loading: !!document.querySelector(".dc-category-report .dc-loading"),
        });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await page.waitForTimeout(1200);
    const frames = await page.evaluate(() => {
      window.webSample = false;
      return window.webFrames;
    });
    assert.ok(frames.length > 10);
    assert.ok(
      frames.every(
        (frame) =>
          frame.report &&
          !frame.loading &&
          !frame.kpi.startsWith("—") &&
          frame.y === scrollY,
      ),
      "save must preserve the background at every sampled frame",
    );
    await close();
    await report.getByText("98.5", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.scrollY), scrollY);
    assert.equal(
      await page
        .locator(".dc-records")
        .getByRole("button", { name: "编辑", exact: true })
        .first()
        .evaluate((el) => el === document.activeElement),
      true,
    );
    state.queryDelay = 0;
    result.saveNoFlicker = {
      sampledFrames: frames.length,
      zero: true,
      failuresPreserveInput: true,
      focusRestored: true,
    };

    state.queryFailure = true;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor();
    await report.getByText("98.5", { exact: true }).waitFor();
    state.queryFailure = false;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor({ state: "detached" });
    result.staleSnapshotLabel = true;

    await open(true);
    await quantity.fill("12.5");
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    const guard = page.getByRole("dialog", { name: "保留未保存的修改？" });
    await guard.waitFor();
    await page.waitForFunction(
      () => document.activeElement?.textContent === "继续编辑",
    );
    await shot("unsaved-confirmation");
    await page.keyboard.press("Control+s");
    assert.equal(state.saves, 3);
    await page.keyboard.press("Escape");
    await guard.waitFor({ state: "hidden" });
    assert.equal(await quantity.inputValue(), "12.5");
    assert.equal(
      await sheet.isVisible(),
      true,
      "one Escape must close only the confirmation",
    );
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.nestedGuard = true;

    await open(true);
    await quantity.fill("1.25e2");
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.records[0].quantity, 125);
    await close();
    result.scientificQuantity = true;

    // Invalid quantities remain strings and never reach the save endpoint.
    await open(true);
    const beforeInvalid = state.saves;
    for (const value of ["-1", "1e-9999", "1000000001"]) {
      await quantity.fill(value);
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet.getByRole("alert").waitFor();
      assert.equal(state.saves, beforeInvalid);
      assert.equal(await quantity.inputValue(), value);
    }
    // Official Select popup stays inside the sheet and has keyboard selection.
    await sheet
      .getByRole("combobox", { name: "工作类别", exact: true })
      .click();
    const popup = sheet.locator(".wm-select-dropdown:visible");
    await popup.getByText("质检", { exact: true }).last().click();
    assert.equal(
      await sheet
        .getByRole("combobox", { name: "工作类别", exact: true })
        .getAttribute("aria-expanded"),
      "false",
    );
    await sheet
      .getByRole("button", { name: "关闭", exact: true })
      .last()
      .click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.validationAndSheetSelect = true;

    // Persisted writes cannot be relabelled as failed when a follow-up GET fails.
    await open(true);
    await quantity.fill("126");
    state.detailFailure = true;
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await sheet
      .getByRole("alert")
      .filter({ hasText: "已保存，详情刷新失败" })
      .waitFor();
    assert.equal(state.records[0].quantity, 126);
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    state.detailFailure = false;
    await close();
    result.committedReadFailure = true;

    // The guard's own save succeeds/fails without submitting the underlying form twice.
    await open(true);
    await quantity.fill("127");
    await page.keyboard.press("Escape");
    await guard.waitFor();
    const beforeGuardSave = state.saves;
    state.saveFailure = 500;
    await guard
      .getByRole("button", { name: "保存并继续", exact: true })
      .click();
    await guard
      .getByRole("alert")
      .filter({ hasText: "隔离保存失败" })
      .waitFor();
    assert.equal(state.saves, beforeGuardSave + 1);
    state.saveFailure = null;
    await guard.getByRole("button", { name: /保存并继续$/ }).click();
    await guard.waitFor({ state: "hidden" });
    await sheet.waitFor({ state: "hidden" });
    assert.equal(state.records[0].quantity, 127);
    result.guardSave = true;

    // DatePicker and Segmented retain natural-period and local-date semantics.
    await page
      .locator(".dc-period-bar")
      .getByText("周", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-10-26 — 2026-11-01" })
      .waitFor();
    assert.equal(
      await page.getByRole("button", { name: "下一周期" }).isEnabled(),
      true,
    );
    await page.getByRole("button", { name: "下一周期" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-11-02 — 2026-11-08" })
      .waitFor();
    await page.getByRole("button", { name: "上一周期" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("月", { exact: true })
      .click();
    const date = page.getByRole("textbox", { name: "基准日期", exact: true });
    await date.fill("2024-02-29");
    await date.press("Enter");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2024 年 02 月" })
      .waitFor();
    assert.equal(state.currentQuery.anchor_date, "2024-02-29");
    await date.click();
    await page.locator(".wm-picker-dropdown:visible").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "本月", exact: true }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("自定义", { exact: true })
      .click();
    await page.getByRole("button", { name: "全部日期", exact: true }).click();
    await page
      .locator(".dc-category-report")
      .getByText("最早记录 — 至今", { exact: false })
      .waitFor();
    await select("筛选工作类别", "代码开发");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".dc-report-table tbody tr[data-row-key]")
          .length === 1,
    );
    assert.equal(state.currentQuery.category, "开发");
    await select("筛选工作类别", "全部类别");
    await select("数据范围", "演示数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("999", { exact: true }).waitFor();
    await select("数据范围", "真实数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("日", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026.10.29" })
      .waitFor();
    result.periodsAndScopes = true;

    // An older, deliberately delayed query must not overwrite the latest result.
    state.delayFor = (query) => (query.category === "评测" ? 650 : 0);
    await select("筛选工作类别", "评测");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await select("筛选工作类别", "质检");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("0", { exact: true }).waitFor();
    await page.waitForTimeout(850);
    assert.equal(await report.locator("tbody tr[data-row-key]").count(), 1);
    assert.equal(await report.locator(".work-badge").innerText(), "质检");
    state.delayFor = null;
    await select("筛选工作类别", "全部类别");
    await page.getByRole("button", { name: "应用筛选" }).click();
    result.staleRequestIgnored = true;

    // Pagination is controlled by the existing 50-row backend contract.
    state.many = true;
    await page.getByRole("button", { name: "刷新连接" }).click();
    await page.locator(".wm-pagination-item-2").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".wm-pagination-item-active")?.textContent ===
        "2",
    );
    assert.equal(state.currentQuery.page, 2);
    state.many = false;
    await page.locator(".wm-pagination-item-1").click();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "详情", exact: true })
      .first()
      .waitFor();
    result.pagination = true;

    // Read-only active records and explicit delete confirmation.
    const activeRow = page.locator('.dc-records tr[data-row-key="99"]');
    assert.equal(
      await activeRow
        .getByRole("button", { name: "编辑", exact: true })
        .isDisabled(),
      true,
    );
    await activeRow.getByRole("button", { name: "详情", exact: true }).click();
    await sheet.waitFor();
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    await close();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "删除", exact: true })
      .first()
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion.waitFor();
    assert.equal(state.deletes, 0);
    await deletion.getByRole("button", { name: "取消", exact: true }).click();
    await deletion.waitFor({ state: "hidden" });
    assert.equal(state.deletes, 0);
    result.readOnlyAndDeleteCancel = true;

    // Body-only scrolling, nested focus, boundary chaining, short-screen footer.
    state.segments = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      start_time: state.records[0].start_time,
      end_time: state.records[0].end_time,
      duration_ms: 30000,
      state: "CLOSED",
    }));
    await page.setViewportSize({ width: 1024, height: 520 });
    await open();
    await sheet.getByRole("button", { name: "计时区间（25）" }).click();
    const body = sheet.locator(".wm-drawer-body");
    await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const bodyTop = await body.evaluate((el) => el.scrollTop),
      backgroundTop = await page.evaluate(() => scrollY);
    await body.hover();
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => scrollY), backgroundTop);
    assert.ok((await body.evaluate((el) => el.scrollTop)) >= bodyTop);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator(".dc-sheet-root")
          .evaluate((el) => el.contains(document.activeElement)),
        true,
        JSON.stringify(
          await page.evaluate(() => ({
            focused: document.activeElement?.outerHTML.slice(0, 500),
          })),
        ),
      );
    }
    const footer = await sheet.locator(".wm-drawer-footer").boundingBox();
    assert.ok(footer.y + footer.height <= 520 && footer.y >= 0);
    await close();
    state.segments = [];
    result.shortScreenScrollAndFocus = true;
  }

  const widths = [];
  for (const width of [390, 640, 800, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(160);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `page overflow ${width}`,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await shot("overview-" + width);
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(
      Math.abs(box.y + box.height / 2 - 500) < 2 && Math.abs(box.x + box.width / 2 - width / 2) < 2,
      JSON.stringify({ width, ...box }),
    );
    await shot("sheet-" + width);
    await close();
    widths.push(width);
  }
  result.widths = widths;
  const zooms = [];
  for (const zoom of [1.25, 1.5]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(
      (value) => (document.documentElement.style.zoom = String(value)),
      zoom,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(
      box.x >= 0 &&
        box.x + box.width <= 1281 &&
        box.y >= 0 &&
        box.y + box.height <= 901 && Math.abs(box.y + box.height / 2 - 450) < 2 && Math.abs(box.x + box.width / 2 - 640) < 2,
      JSON.stringify({ zoom, ...box }),
    );
    await shot("zoom-" + zoom);
    await close();
    zooms.push(zoom);
  }
  await page.evaluate(() => (document.documentElement.style.zoom = "1"));
  result.cssZooms = zooms;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(true);
  await shot("reduced-motion");
  await close();
  result.reducedMotion = true;
  if (!layoutOnly) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      window.motionFrames = [];
      window.sampleMotion = true;
      const sample = () => {
        if (!window.sampleMotion) return;
        const panel = document.querySelector(".wm-drawer-section");
        if (panel?.getClientRects().length)
          window.motionFrames.push({
            y: panel.getBoundingClientRect().y,
            locked: document.querySelector(".dc-page").inert,
          });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await open();
    const settled = await sheet.boundingBox();
    await close();
    const animation = await page.evaluate(() => {
      window.sampleMotion = false;
      return window.motionFrames;
    });
    assert.ok(
      animation.some((frame) => frame.y > settled.y + 20),
      "official bottom motion must move the panel",
    );
    assert.ok(
      animation.every((frame) => frame.locked),
      "background remains locked throughout both motions",
    );
    result.officialMotion = { frames: animation.length };

    await open(true);
    await quantity.fill("128");
    state.saveDelay = 400;
    const before = state.saves;
    await sheet.locator('button[form="dc-editor"]').click();
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.saves, before + 1);
    await close();
    state.saveDelay = 0;
    result.noDuplicateSubmission = true;

    const count = state.records.length;
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .getByRole("button", { name: "删除", exact: true })
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion
      .getByRole("button", { name: "确认删除", exact: true })
      .click();
    await deletion.waitFor({ state: "hidden" });
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .waitFor({ state: "detached" });
    assert.equal(state.records.length, count - 1);
    assert.equal(state.deletes, 1);
    result.deleteAndRefresh = true;

    const firstFailure = await context.newPage();
    const failed = await dashboardFixture(firstFailure);
    failed.queryFailure = true;
    firstFailure.on("pageerror", (error) => errors.push(error.message));
    await firstFailure.goto(
      `${baseUrl}/dashboard#token=isolated-first-failure`,
    );
    await firstFailure
      .getByRole("alert")
      .filter({ hasText: "隔离统计读取失败" })
      .waitFor();
    assert.ok(
      (await firstFailure.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await firstFailure.close();
    const unauth = await context.newPage();
    unauth.on("pageerror", (error) => errors.push(error.message));
    await unauth.goto(`${baseUrl}/dashboard`);
    await unauth
      .getByRole("alert")
      .filter({ hasText: "请从 WorkMemo 打开数据中心" })
      .waitFor();
    assert.ok(
      (await unauth.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await unauth.close();
    result.firstLoadAndAuthorizationErrors = true;
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  await writeFile(
    new URL(
      layoutOnly
        ? "layout-result.json"
        : process.env.WORKMEMO_WEB_URL
          ? "production-result.json"
          : "result.json",
      output,
    ),
    JSON.stringify({ ...result, errors, warnings }, null, 2),
  );
  console.log(JSON.stringify(result));
} catch (error) {
  await shot("failure");
  await writeFile(
    new URL("failure-aria.txt", output),
    await sheet.ariaSnapshot().catch(() => "sheet missing"),
  );
  await writeFile(
    new URL("failure.json", output),
    JSON.stringify(
      {
        message: error.message,
        errors,
        warnings,
        saves: state.saves,
        requests: state.requests.slice(-6),
        sheet: await sheet
          .evaluate((el) => ({
            inert: el.closest("[inert]")?.outerHTML.slice(0, 100),
            ariaHidden: el.closest("[aria-hidden]")?.outerHTML.slice(0, 100),
            buttons: [...el.querySelectorAll("button")].map((b) => ({
              text: b.textContent,
              disabled: b.disabled,
              hidden: b.closest("[aria-hidden]")?.getAttribute("aria-hidden"),
            })),
          }))
          .catch(() => null),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
