import React, { Component } from 'react';
import styled from 'styled-components';
import OpenBrowserHint from '@assets/open_browser.jpg'
import InApp from './inapp';

export const Overlay = styled.div`
    position: fixed; /* Sit on top of the page content */
    display: block; /* Hidden by default */
    width: 100%; /* Full width (cover the whole page) */
    height: 100%; /* Full height (cover the whole page) */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255,255,255,0.96); /* Black background with opacity */
    z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
`;

export const H2Center = styled.h2`
  width: 100%;
  text-align: center;
  color: black;
`;

export const FullWidthImg = styled.img`
  width: 100%;
`;

class CheckBrowser extends Component {

  state = {
    inapp: null,
    loaded: false
  }

  componentWillMount() {
    const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera);
    this.setState({ inapp });
  }

  render() {
    const { inapp } = this.state;

    if (inapp.isInApp) {
      return (
        <Overlay>
          <FullWidthImg style={this.state.loaded ? {} : { display: 'none' }} src={OpenBrowserHint} onLoad={() => this.setState({ loaded: true })} alt="browser-hint" />
          <H2Center style={this.state.loaded ? {} : { display: 'none' }}>Open browser to continue...</H2Center>
        </Overlay>
      );
    } else {
      return null;
    } // isDesktop
  }
}

export default CheckBrowser;