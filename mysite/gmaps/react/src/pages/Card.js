import React, { useState } from 'react';
import { MdDone } from 'react-icons/md'; // Import the tick icon from react-icons
import styles from './Restaurants.module.css';
import { FaCheckCircle } from 'react-icons/fa';

const local = `${process.env.REACT_APP_API_URL}/media/restaurants/`;

const Card = ({ restaurant, title, index, onAddLunch, contact, address, website }) => {
  const [isSelected, setSelected] = useState(false);

  const handleClick = () => {
    setSelected(!isSelected); 
    if (!isSelected){
      if (onAddLunch) {
        onAddLunch(restaurant);
      }
    };
  };

  
  return (
    <div className={`restaurant ${isSelected ? 'active' : ''}`} onClick={handleClick}>
      <img src= {local+index+".jpg"} className={styles.attraction_img}/>
      <h2 className={styles.cardname1}>{title}</h2>
      {isSelected && <span className={styles.tick_icon}>✔</span>}
      <p className={styles.cardcontact}>Contact: {contact}</p>
      <p className={styles.cardaddress}>Address: {address}</p>
      
      <a className={styles.cardwebsite} href={website}><p className={styles.moredetails}>More Details </p></a>
    </div>
  );
};

export default Card;
