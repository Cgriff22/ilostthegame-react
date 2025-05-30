import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function MyCalendar() {
  const [value, setValue] = useState(new Date());

  return (
    <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
      <Calendar onChange={setValue} value={value}/>
    </div>
  );
}

export default MyCalendar;
