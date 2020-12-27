import React from "react";
import "../styles/base.scss";
import { QueryParamProvider } from "../utils/QueryParamProvider";
import 'semantic-ui-css/semantic.min.css';
// TODO: Split CSS per page so we don't import all css in every page

function MyApp({ Component, pageProps }) {
  return (
    <QueryParamProvider>
      <Component {...pageProps} />
    </QueryParamProvider>
  );
}

export default MyApp;
