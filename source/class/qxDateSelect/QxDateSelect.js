qx.Class.define("qxDateSelect.QxDateSelect", {
  extend: qx.ui.core.Widget,
  implement: [qx.ui.form.IForm, qx.ui.form.IDateForm],
  include: [
    // qx.ui.core.MChildrenHandling,
    qx.ui.form.MForm,
  ],

  properties: {
    focusable: {
      refine: true,
      init: false,
    },

    appearance: {
      refine: true,
      init: "qx-date-select",
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
      nullable: false,
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
      validate: "_validateYears",
    },

    reverseYears: {
      nullable: false,
      init: true,
      deferredInit: true,
      check: "Boolean",
      apply: "_applyReverseYears",
    },
  },

  events: {
    changeValue: "qx.event.type.Data",
  },

  construct: function (date, format) {
    this.base(arguments);

    var layout = new qx.ui.layout.Grid();
    layout.setAllowGrowSpannedCellWidth(true);
    layout.setColumnAlign(0, "left", "top");
    layout.setColumnAlign(1, "center", "top");
    layout.setColumnAlign(2, "right", "top");

    this._setLayout(layout);

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
          control = new qx.ui.form.VirtualSelectBox();
          control.setFocusable(true);

          control.addListener(
            "changeModel",
            function (e) {
              this._onChangeChildModel(control, id);
            },
            this
          );

          var _this = this;
          var opts = {
            converter: _this._getDaysOfMonth.bind(_this),
          };

          var monthControl = this.getChildControl("month");
          var monthSelection = monthControl.getSelection();

          var yearControl = this.getChildControl("year");
          var yearSelection = yearControl.getSelection();

          monthSelection.bind("change", control, "model", opts);
          yearSelection.bind("change", control, "model", opts);
          break;

        case "month":
          control = new qx.ui.form.VirtualSelectBox();
          control.setFocusable(true);

          control.addListener(
            "changeModel",
            function () {
              this._onChangeChildModel(control, id);
            },
            this
          );

          control.setLabelPath("label");
          control.setModel(this._getMonths());
          break;

        case "year":
          control = new qx.ui.form.VirtualSelectBox();
          control.setFocusable(true);

          control.addListener(
            "changeModel",
            function () {
              this._onChangeChildModel(control, id);
            },
            this
          );
          break;
      }

      return control || this.base(arguments, id);
    },

    _getDaysOfMonth: function () {
      var year = this.__getYear();
      var month = this.__getMonth();

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
        { value: 12, label: this.tr("December") },
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

      var yearSelect = this.getChildControl("year");
      yearSelect.setModel(model);
    },

    _onChangeChildModel: function (control, id) {
      var model = control.getModel();
      var label;
      switch (id) {
        case "day":
          label = this.tr("Day");
          model.unshift(label);
          break;
        case "month":
          label = this.tr("Month");
          var data = { value: null, label: label };
          // when we push an new model item, the whole model changes
          // which makes the `changeModel` event to be emmited again
          // Here we check if we have already pushed our label so we
          // don't end up with two labels.
          model.getItem(0).getValue() !== null &&
            model.unshift(qx.data.marshal.Json.createModel(data, true));
          break;
        case "year":
          label = this.tr("Year");
          model.unshift(label);
          break;
        default:
          throw new Error("This shouldn't happen.");

      }

      var firstItem = model.getItem(0);
      control.getSelection().push(firstItem);
      firstItem.setSelectable(false);
    },

    _applyReverseYears: function (value) {
      var delegate = {
        sorter: function (a, b) {
          return !value ? a - b : b - a;
        },
      };

      var yearSelect = this.getChildControl("year");
      yearSelect.setDelegate(delegate);
    },

    __getYear: function () {
      return this.getChildControl("year").getValue();
    },

    __getMonth: function () {
      var monthSelection = this.getChildControl("month").getValue();
      return monthSelection.getValue();
    },
  },
});
