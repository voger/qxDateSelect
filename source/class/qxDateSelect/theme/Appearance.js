/* ************************************************************************

   Copyright: 2020 voger

   License: MIT license

   Authors: voger

 ************************************************************************ */

qx.Theme.define("qxDateSelect.theme.Appearance", {
  extend: qx.theme.indigo.Appearance,

  appearances: {
    "qx-date-select": {
      // include: "widget",
      alias: "widget",

      style: function (states) {
        var decorator = "qx-date-select";

        if (states.invalid && !states.disabled) {
          decorator += "-invalid";
        }

        return {
          decorator: decorator
        };
      }
    },

    "qx-date-select/day": "virtual-selectbox",
    "qx-date-select/month": "virtual-selectbox",
    "qx-date-select/year": "virtual-selectbox"
  }
});
