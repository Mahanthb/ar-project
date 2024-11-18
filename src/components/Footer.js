// src/components/Footer.js
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 1rem;
  background: #2a2a72;
  color: #ffffff;
  text-align: center;
`;

function Footer() {
  return <FooterContainer>&copy; 2024 AR Museum</FooterContainer>;
}

export default Footer;
