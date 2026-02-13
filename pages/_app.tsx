import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SpreadsheetProvider } from "@/context/SpreadsheetContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SpreadsheetProvider>
      <Component {...pageProps} />
    </SpreadsheetProvider>
  );
}