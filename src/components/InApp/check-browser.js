import React, { Component } from 'react';
import InApp from './inapp';
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
    const slides = [
      {
          key: 1,
          title: 'Welcome To SendLotus',
          des: 'To experience sendlotus the most optimal way',
          image: '',
      },
      {
          key: 2,
          title: 'First click on the Share button in the red rectangle as below:',
          image: '',
      },
      {
          key: 3,
          title: '',
          image: '',
      },
    ];

    const { inapp } = this.state;

    if (inapp.isDesktop) // isDesktop
    {
      return null;
    } 


    else if (inapp.isMobile) // isMobile
    {
      return alert('For the best user experience, please install app');
      // return <WelcomeScreen slides={slides}/>;
    } 
    

    else // isInApp
    {
      return null;
    }
  }
}

export default CheckBrowser;