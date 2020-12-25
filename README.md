# qxDateSelect
A simple select date widget for Qooxdoo framework

Inspired by Facebook's and Twitter's birthday selection widgets in their registration forms.

![how it looks](https://raw.githubusercontent.com/voger/qxDateSelect/main/screenshoots/screenshoot.png)

Features:

* The months and the labels are translatable.
* The display format can be changed
* Labels can be selectable or not. If they are selectable null value is allowed.
* The value is a Javascript Date() object

While care is taken, not to use features unknown to the old Python build tool, this library and
the demo code are tested only with the qx compiler.


To run the demo clone this repository, change directory into it and run

```console
$ npx qx serve
```

and visit http://localhost:8080/


