var GLOBALS = (function($) {
  'use strict';

  return {
    $win: $(window),
    $doc: $(document)
  };

}(jQuery));

var SITE = (function($) {
  'use strict';

  var $win = GLOBALS.$win,
      $doc = GLOBALS.$doc;

  function init() {

    // js

  }

  return {
    init: init
  };

}(jQuery));

(function($) {
  'use strict';

  GLOBALS.$doc.ready(function() {

    SITE.init();

  });

}(jQuery));