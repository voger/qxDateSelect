/* ************************************************************************

   Copyright: 2020 voger

   License: MIT license

   Authors: voger

************************************************************************ */

qx.Theme.define("qxDateSelect.theme.Decoration", {
  extend: qx.theme.indigo.Decoration,

  decorations: {
    "qx-date-select" :{
      style: {
        width: 1
      }
    },
    "qx-date-select-invalid": {
      include: "qx-date-select",

      style: {
        color: "invalid"
      }
    }
  }
});
