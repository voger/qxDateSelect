qx.Class.define("qxDateSelect.QxDateSelect", {
  extend: qx.ui.core.Widget,
  implement: [qx.ui.form.IForm, qx.ui.form.IDateForm],
  include: [qx.ui.form.MForm],

  properties: {
    focusable: {
      refine: true,
      init: false
    },

    appearance: {
      refine: true,
      init: "qx-date-select"
    },

    /**
     * Determines the order in which
     * the select boxes appear
     *
     */
    format: {
      check: ["DMY", "YDM", "MDY", "YMD", "DYM"],
      init: "DMY",
      apply: "_applyFormat",
      nullable: false
    },

    /**
     * Flag whether the select boxes can be set back to null
     * values. Default `true`.
     *
     */
    allowNull: {
      init: false,
      check: "Boolean",
      apply: "_applyAllowNull"
    },

    /**
     * Selectable years. It can be a range in the format
     * `startYear..endYear"` where `startYear` is smaller
     * than end year or a list of integers.
     */
    years: {
      deferredInit: true,
      nullable: false,
      apply: "_applyYears",
      transform: "_transformYears",
      validate: "_validateYears"
    },

    /**
     * Flag whether the years should be displayed in decending order.
     * Default `true`.
     *
     */
    descendingYears: {
      nullable: false,
      init: true,
      deferredInit: true,
      check: "Boolean",
      apply: "_applyDescendingYears"
    }
  },

  events: {
    /**
     * Whenever the value is changed this event is fired.
     * ** WARNING ** use this event with extreme caution.
     * Every time a select box changes it's selection, this
     * event is fired. This means this event is fired few times
     * before the widget settles to its final value. Don't make
     * any code decisions based on this event.
     *
     *
     */
    changeValue: "qx.event.type.Data"
  },

  construct: function (date, format) {
    this.base(arguments);

    var layout = new qx.ui.layout.Grid(6);
    layout.setAllowGrowSpannedCellWidth(true);
    layout.setColumnAlign(0, "left", "top");
    layout.setColumnAlign(1, "center", "top");
    layout.setColumnAlign(2, "right", "top");

    this._setLayout(layout);

    // days model changes every time a select box is
    // changed so we should listen to it in order to
    // know if the value has changed.
    this.getChildControl("day").addListener(
      "changeSelection",
      this.__fireChangeValue,
      this
    );

    // initialize the date range
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var lastCentury = currentYear - 100;
    this.setYears(lastCentury + ".." + currentYear);

    if (format !== undefined) {
      this.setFormat(format);
    } else {
      this.initFormat();
    }

    this.initDescendingYears();
  },

  members: {
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      focused: true,
      invalid: true
    },

    // controllers
    __daysContoller: null,
    __monthsController: null,
    __yearsController: null,

    // flag to prevent emmitting change value
    __emmitChangeValue: true,

    /**
     * Sets the date
     * @param value {Date} The date to set.
     */
    setValue: function (value) {
      this.__emmitChangeValue = false;
      // order matters otherwise February 29 might mess up
      this.__yearsController.getSelection().setItem(0, value.getFullYear());
      this.__monthsController.getSelection().setItem(0, value.getMonth());
      this.__daysController.getSelection().setItem(0, value.getDate());

      this.__emmitChangeValue = true;
      this.__fireChangeValue();
    },

    resetValue: function (value) {
      this.__emmitChangeValue = false;
      [
        this.__yearsController,
        this.__monthsController,
        this.__daysController
      ].forEach(function (controller) {
        controller.getSelection().setItem(0, null);
      }, this);
      this.__emmitChangeValue = true;
      this.__fireChangeValue();
    },

    getValue: function (value) {
      var year = this.__getYear();
      var month = this.__getMonth();
      var day = this.__getDay();

      var date = new Date(year, month, day, 0, 0);

      // Javascript overfloods dates. Prevent that
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
      ) {
        return null;
      }

      return date;
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      var control;

      switch (id) {
        case "day":
          control = new qx.ui.form.SelectBox();
          control.setFocusable(true);

          this.__daysController = new qx.data.controller.List(null, control);
          this.__daysController.set({
            allowNull: true,
            nullValueTitle: "Day"
          });
          this.__daysController.setDelegate({
            bindItem: function (controller, item, index) {
              controller.bindProperty("", "label", null, item, index);
              controller.bindProperty("", "model", null, item, index);
            }
          });

          [this.getChildControl("month"), this.getChildControl("year")].forEach(
            function (eventTarget) {
              eventTarget.addListener(
                "changeSelection",
                function () {
                  var year = this.__getYear();
                  var month = this.__getMonth();
                  var model = this.__getDaysOfMonth(year, month);
                  this.__setChildModel(this.__daysController, model);
                },
                this
              );
            },
            this
          );
          break;

        case "month":
          control = new qx.ui.form.SelectBox();
          control.setFocusable(true);
          this.__monthsController = new qx.data.controller.List(
            null,
            control,
            "label"
          );

          this.__monthsController.set({
            allowNull: true,
            nullValueTitle: "Month"
          });
          this.__monthsController.setDelegate({
            bindItem: function (controller, item, index) {
              controller.bindProperty("label", "label", null, item, index);
              controller.bindProperty("value", "model", null, item, index);
            }
          });

          this.__setChildModel(this.__monthsController, this._getMonths());
          break;

        case "year":
          control = new qx.ui.form.SelectBox();
          control.setFocusable(true);

          this.__yearsController = new qx.data.controller.List(null, control);
          this.__yearsController.set({
            allowNull: true,
            nullValueTitle: "Year"
          });
          this.__yearsController.setDelegate({
            bindItem: function (controller, item, index) {
              controller.bindProperty("", "label", null, item, index);
              controller.bindProperty("", "model", null, item, index);
            }
          });
          break;
      }

      return control || this.base(arguments, id);
    },

    /**
     * Return a data array with the days of a given month
     * of a given year
     * @param year {Integer} the year
     * @param month {Integer} the 1 based index of month
     * @return {qx.data.Array} the array of the days
     */
    __getDaysOfMonth: function (year, month) {
      var days = new Date(year, month + 1, 0).getDate() || 31;

      // make it inclusive
      var daysRange = qx.module.util.Array.range(1, days + 1);
      return new qx.data.Array(daysRange);
    },

    /**
     * Function to create a list of months in a year
     * @returns {qx.core.Object} json representation of the months
     * @private
     */
    _getMonths: function () {
      var monthList = [
        { value: 0, label: this.tr("January") },
        { value: 1, label: this.tr("February") },
        { value: 2, label: this.tr("March") },
        { value: 3, label: this.tr("April") },
        { value: 4, label: this.tr("May") },
        { value: 5, label: this.tr("June") },
        { value: 6, label: this.tr("July") },
        { value: 7, label: this.tr("August") },
        { value: 8, label: this.tr("September") },
        { value: 9, label: this.tr("October") },
        { value: 10, label: this.tr("November") },
        { value: 11, label: this.tr("December") }
      ];
      return qx.data.marshal.Json.createModel(monthList);
    },

    _applyFormat: function (value) {
      this._removeAll();

      var control;
      var parts = qx.util.StringSplit.split(value, "");

      for (var i = 0; i < parts.length; i++) {
        switch (parts[i]) {
          case "D":
            control = this.getChildControl("day");
            break;
          case "M":
            control = this.getChildControl("month");
            break;
          case "Y":
            control = this.getChildControl("year");
            break;
          default:
            throw new Error("This shouldn't happen.");
        }
        this._add(control, { row: 0, column: i });
      }
    },

    _transformYears: function (val) {
      if (qx.lang.Type.isArray(val)) {
        return val;
      }

      var range = qx.util.StringSplit.split(val, "..");
      var rangeInts = range.map(function (year) {
        return parseInt(year);
      });
      return qx.module.util.Array.range(rangeInts[0], rangeInts[1] + 1);
    },

    _validateYears: function (val) {
      try {
        // eslint-disable-next-line array-callback-return
        val.map(function (year) {
          qx.core.Assert.assertInteger(year);
        });
      } catch (e) {
        throw new qx.core.ValidationError(
          "Validation Error: Invalid value for property years."
        );
      }
    },

    _applyYears: function (value) {
      var model = new qx.data.Array(value);
      this.__setChildModel(this.__yearsController, model);
    },

    _applyDescendingYears: function (value) {
      var array = this.__yearsController.getModel().toArray();
      array.sort(function (a, b) {
        return !value ? a - b : b - a;
      });
      var model = new qx.data.Array(array);
      this.__emmitChangeValue = false;
      this.__setChildModel(this.__yearsController, model);
      this.__emmitChangeValue = true;
    },

    _applyAllowNull: function (value) {
      var day = this.getChildControl("day");
      var month = this.getChildControl("month");
      var year = this.getChildControl("year");

      [day, month, year].forEach(function (control) {
        var nullItem = this.__findNullItem(control);
        nullItem.setEnabled(value);
      }, this);
    },

    __fireChangeValue: function () {
      if (this.__emmitChangeValue) {
        this.fireDataEvent("changeValue", this.getValue());
      }
    },

    __setChildModel: function (controller, model) {
      // save old selection to restore it
      var selection = controller.getSelection().getItem(0);

      controller.setModel(model);

      controller.getSelection().setItem(0, selection);

      // set the nullValue list item
      var control = controller.getTarget();
      var nullItem = this.__findNullItem(control);

      nullItem.setEnabled(this.getAllowNull());
    },

    /**
     * Returns the null item of a child control
     *
     * @param control {qx.ui.form.SelectBox} The child control
     * @return {qx.ui.form.ListItem} The null child select
     */
    __findNullItem: function (control) {
      return control.getChildren().find(function (item) {
        return item.getModel() === null;
      });
    },

    /**
     * Returns a qx.ui.form.ListItem serving as the label for the control
     * @param control {qx.ui.form.SelectBox} the control that we
     * need the label for
     *
     * @return {qx.ui.form.ListItem} the list item serving as a label
     */
    __getLabelItem: function (control) {
      return control.getUserData("labelItem");
    },

    /**
     * Creates a list item to be inserted as a label
     * to a select box.
     * @param label {String} the label of the list item
     * @return qx.ui.form.ListItem
     */
    __createLabelItem: function (label) {
      var listItem = new qx.ui.form.ListItem(label);
      listItem.setEnabled(false);
      return listItem;
    },

    __getYear: function () {
      var selected = this.__yearsController.getSelection();
      return selected.getItem(0);
    },

    __getMonth: function () {
      var selected = this.__monthsController.getSelection();
      return selected.getItem(0);
    },

    __getDay: function () {
      var selected = this.__daysController.getSelection();
      return selected.getItem(0);
    }
  }
});
