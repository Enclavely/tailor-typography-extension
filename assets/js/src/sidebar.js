var $ = window.jQuery;

(function (Tailor) {

    'use strict';

    var iFrame;
    var canvasChannel;
    var hlClass = 'typo_hl_block';

    //returns highlighted elements
    function getHighlighted() {
        return $(iFrame).contents().find('.' + hlClass);
    }

    //on sidebar init
    app.listenTo(app.channel, 'canvas:handshake', function () {
        iFrame = this.el.querySelector('#tailor-sidebar-preview');
        canvasChannel = iFrame.contentWindow.app.channel;

        //when block on canvas is selected setting that to global variable
        app.listenTo(canvasChannel, 'canvas:select', function (tag) {
            window.$selectedEl = tag.$el;
        });

        app.listenTo(canvasChannel, 'element:refresh element:jSrefresh', function (tag) {
            window.$selectedEl = tag.$el;
            app.channel.trigger('sidebar:element_content_changed', tag.$el);
        });
    });

    //on sidebar closing removes all highlighted classes
    app.listenTo(app.channel, 'modal:destroy', function () {
        getHighlighted().removeClass(hlClass);
    });

    //highlighting elements
    app.listenTo(app.channel, 'sidebar:element_selected', function (el) {
        var toHl = $(iFrame).contents().find('.is-editing');
        var hl = getHighlighted();
        toHl = el != 'all' ? toHl.find(el) : toHl;
        hl.removeClass(hlClass);
        toHl.addClass(hlClass);
    });

    //init typography module
    app.on('before:start', function () {
        Tailor.Controls.TypographyGroup = require('./sidebar/components/controls/typography-group.js');
    });

})(window.Tailor || {});
