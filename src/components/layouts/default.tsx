import React from 'react';
import '../../global/static.css';
// import { cx, css } from "@linaria/core";
import Nav from '../Nav.gen';
import Footer from '../Footer.gen';
import TagManager from 'react-gtm-module';

// if (typeof window !== 'undefined') {
//   const tagManagerArgs = {
//     gtmId: 'GTM-M7P5TJ',
//   };

//   TagManager.initialize(tagManagerArgs);
// }

const DefaultLayout: React.FC<{ children: JSX.Element }> = ({ children }) => (
  <>
    <Nav />
    {children}
    <Footer />
    <link rel="stylesheet" href="https://use.typekit.net/enq8duc.css" />
  </>
);

export default DefaultLayout;
