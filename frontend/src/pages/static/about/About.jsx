import React from 'react'

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">About KEasy</h1>
      <div className="prose max-w-none dark:prose-invert lg:prose-lg">
        <p>
          KEasy is a platform designed to help foreigners navigate life in South Korea with ease. We provide resources, community connections, and
          services that make it simpler to enjoy all that Korea has to offer.
        </p>
        <h2>Our Mission</h2>
        <p>
          Our mission is to bridge cultural gaps and make life in South Korea more accessible and enjoyable for expats, international students, and
          visitors.
        </p>
        <h2>What We Offer</h2>
        <ul>
          <li>A marketplace for buying and selling items within the expat community</li>
          <li>Events calendar to discover local happenings</li>
          <li>Community connections through KakaoTalk groups</li>
          <li>Blog with helpful articles about living in Korea</li>
          <li>Guides to nearby places and local attractions</li>
        </ul>
        <h2>Our Team</h2>
        <p>
          KEasy was founded by a team of expats who experienced firsthand the challenges of settling in a new country. We're passionate about creating
          solutions that we wish we had when we first arrived in Korea.
        </p>
      </div>
    </div>
  )
}

export default About