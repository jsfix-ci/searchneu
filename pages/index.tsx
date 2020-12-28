/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */
import cx from "classnames";
import React, { useState } from "react";
import Image from "next/image";
import { StringParam, useQueryParam } from "use-query-params";
import Footer from "../components/Footer";
import {
  getLatestTerm,
  getTermDropdownOptionsForCampus,
} from "../components/global";
import HomeSearch from "../components/HomePage/HomeSearch";
import Boston from "../components/icons/boston.svg";
import Logo from "../components/icons/Logo";
import macros from "../components/macros";
import { Campus } from "../components/types";
import Husky from "../components/icons/Husky";
import Head from "next/head";

export default function Home() {
  const [campus, setCampus] = useState(Campus.NEU);

  // The latest term
  const LATEST_TERM = getLatestTerm(campus);

  const [termId = LATEST_TERM, setTermId] = useQueryParam(
    "termId",
    StringParam
  ); // Default to LATEST if term not in params

  const AVAILABLE_TERM_IDS = getTermDropdownOptionsForCampus(campus).map(
    (t) => {
      return t.value;
    }
  );

  // Redirect to latest if we're at an old term
  if (!AVAILABLE_TERM_IDS.includes(termId)) {
    setTermId(LATEST_TERM);
  }

  const [searchFocused, setSearchFocused] = useState(false);

  // On mobile only show the logo and the github corner if there are no results and the search box is not focused (the virtual keyboard is not on the screen).
  let containerClassnames = "home-container";
  if (macros.isMobile && searchFocused) {
    containerClassnames += " mobileCompact";
  }

  // Not totally sure why, but this height: 100% removes the extra whitespace at the bottom of the page caused by the upward translate animation.
  // Actually it only removes the extra whitespace on chrome. Need to come up with a better solution for other browsers.
  return (
    <div className={containerClassnames}>
      <Head>
        <title>Search NEU - {campus} </title>
      </Head>
      <a
        href="https://www.sandboxnu.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="sandboxLogoContainer"
      >
        <Image
          src="/images/sandbox-logo.png"
          alt="sandbox logo"
          width={47}
          height={61}
        />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/sandboxnu/searchneu"
        className="githubCornerContainer"
      >
        <svg width="80" height="80" viewBox="0 0 250 250">
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
          <path
            d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
            fill="currentColor"
            className="octopusArm"
          />
          <path
            d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
            fill="currentColor"
          />
        </svg>
      </a>

      <div>
        <div
          className={cx({
            // TODO: Take this out and restyle this monstrosity from scratch
            ui: true,
            center: true,
            spacing: true,
            aligned: true,
            icon: true,
            header: true,
            topHeader: true,
          })}
        >
          <div className="centerTextContainer">
            <Logo className="logo" aria-label="logo" campus={campus} />

            <HomeSearch
              setTermId={setTermId}
              termId={termId}
              campus={campus}
              setCampus={setCampus}
            />
          </div>
          <Husky className="husky" campus={campus} aria-label="husky" />
          <div className="bostonContainer">
            <Boston className="boston" alt="logo" />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}