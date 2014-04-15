/**
 * An alias to document.getElementById
 * @param x Element ID
 * @returns {HTMLElement}
 */
function $$(x) {
  return document.getElementById(x);
}

/**
 * A simple implement of document.ready
 * http://dustindiaz.com/smallest-domready-ever
 * @param {function} f Function to run after document ready
 */
function r(f){
  return /in/.test(document.readyState) ?
    setTimeout('r('+f+')',9) : f();
}

//Global variable dotchat for views usage
dotchat = {
  group: null,
  secret: null,
  author: null,
  lastID: null,
  allFetched: null,
  scroll: 'end',
  // front/middle/end

  /**
   * Setup dotchat frontend
   * @param {string} group Group to join
   * @param {string} secret Secret code of the group
   * @param {string} token User auth token if available
   */
  setup: function (group, secret, token) {
    dotchat.group = group;
    dotchat.secret = secret;
    if (docCookies.getItem('author')) {
      dotchat.author = docCookies.getItem('author');
      dotchat.handlers.toggleSubmitForm();
    }
    dotchat.connect();
    dotchat.bind();
  },

  /**
   * Connect to socket.io server
   * and setup controllers
   */
  connect: function () {
    dotchat.socket = io.connect();
    dotchat.socket.on('connect', dotchat.routes.initialMessages);
    dotchat.socket.on('avatar', dotchat.routes.updateAvatar);
    dotchat.socket.on('message', dotchat.routes.newMessage);
    dotchat.socket.on('fetch', dotchat.routes.oldMessages);
    dotchat.socket.on('disconnect', function () {
      //TODO: show offline error
    });
  },

  /**
   * Setup UI event controller
   */
  bind: function () {
    // TODO: all binding functions here should be in handlers
    window.onscroll = dotchat.handlers.scrollChanged;
    var enter_key = 13; // disable enter and used as send
    $$('chat_content').onkeydown =
      dotchat.utils.whenKeyIs(enter_key, dotchat.actions.sendMessage);
    $$('chat_information').onkeydown =
      dotchat.utils.whenKeyIs(enter_key, dotchat.handlers.changeAuthorName);
    $$('chat_user').onclick =
      dotchat.handlers.toggleSubmitForm;
    $$('fetch_messages').onclick =
      dotchat.actions.fetchMessages;
  },

  actions: {
    /**
     * Join socket.io group for new messages
     */
    joinGroup: function () {
      dotchat.socket.emit('join', {
        group: dotchat.group,
        secret: dotchat.secret,
        author: dotchat.author
      });
    },

    /**
     * Fetch old messages from server
     */
    fetchMessages: function () {
      dotchat.socket.emit('fetch', {
        group: dotchat.group,
        secret: dotchat.secret,
        author: dotchat.author,
        lastID: dotchat.lastID
      });
    },

    /**
     * Send message to socket.io server with content of #chat_content
     */
    sendMessage: function () {
      if ($$('chat_content').value === '') {
        return; // avoid empty messages
      }
      dotchat.socket.emit('message', {
        group: dotchat.group,
        secret: dotchat.secret,
        author: dotchat.author,
        content: $$('chat_content').value
      }, function (info) {
        if (info.ok) {
          $$('chat_content').value = '';
        }
      });
      // TODO: show a pending message
      // dotchat.newMessage($$('chat_content').value, true);
      $$('chat_content').value = 'Sending: ' + $$('chat_content').value;
    },

    /**
     * Request avatar of user from server
     */
    requestAvatar: function () {
      dotchat.socket.emit('avatar', {
        group: dotchat.group,
        secret: dotchat.secret,
        author: dotchat.author
      });
    }
  },

  routes: {
    /**
     * Emit initial messages when connected to server
     */
    initialMessages: function () {
      dotchat.actions.joinGroup();
      dotchat.actions.requestAvatar();
      if (!dotchat.lastID) {
        dotchat.actions.fetchMessages();
      } // only when not fetched (not reconnection)
    },

    /**
     * Update avatar with info
     * @param info with url: avatar url
     */
    updateAvatar: function (info) {
      $$('chat_avatar').src = info.url;
    },

    /**
     * Show a new message on the end of web,
     * if it's not a pending message,
     *  1) if there's no corresponding pending message
     *     a) if it's others, create a li with .others
     *     b) if it's mine, create a li with .mine
     *  2) TODO: if there's a corresponding pending message,
     *     change the status to sent, complete the information
     * TODO: if it's a pending message, create a li with .mine and .pending
     * @param message An object with html and id contains message to show
     * @param {boolean} pending true if it's a pending message
     */
    newMessage: function (message, pending) {
      if (!pending) {
        // there's no corresponding because not implemented
        dotchat.utils.fixScrollDo(function() {
          $$('messages').innerHTML += message.html;
          dotchat.utils.tagMessages();
        });
        // TODO: system notification and UI notification
      }
    },

    /**
     * Show ordered old messages on the top of web
     * @param messages An object with html and lastID contains messages to show
     */
    oldMessages: function (messages) {
      if (messages.queryID !== dotchat.lastID) {
        return; // not query for this time
      }
      if (messages.lastID === dotchat.lastID) {
        dotchat.allFetched = true;
        dotchat.utils.addClass($$('fetch_messages'), 'hidden');
        return; // all messages fetched
      }
      dotchat.lastID = messages.lastID;
      dotchat.utils.fixScrollDo(function () {
        $$('messages').innerHTML = messages.html + $$('messages').innerHTML;
        dotchat.utils.tagMessages();
      });
    }
  },

  handlers: {
    /**
     * Function handle scroll change info and update dotchat.scroll
     */
    scrollChanged: function () {
      // only this method works on most of browsers
      var top = document.documentElement.scrollTop || document.body.scrollTop;
      var bottom = top + ("innerHeight" in window ? // fix for IE
        window.innerHeight : document.documentElement.offsetHeight);
      var height = document.height || document.body.scrollHeight;
      if (height - bottom < 100) {
        dotchat.scroll = 'end';
      } else if (top < 100) {
        // TODO: pull to refresh instead
        //if (!dotchat.allFetched && dotchat.scroll !== 'front') {
        //  dotchat.actions.fetchMessages();
        //} // old messages exist and status changed
        dotchat.scroll = 'front';
      } else {
        dotchat.scroll = 'middle';
      }
    },

    /**
     * Handle function used when submit form type should be changed
     */
    toggleSubmitForm: function () {
      if (dotchat.author) {
        dotchat.utils.toggleClass($$('chat_information'), 'hidden');
        dotchat.utils.toggleClass($$('chat_content'), 'hidden');
      } else {
        // force submit form to information form
        dotchat.utils.delClass($$('chat_information'), 'hidden');
        dotchat.utils.addClass($$('chat_content'), 'hidden');
      }
    },

    /**
     * Handler for change author name as user requested
     */
    changeAuthorName: function () {
      dotchat.author = $$('chat_information').value;
      docCookies.setItem('author', dotchat.author, null, '/');
      dotchat.actions.requestAvatar();
      dotchat.handlers.toggleSubmitForm();
      dotchat.utils.tagMessages();
    }
  },

  utils: {
    /**
     * Generate a function to call param callback when
     * an key pressed identical to param key, and prevent
     * the default action of the key press
     * Should be used as element.onkeydown
     * @param key Needed key
     * @param callback Callback function
     * @returns {Function} Generated function used as onkeydown
     */
    whenKeyIs: function (key, callback) {
      return function (event) {
        if (!event && window) {
          event = window.event;
        }
        if (event && (event.keyCode === key || event.which === key)) {
          callback();
          if (event.preventDefault) {
            event.preventDefault();
          }
          return false;
        } else {
          return true;
        }
      };
    },

    /**
     * Get information in class key of DOM
     * @param dom One DOM
     * @param {string} key Class name
     * @returns {string}
     */
    valueOf: function(dom, key) {
      try {
        return dom.getElementsByClassName(key)[0].innerHTML;
      } catch (e) {
        return IEGetElementsByClassName(dom, key)[0].innerHTML;
      }
    },

    /**
     * Check if two DOM has same information in class key
     * @param dom1 One DOM
     * @param dom2 Another DOM
     * @param {string} key Class name
     * @returns {boolean}
     */
    hasSame: function(dom1, dom2, key) {
      return this.valueOf(dom1, key) === this.valueOf(dom2, key);
    },

    /**
     * Add class to a DOM
     * @param dom One DOM
     * @param {string} key Class name to add
     */
    addClass: function(dom, key) {
      if (dom.className.indexOf(key) === -1) {
        dom.className += ' ' + key;
      }
    },

    /**
     * Remove class from a DOM
     * @param dom One DOM
     * @param {string} key Class name to remove
     */
    delClass: function(dom, key) {
      dom.className = dom.className.replace(key, '');
    },

    /**
     * Toggle class in a DOM
     * @param dom One DOM
     * @param {string} key Class name to toggle
     */
    toggleClass: function(dom, key) {
      if (dom.className.indexOf(key) === -1) {
        dotchat.utils.addClass(dom, key);
      } else {
        dotchat.utils.delClass(dom, key);
      }
    },

    /**
     * Tag all messages with author information
     */
    tagMessages: function () {
      var messages = $$('messages').childNodes;
      for (var i = 0; i < messages.length; i++) {
        var tagRegex = /(unknown|mine|others)/;
        messages[i].className =
          messages[i].className.replace(tagRegex,
            this.valueOf(messages[i], 'author') === dotchat.author ?
              'mine' : 'others'
          );
        if (i && this.hasSame(messages[i], messages[i-1], 'author')) {
          this.addClass(messages[i], 'same_author');
          if (this.hasSame(messages[i], messages[i-1], 'create')) {
            this.addClass(messages[i-1], 'same_details');
          }
        }
      }
    },

    /**
     * With scroll location fixed, do action
     * @param {function} action Action to do with scroll fixed
     */
    fixScrollDo: function (action) {
      var oldBottom = null;
      if (dotchat.scroll !== 'end') { // keep end
        var firstItem = $$('messages').firstChild;
        if (firstItem) {
          firstItem.id = 'oldTop'; // Tag it because old DOM will be destroyed
          oldBottom = firstItem.getBoundingClientRect().bottom;
        }
      }
      action();
      if (oldBottom) { // fix scroll location after added
        var oldItem = $$('oldTop'); // Restore old firstItem from DOM with tag
        oldItem.id = ''; // Recycle id for next id tagging
        var offset = oldItem.getBoundingClientRect().bottom - oldBottom;
        window.scrollBy(0, offset);
      } else { // just goes end of body
        window.scrollTo(0, $$('body').scrollHeight);
      }
    }
  }
};

/*\
 |*|  A complete cookies reader/writer framework with full unicode support.
 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
 |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
 |*|
 |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|  * docCookies.getItem(name)
 |*|  * docCookies.removeItem(name[, path], domain)
 |*|  * docCookies.hasItem(name)
 \*/
var docCookies = { getItem: function (sKey) { return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null; }, setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) { if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; } var sExpires = ""; if (vEnd) { switch (vEnd.constructor) { case Number: sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd; break; case String: sExpires = "; expires=" + vEnd; break; case Date: sExpires = "; expires=" + vEnd.toUTCString(); break; } } document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : ""); return true; }, removeItem: function (sKey, sPath, sDomain) { if (!sKey || !this.hasItem(sKey)) { return false; } document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : ""); return true; }, hasItem: function (sKey) { return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie); } };

var IEGetElementsByClassName = function (node, classname) {
  var a = [];
  var re = new RegExp('(^| )'+classname+'( |$)');
  var els = node.getElementsByTagName("*");
  for (var i = 0, j = els.length; i < j; i++) {
    if (re.test(els[i].className)) a.push(els[i]);
  }
  return a;
};
