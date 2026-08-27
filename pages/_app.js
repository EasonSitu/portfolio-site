import { calibre, manrope } from "public/fonts";
import "../styles/globals.scss";

const App = ({ Component, pageProps }) => {
  return (
    <>
      <div
        className={`${calibre.variable} ${manrope.variable} app-root`}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
