/* ************************************************************************

   Copyright: 2020 voger

   License: MIT license

   Authors: voger

 ************************************************************************ */

/**
 * This is the main application class of "qxDateSelect"
 */
qx.Class.define("qxDateSelect.demo.Application", {
  extend: qx.application.Standalone,

  /*
     *****************************************************************************
     MEMBERS
     *****************************************************************************
     */

  members: {
    __formatter: null,
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main: function () {
      // Call super class
      this.base(arguments);
      var self = this;

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

      // create a container to hold the widget and the label
      var widgetContainer = new qx.ui.container.Composite();
      widgetContainer.setLayout(new qx.ui.layout.VBox());

      var dateSelect = new qxDateSelect.QxDateSelect();

      var label = new qx.ui.basic.Label();
      label.setFont(new qx.bom.Font(28, ["Verdana", "sans-serif"]));

      dateSelect.bind("changeValue", label, "value", {
        converter: function (value) {
          if (!value) {
            return "Please set a valid date";
          }

          var value = self.__formatter.format(value);
          console.log(value);
          return value;
        },
      });

      widgetContainer.add(label);
      widgetContainer.add(dateSelect);

      // set date today button
      var button1 = new qx.ui.form.Button("Set date TODAY").set({
        allowGrowX: true,
        allowStretchX: true,
      });
      button1.addListener(
        "execute",
        function () {
          dateSelect.setValue(new Date());
        },
        this
      );

      // set various formats
      var select1 = new qx.ui.form.SelectBox().set({
        width: 160,
      });
      var model = ["DMY", "YDM", "MDY", "YMD", "DYM"];
      var select1Controller = new qx.data.controller.List(
        new qx.data.Array(model),
        select1
      );
      select1Controller.setDelegate({
        bindItem: function (controller, item, id) {
          controller.bindProperty("", "model", null, item, id);
          controller.bindProperty(
            "",
            "label",
            {
              converter: function (value) {
                return "Set format to " + value;
              },
            },
            item,
            id
          );
        },
      });
      select1Controller.bind("selection[0]", dateSelect, "format", {
        onUpdate: function (_, target, data) {
          // not sure why is called twice.
          // do nothing when data is undefined
          if (!data) {
            return;
          }

          if (self.__formatter) {
            self.__formatter.dispose();
          }

          var formatArr = data.split("").map(function (item) {
            var returnVal;
            switch (item) {
              case "Y":
                returnVal = "yyyy";
                break;
              case "M":
                returnVal = "MM";
                break;
              case "D":
                returnVal = "dd";
                break;
              default:
                throw new Error("Ooops!");
            }

            return returnVal;
          });
          self.__formatter = new qx.util.format.DateFormat(formatArr.join("/"));
          target.fireDataEvent("changeValue", target.getValue());
        },
      });

      // Toggle allow null
      var button2 = new qx.ui.form.ToggleButton("Allow null value");
      button2.bind("changeValue", dateSelect, "allowNull");

      var buttonContainer = new qx.ui.container.Composite(
        new qx.ui.layout.Grid(6, 6)
      );
      buttonContainer.add(button1, { row: 0, column: 0 });
      buttonContainer.add(select1, { row: 1, column: 0 });
      buttonContainer.add(button2, { row: 2, column: 0 });

      var doc = this.getRoot();
      // doc.add(container, {edge: 0});

      doc.add(widgetContainer, { top: 50, left: 50 });
      doc.add(buttonContainer, { top: 50, left: 500 });
    },
  },
});
