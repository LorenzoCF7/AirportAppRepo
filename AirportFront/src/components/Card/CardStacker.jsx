import React from 'react';
import Card from './Card';
import styles from './CardStacker.module.css';

const CardStacker = ({ data }) => {
  return (
    <div className={styles.cardStacker}>
      {data.map((eachData, index) => (
        <Card
          key={index} 
          title={eachData.title}
          subtitle={eachData.subtitle}
          rating={eachData.rating}
          backgroundColors={eachData.backgroundColors}
          image={eachData.image} 
          className={index !== 0 ? styles.stacked : ''}
        />
      ))}
    </div>
  );
};

export default CardStacker;
