/* ************************************************************************

   Copyright: 2020 voger

   License: MIT license

   Authors: voger

 ************************************************************************ */

qx.Theme.define("qxDateSelect.theme.Appearance", {
  extend: qx.theme.indigo.Appearance,

  appearances: {
    "qx-date-select": "widget",
    "qx-date-select/day": "virtual-selectbox",
    "qx-date-select/month": "virtual-selectbox",
    "qx-date-select/year": "virtual-selectbox"
  }
});
