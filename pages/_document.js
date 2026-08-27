import { Html, Head, Main, NextScript } from "next/document";
import { withPublicBasePath } from "../lib/publicPath.mjs";

const INITIAL_LOCALE_SCRIPT = `
(function () {
  try {
    var saved = window.localStorage.getItem("portfolio-locale");
    var languages = { en: "en", "zh-CN": "zh-CN", "zh-HK": "zh-Hant-HK" };
    if (saved && languages[saved]) {
      document.documentElement.lang = languages[saved];
      document.documentElement.dataset.portfolioLocale = saved;
    }
  } catch (error) {
    // localStorage can be unavailable in privacy-restricted browsers.
  }
})();
`;

const Document = () => {
  return (
    <Html lang="zh-Hant-HK">
      <Head>
        <link rel="manifest" href={withPublicBasePath("/manifest.json")} />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: INITIAL_LOCALE_SCRIPT }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
