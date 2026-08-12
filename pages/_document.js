import { Html, Head, Main, NextScript } from "next/document";
import { withPublicBasePath } from "../lib/publicPath.mjs";

const Document = () => {
  return (
    <Html lang="zh-Hant-HK">
      <Head>
        <link rel="manifest" href={withPublicBasePath("/manifest.json")} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
