import React, { useState } from 'react'
import { Markup } from 'interweave'
import macros from '../../macros'
import { DesktopSectionPanel, MobileSectionPanel } from './SectionPanel'
import { Course, PrereqType } from '../../types'
import IconGlobe from '../../images/IconGlobe'
import IconArrow from '../../images/IconArrow'
import SignUpForNotifications from '../../SignUpForNotifications'
import useResultDetail from './useResultDetail'
import useUserChange from './useUserChange';
import useShowAll from './useShowAll';
import moment from 'moment';
import MobileCollapsableDetail from './MobileCollapsableDetail'
import IconCollapseExpand from '../../images/IconCollapseExpand'

interface SearchResultProps {
  aClass: Course,
}

const getLastUpdateString = (course: Course) : string => {
  return course.lastUpdateTime ? moment(course.lastUpdateTime).fromNow() : null;
}

export function SearchResult({ aClass } : SearchResultProps) {
  const { optionalDisplay, creditsString } = useResultDetail(aClass)
  const userIsWatchingClass = useUserChange(aClass)
  const {
    showAll, setShowAll, renderedSections, hideShowAll,
  } = useShowAll(aClass)

  const feeString = aClass.feeDescription && aClass.feeAmount ? `${aClass.feeDescription}- $${aClass.feeAmount}` : null

  return (
    <div className='SearchResult'>
      <div className='SearchResult__header'>
        <div className='SearchResult__header--left'>
          <span className='SearchResult__header--classTitle'>
            {aClass.subject} {aClass.classId}: {aClass.name}
          </span>
          <div className='SearchResult__header--sub'>
            <a
              target='_blank'
              rel='noopener noreferrer'
              data-tip={ `View on ${aClass.host}` }
              href={ aClass.prettyUrl }
            >
              <IconGlobe />
            </a>
            <span>{`Updated ${(getLastUpdateString(aClass))}`}</span>
          </div>
        </div>
        <span className='SearchResult__header--creditString'>
          {creditsString()}
        </span>
      </div>
      <div className='SearchResult__panel'>
        <Markup content={ aClass.desc } />
        <br />
        <br />
        <div className='SearchResult__panel--main'>
          <div className='SearchResult__panel--left'>
            NUPaths:
            {aClass.nupath.length > 0 ? <span> {aClass.nupath.join(', ')}</span> : <span className='empty'> None</span>}
            <br />
            Prerequisites: {optionalDisplay(PrereqType.PREREQ, aClass)}
            <br />
            Corequisites: {optionalDisplay(PrereqType.COREQ, aClass)}
            <br />
            Course fees:
            {feeString ? <span>  {feeString}</span> : <span className='empty'> None</span>}
          </div>
          <div className='SearchResult__panel--right'>
            <SignUpForNotifications aClass={ aClass } userIsWatchingClass={ userIsWatchingClass } />
          </div>
        </div>
      </div>
      <table className='SearchResult__sectionTable'>
        <thead>
          <tr>
            <th>
              <div className='inlineBlock' data-tip='Course Reference Number'>
                CRN
              </div>
            </th>
            <th> Professors </th>
            <th> Meetings </th>
            <th> Campus </th>
            <th> Seats </th>
            {userIsWatchingClass && <th> Notifications </th>}
          </tr>
        </thead>
        <tbody>
          {renderedSections.map((section) => (
            <DesktopSectionPanel
              key={ section.crn }
              section={ section }
              showNotificationSwitches={ userIsWatchingClass }
            />
          ))}
        </tbody>
      </table>
      {!hideShowAll
      && (
      <div className='SearchResult__showAll' role='button' tabIndex={ 0 } onClick={ () => setShowAll(!showAll) }>
        <span>{showAll ? 'Collapse sections' : 'Show all sections'}</span>
        <IconArrow className={ showAll ? 'SearchResult__showAll--collapse' : null } />
      </div>
      )}
    </div>
  )
}

export function MobileSearchResult({ aClass } : SearchResultProps) {
  const [expanded, setExpanded] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showNUPath, setShowNUPath] = useState(false)
  const [showPrereq, setShowPrereq] = useState(false)
  const [showCoreq, setShowCoreq] = useState(false)
  const userIsWatchingClass = useUserChange(aClass)
  const {
    showAll, setShowAll, renderedSections, hideShowAll,
  } = useShowAll(aClass)

  const { optionalDisplay, creditsString } = useResultDetail(aClass);


  const renderNUPaths = () => (
    // eslint-disable-next-line react/prop-types
    <div>{aClass.nupath.length > 0 ? <div> {aClass.nupath.join(', ')}</div> : <span className='empty'> None</span>}</div>
  )

  return (
    <div className='MobileSearchResult'>
      <div className={ expanded ? 'MobileSearchResult__header--expanded' : 'MobileSearchResult__header' } role='button' tabIndex={ 0 } onClick={ () => setExpanded(!expanded) }>
        <IconCollapseExpand />
        <span className='MobileSearchResult__header--classTitle'>
          {`${aClass.subject} ${aClass.classId} : ${aClass.name}`}
        </span>
      </div>
      {expanded && (
      <div className='MobileSearchResult__panel'>
        <div className='MobileSearchResult__panel--mainContainer'>
          <div className='MobileSearchResult__panel--infoStrings'>
            <a href={ aClass.prettyUrl } target='_blank' rel='noopener noreferrer'>{`Updated ${(getLastUpdateString(aClass))}`}</a>
            <span>
              {creditsString()}
            </span>
          </div>
          <div className={ showMore ? 'MobileSearchResult__panel--description' : 'MobileSearchResult__panel--descriptionHidden' }>
            {aClass.desc}
          </div>
          <div className='MobileSearchResult__panel--showMore' role='button' tabIndex={ 0 } onClick={ () => setShowMore(!showMore) }>{showMore ? 'Show less' : 'Show more'}</div>
          <MobileCollapsableDetail title='NUPATH' expand={ showNUPath } setExpand={ setShowNUPath } renderChildren={ renderNUPaths } />
          <MobileCollapsableDetail title='PREREQUISITES' expand={ showPrereq } setExpand={ setShowPrereq } renderChildren={ () => optionalDisplay(PrereqType.PREREQ, aClass) } />
          <MobileCollapsableDetail title='COREQUISITES' expand={ showCoreq } setExpand={ setShowCoreq } renderChildren={ () => optionalDisplay(PrereqType.COREQ, aClass) } />
          <div className='MobileSearchResult__panel--notifContainer'>
            <SignUpForNotifications aClass={ aClass } userIsWatchingClass={ userIsWatchingClass } />
          </div>
        </div>
        <div className='MobileSearchResult__panel--sections'>
          {
            renderedSections.map((section) => (
              <MobileSectionPanel
                key={ section.crn }
                section={ section }
                showNotificationSwitches={ userIsWatchingClass }
              />
            ))
          }
        </div>
        {!hideShowAll && (
        <div className='MobileSearchResult__showAll' role='button' tabIndex={ 0 } onClick={ () => setShowAll(!showAll) }>
          <span>{showAll ? 'Collapse sections' : 'Show all sections'}</span>
          <IconArrow className={ showAll ? 'MobileSearchResult__showAll--collapse' : '' } />
        </div>
        )}
      </div>
      )}
    </div>

  )
}