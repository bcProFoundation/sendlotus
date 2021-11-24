import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OpenBrowserHint from '@assets/open_browser.jpg'
import Arrow from '@assets/arrow.png'
import InApp from '../../utils/inapp';

export const Overlay = styled.div`
    position: fixed; /* Sit on top of the page content */
    display: block; /* Hidden by default */
    width: 100%; /* Full width (cover the whole page) */
    height: 100%; /* Full height (cover the whole page) */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.8);
    z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
`;

export const H2Center = styled.h2`
  width: 100%;
  text-align: center;
  color: white;
`;

export const FullWidthImg = styled.img`
  width: 80%;
  margin: auto;
  margin-top: 15%;
  display:block;
`;

export const TopImg = styled.img`
  width: 10%;
  display:block;
  position: absolute;
  height: auto;
  right: 0px;
  top: 0px;
  margin-right: 3%;
  margin-top: 10px;
`;

const CheckBrowser = () => {
  const [inapp, setInapp] = useState(null);
  const [loadedArrow, setLoadedArrow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera);
    setInapp(inapp);
  }, [])

  return (
    <>
      {inapp?.isInApp &&
        <Overlay style={loaded && loadedArrow ? {} : { display: 'none' }}>
          <TopImg src={Arrow} onLoad={() => setLoaded(true)} />
          <FullWidthImg src={OpenBrowserHint} onLoad={() => setLoadedArrow(true)} />
          <H2Center>Open browser to continue...</H2Center>
        </Overlay>
      }
    </>
  )
}

export default CheckBrowser;