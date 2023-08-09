import React, { useState } from 'react';
import { MdDone } from 'react-icons/md'; // Import the tick icon from react-icons
import styles from './Restaurants.module.css';
import { FaCheckCircle } from 'react-icons/fa';

const local = "http://localhost:8000/media/restaurants/";

const Card = ({ title, index, onAddLunch, contact, isSelected, address, website }) => {

  
  
  const handleClick = () => {
    if (!isSelected) {
      if (onAddLunch) {
        onAddLunch(title);
      }
    };
  };

  
  return (
    <div className={`restaurant ${isSelected ? 'active' : ''}`} onClick={handleClick}>
      <img src= {local+index+".jpg"} className={styles.attraction_img}/>
      <h2 className={styles.cardname1}>{title}</h2>
      <p className={styles.cardname}>Contact: {contact}</p>
      <p className={styles.cardname}>Address: {address}</p>
      {isSelected && <MdDone className="tick_icon" />}
      <a className={styles.cardwebsite} href={website}><p className={styles.moredetails}>More Details </p></a>
    </div>
  );
};

export default Card;
