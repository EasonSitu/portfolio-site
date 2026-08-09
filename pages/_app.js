import { calibre, manrope } from "public/fonts";
import "../styles/globals.scss";

const App = ({ Component, pageProps }) => {
  return (
    <>
      <div
        className={`${calibre.variable} ${manrope.variable} font-sans`}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
