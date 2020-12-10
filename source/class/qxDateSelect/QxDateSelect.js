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

    /**
     * This property determines the order in which
     * the select boxes appear
     *
     */
    format: {
      check: ["DMY", "YDM", "MDY", "YMD", "DYM"],
      init: "DMY",
      apply: "_applyFormat",
      nullable: false
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

    if (format !== undefined) {
      this.setFormat(format);
    } else {
      this.initFormat();
    }
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
          control = new qx.ui.form.SelectBox();
          control.setFocusable(true);
          break;

        case "month":
          control = new qx.ui.form.SelectBox();
          control.setFocusable(true);
          break;

        case "year":
          control = new qx.ui.form.SelectBox();
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
            throw "This shouldn't happen.";
        }
        this._add(control, { row: 0, column: i });
      }
    },
  },
});
