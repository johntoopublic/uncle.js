// Outer function for scoping execution.
(function(){

// Remove own script from DOM.
var scripts = document.body.getElementsByTagName('script');
document.body.removeChild(scripts[scripts.length - 1]);

// Set body variables for scrolling over current content.
document.body['data-title'] = document.title;
document.body['data-url'] = location.href;

// Patterns used to find next and previous links on the page.
var PREVIOUS_PATTERN = /prev|back|&lt;/i;
var NEXT_PATTERN = /next|forward|&gt;/i;
var EXCLUDE_PATTERN = /\|/i;

// Remove hash tags to better match URLs.
var normalize = function(url) {
  return url.replace(/#.*/, '');
};

// Return a URL matching the given search, used for Next / Previous.
var findUrl = function(doc, search) {
  var current = normalize(doc.location.href);
  var anchors = doc.getElementsByTagName('a');
  for (var i = 0; i < anchors.length; i++) {
    var html = anchors[i].outerHTML;
    if (html.search(search) != -1 &&
        html.search(EXCLUDE_PATTERN) == -1 && anchors[i].href) {
      var url = normalize(anchors[i].href);
      if (url != current) {
        return url;
      }
    }
  }
};

// Load a target url in a non-scripted iframe and return the document tag.
var loading = false;
var getDocument = function(url, callback) {
  if (!url || loading) {
    return;
  }
  loading = true;
  var iframe = document.createElement('iframe');
  iframe.sandbox = 'allow-same-origin';
  iframe.style.cssText = 'display:none;height:0;width:0;';
  iframe.style = 'display:none;';
  iframe.src = url;
  iframe.onload = function() {
    callback(iframe.contentDocument);
    document.body.removeChild(iframe);
    loading = false;
  }
  document.body.appendChild(iframe);
};

// Use the next available next or previous link to load and append the content.
var pattern = findUrl(document, NEXT_PATTERN) ? NEXT_PATTERN : PREVIOUS_PATTERN;
var target = findUrl(document, pattern);
var fetchNext = function() {
  getDocument(target, function(doc) {
    // Position the body if already position:absolute (e.g. xkcd).
    if (window.getComputedStyle(doc.body).position == 'absolute') {
      doc.body.style.top = document.body.scrollHeight + 'px';
    }
    doc.body['data-title'] = doc.title;
    doc.body['data-url'] = target;
    target = findUrl(doc, pattern);
    document.body.appendChild(doc.body);
  });
};

// On scroll, load additional content if the last page is onscreen.
window.onscroll = function(){
  var bodies = document.getElementsByTagName('body');
  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    var rect = body.getBoundingClientRect();
    if (rect.top >= 0 && rect.top < window.innerHeight) {
      window.history.replaceState(null, body['data-title'], body['data-url']);
      document.title = body['data-title'];
      if (i >= bodies.length - 1) {
        fetchNext();
      }
      return;
    }
  }
}
fetchNext();
})();
