var $ = window.jQuery;
var TH = require('./sidebar/components/typography-helper.js');

(function (ElementAPI, SettingAPI, Views) {

    'use strict';

    var connectedFonts = [];
    var mediaTypes = ['desktop', 'tablet', 'mobile'];

    function connect_font(fontName) {
        var font = _.find(typography_google_fonts, function (value, index) {
            return value.name == fontName;
        });

        if (font != undefined) {
            var newStyle = document.createElement('style');
            newStyle.appendChild(document.createTextNode("\
                        @font-face {\
                            font-family: " + font.name + ";\
                            src: url('" + font.src + "');\
                        }\
                    "
            ));
            document.head.appendChild(newStyle);
            connectedFonts.push(fontName);
        }
    }

    function addFontFromTypographyGroup(model, name) {
        var typographyGroup = model.attributes.atts[name];
        try {
            typographyGroup = JSON.parse(typographyGroup);
        } catch (e) {
            typographyGroup = undefined;
        }
        if (typographyGroup !== undefined) {
            _.each(typographyGroup, function (params) {
                var fontData = params.font_family;
                var connectedFont = _.find(connectedFonts, function (value, index) {
                    return fontData == value
                });
                if (connectedFont == undefined) {
                    connect_font(fontData);
                }
            });
        }
    }

    function getTypoElementNameByMedia(media) {
        return media == 'desktop' ? 'typography_group' : 'typography_group_' + media;
    }

    app.listenTo(app.channel, 'element:ready', function (tag) {
        _.each(mediaTypes, function (media) {
            addFontFromTypographyGroup(tag.model, getTypoElementNameByMedia(media));
        });
    });

    _.each(mediaTypes, function (media) {
        var element = getTypoElementNameByMedia(media);

        SettingAPI.onChange(( 'element:' + element ), function (to, from, model) {
            addFontFromTypographyGroup(model, element);
            return TH.getCompiledStyles(model);
        });
    });

})(window.Tailor.Api.Element, window.Tailor.Api.Setting, Tailor.Views || {});

