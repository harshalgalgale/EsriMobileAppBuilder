(function ($) {
    $.fn.extend({
        collapsiblePanel: function () {
            $(this).each(function () {
                var indicator = $(this).find('.ui-expander').first();
                var header = $(this).find('.expander-header').first();
                var content = $(this).find('.expander-content').first();
                if (content.is(':visible')) {
                    indicator.removeClass('ui-icon-plus').addClass('ui-icon-minus');
                } else {
                    indicator.removeClass('ui-icon-minus').addClass('ui-icon-plus');
                }

                header.click(function () {
                    content.slideToggle(100, function () {
                        if (content.is(':visible')) {
                            indicator.removeClass('ui-icon-plus').addClass('ui-icon-minus');
                        } else {
                            indicator.removeClass('ui-icon-minus').addClass('ui-icon-plus');
                        }
                    });
                });
            });
        }
    });
})(jQuery);