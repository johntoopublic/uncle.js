// Outer function for scoping execution.
(function(){

// Remove own script from DOM.
var scripts = document.body.getElementsByTagName('script');
document.body.removeChild(scripts[scripts.length - 1]);

// Add textarea for custom CSS rules.
var text = document.createElement('textarea');
text.placeholder = 'Custom CSS';
text.value = window.localStorage.getItem('uncle.js');
text.style.background = '#ddd';
text.style.bottom = '5px';
text.style.color = '#000';
text.style.display = 'none';
text.style.fontSize = '10px';
text.style.height = ' 50px';
text.style.position = 'fixed';
text.style.left = '5px';
text.style.width = '200px';
text.style.zIndex = '10000';
document.body.appendChild(text);

// Add updated style for applying rules.
var css = document.createElement('style');
css.innerHTML = text.value;
document.body.appendChild(css);

// Update CSS value on textarea change.
text.addEventListener('keyup', function(e) {
  e.stopPropagation();
  var style = text.value;
  css.innerHTML = style;
  window.localStorage.setItem('uncle.js', style);
});

// Toggle CSS textarea on press of 'c'.
document.body.addEventListener('keyup', function(e) {
  if (e.keyCode == 67) {
    text.style.display = text.style.display == 'none' ? 'block' : 'none';
  }
});

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
