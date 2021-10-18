import _ from 'lodash';

const BROWSER = {
  messenger: /\bFB[\w_]+\/(Messenger|MESSENGER)/,
  facebook: /\bFB[\w_]+\//,
  twitter: /\bTwitter/i,
  line: /\bLine\//i,
  wechat: /\bMicroMessenger\//i,
  puffin: /\bPuffin/i,
  miui: /\bMiuiBrowser\//i,
  instagram: /\bInstagram/i,
  chrome: /\bCrMo\b|CriOS|Android.*Chrome\/[.0-9]* (Mobile)?/,
  safari: /Version.*Mobile.*Safari|Safari.*Mobile|MobileSafari/,
  ie: /IEMobile|MSIEMobile/,
  firefox: /fennec|firefox.*maemo|(Mobile|Tablet).*Firefox|Firefox.*Mobile|FxiOS/,
};

class InApp {

  ua = '';

  constructor(useragent) {
    this.ua = useragent;
  }

  get browser(): string {
    return _.findKey(BROWSER, regex => regex.test(this.ua)) || 'other';
  }

  get isMobile(): boolean {
    return /(Android|Mobile)/i.test(this.ua) || false;
  }

  get isIOS(): boolean {
    return /(iPad|iPhone)/i.test(this.ua) || false;
  }

  get isDesktop(): boolean {
    return !this.isMobile && !this.isIOS;
  }

  get isInApp(): boolean {
    const rules = [
      'WebView',
      '(iPhone|iPod|iPad)(?!.*Safari\/)',
      'Android.*(wv|\.0\.0\.0)',
    ];
    const regex = new RegExp(`(${rules.join('|')})`, 'ig');
    return Boolean(this.ua.match(regex));
  }
}

export default InApp;