var params = ['font_family', 'font_size', 'font_weight', 'font_transform', 'font_style', 'line_height', 'letter_spacing'];
var mediaTypes = ['desktop', 'tablet', 'mobile'];

TypographyHelper = {
    //returns a unit
    cleanUnit: function (unit) {
        var defaultValue = 'px';
        var sizeUnits = ['pt', 'px', 'em', 'rm'];
        return _.contains(sizeUnits, unit) ? unit : defaultValue;
    },

    //returns a value if it is found
    findParamValue: function (values, paramName) {
        var result = null;
        _.each(values, function (value, key) {
            if (key == paramName) {
                result = value;
            }
        });
        return result;
    },

    getElementClassParamValueForMedia: function (elementClassName, param, media, cleanValues) {
        var result;
        var elementName = elementClassName.split('.')[0];

        //try to get element value
        try {
            result = cleanValues[media][elementClassName][param];
        } catch (e) {
        }

        //try to get element value without class
        if (result === undefined) {
            try {
                result = cleanValues[media][elementName][param];
            } catch (e) {
            }
        }

        //try to get element all value
        if (result === undefined) {
            try {
                result = cleanValues[media]['all'][param];
            } catch (e) {
            }
        }

        //try to get desktop element value
        if (result === undefined && media != 'desktop') {
            try {
                result = cleanValues['desktop'][elementClassName][param];
            } catch (e) {
            }
        }

        //try to get desktop element value without class
        if (result === undefined && media != 'desktop') {
            try {
                result = cleanValues['desktop'][elementName][param];
            } catch (e) {
            }
        }

        //try to get desktop all value
        if (result === undefined && media != 'desktop') {
            try {
                result = cleanValues['desktop']['all'][param];
            } catch (e) {
            }
        }

        return result === undefined ? null : result;
    },

    getCompiledStyles: function (model) {
        var allValues = {};
        var self = this;
        var desktop;
        var tablet;
        var mobile;
        var styles = [];

        try {
            desktop = JSON.parse(model.attributes.atts.typography_group);
        } catch (e) {
            desktop = {};
        }

        try {
            tablet = JSON.parse(model.attributes.atts.typography_group_tablet);
        } catch (e) {
            tablet = {};
        }

        try {
            mobile = JSON.parse(model.attributes.atts.typography_group_mobile);
        } catch (e) {
            mobile = {};
        }

        allValues['desktop'] = desktop;
        allValues['tablet'] = tablet;
        allValues['mobile'] = mobile;

        var elements = [];
        _.each(mediaTypes, function (media) {
            _.each(allValues[media], function (paramValues, element) {
                if (_.indexOf(elements, element) == -1){
                    elements.push(element);
                }
            })
        });

        _.each(mediaTypes, function (media) {
            _.each(elements, function (element, index) {
                var selectors = [];
                var fontSizeUnit = self.cleanUnit(self.getElementClassParamValueForMedia(element, 'font_size_unit', media, allValues));
                var lineHeightUnit = self.cleanUnit(self.getElementClassParamValueForMedia(element, 'line_height_unit', media, allValues));
                var letterSpacingUnit = self.cleanUnit(self.getElementClassParamValueForMedia(element, 'letter_spacing_unit', media, allValues));

                var typoElement = element == 'all' ? ' *' : element;
                typoElement = typoElement == 'blockquote' ? typoElement + ' *' : typoElement;

                selectors.push(typoElement);

                _.each(params, function (param) {

                    var styleToPush = null;
                    var styleTemplate = {
                        'selectors': selectors,
                        'media': media
                    };

                    var value = self.getElementClassParamValueForMedia(element, param, media, allValues);

                    if (value !== null) {
                        switch (param) {
                            case 'font_family':
                                if (value != 'inherit') {
                                    styleToPush = _.extend(styleTemplate, {
                                        'declarations': {
                                            'font-family': value
                                        }
                                    });
                                }
                                break;
                            case 'font_size':
                                styleToPush = _.extend(styleTemplate, {
                                    'declarations': {
                                        'font-size': value == '0' ? 'inherit' : value + fontSizeUnit
                                    }
                                });
                                break;
                            case 'font_weight':
                                styleToPush = _.extend(styleTemplate, {
                                    'declarations': {
                                        'font-weight': value
                                    }
                                });
                                break;
                            case 'font_transform':
                                styleToPush = _.extend(styleTemplate, {
                                    'declarations': {
                                        'text-transform': value
                                    }
                                });
                                break;
                            case 'font_style':
                                styleToPush = _.extend(styleTemplate, {
                                    'declarations': {
                                        'font-style': value
                                    }
                                });
                                break;
                            case 'line_height':
                                styleToPush = _.extend(styleTemplate, {
                                    'declarations': {
                                        'line-height': value == '0' ? 'inherit' : value + lineHeightUnit
                                    }
                                });
                                break;
                            case 'letter_spacing':
                                styleToPush = _.extend(styleTemplate, {
                                    'declarations': {
                                        'letter-spacing': value == '0' ? 'inherit' : value + letterSpacingUnit
                                    }
                                });
                                break;
                        }
                    }

                    if (styleToPush !== null) {
                        styles.push(styleToPush);
                    }
                });
            })
        });

        return styles;
    }
};

module.exports = TypographyHelper;