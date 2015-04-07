/*
Copyright (c) 2013 by Shin.  All Rights Reserved.
*/

/**
 * Base path and no-image path
 */
BASE = window.location.href.replace(/\/[^\/]+$/, '/');
NOIMAGE = BASE + 'img/noimage.png';


/**
 * Global APP configure
 */
CONFIG = {
    AppName             : 'Tải game mobile',
    BundleId            : 'vn.taigame.portal',
    AppId               : '4',
    Version             : '0.9',
    OS                  : getMobileOs(),
    Imei                : getDeviceId(),
    ClientWidth         : window.innerWidth || document.body.clientWidth,
    ClientHeight        : window.innerHeight || document.body.clientHeight,
    GoogleAnalyticsId   : 'UA-XXXXX-X',
    ServerList          : ['http://www.taigame.vn'],
};


/**
 * Use animation in app
 */
USE_ANIMATIONS = false;


/**
 * Max items in list view
 */
LISTVIEW_MAX_ITEMS = 30;


/**
 * Pull to refresh threshold
 */
PULL_TO_REFRESH_HEIGHT = 50;


/**
 * Timeout to display an advertisement
 */
ADS_TIMEOUT = 15000;


/**
 * Set default view and page
 * @var int/string selector
 */
DEFAULT_VIEW = '#home';
DEFAULT_PAGE = 0;


/**
 * Global API status flags
 */
FLAG_STATUS_OK      = 1;
FLAG_STATUS_ERROR   = 0;


/**
 * jQuery AJAX configs
 */
$.ajaxSetup({
    async: true,
    cache: false,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    crossDomain: true,
    data: {option: 'apis', action: 'ping'},
    dataType: 'json',
    global: false,
    timeout: 10000,
    processData: true,
    type: 'GET',
    url: CONFIG.ServerList[0] || false
});


/**
 * OS custom hacks
 */
!function OSHacks(){
    if(CONFIG.OS == 'windowsphone'){
        $('html').addClass('no-openfont');
        USE_ANIMATIONS = false;
    }
}();


/**
 * Choose server
 */
!function chooseServer(serverList){
    "use strict";
    var found = false;

    if(!serverList) serverList = CONFIG.ServerList;

    $.each(serverList, function(i, test_url){
        $.ajax({url: test_url, timeout: 5000}).done(function(){
            if(!found){
                $.ajaxSetup({url: test_url});
                found = true;
            }
        }).fail(false);
    });

    return false;
}();


!function enableAnimation(){
    if(!USE_ANIMATIONS){
        loadCSS(BASE + 'css/noanimation.css');
    }

    function loadCSS(file){
        return $('<link rel="stylesheet" href="'+file+'">').appendTo('head');
    }
}();


/**
 * Get device unique ID
 */
function getDeviceId(){
    if('Fingerprint' in window){
        return (new Fingerprint({canvas: true})).get();
    }
    return navigator.userAgent;
}


/**
 * Get mobile OS
 */
function getMobileOs(){
    if(!'navigator' in window){
        return 'unknown';
    }

    var agent = navigator.userAgent.toLowerCase();
    var platform = navigator.platform.toLowerCase();

    var result = agent.replace(/^.*?(ip(hone|od|ad)|android|windows phone|j2me|midp).*$/, '$1');

    switch (result) {
        case 'iphone':
        case 'ipad':
        case 'ipod':
            return 'ios';
        case 'android':
            return 'android';
        case 'windows phone':
            return 'windowsphone';
        case 'j2me':
        case 'midp':
            return 'java';
    }

    return platform;
}


/**
 * API request handler
 *
 * @param   string    type
 * @param   object    data
 * @param   function  callback
 * @return  jqXHR
 */
ApiRequestDefinition = {};
ApiRequest = function(type, data, callback){
    var self = this;
    var default_params = (type in ApiRequestDefinition) ? ApiRequestDefinition[type] : {};

    if(typeof data == 'function' && !callback) callback = data;
    if(!callback || typeof callback != 'function'){callback = function(json){return;}}
    if(data){$.extend(default_params, data)}

    return $.ajax({data: default_params, success: callback});
}


/**
 * Custom API request handler definitions
 */

//type = ping
//use: ApiRequest('ping'[,data,callback])
ApiRequestDefinition.ping = {
    option: 'ping',
    action: 'ping'
}

//type = version
//use: ApiRequest('version'[,data,callback])
ApiRequestDefinition.version = {
    option: 'apis',
    action: 'checkversion',
    device: CONFIG.OS,
    version: CONFIG.Version,
    appid: CONFIG.AppId,
    imei: CONFIG.Imei,
    screen_width: CONFIG.ClientWidth,
    screen_height: CONFIG.ClientHeight,
}

//type = list
//use: ApiRequest('list'[,data,callback])
ApiRequestDefinition.list = {
    option: 'apis',
    action: 'category',
    appid: CONFIG.AppId,
    paging: 1,
}

//type = category
//use: ApiRequest('category'[,data,callback])
ApiRequestDefinition.category = {
    option: 'apis',
    action: 'content',
    appid: CONFIG.AppId,
    id: null,
    paging: 1,
    limit: LISTVIEW_MAX_ITEMS
}

//type = content
//use: ApiRequest('content'[,data,callback])
ApiRequestDefinition.content = {
    option: 'apis',
    action: 'detail',
    appid: CONFIG.AppId,
    id: null,
}

//type = search
//use: ApiRequest('search'[,data,callback])
ApiRequestDefinition.search = {
    option: 'apis',
    action: 'search',
    appid: CONFIG.AppId,
    val: '',
    paging: 1,
    limit: LISTVIEW_MAX_ITEMS
}


/**
 * iScroll configs
 * @see https://github.com/cubiq/iscroll
 */
var touchSupport = Modernizr.touch ? true : false;

ISCROLL_SETTING = {
    get: function(name) {
        var data = (name in this) ? this[name] : this.default;
        return $.extend({}, data);
    },

    default: {
        click: touchSupport,
        scrollbars: 'custom',
        interactiveScrollbars: false,
        freeScroll: true,
        probeType: 0
    },

    simple: {
        click: touchSupport,
        freeScroll: true,
        probeType: 0
    },

    pull: {
        click: touchSupport,
        scrollbars: 'custom',
        interactiveScrollbars: false,
        freeScroll: true,
        probeType: 2,
        scroll: function(){/* TODO: implement code */}
    }
}
