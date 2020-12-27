import React from 'react';
import Keys from '../../Keys';
import NotifCheckBox from '../../panels/NotifCheckBox';
import { DayOfWeek, Meeting, MomentTuple, Section } from '../../types';
import useSectionPanelDetail from './useSectionPanelDetail';
import WeekdayBoxes from './WeekdayBoxes';

interface DesktopSectionPanelProps {
  section: Section
  showNotificationSwitches: boolean
}

function DesktopSectionPanel({ section, showNotificationSwitches } : DesktopSectionPanelProps) {
  const { getSeatsClass } = useSectionPanelDetail(section)

  const meetsOnDay = (meeting: Meeting, dayIndex : DayOfWeek) : boolean => {
    return meeting.times.some((time) => { return time.start.day() === dayIndex; });
  }

  // Unique list of all professors in all meetings, sorted alphabetically, unescape html entity decoding
  const getProfs = (section: Section) : string[] => {
    return section.profs.length > 0 ? Array.from(section.profs.map((prof) => unescape(prof))).sort() : ['TBA'];
  }

  const getUniqueTimes = (times: MomentTuple[]) => {
    const seenTimes = new Set()
    return times.reduce((acc, t) => {
      if (!seenTimes.has(t.start.format('h:mm'))) {
        acc.push(t)
      }
      seenTimes.add(t.start.format('h:mm'))
      return acc
    }, [])
  }

  const singleMeeting = (daysMet: boolean[], meeting: Meeting) => {
    if (daysMet.some((d) => d)) {
      return (
        <div className='DesktopSectionPanel__meetings'>
          <WeekdayBoxes meetingDays={ daysMet } />
          <div className='DesktopSectionPanel__meetings--times'>
            {getUniqueTimes(meeting.times).map((time) => (
              <>
                <span>
                  {`${time.start.format('h:mm')}-${time.end.format('h:mm a')} | ${meeting.location}`}
                </span>
                <br />
              </>
            ))}
          </div>
        </div>
      )
      // eslint-disable-next-line react/prop-types
    } if (section.meetings.length <= 1) {
      return <span>See syllabus</span>
    }
    return null
  }

  const getMeetings = (s: Section) => {
    return s.meetings.map((m) => {
      const meetingDays = Array(7).fill(false)
      meetingDays.forEach((d, index) => { if (meetsOnDay(m, index)) meetingDays[index] = true })
      return singleMeeting(meetingDays, m)
    })
  }


  return (
    <tr className='DesktopSectionPanel' key={ Keys.getSectionHash(section) }>
      <td>
        <a href={ section.url } target='_blank' rel='noopener noreferrer'>{section.crn}</a>
      </td>
      <td>
        {getProfs(section).join(', ')}
      </td>
      <td>
        {section.online ? <span>Online Class</span>
          : getMeetings(section)}
      </td>
      <td>
        {section.campus}
      </td>
      <td>
        <span className={ getSeatsClass() }>
          {section.seatsRemaining}/{section.seatsCapacity}
        </span>
        <br />
        <span>
          {`${section.waitRemaining}/${section.waitCapacity} Waitlist Seats`}
        </span>
      </td>
      {showNotificationSwitches && <td><div className='DesktopSectionPanel__notifs'><NotifCheckBox section={ section } /></div></td>}
    </tr>

  )
}

export default DesktopSectionPanel
