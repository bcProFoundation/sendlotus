import React, { Component } from 'react';
import InApp from './inapp';

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

    if (inapp.isDesktop) // isDesktop
    {
      return 0;
    } 

    else if (inapp.isMobile) // isMobile
    {
      const 

      return (
        <div>
          <div className="container">

          </div>
        </div>
      );
    } 
    
    else // isInApp
    {
      return (
        <div>

        </div>
      );
    }
    // return (
    //   <div className="container">
    //     <div className="p-3 border position-relative">
    //       <div className="border position-absolute right-0 top-0 p-1">inapp.browser</div>
    //       {inapp.browser}
    //     </div>
    //     <div className="p-3 border position-relative">
    //       <div className="border position-absolute right-0 top-0 p-1">inapp.isMobile()</div>
    //       {inapp.isMobile ? 'true' : 'false'}
    //     </div>
    //     <div className="p-3 border position-relative">
    //       <div className="border position-absolute right-0 top-0 p-1">inapp.isDesktop()</div>
    //       {inapp.isDesktop ? 'true' : 'false'}
    //     </div>
    //     <div className="p-3 border position-relative">
    //       <div className="border position-absolute right-0 top-0 p-1">inapp.isInApp()</div>
    //       {inapp.isInApp ? 'true' : 'false'}
    //     </div>
    //   </div>
    // );
  }
}

export default CheckBrowser;