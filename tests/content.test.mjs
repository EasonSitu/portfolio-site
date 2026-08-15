import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { siteContent } from "../data/content.mjs";
import { ARCHIVE_GATE_SECTIONS, DEFAULT_LOCALE } from "../lib/pageContract.mjs";
import { DESIGN_TOKENS } from "../lib/designTokens.mjs";

const indexSource = readFileSync(new URL("../pages/index.js", import.meta.url), "utf8");
const documentSource = readFileSync(new URL("../pages/_document.js", import.meta.url), "utf8");

const locales = ["en", "zh-CN", "zh-HK"];

for (const locale of locales) {
  test(`${locale} contains every recruiter-facing section`, () => {
    const copy = siteContent[locale];
    assert.ok(copy.hero.name);
    assert.match(copy.hero.name, /Eason/);
    assert.ok(copy.hero.namePrimary);
    assert.equal(copy.hero.nameLatin, "Eason");
    assert.equal(`${copy.hero.namePrimary} ${copy.hero.nameLatin}`, copy.hero.name);
    assert.doesNotMatch(copy.hero.name, /[。.!！]$/);
    assert.ok(copy.hero.title);
    assert.equal(copy.hero.typewriter.length, 3);
    assert.ok(copy.about.primary);
    assert.equal(copy.about.keywords.length, 5);
    assert.equal(copy.skills.length, 3);
    assert.ok(copy.skillsHeader.title);
    assert.ok(copy.skillsHeader.intro);
    assert.equal(copy.skillsEvidence.length, 3);
    assert.deepEqual(
      copy.hero.workflowLayers.map((layer) => layer.id),
      ["business-context", "requirements", "coordination", "testing", "delivery"],
    );
    assert.ok(copy.positioning.primary);
    assert.equal(copy.positioning.secondary, undefined);
    assert.equal(copy.metrics.length, 4);
    assert.equal(copy.experience.length, 4);
    assert.equal(copy.aiPractice.length, 3);
    assert.ok(copy.aiPracticeHeader.title);
    assert.ok(copy.aiPracticeHeader.intro);
    assert.ok(copy.aiPracticeClosing);
    assert.equal(copy.about.secondary, undefined);
    assert.equal(copy.capabilities, undefined);
    assert.equal(copy.teamValue, undefined);
    assert.equal(copy.workflow, undefined);
    assert.equal(copy.evidence, undefined);
    assert.equal(copy.aiHeader, undefined);
    assert.ok(copy.selectedProjects.length >= 1);
    assert.equal(copy.selectedProjects.length, 2);
    assert.deepEqual(
      copy.selectedProjects.map((project) => project.id),
      ["cic-ai-assessment", "portfolio-site"],
    );
    assert.ok(copy.selectedProjects.every((project) => project.title && project.summary && project.tags?.length >= 3));
    assert.equal(copy.experienceHeader.intro, undefined);
    assert.equal(copy.footer, undefined);
    assert.ok(copy.experience.every((item) => item.focus && item.tags?.length >= 3 && item.tags.length <= 4));
    assert.ok(copy.aiPractice.every((item) => item.number && item.title && item.description));
    assert.ok(copy.skills.every((category) => category.title && category.items?.length));
  });

  test(`${locale} exposes valid contact links`, () => {
    const { contact } = siteContent[locale];
    assert.match(contact.email, /^mailto:/);
    assert.equal(contact.linkedin, "");
    assert.equal(contact.resume, "/Zhicheng-Situ-CV.pdf");
    assert.equal(contact.emailAddress, "situeason@gmail.com");
    assert.ok(contact.location);
    assert.ok(contact.closing);
    assert.equal(contact.talkTitle, "LET'S\nTALK.");
  });
}

