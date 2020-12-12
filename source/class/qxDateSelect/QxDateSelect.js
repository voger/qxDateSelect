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
          break;

        case "month":
          control = new qx.ui.form.VirtualSelectBox();
          control.setFocusable(true);
          break;

        case "year":
          control = new qx.ui.form.VirtualSelectBox();
          control.setFocusable(true);
          break;
      }

      return control || this.base(arguments, id);
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
        return val.sort(function (a, b) {
          return a - b;
        });
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

    _applyReverseYears: function (value) {
      var delegate = {
        sorter: function (a, b) {
          return !value ? a - b : b - a;
        },
      };

      var yearSelect = this.getChildControl("year");
      yearSelect.setDelegate(delegate);
    },
  },
});
