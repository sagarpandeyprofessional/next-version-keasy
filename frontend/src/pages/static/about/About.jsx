import React from 'react';
import styles from './About.module.css'; // Your CSS module

export default function About() {
  return (
    <div className={`container ${styles.aboutContainer} py-5`}>
      <h1 className="mb-4 display-4 text-dark">About KEasy</h1>

      <div className={styles.content}>
        <p>
          KEasy is a platform designed to help foreigners navigate life in South Korea with ease. We provide resources, community connections, and
          services that make it simpler to enjoy all that Korea has to offer.
        </p>

        <h2 className="mt-4">Our Mission</h2>
        <p>
          Our mission is to bridge cultural gaps and make life in South Korea more accessible and enjoyable for expats, international students, and
          visitors.
        </p>

        <h2 className="mt-4">What We Offer</h2>
        <ul>
          <li>A marketplace for buying and selling items within the expat community</li>
          <li>Events calendar to discover local happenings</li>
          <li>Community connections through KakaoTalk groups</li>
          <li>Blog with helpful articles about living in Korea</li>
          <li>Guides to nearby places and local attractions</li>
        </ul>

        <h2 className="mt-4">Our Team</h2>
        <p>
          KEasy was founded by a team of expats who experienced firsthand the challenges of settling in a new country. We're passionate about creating
          solutions that we wish we had when we first arrived in Korea.
        </p>
      </div>
    </div>
  );
}