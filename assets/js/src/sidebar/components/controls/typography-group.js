var AbstractControl = require('../../../../../../../tailor/assets/js/src/sidebar/components/controls/abstract-control.js');
var TH = require('../typography-helper.js');
var TypographyGroup;
var $ = window.jQuery;

var mediaTypes = ['desktop', 'tablet', 'mobile'];
//current selected sub element
var selectedSubElement = 'all';
//all sub elements
var selectedElementClass = 'all';
// default all elements
var defaultAllSubElements = {
    'all': 'all'
};
// all elements
var allSubElements = _.extend({}, defaultAllSubElements);

//default subElementClasses
var defaultSubElementClasses = {
    'all': 'all'
};
//subElementClasses
var subElementClasses = _.extend({}, defaultSubElementClasses);

//default all exist classes
var defaultAllClasses = {
    'all': {
        'all': 'all'
    }
};
//default all exist classes
var allClasses = _.extend({}, defaultAllClasses);

//get current selected element and class combination
function getElClass() {
    return selectedSubElement + (selectedElementClass == 'all' ? '' : '.' + selectedElementClass);
}

//parses input name from string
function parseInputName(input) {
    return input.replace(/(^.*\[|\].*$)/g, '')
}

//adds value from field to the values array
function addValue(values, field, subElement) {
    var param = parseInputName(field.name);

    if (field.value !== "" && param !== "") {
        if (!_.isObject(values[subElement])) {
            values[subElement] = {};
        }
        values[subElement][param] = field.value;
    }

    return values;
}

