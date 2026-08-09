import test from "node:test";
import assert from "node:assert/strict";
import { resolveLocale } from "../utils/i18n.mjs";

test("a valid saved preference wins", () => {
  assert.equal(resolveLocale("en", "zh-HK"), "zh-HK");
});

test("a supported browser locale is used when no preference exists", () => {
  assert.equal(resolveLocale("zh-CN", null), "zh-CN");
});

test("unsupported values fall back to English", () => {
  assert.equal(resolveLocale("fr", null), "en");
});
