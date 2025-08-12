import React from "react";
import styles from "./styles/MarketplaceItem.module.css";
import { Card, Button } from "react-bootstrap";
import { FaMapMarkerAlt, FaTag } from "react-icons/fa";

const MarketplaceItem = () => {
  // Static placeholder item for design preview
  const item = {
    title: "Samsung 4K Smart TV",
    description: "55-inch Samsung Smart TV in excellent condition.",
    price: "₩400,000",
    condition: "Second-hand",
    category: "Electronics",
    location: "Seoul",
    image: "/images/marketplace/tv.jpg",
    sellerName: "John Doe",
  };

  return (
    <Card className={`${styles.marketplaceItem} shadow-sm`}>
      <div className={styles.imageWrapper}>
        <Card.Img
          variant="top"
          src={item.image}
          alt={item.title}
          className={styles.itemImage}
        />
        <span
          className={`${styles.conditionBadge} ${
            item.condition === "New" ? styles.new : styles.used
          }`}
        >
          {item.condition}
        </span>
      </div>
      <Card.Body>
        <Card.Title className={styles.title}>{item.title}</Card.Title>
        <Card.Text className={styles.price}>{item.price}</Card.Text>
        <Card.Text className={styles.description}>{item.description}</Card.Text>
        <div className={styles.meta}>
          <span className={styles.category}>
            <FaTag /> {item.category}
          </span>
          <span className={styles.location}>
            <FaMapMarkerAlt /> {item.location}
          </span>
        </div>
        <div className="mt-3">
          <Button variant="primary" className={styles.viewBtn}>
            Buy
          </Button>
          <Button variant="primary" className={styles.viewBtn}>
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MarketplaceItem;
