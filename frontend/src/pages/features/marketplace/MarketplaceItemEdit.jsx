import React from "react";
import styles from "./styles/MarketplaceItemEdit.module.css";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FaArrowLeft, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const MarketplaceItemEdit = () => {
  // Placeholder ID for preview
  const itemId = 1;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className={`shadow-sm p-4 ${styles.editCard}`}>
            {/* Back Link */}
            <div className="mb-4">
              <Link to="/marketplace/my" className={styles.backLink}>
                <FaArrowLeft className="me-2" /> Back to My Listings
              </Link>
            </div>

            <h1 className="mb-4 fw-bold">Edit Listing</h1>

            {/* Placeholder Content */}
            <div className="text-center py-5">
              <FaEdit className={`mb-3 ${styles.iconLarge}`} />
              <h2 className="fw-semibold">Edit Feature Coming Soon</h2>
              <p className="text-muted">
                The ability to edit listings is currently under development.  
                Check back soon!
              </p>

              {/* Action Buttons */}
              <div className="mt-4 d-flex justify-content-center gap-3">
                <Link to={`/marketplace/${itemId}`}>
                  <Button variant="outline-dark" className="px-4">
                    View Item
                  </Button>
                </Link>
                <Link to="/marketplace/my">
                  <Button variant="dark" className="px-4">
                    Return to My Listings
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MarketplaceItemEdit;