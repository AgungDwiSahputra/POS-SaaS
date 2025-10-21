/******/ (() => { // webpackBootstrap
/*!**************************************!*\
  !*** ./resources/assets/js/index.js ***!
  \**************************************/
(function ($) {
  'use strict';

  if (!$ || !$.fn) {
    return;
  }
  var initSlider = function initSlider(selector, options) {
    var $element = $(selector);
    if (!$element.length || typeof $element.slick !== 'function') {
      return;
    }
    $element.each(function () {
      var $slider = $(this);
      if ($slider.hasClass('slick-initialized')) {
        $slider.slick('unslick');
      }
      $slider.slick(options);
    });
  };
  var initTabs = function initTabs() {
    var $buttons = $('#tabs [data-tab]');
    var $panels = $('.tab-panel');
    if (!$buttons.length || !$panels.length) {
      return;
    }
    var activate = function activate(tabId) {
      $buttons.removeClass('tab-active bg-white text-primary shadow-lg border border-primary').addClass('text-gray-200');
      $panels.addClass('hidden');
      var $targetButton = $buttons.filter('[data-tab="' + tabId + '"]');
      var $targetPanel = $('#' + tabId);
      $targetButton.addClass('tab-active bg-white text-primary shadow-lg border border-primary').removeClass('text-gray-200');
      $targetPanel.removeClass('hidden');
    };
    $buttons.on('click keypress', function (event) {
      if (event.type === 'keypress' && event.which !== 13 && event.which !== 32) {
        return;
      }
      event.preventDefault();
      var tabId = $(this).data('tab');
      activate(tabId);
    });
    activate($buttons.first().data('tab'));
  };
  var initAccordion = function initAccordion() {
    var $items = $('.accordion-item');
    if (!$items.length) {
      return;
    }
    $items.each(function () {
      var $item = $(this);
      var $content = $item.find('.accordion-content');
      if ($item.hasClass('accordion-open')) {
        $content.show();
      } else {
        $content.hide();
      }
    });
    $('.accordion-header').on('click keypress', function (event) {
      if (event.type === 'keypress' && event.which !== 13 && event.which !== 32) {
        return;
      }
      event.preventDefault();
      var $item = $(this).closest('.accordion-item');
      var $content = $item.find('.accordion-content');
      $item.toggleClass('accordion-open');
      $content.stop(true, true).slideToggle(200);
    });
  };
  $(function () {
    initSlider('.action-slider', {
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000,
      arrows: false,
      dots: true,
      responsive: [{
        breakpoint: 1200,
        settings: {
          slidesToShow: 2
        }
      }, {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }]
    });
    initSlider('.pricing-slider', {
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: true,
      dots: false,
      adaptiveHeight: true,
      prevArrow: '<button type="button" class="slick-prev" aria-label="Previous"></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Next"></button>',
      responsive: [{
        breakpoint: 1200,
        settings: {
          slidesToShow: 2
        }
      }, {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      }]
    });
    initSlider('.meet-slider', {
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      dots: true,
      autoplay: true,
      autoplaySpeed: 5000,
      adaptiveHeight: true
    });
    initTabs();
    initAccordion();
  });
})(window.jQuery);
/******/ })()
;