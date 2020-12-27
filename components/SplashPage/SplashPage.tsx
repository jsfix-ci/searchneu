/*
 * This file is part of Search NEU and licensed under AGPL3.
 * See the license file in the root folder for details.
 */

import React from "react";
import { Grid, Button } from "semantic-ui-react";
import Image from "next/image";
import Link from "next/link";
import { getLatestTerm } from "../global";
import { Campus } from "../types";

function SplashPage() {
  // Events that fire when the buttons are clicked.
  const termId = getLatestTerm(Campus.NEU);

  return (
    <span id="splash-page">
      {/* First Row. */}
      <Grid stackable className="row-first splash-row">
        {/* These widths must add up to 16.*/}
        <Grid.Column width={7} className="text">
          <div className="text-inner">
            <h1>Instantly search through all of NEU&apos;s classes.</h1>
            <div className="all-text-desc">
              Search through classes, professors, sections, and subjects at
              Northeastern. Going to add more features soon!
            </div>
            <Link href={`/${termId}/cs2510`}>
              <Button primary className="button-red">
                Search for CS 2510
              </Button>
            </Link>
          </div>
        </Grid.Column>
        <Grid.Column width={9} className="right-side">
          <div className="img-container">
            <Image
              id="cs2510-desktop"
              width={960}
              height={450}
              src="/images/2500-desktop.png"
              alt="Example of a result of searching for CS2510"
            />
            <div className="rotated-div" />
          </div>
        </Grid.Column>
      </Grid>

      {/* Second Row. */}
      <Grid stackable reversed="mobile" className="row-second splash-row">
        <Grid.Column width={9} className="img-container">
          <Image
            id="engw1111-desktop"
            width={930}
            height={755}
            src="/images/engw1111-desktop.png"
            alt="Expanded view of a result of searching for ENGW1111"
          />
          <Image
            id="lerner-mobile"
            width={377}
            height={669}
            src="/images/lerner-mobile.png"
            alt="Mobile view example"
          />
          <div className="rotated-div" />
        </Grid.Column>
        <Grid.Column width={7} className="text">
          <div className="text-inner">
            <h1>Everything you could be looking for.</h1>
            <div className="all-text-desc">
              See class descriptions, prereqs, coreqs, CRNs, professors,
              meetings, and locations! Even more stuff coming soon!
            </div>
            <Link href={`/${termId}/engw1111`}>
              <Button primary className="button-grey">
                Search for ENGW 1111
              </Button>
            </Link>
          </div>
        </Grid.Column>
      </Grid>

      {/* Third Row. */}
      <Grid stackable className="row-third splash-row">
        <Grid.Column width={7} className="text">
          <div className="text-inner">
            <h1>Works great on mobile!</h1>
            <div className="all-text-desc">holla holla</div>
            <Link href={`/${termId}/cs3500`}>
              <Button primary className="button-red">
                Search for OOD
              </Button>
            </Link>
          </div>
        </Grid.Column>
        <Grid.Column width={9} className="img-container">
          <div className="img-inner">
            <div>
              <Image
                id="oodMobile1"
                width={377}
                height={669}
                src="/images/ood-mobile-1.png"
                alt="More mobile examples"
              />
              <Image
                id="oodMobile2"
                width={395}
                height={688}
                src="/images/ood-mobile-2.png"
                alt="More mobile examples"
              />
            </div>
            <div>
              <Image
                id="cs2500Mobile"
                width={377}
                height={669}
                src="/images/cs2500-mobile.png"
                alt="More mobile examples"
              />
              <Image
                id="cs2500Resultsmobile"
                width={394}
                height={690}
                src="/images/cs2500-results-mobile.png"
                alt="More mobile examples"
              />
            </div>
            <div className="rotated-div" />
          </div>
        </Grid.Column>
      </Grid>
    </span>
  );
}

export default SplashPage;
