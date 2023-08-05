import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import * as icons from 'react-bootstrap-icons';
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';

const DatePicker = ({ selectedDate, handleSelectedDate }) => {
    useEffect(() => {
        console.log(selectedDate);
    }, [selectedDate]);

    const [showDatePicker, setShowDatePicker] = useState(false);

    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    }

    const [selected, setSelected] = useState();


    let footer = <p>Please pick a day.</p>;
    if (selected) {
      footer = <p>You picked {format(selected, 'PP')}.</p>;
    }

    return(
        <div>
        <button onClick={toggleDatePicker} selectedDate={handleSelectedDate}>
            <icons.Calendar />
        </button>
        <DayPicker
            mode='single'
            style={{ display: showDatePicker ? 'block' : 'none'}}
            selected={selected}
            onSelect={setSelected}
            footer={footer}
            onChange={date => handleSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            showPopperArrow={false}
            placeholderText="Select a date"
        />
    </div>
    )

}

export default DatePicker