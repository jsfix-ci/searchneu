import Document, { Html, Head, Main, NextScript } from "next/document";
import Macros from "../components/abstractMacros";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e75454" />
          <link
            href="https://fonts.googleapis.com/css?family=Open+Sans:400,700"
            rel="stylesheet"
          />
          {Macros.PROD && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${Macros.googleAnalyticsToken}`}
              />
              <script
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${Macros.googleAnalyticsToken}', {
                    page_path: window.location.pathname,
                  });
                `,
                }}
              />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
