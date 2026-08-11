import { Html, Head, Main, NextScript } from "next/document";

const Document = () => {
  return (
    <Html lang="zh-HK">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
