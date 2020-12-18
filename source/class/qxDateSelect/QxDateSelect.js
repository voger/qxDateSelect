qx.Class.define("qxDateSelect.QxDateSelect", {
  extend: qx.ui.core.Widget,
  implement: [qx.ui.form.IForm, qx.ui.form.IDateForm],
  include: [
    // qx.ui.core.MChildrenHandling,
    qx.ui.form.MForm
  ],

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

    reverseYears: {
      nullable: false,
      init: true,
      deferredInit: true,
      check: "Boolean",
      apply: "_applyReverseYears"
    }
  },

  events: {
    changeValue: "qx.event.type.Data"
  },

  construct: function (date, format) {
    this.base(arguments);

    var layout = new qx.ui.layout.Grid();
    layout.setAllowGrowSpannedCellWidth(true);
    layout.setColumnAlign(0, "left", "top");
    layout.setColumnAlign(1, "center", "top");
    layout.setColumnAlign(2, "right", "top");

    this._setLayout(layout);

    this.getChildControl("year");
    this.getChildControl("month");
    this.getChildControl("day");

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

    this.initReverseYears();
  },

  members: {
    // controllers
    __daysContoller: null,
    __monthsController: null,
    __yearsController: null,

    // select boxes
    __daysSelect: null,
    __monthsSelect: null,
    __yearsSelect: null,

    // label items
    __daysLabel: null,
    __monthsLabel: null,
    __yearsLabel: null,

    setValue: function (value) {
      this.debug("setValue(): To be done");
    },

    resetValue: function (value) {
      this.debug("resetValue(): To be done");
    },

    getValue: function (value) {
      this.debug("getValue(): To be done");
    },

    // overridden
    _createChildControlImpl: function (id, hash) {
      var control;

      switch (id) {
        case "day":
          control = this.__daysSelect = new qx.ui.form.SelectBox();
          this.__daysLabel = this.__createLabelItem(this.tr("Day"));
          control.setFocusable(true);
          this.__daysController = new qx.data.controller.List(null, control);

          var monthControl = this.__monthsSelect;
          var yearControl = this.__yearsSelect;

          [monthControl, yearControl].forEach(function (eventTarget) {
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
          }, this);

          break;

        case "month":
          control = this.__monthsSelect = new qx.ui.form.SelectBox();
          control.setFocusable(true);
          this.__monthsLabel = this.__createLabelItem(this.tr("Month"));
          this.__monthsController = new qx.data.controller.List(
            null,
            control,
            "label"
          );
          this.__monthsController.setDelegate({
            bindItem: function (controller, item, index) {
              controller.bindProperty("label", "label", null, item, index);
              controller.bindProperty("value", "model", null, item, index);
            }
          });

          this.__setChildModel(this.__monthsController, this._getMonths());
          break;

        case "year":
          control = this.__yearsSelect = new qx.ui.form.SelectBox();
          control.setFocusable(true);

          this.__yearsLabel = this.__createLabelItem(this.tr("Year"));
          this.__yearsController = new qx.data.controller.List(null, control);
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
      var days = new Date(year, month, 0).getDate() || 31;

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
        { value: 1, label: this.tr("January") },
        { value: 2, label: this.tr("February") },
        { value: 3, label: this.tr("March") },
        { value: 4, label: this.tr("April") },
        { value: 5, label: this.tr("May") },
        { value: 6, label: this.tr("June") },
        { value: 7, label: this.tr("July") },
        { value: 8, label: this.tr("August") },
        { value: 9, label: this.tr("September") },
        { value: 10, label: this.tr("October") },
        { value: 11, label: this.tr("November") },
        { value: 12, label: this.tr("December") }
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
            control = this.__daysSelect;
            break;
          case "M":
            control = this.__monthsSelect;
            break;
          case "Y":
            control = this.__yearsSelect;
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

    _applyReverseYears: function (value) {
      var array = this.__yearsController.getModel().toArray();
      array.sort(function (a, b) {
        return !value ? a - b : b - a;
      });
      var model = new qx.data.Array(array);
      this.__setChildModel(this.__yearsController, model);
    },

    __setChildModel: function (controller, model) {
      var control = controller.getTarget();

      // save old selection to restore it
      var selection = controller.getSelection().getItem(0);

      control.removeAll();
      controller.setModel(model);

      var labelItem = this.__getLabelItem(control);
      control.addAt(labelItem, 0);

      // restore old selection if available or set
      // label as selection
      if (model.indexOf(selection) < 0) {
        control.setSelection([labelItem]);
      } else {
        controller.getSelection().setItem(0, selection);
      }
    },

    /**
     * Returns a qx.ui.form.ListItem serving as the label for the control
     * @param control {qx.ui.form.SelectBox} the control that we
     * need the label for
     *
     * @return {qx.ui.form.ListItem} the list item serving as a label
     */
    __getLabelItem: function (control) {
      var listItem;
      switch (control) {
        case this.__daysSelect:
          listItem = this.__daysLabel;
          break;
        case this.__monthsSelect:
          listItem = this.__monthsLabel;
          break;
        case this.__yearsSelect:
          listItem = this.__yearsLabel;
          break;
        default:
          throw new Error("This shouldn't happen.");
      }
      return listItem;
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
    }
  }
});
