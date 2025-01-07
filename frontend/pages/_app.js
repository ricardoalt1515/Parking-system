import Navbar from "../components/Navbar";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Navbar />
      <main className="pt-20">
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;
