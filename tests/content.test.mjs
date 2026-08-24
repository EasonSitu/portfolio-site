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
      statement: "I’m strongest when turning requirements that are still unclear into an executable plan, then coordinating clients, technical teams and vendors through testing and delivery. In recent years, I have also used AI in prototypes, solution validation and day-to-day work.",
      closing: "If your team is working on similar problems, I’d be glad to talk.",
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
      statement: "我比较擅长把还不够清晰的需求整理成可以执行的方案，再协调客户、技术团队和供应商一路推进到测试和交付。近年也持续把 AI 用在原型、方案验证和日常工作流程中。",
      closing: "如果你的团队正在做类似的事情，欢迎找我聊聊。",
       location: "香港 · 大湾区",
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
      statement: "我比較擅長把還不夠清晰的需求整理成可以執行的方案，再協調客戶、技術團隊和供應商一路推進到測試和交付。近年也持續把 AI 用在原型、方案驗證和日常工作流程中。",
      closing: "如果你的團隊正在做類似的事情，歡迎找我聊聊。",
       location: "香港 · 大灣區",
      languages: "粵語 · 普通話 · 英語",
    },
  );
});

test("hero typewriter copy is concise and role-accurate in every locale", () => {
  assert.deepEqual(siteContent.en.hero.typewriter, [
    "30+ AI/IoT and digital projects across my career",
    "From requirements analysis and software delivery to real-world implementation",
    "Applied AI prototypes for faster validation and clearer communication",
  ]);
  assert.deepEqual(siteContent["zh-CN"].hero.typewriter, [
    "累计参与 30+ 个 AI/IoT 及数字化项目",
    "从需求分析、软件交付到真实环境实施",
    "以应用型 AI 原型加快方案验证与沟通",
  ]);
  assert.deepEqual(siteContent["zh-HK"].hero.typewriter, [
    "累積參與 30+ 個 AI/IoT 及數碼項目",
    "由需求分析、軟件交付到真實環境實施",
    "以應用型 AI 原型加快方案驗證與溝通",
  ]);
});

