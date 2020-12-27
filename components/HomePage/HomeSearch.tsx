import { useRouter } from 'next/router'
import React from 'react'
import { getTermDropdownOptionsForCampus } from '../global'
import IconGradcap from '../images/IconGradcap'
import IconScale from '../images/IconScale'
import IconTie from '../images/IconTie'
import SearchBar from '../ResultsPage/SearchBar'
import SearchDropdown from '../ResultsPage/SearchDropdown'
import { Campus } from '../types'

interface HomeSearchProps {
  setTermId: (s: string) => void;
  termId: string;
  campus: Campus;
  setCampus: (c: Campus) => void;
  buttonColor: 'red' | 'yellow' | 'blue';
}

const HomeSearch = ({
  setTermId, termId, campus, setCampus, buttonColor,
}: HomeSearchProps) => {
  const router = useRouter();
  return (
    <div className='HomeSearch'>
      <div className='HomeSearch__campusSelector'>
        <input type='radio' id='campusSelectorNeu' name='CampusSelector' defaultChecked />
        <label className='HomeSearch__campusSelector--neu' htmlFor='campusSelectorNeu' onClick={ () => setCampus(Campus.NEU) }>
          <IconGradcap />
          <span>NEU</span>
        </label>
        <input type='radio' id='campusSelectorCps' name='CampusSelector' />
        <label className='HomeSearch__campusSelector--cps' htmlFor='campusSelectorCps' onClick={ () => setCampus(Campus.CPS) }>
          <IconTie />
          <span>CPS</span>
        </label>
        <input type='radio' id='campusSelectorLaw' name='CampusSelector' />
        <label className='HomeSearch__campusSelector--law' htmlFor='campusSelectorLaw' onClick={ () => setCampus(Campus.LAW) }>
          <IconScale />
          <span>Law</span>
        </label>
      </div>
      <div className='HomeSearch__searchBar'>
        <div className='HomeSearch__searchBar--dropdown'>
          <SearchDropdown
            options={ getTermDropdownOptionsForCampus(campus) }
            value={ termId }
            placeholder='Fall 2020'
            onChange={ setTermId }
            className='searchDropdown'
            compact={ false }
            key={ campus }
          />
        </div>
        <div
          className='HomeSearch__searchBar--input'
        >
          <SearchBar
            onSearch={ (q) => { router.push(`${termId}/${q}`); } }
            query=''
            buttonColor={ buttonColor }
          />
        </div>
      </div>
    </div>

  )
}

export default HomeSearch
