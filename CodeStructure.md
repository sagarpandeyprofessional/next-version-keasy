KEASY FOLDER STRUCTURE
└── src/
    ├── assets/                
    │   ├── react.svg #logo
    │
    ├── components/ # only components will be used within Layout or App.jsx
    │   ├── layout/
    │       ├── Layout.jsx 
    │       ├── Navbar.jsx
    │       ├── Footer.jsx
    │       ├── PrivateRoute.jsx #empty cus we can't check if user is Auth            
    │       └── styles/
    │             ├── Footer.module.css 
    │             ├── Navbar.module.css 
    │             ├── Layout.module.css 
    │
    ├── pages/                 
    │   ├── auth/ # Authentication
    │   │   ├── login/
    │   │   │    ├── Login.jsx
    │   │   │    └── Login.module.css
    │   │   └── register/
    │   │       ├── Register.jsx
    │   │       └── Register.module.css
    │   │                 
    │   ├── features/ # all app features/ if components will be made, will be inside their ownFolder/components/FeatureComp.jsx
    │   │   ├── blog/
    │   │   │    ├── Blog.jsx
    │   │   │    └── Blog.module.css
    │   │   ├── community/
    │   │   │    ├── Community.jsx
    │   │   │    └── Community.module.css
    │   │   ├── events/
    │   │   │    ├── Events.jsx
    │   │   │    └── Events.module.css
    │   │   ├── marketplace/
    │   │   │    ├── Marketplace.jsx
    │   │   │    ├── Marketplace.module.css
    │   │   │    ├── MarketplaceItem.jsx
    │   │   │    ├── MarketplaceEdit.jsx
    │   │   │    ├── MarketplacePost.jsx
    │   │   │    ├── MyListing.jsx
    │   │   │    ├── marketplaceData.js
    │   │   │    └── styles/
    │   │   │         ├── MarketplaceItem.module.css
    │   │   │         ├── MarketplaceEdit.module.css
    │   │   │         ├── MarketplacePost.module.css
    │   │   │         └── MyListing.module.css
    │   │   └── nearby/
    │   │       ├── Nearby.jsx
    │   │       └── Nearby.module.css
    │   ├── home/  # Home Page
    │   │   ├── components/
    │   │   │    ├── FestivalCard.jsx
    │   │   │    └── styles/
    │   │   │           └── FestivalCard.module.css
    │   │   ├── styles/
    │   │   │    └── Home.module.css
    │   │   └── Home.jsx
    │   │
    │   ├── profile/
    │   │   ├── styles/
    │   │   │    ├── EditProfile.module.css
    │   │   │    └── Profile.module.css
    │   │   ├── EditProfile.jsx
    │   │   └── Profile.jsx
    │   │
    │   ├── staticPages/ # app static pages 
    │       ├── about/
    │       │    ├── About.jsx
    │       │    └── About.module.css
    │       ├── contact/
    │       │    ├── Contact.jsx
    │       │    └── Contact.module.css
    │       ├── faq/
    │       │    ├── FAQ.jsx
    │       │    └── FAQ.module.css
    │
    ├── App.css
    ├── App.jsx
    └── main.jsx
