import React, { Component } from 'react';
import { Row, Col, Button } from 'antd';
import { isAndroid, isIOS } from "react-device-detect";

import InApp from 'detect-inapp';
import PWAInstallerPrompt from './addHomeScreen'
import PWAPrompt from './IOSPWAPrompt/PWAPrompt'


class CheckBrowser extends Component {

  state = {
    inapp: null,
  }

  componentWillMount() {
    const inapp = new InApp(navigator.userAgent || navigator.vendor || window.opera);
    this.setState({ inapp });
    // window.ga('send', 'event', 'useragent', useragent, inapp.browser);
  }

  render() {
    const { inapp } = this.state;
    
    // isDesktop
    if (inapp.isDesktop) 
    {
      return null;
    } 
    // isMobile
    else if (inapp.isMobile)
    {
      return (
        <PWAInstallerPrompt 
          render={({ onClick }) => (
            <Row align="middle" justify="center">
              <Col span={16}>
                  Add to HomeScreen & Quick Access!
              </Col>
              <Col span={6}>
                <Button type="dashed" onClick={onClick}>
                  Install
                </Button>
              </Col>
            </Row>
          )}
          callback={(data) => console.log(data)} 
        />
      );
    }
    // isIOS
    else if (inapp.isIOS)
    {
      return (
        <PWAPrompt
          delay={delay}
          copyTitle={copyTitle}
          copyBody={copyBody}
          copyAddHomeButtonLabel={copyAddHomeButtonLabel}
          copyShareButtonLabel={copyShareButtonLabel}
          copyClosePrompt={copyClosePrompt}
          permanentlyHideOnDismiss={permanentlyHideOnDismiss}
          promptData={promptData}
          maxVisits={timesToShow + promptOnVisit}
          onClose={onClose}
        />
      );
    }
    // isInApp
    else //isInApp
    {
      return location.replace("https://sendlotus.com/");
    }
  }
}

export default CheckBrowser;