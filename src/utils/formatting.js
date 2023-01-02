import _ from 'lodash';

export const formatDate = (dateString, userLocale = 'en') => {
  const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
  const dateFormattingError = 'Unable to format date.';
  try {
    if (dateString) {
      return new Date(_.toNumber(dateString) * 1000).toLocaleDateString(userLocale, options);
    }
    return new Date().toLocaleDateString(userLocale, options);
  } catch (error) {
    return dateFormattingError;
  }
};
