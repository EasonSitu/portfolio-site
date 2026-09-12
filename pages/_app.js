import { calibre, manrope } from "public/fonts";
import "../styles/globals.scss";
import PageCurtain from "../components/PageCurtain";

const App = ({ Component, pageProps }) => {
  return (
    <>
      <div
        className={`${calibre.variable} ${manrope.variable} app-root`}
      >
        <PageCurtain><Component {...pageProps} /></PageCurtain>
      </div>
    </>
  );
};

export default App;