test("skills index uses three recruiter-readable groups and verified evidence", () => {
  assert.deepEqual(siteContent.en.skills, [
    {
      title: "Solution Delivery",
      items: ["Requirements Clarification", "Solution Planning", "Deployment & Debugging", "Testing & UAT", "Client & Vendor Coordination"],
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
  assert.match(siteContent.en.aiPractice[1].description, /test its effect and feasibility/i);
  assert.match(siteContent["zh-CN"].aiPractice[2].description, /客户、业务和技术团队/);
  assert.match(siteContent["zh-HK"].aiPractice[0].description, /實際問題/);
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
    ["30+", "10+", "30+", "8"],
  );
});

test("experience chronology and Questwork date are accurate", () => {
  const experience = siteContent.en.experience;
  assert.deepEqual(
    experience.map((item) => item.company),
    [
      "ISBIM LIMITED",
      "Questwork Consulting Limited",
      "K Compact Company Limited",
      "Zhuhai Kingsoft Shiyou Technology Co., Ltd.",
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
      if (["k-compact", "kingame"].includes(item.id)) assert.equal(item.detail.cases.length, 0);
      else assert.ok(item.detail.cases.length >= 1);
      assert.ok(item.detail.cases.every((selectedCase) => selectedCase.title && selectedCase.body));
      if (item.id === "isbim") assert.ok(item.detail.cases.every((selectedCase) => selectedCase.project));
    }
  }

  assert.equal(siteContent.en.experience[0].headline, "Construction technology IoT solution delivery");
  assert.equal(siteContent["zh-CN"].experience[0].headline, "建筑科技 IoT 方案交付");
  assert.equal(siteContent["zh-HK"].experience[0].headline, "建造科技 IoT 方案交付");
  assert.match(siteContent.en.experience[0].detail.overview, /Led 20\+/i);
  assert.match(siteContent["zh-CN"].experience[0].detail.overview, /主导 20\+/);
  assert.match(siteContent["zh-HK"].experience[0].detail.overview, /主導 20\+/);
});

test("copy keeps ownership, role titles and factual boundaries aligned across languages", () => {
  for (const locale of locales) {
    const [isbim, questwork, kCompact, kingame] = siteContent[locale].experience;
    assert.match(isbim.focus, /20\+/);
    assert.match(isbim.detail.sections[1].body, /10\+/);
    assert.equal(kCompact.detail.cases.length, 0);
    assert.equal(kingame.detail.cases.length, 0);
    assert.match(kingame.focus, /30\+/);
    assert.match(kingame.focus, /8/);
    assert.match(siteContent[locale].aiProject.boundary, /prototype|原型/i);
    assert.match(siteContent[locale].aiProject.boundary, /not|并非|並非/i);
    assert.match(siteContent[locale].nav.projects, /Recent Work|近期项目|近期項目/);
    assert.match(siteContent[locale].skillsHeader.title, /What I Do|我能做什么|我能做什麼/);
    assert.match(siteContent[locale].aiPracticeHeader.title, /How I Use AI|我怎样用 AI|我怎樣用 AI/);
    assert.match(siteContent[locale].contact.kicker, /CONTACT|联系我|聯絡我/);
    assert.match(questwork.role, /Software Delivery|软件交付|軟件交付/);
  }
  assert.match(siteContent.en.experience[0].focus, /^Led .*20\+/);
  assert.match(siteContent["zh-CN"].experience[0].focus, /^主导 20\+/);
  assert.match(siteContent["zh-HK"].experience[0].focus, /^主導 20\+/);
  assert.match(siteContent.en.experience[2].focus, /already been paused before I joined/);
  assert.match(siteContent["zh-CN"].experience[2].focus, /接手前任团队留下、当时已经暂停/);
  assert.match(siteContent["zh-HK"].experience[2].focus, /接手前任團隊留下、當時已暫停/);
});

test("experience company names use legal-name formatting in every locale", () => {
  const chineseCompanies = [
    "香港互聯立方有限公司（ISBIM LIMITED）",
    "匯研顧問有限公司（Questwork Consulting Limited）",
    "伽瑪有限公司（K Compact Company Limited）",
    "珠海金山世遊科技有限公司（Zhuhai Kingsoft Shiyou Technology Co., Ltd.）",
  ];
  const englishCompanies = [
    "ISBIM LIMITED",
    "Questwork Consulting Limited",
    "K Compact Company Limited",
    "Zhuhai Kingsoft Shiyou Technology Co., Ltd.",
  ];
  assert.deepEqual(siteContent["zh-HK"].experience.map((item) => item.company), chineseCompanies);
  assert.deepEqual(siteContent["zh-CN"].experience.map((item) => item.company), chineseCompanies);
  assert.deepEqual(siteContent.en.experience.map((item) => item.company), englishCompanies);
});

test("recent work is framed as active software and AI delivery", () => {
  assert.equal(siteContent["zh-HK"].projectHeader.kicker, "近期項目");
  assert.equal(siteContent["zh-CN"].projectHeader.kicker, "近期项目");
  assert.equal(siteContent.en.projectHeader.kicker, "RECENT WORK");
  assert.match(siteContent["zh-HK"].projectHeader.title, /能運行、能驗證/);
  assert.match(siteContent["zh-CN"].projectHeader.title, /能运行、能验证/);
  assert.match(siteContent.en.projectHeader.title, /working, testable products and prototypes/i);
});

test("isBIM project cases keep separate contract, theme and body layers", () => {
  const expectedProjects = {
    en: ["ND/2024/06", "3/WSD/23", "J9064"],
    "zh-CN": ["ND/2024/06", "3/WSD/23", "J9064"],
    "zh-HK": ["ND/2024/06", "3/WSD/23", "J9064"],
  };
  for (const locale of locales) {
    const item = siteContent[locale].experience[0];
    assert.equal(siteContent[locale].experienceHeader.detailCasesLabel, locale === "en" ? "Project Cases" : locale === "zh-CN" ? "项目案例" : "項目案例");
    assert.deepEqual(item.detail.cases.map((selectedCase) => selectedCase.project.split(" · ")[0]), expectedProjects[locale]);
    assert.ok(item.detail.cases.every((selectedCase) => selectedCase.project && selectedCase.title && selectedCase.body));
  }
  assert.match(siteContent.en.experience[0].detail.cases[0].title, /Remote Site Connectivity/);
  assert.match(siteContent.en.experience[0].detail.cases[1].title, /Underground Network Infrastructure/);
  assert.match(siteContent.en.experience[0].detail.cases[2].title, /Integrated 4S \/ IoT/);
});

test("selected work keeps the CIC prototype first and the portfolio project second", () => {
  for (const locale of locales) {
    const projects = siteContent[locale].selectedProjects;
    assert.equal(projects[0].id, "cic-ai-assessment");
    assert.equal(projects[1].id, "portfolio-site");
    assert.match(projects[0].kicker, /CIC/i);
    assert.ok(projects[0].cardTitle);
    assert.match(projects[1].summary, /AI|AI-assisted|AI 輔助|AI 辅助/i);
  }
});
