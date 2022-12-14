'use strict';
import { ToastAndroid } from 'react-native';
let Helpers = {

  // TOAST
  displayToast(displayText) {
    ToastAndroid.showWithGravity(
      displayText,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
    );
  },

  // get a string after the character .
  getFirstPart(str) {
    return this.toTitleCase(str.split('.')[0]);
  },

  //TO SENTENCE CASE
  toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  },

  //TO SENTENCE CASE
  toUPPERCASE(str) {
    return str.toUpperCase();
  },

  // Remove decimal places from it
  removeDecimal(textValue) {
    return textValue.replace(/(\d)(?=(\d{3})+\.)/g, "$1,").replace(/\.00/g, '')
  },

  // Remove only extra quote from a string
  removeExtraQuotes(stringValue) {
    return stringValue.replace(/^"(.*)"$/, '$1');
  },

  // Remove extra string from it
  removeExtraQuotesAndWhiteSpaces(stringValue) {
    return stringValue.replace(/^"(.*)"$/, '$1').replace(/\s/g, "");
  },

  //round to 2 decimal place
  roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
  },

  // Format thousands to K
  kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
  },

  // Generalised formatter
  nFormatter(num, digits) {
    var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  },

  // Format numbers to thousand seperators
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  //get months from value
  getMonthsValue(data) {
    var value = parseInt(data) - 1;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    // var months = ["January", "February", "March", "April", "May", "June",
    //   "July", "August", "September", "October", "November", "December"];
    var month_index = months[value];
    return month_index;
  },

  //get months from value
  getFullMonthsValue(data) {
    var value = parseInt(data) - 1;
    var months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    var month_index = months[value];
    return month_index;
  },

  //get days from value
  getFullDaysValue(data) {
    var value = parseInt(data) - 1;
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var day_index = days[value];
    return day_index;
  },

  randomString() {
    var length = 15;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }

}

export {Helpers};