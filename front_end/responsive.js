'use strict';

$(document).ready(function() {
  var videos = document.getElementsByTagName('video');

  for (var i = 0; i != videos.length; i++) {
    var sources = videos[i].getElementsByTagName('source');

    for (var j = 0; j != sources.length; j++) {
      var result = $.ajax({
        url: "http://127.0.0.1:11235/",
        data: {
          filename: sources[j].filename
        },
        dataType: json
      });
    }
  }
});