test("contact copy follows the approved recruiter-facing message hierarchy", () => {
  assert.deepEqual(
    {
      title: siteContent.en.contact.title,
      statement: siteContent.en.contact.statement,
      closing: siteContent.en.contact.closing,
      location: siteContent.en.contact.location,
      languages: siteContent.en.contact.languages,
    },
    {
      title: "I want to keep working where business needs, technology and delivery come together.",
       statement: "I’m interested in digital and AI solution delivery, implementation, project coordination and applied AI, especially work that solves real problems and gets used in practice.",
      closing: "If my experience connects with something your team is working on, I’d be glad to talk.",
      location: "Hong Kong",
      languages: "Cantonese · Mandarin · English",
    },
  );
  assert.deepEqual(
    {
      title: siteContent["zh-CN"].contact.title,
      statement: siteContent["zh-CN"].contact.statement,
      closing: siteContent["zh-CN"].contact.closing,
      location: siteContent["zh-CN"].contact.location,
      languages: siteContent["zh-CN"].contact.languages,
    },
    {
      title: "我希望继续做连接业务、技术与交付的工作。",
       statement: "我关注数字化与 AI 方案交付、实施、项目协调及应用型 AI，希望参与真正能够解决问题并落地使用的项目。",
      closing: "如果你认为我的经历与你的团队正在推进的事情有关，欢迎和我聊聊。",
      location: "香港 · 深圳",
      languages: "粤语 · 普通话 · 英语",
    },
  );
  assert.deepEqual(
    {
      title: siteContent["zh-HK"].contact.title,
      statement: siteContent["zh-HK"].contact.statement,
      closing: siteContent["zh-HK"].contact.closing,
      location: siteContent["zh-HK"].contact.location,
      languages: siteContent["zh-HK"].contact.languages,
    },
    {
      title: "我希望繼續做連接業務、技術與交付的工作。",
       statement: "我關注數碼與 AI 方案交付、實施、項目協調及應用型 AI，希望參與真正能夠解決問題並落地使用的項目。",
      closing: "如果你認為我的經歷與你的團隊正在推進的事情有關，歡迎和我聊聊。",
      location: "香港 · 深圳",
      languages: "粵語 · 普通話 · 英語",
    },
  );
});

test("hero typewriter copy is concise and role-accurate in every locale", () => {
  assert.deepEqual(siteContent.en.hero.typewriter, [
    "30+ AI/IoT and digital projects",
    "From product requirements to real-world delivery",
    "Applied AI for faster validation and clearer workflows",
  ]);
  assert.deepEqual(siteContent["zh-CN"].hero.typewriter, [
    "参与 30+ 个 AI/IoT 及数字化项目",
    "从产品需求、软件交付到真实环境实施",
    "持续探索 AI 在工作中的实际应用",
  ]);
  assert.deepEqual(siteContent["zh-HK"].hero.typewriter, [
    "參與 30+ 個 AI/IoT 及數碼項目",
    "由產品需求、軟件交付到真實環境實施",
    "持續探索 AI 在工作中的實際應用",
  ]);
});

test("skills index uses three recruiter-readable groups and verified evidence", () => {
  assert.deepEqual(siteContent.en.skills, [
    {
      title: "Solution Delivery",
      items: ["Requirements", "Deployment & Debugging", "Testing & UAT", "Client & Vendor Coordination"],
    },
    {
      title: "Product & Software",
      items: ["BRD / PRD", "Process Mapping", "Prototyping", "Agile / Scrum", "Technical Documentation"],
    },
    {
      title: "Applied AI",
      items: ["Generative AI", "Python", "RAG", "YOLO", "OpenCV", "MediaPipe", "Rapid Prototyping"],
    },
  ]);
  assert.deepEqual(siteContent["zh-CN"].skillsEvidence, [
    "20+ ConTech IoT 项目",
    "30+ PRD",
    "8 次产品迭代",
  ]);
  assert.deepEqual(siteContent["zh-HK"].skillsEvidence, [
    "20+ 建造科技 IoT 項目",
    "30+ PRD",
    "8 次產品迭代",
  ]);
});

