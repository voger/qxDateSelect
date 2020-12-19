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
      var container = new qx.ui.container.Composite();
      container.setLayout(new qx.ui.layout.HBox());


      // create a container to hold the widget
      var widgetContainer = new qx.ui.container.Composite();
      widgetContainer.setLayout(new qx.ui.layout.Canvas);


      var dateSelect = new qxDateSelect.QxDateSelect();
      widgetContainer.add(dateSelect, {left: 30, top: 50});

      container.add(widgetContainer, {flex: 1});

      var button1 = new qx.ui.form.Button("Set date TODAY");
      button1.addListener("execute", function() {
        dateSelect.setValue(new Date());
      }, this);


      var buttonContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(6));
      buttonContainer.add(button1, {row: 0, column: 0});


      container.add(buttonContainer, {flex: 3});
      var doc = this.getRoot();
      // doc.add(container, {edge: 0});

      doc.add(dateSelect, {top: 50, left: 50});
      doc.add(buttonContainer, {top: 50, left: 500});
    }
  }
});
