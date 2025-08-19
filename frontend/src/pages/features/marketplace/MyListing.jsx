import React from 'react';
import { formatCurrency, categories, locations } from './marketplaceData';
import styles from './styles/MyListing.module.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Card, Button, Row, Col } from 'react-bootstrap';

// Mock data for now
const myListings = [
  {
    id: 1,
    title: 'Samsung Galaxy S22',
    description: 'Brand new phone, unopened box.',
    price: 1200000,
    condition: 'new',
    category: 'Electronics',
    location: 'Seoul',
    image_url: 'https://via.placeholder.com/300x200',
    postedDate: '2025-08-10',
    sellerName: 'You'
  },
  {
    id: 2,
    title: 'Wooden Desk',
    description: 'Minimalist design, great condition.',
    price: 80000,
    condition: 'second-hand',
    category: 'Furniture',
    location: 'Daejeon',
    image_url: 'https://via.placeholder.com/300x200',
    postedDate: '2025-08-08',
    sellerName: 'You'
  }
];

const MyListingPage = () => {
  return (
    <div className={`container mt-4 ${styles.pageWrapper}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={styles.pageTitle}>My Listings</h2>
        <Button variant="primary">
          <FaPlus className="me-2" /> Add New Listing
        </Button>
      </div>

      <Row xs={1} md={3} className="g-4">
        {myListings.map(item => (
          <Col key={item.id}>
            <Card className={`${styles.card} h-100`}>
              <Card.Img
                variant="top"
                src={item.image_url}
                alt={item.title}
                className={styles.cardImage}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{item.title}</Card.Title>
                <Card.Text className={styles.priceText}>
                  {formatCurrency(item.price)}
                </Card.Text>
                <Card.Text className="text-muted mb-2">
                  {item.condition === 'new' ? 'New' : 'Second-hand'} • {item.category} • {item.location}
                </Card.Text>
                <Card.Text className={styles.description}>
                  {item.description}
                </Card.Text>
                <div className="mt-auto d-flex justify-content-between">
                  <Button variant="outline-primary" size="sm">
                    <FaEdit className="me-1" /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </div>
              </Card.Body>
              <Card.Footer className="text-muted small">
                Posted on {item.postedDate}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyListingPage;
