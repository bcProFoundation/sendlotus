import React, { Component } from 'react';
import InApp from './inapp';

import AddToHomeScreen from './AddToHomescreen/addToHomescreen'
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
        <div>
        <AddToHomeScreen
            startAutomatically={ true }
            startDelay={ 0 }
            lifespan={ 30 }
            skipFirstVisit={ true }
            displayPace={ 0 }
            customPromptContent={ {
              cancelMsg: '',
              installMsg: 'Install',
              guidanceCancelMsg: ''
            } }
            customPromptElements={ {
              container: 'athContainer',
              containerAddOns: '',
              banner: 'athBanner',
              logoCell: 'athLogoCell',
              logoCellAddOns: 'athContentCell',
              logo: 'athLogo',
              titleCell: 'athTitleCell',
              titleCellAddOns: 'athContentCell',
              title: 'athTitle',
              cancelButtonCell: 'athCancelButtonCell',
              cancelButtonCellAddOns: 'athButtonCell',
              cancelButton: 'athCancelButton',
              installButtonCell: 'athInstallButtonCell',
              installButtonCellAddOns: 'athButtonCell',
              installButton: 'athInstallButton',
              installButtonAddOns: 'button',
              guidance: 'athGuidance',
              guidanceImageCell: 'athGuidanceImageCell',
              guidanceImageCellAddOns: '',
              guidanceCancelButton: 'athGuidanceCancelButton'
            } }
        />
        </div>
      );
      // return <AddToHomescreen/>;
      // return <WelcomeScreen slides={slides}/>;
    } 
    

    else // isInApp
    {
      return alert('For the best user experience, please install app');
    }
  }
}

export default CheckBrowser;