import React, { Component } from 'react';
import { Row, Col, Button } from 'antd';
import InApp from './inapp';
import PWAInstallerPrompt from './addHomeScreen'
// import WelcomeScreen from './Slider/Welcome-screen';

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
    // const slides = [
    //   {
    //       key: 1,
    //       title: 'Welcome To SendLotus',
    //       des: 'To experience sendlotus the most optimal way',
    //       image: '',
    //   },
    //   {
    //       key: 2,
    //       title: 'First click on the Share button in the red rectangle as below:',
    //       image: '',
    //   },
    //   {
    //       key: 3,
    //       title: '',
    //       image: '',
    //   },
    // ];

    const { inapp } = this.state;

    if (inapp.isDesktop) // isDesktop
    {
      return null;
    } 


    else if (inapp.isMobile) // isMobile
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
      // return <WelcomeScreen slides={slides}/>;
    } 
    

    else // isInApp
    {
      // return alert('For the best user experience, please install app');
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
  }
}

export default CheckBrowser;