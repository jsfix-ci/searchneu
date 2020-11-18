import React from 'react'
// import Section from '../../classModels/Section'

function AddToCalendar() {
  return (
    <div title='Add to Calendar' className='addeventatc' style={{ marginBottom: '13px' }}>
      Add to Calendar
      <span className='start'>12/02/2020 08:00 AM</span>
      <span className='end'>12/02/2020 10:00 AM</span>
      <span className='timezone'>America/Los_Angeles</span>
      <span className='title'>Summary of the event</span>
      <span className='description'>Description of the event</span>
      <span className='location'>Location of the event</span>
      <span className='recurring'>FREQ=DAILY;INTERVAL=2;COUNT=5</span>
      <span className='calname'>course-time</span>
    </div>
  )
}

export default AddToCalendar
