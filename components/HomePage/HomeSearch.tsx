import { useRouter } from 'next/router';
import React from 'react';
import { getTermDropdownOptionsForCampus } from '../global';
import IconGradcap from '../icons/IconGradcap';
import IconScale from '../icons/IconScale';
import IconTie from '../icons/IconTie';
import SearchBar from '../ResultsPage/SearchBar';
import SearchDropdown from '../ResultsPage/SearchDropdown';
import { Campus } from '../types';

interface HomeSearchProps {
  setTermId: (s: string) => void;
  termId: string;
  campus: Campus;
  setCampus: (c: Campus) => void;
}
const campusToColor: Record<Campus, 'red' | 'yellow' | 'blue'> = {
  [Campus.NEU]: 'red',
  [Campus.CPS]: 'yellow',
  [Campus.LAW]: 'blue',
};
const HomeSearch = ({
  setTermId,
  termId,
  campus,
  setCampus,
}: HomeSearchProps) => {
  const router = useRouter();
  return (
    <div className="HomeSearch">
      <div className="HomeSearch__campusSelector">
        <input
          type="radio"
          id="campusSelectorNeu"
          name="CampusSelector"
          checked={campus == Campus.NEU}
          onChange={() => setCampus(Campus.NEU)}
        />
        <label
          className="HomeSearch__campusSelector--neu"
          htmlFor="campusSelectorNeu"
        >
          <IconGradcap />
          <span>NEU</span>
        </label>
        <input
          type="radio"
          id="campusSelectorCps"
          name="CampusSelector"
          checked={campus == Campus.CPS}
          onChange={() => setCampus(Campus.CPS)}
        />
        <label
          className="HomeSearch__campusSelector--cps"
          htmlFor="campusSelectorCps"
        >
          <IconTie />
          <span>CPS</span>
        </label>
        <input
          type="radio"
          id="campusSelectorLaw"
          name="CampusSelector"
          checked={campus == Campus.LAW}
          onChange={() => setCampus(Campus.LAW)}
        />
        <label
          className="HomeSearch__campusSelector--law"
          htmlFor="campusSelectorLaw"
        >
          <IconScale />
          <span>Law</span>
        </label>
      </div>
      <div className="HomeSearch__searchBar">
        <div className="HomeSearch__searchBar--dropdown">
          <SearchDropdown
            options={getTermDropdownOptionsForCampus(campus)}
            value={termId}
            placeholder="Fall 2020"
            onChange={setTermId}
            className="searchDropdown"
            compact={false}
            key={campus}
          />
        </div>
        <div className="HomeSearch__searchBar--input">
          <SearchBar
            onSearch={(q) => {
              router.push(`/${campus}/${termId}/search/${q}`);
            }}
            query=""
            buttonColor={campusToColor[campus]}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeSearch;
