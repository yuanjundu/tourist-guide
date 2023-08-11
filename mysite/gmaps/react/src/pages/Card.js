import React, { useState } from 'react';
import { MdDone } from 'react-icons/md'; // Import the tick icon from react-icons
import styles from './Restaurants.module.css';
import { FaCheckCircle } from 'react-icons/fa';

const local = `${process.env.REACT_APP_API_URL}/media/restaurants/`;

const Card = ({ restaurant, title, index, onAddLunch, contact, isSelected, onSelect, address, website }) => {
  
  const handleClick = () => {
    onSelect();
};


  
  return (
    <div className={`${styles.cards} ${isSelected ? styles.active : ''}`} onClick={handleClick}>
      <img src={local + index + ".webp"} className={styles.attraction_img} loading="lazy" />
      <h2 className={styles.cardname1}>{title}</h2>
      <p className={styles.cardname}>Contact: {contact}</p>
      <p className={styles.cardname}>Address: {address}</p>
      {isSelected && <MdDone className="tick_icon" />}
      <a className={styles.cardwebsite} href={website}><p className={styles.moredetails}>More Details </p></a>
    </div>
  );
};

export default Card;