test("AI practice frames applied AI as a three-step validation capability", () => {
  for (const locale of locales) {
    const copy = siteContent[locale];
    assert.equal(copy.aiPractice.length, 3);
    assert.deepEqual(copy.aiPractice.map((item) => item.number), ["01", "02", "03"]);
    assert.ok(copy.aiPractice.every((item) => item.title && item.description));
    assert.ok(copy.aiPracticeHeader.title);
    assert.ok(copy.aiPracticeHeader.intro);
    assert.ok(copy.aiPracticeClosing);
  }
  assert.match(siteContent.en.aiPractice[1].description, /knowledge bases/i);
  assert.match(siteContent["zh-CN"].aiPractice[2].description, /客户、业务和技术团队/);
  assert.match(siteContent["zh-HK"].aiPractice[0].description, /業務問題/);
});

test("hero greeting is concise and unpunctuated in every locale", () => {
  assert.equal(siteContent.en.hero.eyebrow, "Hello, it’s good to meet you");
  assert.equal(siteContent["zh-CN"].hero.eyebrow, "你好，很高兴认识你");
  assert.equal(siteContent["zh-HK"].hero.eyebrow, "你好，很高興認識你");
});

test("capability evidence no longer leads with education", () => {
  for (const locale of locales) {
    assert.doesNotMatch(siteContent[locale].about.primary, /University|大学|大學|本科|學士|学士/i);
  }
});

test("archive gate sections stay in reading order", () => {
  assert.deepEqual(ARCHIVE_GATE_SECTIONS, ["home", "experience", "project", "skills", "contact"]);
  assert.equal(new Set(ARCHIVE_GATE_SECTIONS).size, ARCHIVE_GATE_SECTIONS.length);
});

test("the site defaults to Traditional Chinese before hydration", () => {
  assert.equal(DEFAULT_LOCALE, "zh-HK");
  assert.match(indexSource, /useState\(DEFAULT_LOCALE\)/);
  assert.match(documentSource, /<Html lang="zh-Hant-HK">/);
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
      "Kingame Corporation Limited",
    ],
  );
  assert.match(experience[1].period, /Mar 2025/);
  assert.match(experience[3].period, /May 2022/);
});

test("experience entries provide concise cards and detailed reports in every locale", () => {
  const expectedIds = ["isbim", "questwork", "k-compact", "kingame"];

  for (const locale of locales) {
    const copy = siteContent[locale];
    assert.deepEqual(copy.experience.map((item) => item.id), expectedIds);
    assert.ok(copy.experienceHeader.detailOverviewLabel);
    assert.ok(copy.experienceHeader.detailSectionsLabel);
    assert.ok(copy.experienceHeader.detailCasesLabel);

    for (const item of copy.experience) {
      assert.ok(item.headline);
      assert.ok(item.focus);
      assert.ok(item.tags.length >= 3 && item.tags.length <= 4);
      assert.ok(item.detail?.overview);
      assert.ok(item.detail.sections.length >= 2);
      assert.ok(item.detail.sections.every((section) => section.title && section.body));
      assert.ok(item.detail.cases.length >= 1);
      assert.ok(item.detail.cases.every((selectedCase) => selectedCase.title && selectedCase.body));
    }
  }

  assert.equal(siteContent.en.experience[0].headline, "Construction technology IoT solution delivery");
  assert.equal(siteContent["zh-CN"].experience[0].headline, "建筑科技 IoT 方案交付");
  assert.equal(siteContent["zh-HK"].experience[0].headline, "建造科技 IoT 方案交付");
  assert.match(siteContent.en.experience[0].detail.overview, /site surveys/i);
  assert.match(siteContent["zh-CN"].experience[0].detail.overview, /现场勘测/);
  assert.match(siteContent["zh-HK"].experience[0].detail.overview, /現場勘測/);
});

test("selected work keeps the CIC prototype first and the portfolio project second", () => {
  for (const locale of locales) {
    const projects = siteContent[locale].selectedProjects;
    assert.equal(projects[0].id, "cic-ai-assessment");
    assert.equal(projects[1].id, "portfolio-site");
    assert.match(projects[0].kicker, /CIC/i);
    assert.match(projects[1].summary, /AI|AI-assisted|AI 輔助|AI 辅助/i);
  }
});
