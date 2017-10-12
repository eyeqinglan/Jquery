(function($) {
  $.fn.qrcode = function(options) {
    // if options is string,
    if (typeof options === 'string') {
      options = {
        text : options
      };
    }

    var supportCanvas = false;
    try {
      document.createElement('canvas').getContext('2d');
      supportCanvas = true;
    } catch (e) {
      supportCanvas = false;
    }

    // set default values
    // typeNumber < 1 for automatic calculation
    options = $.extend({}, {
      render : supportCanvas ? "canvas" : "table",
      width : 256,
      height : 256,
      typeNumber : -1,
      correctLevel : QRErrorCorrectLevel.H,
      background : "#ffffff",
      foreground : "#000000"
    }, options);
    options = $.extend({}, {
      imgSrc : null,
      imgWidth : options.width / 3.5,
      imgHeight : options.height / 3.5
    }, options);

    var createCanvas = function() {
      // create the qrcode itself
      var qrcode = new QRCode(options.typeNumber, options.correctLevel);
      qrcode.addData(options.text);
      qrcode.make();

      // create canvas element
      var canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.height;
      var ctx = canvas.getContext('2d');

      // compute tileW/tileH based on options.width/options.height
      var tileW = options.width / qrcode.getModuleCount();
      var tileH = options.height / qrcode.getModuleCount();

      // draw in the canvas
      for ( var row = 0; row < qrcode.getModuleCount(); row++) {
        for ( var col = 0; col < qrcode.getModuleCount(); col++) {
          ctx.fillStyle = qrcode.isDark(row, col) ? options.foreground
              : options.background;
          var w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
          var h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
          ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
        }
      }

      if (options.imgSrc) {
        var img = new Image();
        img.src = options.imgSrc;
        img.addEventListener('load', function() {
          ctx.drawImage(img, (options.width - options.imgWidth) / 2,
              (options.height - options.imgHeight) / 2, options.imgWidth,
              options.imgHeight);
        });
      }

      // return just built canvas
      return canvas;
    }

    // from Jon-Carlos Rivera (https://github.com/imbcmdth)
    var createTable = function() {
      // create the qrcode itself
      var qrcode = new QRCode(options.typeNumber, options.correctLevel);
      qrcode.addData(options.text);
      qrcode.make();

      // create table element
      var $table = $('<table></table>').css("width", options.width + "px").css(
          "height", options.height + "px").css("border", "0px").css(
          "border-collapse", "collapse").css('background-color',
          options.background);

      // compute tileS percentage
      var tileW = options.width / qrcode.getModuleCount();
      var tileH = options.height / qrcode.getModuleCount();

      // draw in the table
      for ( var row = 0; row < qrcode.getModuleCount(); row++) {
        var $row = $('<tr></tr>').css('height', tileH + "px").appendTo($table);

        for ( var col = 0; col < qrcode.getModuleCount(); col++) {
          $('<td></td>').css('width', tileW + "px")
              .css(
                  'background-color',
                  qrcode.isDark(row, col) ? options.foreground
                      : options.background).appendTo($row);
        }
      }

      $table.bind('render', function() {
        if (options.imgSrc) {
          var td0 = $table.find('tbody tr:first td:first');
          var img = $('<img/>').attr('src', options.imgSrc).css('width',
              options.imgWidth).css('height', options.imgHeight).css(
              'position', 'absolute').css('top',
              td0.position().top + (options.height - options.imgHeight) / 2)
              .css('left',
                  td0.position().left + (options.width - options.imgWidth) / 2)
              .css('border-radius', '5px').css('-webkit-border-radius', '5px')
              .css('-moz-border-radius', '5px');
          $table.append(img);
        }
      });

      return $table;
    }

    return this
        .each(function() {
          var element = options.render == "canvas" ? createCanvas()
              : createTable();
          $(element).appendTo(this);
          $(element).trigger('render');
        });
  };
})(jQuery);
