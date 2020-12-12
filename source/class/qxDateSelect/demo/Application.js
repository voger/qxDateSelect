/* ************************************************************************

   Copyright: 2020 voger

   License: MIT license

   Authors: voger

************************************************************************ */

/**
 * This is the main application class of "qxDateSelect"
 */
qx.Class.define("qxDateSelect.demo.Application",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function() {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */


      // Document is the application root
      var doc = this.getRoot();

      var dateSelect = new qxDateSelect.QxDateSelect();

      doc.add(dateSelect, {left: 50, top: 50});
    }
  }
});
