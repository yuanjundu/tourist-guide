import React, { useState } from "react";
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { DayPicker } from 'react-day-picker';

const Datepicker = ({ selectedDate, setSelectedDate }) => {
    const formatDate = (date) => {
        if (date && date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
        return '';
    };
    
    const [selected, setSelected] = useState();
    
    let footer = <p>Please pick a day.</p>;
    if (selected) {
        console.log(formatDate(selected));
        footer = <p>You picked {format(selected, 'PP')}.</p>;
    }
    
    return (
        <DayPicker
            mode='single'
            style={{ backgroundColor: '#ebebeb', color: 'Black', borderRadius: '10px', margin: 0 , marginBottom: '10px' }}
            selected={selected || new Date()}
            onSelect={setSelected}
            footer={footer}
            dateFormat="yyyy-MM-dd"
            showPopperArrow={false}
            placeholderText="Select a date"
            onDayClick={(date) => {
                const formattedDate = formatDate(date);
                console.log("Picked Date:", formattedDate);
                setSelectedDate(formattedDate);
            }}
        />
    );
}

export default Datepicker;
