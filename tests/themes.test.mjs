import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_APPEARANCE, isAppearance, MAX_OPACITY, MIN_OPACITY, THEME_IDS, THEMES, themeStyle } from "../src/themes.ts";

function hex(value) {
  assert.match(value, /^#[0-9a-f]{6}$/i);
  return [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}
function rgb(value) { return value.split(" ").map(Number); }
function blend(foreground, background, opacity) {
  return foreground.map((value, index) => value * opacity + background[index] * (1 - opacity));
}
function luminance(color) {
  const linear = color.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function readable(foreground, background, label) {
  const values = [luminance(hex(foreground)), luminance(background)].sort((a, b) => a - b);
  const contrast = (values[1] + 0.05) / (values[0] + 0.05);
  assert.ok(contrast >= 4.5, `${label}: contrast ${contrast.toFixed(2)} is below 4.5`);
}

for (const id of THEME_IDS) {
  test(`${id}: readable foregrounds at both opacity boundaries over black and white`, () => {
    const theme = THEMES[id];
    assert.ok(theme.defaultOpacity >= MIN_OPACITY && theme.defaultOpacity <= MAX_OPACITY);
    for (const opacity of [MIN_OPACITY, MAX_OPACITY]) {
      for (const backdrop of [[0, 0, 0], [255, 255, 255]]) {
        const background = blend(rgb(theme.windowRgb), backdrop, opacity / 100);
        for (const [name, foreground] of Object.entries({ primary: theme.text, muted: theme.muted, accent: theme.accentText })) {
          readable(foreground, background, `${id}/${opacity}/${name}`);
        }
        const panel = blend(rgb(theme.surfaceRgb), background, 0.94);
        const input = blend(rgb(theme.inputRgb), background, 0.96);
        readable(theme.text, panel, `${id}/panel`);
        readable(theme.muted, input, `${id}/input`);
      }
    }
    readable(theme.onAccent, hex(theme.accent), `${id}/button`);
    readable(theme.onAccent, hex(theme.accentHover), `${id}/button-hover`);
    readable(theme.noticeText, hex(theme.noticeBg), `${id}/notice`);
    readable(theme.errorText, hex(theme.errorBg), `${id}/error`);
    readable(theme.onClose, hex(theme.closeBg), `${id}/close`);
  });
}

test("reject malformed or out-of-range appearance payloads", () => {
  assert.ok(isAppearance(DEFAULT_APPEARANCE));
  for (const value of [null, {}, { ...DEFAULT_APPEARANCE, version: 2 },
    { ...DEFAULT_APPEARANCE, theme: "unknown" }, { ...DEFAULT_APPEARANCE, opacity: 79 },
    { ...DEFAULT_APPEARANCE, opacity: 101 }, { ...DEFAULT_APPEARANCE, opacity: 88.5 },
    { ...DEFAULT_APPEARANCE, opacity: NaN }]) assert.equal(isAppearance(value), false);
});

test("all skins provide the same complete CSS token set without changing the selected settings", () => {
  const expected = Object.keys(themeStyle(DEFAULT_APPEARANCE)).sort();
  for (const id of THEME_IDS) {
    const settings = Object.freeze({ version: 1, theme: id, opacity: MIN_OPACITY });
    const style = themeStyle(settings);
    assert.deepEqual(Object.keys(style).sort(), expected);
    assert.ok(Object.values(style).every((value) => value !== undefined && value !== ""));
    assert.equal(style["--window-opacity"], MIN_OPACITY / 100);
    assert.equal(style.colorScheme, THEMES[id].scheme);
    assert.equal(settings.opacity, MIN_OPACITY);
  }
});
