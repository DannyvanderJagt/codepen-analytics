var result = [
  'uniqueid=' + uniqueid,
  'display_width=' + screen.width,
  'display_height=' + screen.height,
  'display_colordepth=' + screen.colorDepth,
  'display_pixeldepth=' + screen.pixelDepth,
  'window_width=' + Math.round(window.innerWidth/100)*100,
  'window_height=' + Math.round(window.innerHeight/100)*100,
  'window_devicepixelratio=' + window.devicePixelRatio
];

var getJSONP = function (url, success) {
  var ud = '_' + new Date().getTime();
  var script = document.createElement('script');
  var head = document.getElementsByTagName('head')[0] || document.documentElement;

  window[ud] = function (data) {
    head.removeChild(script);
    success && success(data);
  };

  script.src = url.replace('callback=?', 'callback=' + ud);
  head.appendChild(script);
};

var url = 'http://localhost.io:8003/pen/post/'+ uniqueid +'?' + result.join('&');

getJSONP(url, function(err, data){
  console.log('done');
  console.log(err, data);
});