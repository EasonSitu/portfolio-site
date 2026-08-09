import test from "node:test";
import assert from "node:assert/strict";
import { siteContent } from "../data/content.mjs";
import { ARCHIVE_GATE_SECTIONS } from "../lib/pageContract.mjs";
import { DESIGN_TOKENS } from "../lib/designTokens.mjs";

const locales = ["en", "zh-CN", "zh-HK"];

for (const locale of locales) {
  test(`${locale} contains every recruiter-facing section`, () => {
    const copy = siteContent[locale];
    assert.ok(copy.hero.name);
    assert.ok(copy.hero.title);
    assert.equal(copy.hero.typewriter.length, 3);
    assert.ok(copy.about.primary);
    assert.equal(copy.about.keywords.length, 5);
    assert.equal(copy.teamValue.items.length, 4);
    assert.equal(copy.skills.length, 3);
    assert.deepEqual(
      copy.hero.workflowLayers.map((layer) => layer.id),
      ["business-context", "requirements", "coordination", "testing", "delivery"],
    );
    assert.ok(copy.positioning.primary);
    assert.equal(copy.metrics.length, 4);
    assert.equal(copy.capabilities.length, 4);
    assert.equal(copy.experience.length, 4);
    assert.equal(copy.aiPractice.length, 4);
    assert.equal(copy.workflow.steps.length, 6);
    assert.ok(copy.experience.every((item) => item.headline && item.description && item.tags?.length));
    assert.ok(copy.aiPractice.every((item) => item.number && item.title && item.description));
    assert.ok(copy.teamValue.items.every((item) => item.title && item.description));
    assert.ok(copy.skills.every((category) => category.title && category.items?.length));
  });

  test(`${locale} exposes valid contact links`, () => {
    const { contact } = siteContent[locale];
    assert.match(contact.email, /^mailto:/);
    assert.equal(contact.linkedin, "");
    assert.equal(contact.resume, "/Zhicheng-Situ-CV.pdf");
  });
}

test("hero typewriter copy is concise and role-accurate in every locale", () => {
  assert.deepEqual(siteContent.en.hero.typewriter, [
    "I deliver digital and AI solutions.",
    "I turn complex requirements into executable plans.",
    "I coordinate people, technology and delivery.",
  ]);
  assert.deepEqual(siteContent["zh-CN"].hero.typewriter, [
    "我推动数字化与 AI 方案落地。",
    "我把复杂需求整理成可执行方案。",
    "我协调业务、技术与项目交付。",
  ]);
  assert.deepEqual(siteContent["zh-HK"].hero.typewriter, [
    "我推動數碼與 AI 方案落地。",
    "我把複雜需求整理成可執行方案。",
    "我協調業務、技術與項目交付。",
  ]);
});

test("capability evidence no longer leads with education", () => {
  for (const locale of locales) {
    assert.doesNotMatch(siteContent[locale].about.primary, /University|大学|大學|本科|學士|学士/i);
  }
});

test("archive gate sections stay in reading order", () => {
  assert.deepEqual(ARCHIVE_GATE_SECTIONS, ["home", "experience", "about", "project", "role", "ai", "contact"]);
  assert.equal(new Set(ARCHIVE_GATE_SECTIONS).size, ARCHIVE_GATE_SECTIONS.length);
});

test("archive gate design tokens keep background, stone, glass and energy distinct", () => {
  assert.deepEqual(
    Object.keys(DESIGN_TOKENS),
    ["space", "spaceDeep", "stone", "glass", "champagne", "ivory", "violet"],
  );
  assert.equal(new Set(Object.values(DESIGN_TOKENS)).size, Object.keys(DESIGN_TOKENS).length);
});

test("metrics retain verified resume values", () => {
  assert.deepEqual(
    siteContent.en.metrics.map((metric) => metric.value),
    ["20+", "10+", "30+", "8"],
  );
});

test("experience chronology and Questwork date are accurate", () => {
  const experience = siteContent.en.experience;
  assert.deepEqual(
    experience.map((item) => item.company),
    [
      "isBIM Limited",
      "Questwork Consultation Company",
      "K Compact Company Limited",
      "Zhuhai Kingsoft Seasun Technology Co., Ltd.",
    ],
  );
  assert.match(experience[1].period, /Mar 2025/);
  assert.match(experience[3].period, /May 2022/);
});
