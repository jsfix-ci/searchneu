import Head from "next/head";
import React from "react";
import "semantic-ui-css/semantic.min.css";
import "../styles/base.scss";
import { QueryParamProvider } from "../utils/QueryParamProvider";

// TODO: Split CSS per page so we don't import all css in every page

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="description" content="Search for Northeastern" />
        <meta name="author" content="Sandbox" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <QueryParamProvider>
        <Component {...pageProps} />
      </QueryParamProvider>
    </>
  );
}

export default MyApp;