//define new control
TypographyGroup = AbstractControl.extend({
    firstRender: true,

    //define ui elements
    ui: {
        'select_input': 'select',

        'button_group_input': '.control__body .button',

        'range_input': 'input[type=range]',
        'text_input': 'input[type=text]',

        'mediaButton': '.js-setting-group .button',
        'defaultButton': '.js-default',
        'controlGroups': '.control__body > *'
    },

    //define actions
    events: {
        'change @ui.select_input': 'onSelectChange',

        'click @ui.button_group_input': 'onButtonGroupChange',

        'input @ui.range_input': 'onRangeInput',
        'mouseup @ui.range_input': 'onRangeChange',
        'keyup @ui.text_input': 'onRangeChange',

        'click @ui.mediaButton': 'onMediaButtonChange',
        'click @ui.defaultButton': 'onDefaultButtonChange'
    },

    addListeners: function () {
        this.listenTo(app.channel, 'sidebar:element_content_changed', function ($el) {
            this.parseAllSubElements(window.$selectedEl[0]);
            this.render();
        });
    },

    //on media type change
    onMediaButtonChange: function (e) {
        this.media = e.currentTarget.getAttribute('data-media');
        app.channel.trigger('sidebar:device', this.media);
        this.onFieldChange(e, 'media_button');
        this.updateControlGroups();
        this.render();
    },

    onRender: function () {
        this.updateControlGroups();
    },

    //functions, which uses in template render
    templateHelpers: {
        //returns current value for key in current media
        getCurrentValue: function (media, key) {
            var currentValue = undefined;
            var currentSubElement = getElClass();

            try {
                currentValue = this.values[media][currentSubElement][key];
            } catch (e) {
            }

            return currentValue
        },
        //returns 'selected' if current value == value
        selected: function (media, key, value) {
            var currentValue = this.getCurrentValue(media, key);
            return value == currentValue ? 'selected' : '';
        },
        //returns 'active' if current value == value
        active: function (media, key, value) {
            var currentValue = this.getCurrentValue(media, key);
            return value == currentValue ? 'active' : '';
        },
        //returns 'selected' if current selectValue == selectedSubElement
        is_selected_sub_element: function (selectValue) {
            return selectValue == selectedSubElement ? 'selected' : '';
        },
        //returns 'selected' if current selectValue == selectedElementClass
        is_selected_class: function (selectValue) {
            return selectValue == selectedElementClass ? 'selected' : '';
        }
    },

    //here adds additional variables before template rendering
    addSerializedData: function (data) {
        if (this.firstRender) {
            selectedSubElement = 'all';
            selectedElementClass = 'all';
            this.firstRender = false;

            this.parseAllSubElements(window.$selectedEl[0]);

            this.addListeners();
            // this.checkDependencies();
        }

        data.values = this.getCurrentValues(data.params);

        data.params['media'] = this.media;
        data.params['element_blocks'] = allSubElements;
        data.params['block_classes'] = subElementClasses;
        data.selectedSubElement = getElClass();

        return data;
    },

    //returns all variables for current element in current media
    getCurrentValues: function (params) {
        var allValues = this.getValues();
        var self = this;

        _.each(mediaTypes, function (media) {
            var values;

            try {
                values = JSON.parse(allValues[media]);
            } catch (e) {
            }

            if (!_.isObject(values)) {
                values = {};
            }

            var currentValues = values[self.getCurrentSubElement()];
            if (!_.isObject(currentValues)) {
                currentValues = {};
            }
            if (!_.isObject(values)) {
                allValues[media] = {};
            } else {
                allValues[media] = values;
            }
            allValues[media][self.getCurrentSubElement()] = currentValues;
        });

        var cleanValues = JSON.parse(JSON.stringify(allValues));
        
        
        function setElementParamValueForMedia(element, param, value, media) {
            if (!_.isObject(allValues[media])) {
                allValues[media] = {};
            }

            if (!_.isObject(allValues[media][element])) {
                allValues[media][element] = {}
            }

            allValues[media][element][param] = value;
        }

        function fillValues(){
            _.each(allSubElements, function (elementName) {
                _.each(allClasses[elementName], function (className) {
                    var elementClassName = elementName + (className == 'all' ? '' : '.' + className);
                    _.each(params, function (paramValues, paramName) {
                        _.each(mediaTypes, function (media) {
                            var mediaValue = TH.getElementClassParamValueForMedia(elementClassName, paramName, media, cleanValues);
                            if (mediaValue != null) {
                                setElementParamValueForMedia(elementClassName, paramName, mediaValue, media);
                            }
                        });
                    });
                })
            });
        }

        fillValues();
        
        return allValues;
    },

    //returns last selected sub_element (saved in values)
    getCurrentSubElement: function () {
        return selectedSubElement;
    },

    //parse options for element selectors
    parseAllSubElements: function ($selectedEl) {
        allSubElements = _.extend({}, defaultAllSubElements);
        allClasses = _.extend({}, defaultAllClasses);

        function getSubElements(element, firstLvl) {
            var subEl = {};
            var firstClassName = element.classList[0];
            var subElName = element.tagName.toLowerCase();

            if (!firstLvl) {
                subEl[subElName] = subElName;
            }

            if (!_.isObject(allClasses[subElName])) {
                allClasses[subElName] = {
                    'all': 'all'
                };
            }

            if (!firstLvl && firstClassName !== undefined) {
                allClasses[subElName][firstClassName] = firstClassName;
            }
            $.each(element.children, function (key, child) {
                subEl = _.extend(subEl, getSubElements(child, false));
            });
            return subEl;
        }

        allSubElements = _.extend(allSubElements, getSubElements($selectedEl, true));
        subElementClasses = allClasses[selectedSubElement];
    },

    //action on select change
    onSelectChange: function (e) {
        var currentSelect = e.currentTarget;
        var changedClass = false;
        var param = parseInputName(e.currentTarget.name);

        if (param == 'sub_element') {
            if (currentSelect.value != selectedSubElement) {
                selectedSubElement = currentSelect.value;
                selectedElementClass = 'all';
                changedClass = true;
                subElementClasses = allClasses[selectedSubElement];
            }
        }

        if (param == 'block_classes' && changedClass == false) {
            selectedElementClass = currentSelect.value;
        }

        this.onFieldChange(e, 'select')
    },

    //action on button group change
    onButtonGroupChange: function (e) {
        _.each(e.currentTarget.parentElement.children, function (children) {
            children.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        this.onFieldChange(e, 'button_group')
    },

    //action on range change
    onRangeChange: function (e) {
        var value = e.target.value;

        this.ui.text_input.filter('[name^="' + e.currentTarget.name + '"]').val(value);
        this.ui.range_input.filter('[name^="' + e.currentTarget.name + '"]').val(value);

        this.onFieldChange(e, 'range')
    },

    //action on range move
    onRangeInput: function (e) {
        var value = e.target.value;
        this.ui.text_input.filter('[name^="' + e.currentTarget.name + '"]').val(value);
        this.ui.range_input.filter('[name^="' + e.currentTarget.name + '"]').val(value);
    },

    //action in field change, preparation and saving
    onFieldChange: function (e, fieldType) {
        var param = parseInputName(e.currentTarget.name);

        //all exists values
        var allValues = this.getValues();
        var values;

        try {
            //all values for current media
            values = JSON.parse(allValues[this.media]);
        } catch (e) {
            values = {};
        }


        if (param != 'sub_element' && param != 'block_classes') {
            var newValue = values[getElClass()];

            if (newValue == undefined) {
                values[getElClass()] = {};
            }

            values = addValue(values, e.currentTarget, getElClass());
        } else {
            app.channel.trigger('sidebar:element_selected', getElClass());
        }

        values = JSON.stringify(values);

        this.setValue(values);
        this.updateControlGroups();
        this.render();
    }
});

module.exports = TypographyGroup;
