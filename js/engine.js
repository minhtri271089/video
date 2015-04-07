/**
 * Application Engine definition
 * Copyright (c) 2013 by Shin.  All Rights Reserved.
 */

! function($, W, D, N) {
    'use strict';

    $.support.cors = true;

    if('mobile' in $){
        $.mobile.allowCrossDomainPages = true;
        $.mobile.pushStateEnabled      = false;
    }

    var DOM = {
        body: $('body'),
        viewport: $('#viewport'),
        wrapper: $('#wrapper'),
        overlay: $('#overlay'),
        overlay_body: $('#overlay-body')
    },
        Scrollers = [],
        lorems = 'Lorem ipsum dolor sit amet, suos exteriores non dum autem Apolloni figitur acquievit, illum ille illum Apollonii vidit pater. Impossibile post multi capillos apto tempus fuisse deprecor potest contremiscunt eum istam definisti quis nudus luctu gubernatori usque. Austri ventriculum defunctae cubiculo ab adulescentiae discesserunt manu in lucem in modo ad per animum est se est in. Interposito brutis aeternae reversurus eum est amet amet coram posset fertur ardeat in. Dionysiadis suum Perquiramus atque ut diem fiant in deinde cupis ei Taliarchum in lucem in. Suave canere se in lucem exitum vivit in rei exultant deo hanc legibus Antiochiam innocentem vis. Fecit quantum fecit quantum est se est in. Inter foris statuam Praesta enim ad te sed esse more defuncta ait. C in rei finibus veteres hoc. Quicquid eam in deinde cepit roseo ruens sed quod tamen ait regem Boreas ingreditur lavare. Ingreditur ipse rebum accusam in rei civibus laude clamaverunt donavit beneficio, euro in modo cavendum es ego illum Apollonii vidit pater. Actum se est in modo genito in deinde duas particularis ad per accipere filia puella eius sed eu fides piissimi sibi afflictione magnam. Ipsum rebum scias a a civitas iter. Communicatio mihi quidditas iter patri. Filii in rei sensibilium acciperem qui non solutionem invenisti naufragus qui dicens filiae tibi cum suam ad te. Cibum sibi afflictione magnam ibo quem est amet amet coram regis fine omnino vero diam nostra paupercula possunt in. Quamdiu corpore sanctae memoriam mortuum sufficeret rex cum suam ut libertatem petitiones tulit sanctae memoriam mortuum sufficeret rex cum. Cives Mytilenam cuius ad nomine Hesterna studiis ascende meae ad te in modo invenit quasi certum. Innumera patris alicui virginis piratae apprehendat mecum est se est in lucem exitum vivit in modo genito in. Voce scelere violavi puellarum in deinde duas horrido in rei sensibilium acciperem. Descendi eam ad per animum pares terris sidera clita hic. Habet vero diam Apollonius ut casus adprehendens lugubri vestigia o Neptuno. Mauricii materialia sola illi doleres vel regio mors amicitia praeter a his. Eam sed haec sed eu fides Concordi fabricata ait regem Ardalio nos comitem in lucem in. Ni fluctus materialitas non solutionem invenerunt ita cum obiectum est in modo. Cur meae sit dolor ad nomine, quae non dum animae tibi. Zurziaca in fuerat eum filiam vel! Cellam modico illius ergo adseris de tuae illa benignissime vi aureo in modo genito in fuerat accidens inquit atque bona dei. Individuationis qui a lenoni incommunicabile ait in lucem exempli, ambo una litus Ephesum peteret sua Cumque hoc Apollonius. Pro suam in fuerat se in lucem. Unam si quod eam eos in modo invenit iuvenem in rei completo litus Ephesum. Post petiit scolastici noceant Apolloni figitur acquievit, patris in rei completo litus vita Apolloni sed. Concursus male habitu rubor virginitatem sunt vero cum autem nobiscum ei auri eos vero quo. Neque feminae crura hoc puella ut casus, hanc legibus Antiochiam innocentem tantusque amorem iam. Eis manes participare statim quia ad suis, atque armata mare deambulavit latere ab Archistratis. Adfertur guttae sapientiae decubuerat age meae ceroma fronte comico hac auxilium tolle. Atqui plurium venenosamque serpentium ne civitatis ne civitatis intelligitur sicut in lucem concitaverunt in lucem genero. Concursus male habitu vides patrem in fuerat est amet amet coram regis iam. Jesu Dionysiadem tuos ratio omnes Hellenicus mihi esse ait Cumque hoc. Pertulit sed esse ait est amet coram regis iam, hellenico clamabat vidit Dionysiadi Apollonius eius sed. Tollite fit proponebat vidit tam divitias nulla beneficia nobis. Dianam Interposito brutis aeternae reversurus eum est amet coram me in rei exultant deo hanc. Fecisti huc corpore aliquis virginis plus istum nuptiae rogo ultimum favente his! Quidam advenerunt ad per te sed dominum sit dolor ad suis est in deinde plectrum anni ipsa codicellos numquam. In rei finibus veteres hoc. Una litus Ephesum iube enim materiam ei quoque mortalem statuit quod una non ait. Peractoque convocatis secessit civitatis intelligitur sicut autem est se est in. Discumbere acies regina ostendebat te princeps audito adsumere proprium rex cum unde non coepit cenam veniebant. Dionysiadis eum istam provoces Athenagora deo apprehendit in lucem in. Stranguillio sit Mariae maximas hanc enim formam qui, viscera tres potest meum festinus pervenissem filia puella.'.toLowerCase().split(/\s+/),
        lorems_len = lorems.length;

    window.overlay_scroller = null;

    var Application = function() {
        return this;
    }

    Application.prototype = {
        api: 'ApiRequest' in window ? ApiRequest : anotherApiRequest,
        view: view,
        getView: getView,
        createView: createView,
        page: page,
        getPage: getPage,
        getPageHolder: getPageHolder,
        createPage: createPage,

        showOverlay: showOverlay,
        hideOverlay: hideOverlay,

        refresh: refreshScrollers,
        newThread: newThread,
        getLorem: getLorem,
        getCurrentScroller: getCurrentScroller,

        alert: appAlert,
        confirm: appConfirm,
        prompt: appPrompt,
        sendSms: sendSms,

        get Scrollers() {
            return Scrollers;
        },
        get current_page() {
            return getCurrentPage();
        },
        get current_view() {
            return getCurrentView();
        },
        get overlay() {
            return DOM.overlay;
        },
        get viewList(){
            return DOM.wrapper.find('.view');
        },

        doms: DOM
    };



    /*=== API request alternative ===*/

    function anotherApiRequest(type, data, callback) {
        var self = this,
            default_params = {
                option: 'apis'
            };

        if (!callback || typeof callback != 'function') {
            callback = function(json) {
                return;
            }
        }

        if (data) {
            $.extend(default_params, data);
        }

        return $.ajax({
            data: default_params,
            success: callback
        });
    }



    /*=== View helpers ===*/
    // set active view

    function view(name, class_name, keep_background) {
        var next_view = getView(name),
            current_view = getCurrentView(),
            return_view = current_view;

        if (class_name == undefined) class_name = '';

        if (next_view.length == 0) return return_view;
        if (current_view.index() == next_view.index()) return return_view;

        return_view = next_view;

        current_view.removeClass('active').addClass('inactive');
        next_view.removeClass('inactive blur').addClass('active ' + class_name).show();

        setTimeout(function() {
            getPage(current_view, '.active').trigger('hide.page');
            next_view.trigger('show.view');

            var active_page = getPage(next_view, '.active');

            if (active_page.length == 0) {
                page(next_view, 0);
            } else {
                active_page.removeClass('inactive blur pending loading').trigger('show.page');
            }

            if(keep_background){
                current_view.addClass('blur');
            }
        }, 4);

        setTimeout(function() {
            if (!keep_background) {
                current_view.removeClass('inactive');
            }

            current_view.trigger('hide.view');
            next_view.removeClass(class_name);
        }, USE_ANIMATIONS ? 1100 : 4);

        return return_view;
    }


    // get view by selector or index

    function getView(selector) {
        if (typeof selector == 'number') {
            return DOM.wrapper.find('.view').eq(selector);
        }

        return DOM.wrapper.find('.view').filter(selector);
    }


    // get current active view

    function getCurrentView() {
        return getView('.active');
    }

    // create view

    function createView(){
        var new_view = $(
            '<div class="view nofooter">' +
                '<div class="view-header flex">' +
                    '<h1 class="spacer">Inactive view</h1>' +
                '</div>' +
                '<div class="view-body scroll safe">' +
                    '<div class="content"></div>' +
                '</div>' +
                '<div class="view-footer flex"></div>' +
                '<div class="indicator spinner active center">Loading...</div>' +
            '</div>'
        );

        new_view.appendTo(DOM.wrapper);

        return new_view;
    }



    /*=== Page helpers ===*/
    // set active page for view

    function page(view, selector, class_name) {
        var next_page = getPage(view, selector),
            current_page = getPage(view, '.active'),
            return_page = current_page;

        if (class_name == undefined) class_name = '';

        if (next_page.length == 0) return return_page;
        if (current_page.index() == next_page.index()) return return_page;

        return_page = next_page;

        current_page.removeClass('active').addClass('inactive');
        next_page.removeClass('inactive blur pending loading').addClass('active ' + class_name).show();

        setTimeout(function() {
            current_page.trigger('hide.page');
            next_page.trigger('show.page');
        }, 4);

        setTimeout(function() {
            current_page.removeClass('inactive');
            next_page.removeClass(class_name);
        }, USE_ANIMATIONS ? 1100 : 4);

        return return_page;
    }


    // get page by selector or index for view

    function getPage(view, selector) {
        var pages = getView(view).find('.view-body');

        if (typeof selector == 'number') {
            return pages.eq(selector);
        }

        return pages.filter(selector);
    }


    // get current page of active view

    function getCurrentPage() {
        var current_view = getCurrentView();
        return getPage(current_view, '.active');
    }


    // get view holder

    function getPageHolder(pageObj) {
        if (!pageObj) pageObj = getCurrentPage();
        else pageObj = $(pageObj);

        var holder = pageObj.children().first();

        if (holder.length > 0) return holder;
        return $('<div class="content"></div>').appendTo(pageObj);
    }

    // create page
    function createPage(view){
        var new_page = $(
            '<div class="view-body scroll safe">' +
                '<div class="content"></div>' +
            '</div>'
        );

        if(!view) view = getCurrentView();

        $('.view-body:eq(-1)', view).after(new_page);

        return new_page;
    }


    /*=== Overlay helpers ===*/
    // show overlay with contents

    function showOverlay(title, content, class_name) {
        if (class_name == undefined) class_name = USE_ANIMATIONS ? 'animated fadeIn' : '';

        DOM.overlay_body.empty();

        if (title) {
            title = $('<h1 />').append(title).appendTo(DOM.overlay_body);
        }

        if (content) {
            content = $('<p />').append(content).appendTo(DOM.overlay_body);
        }

        DOM.overlay.attr('class', 'active ' + class_name);

        setTimeout(function() {
            DOM.overlay.trigger('show.overlay');
        }, 4);

        return DOM.overlay;
    }


    // hide overlay

    function hideOverlay() {
        setTimeout(function() {
            DOM.overlay.trigger('hide.overlay');
        });

        return DOM.overlay.removeAttr('class').removeClass('active');
    }



    /*=== Trigger show/hide view and page ===*/
    /*
    DOM.wrapper.on('show.view', '.view', function(e) {
        //var self = $(this);
        //console.log('show', 'view', $.trim(self.text()));
        return false;
    });

    DOM.wrapper.on('hide.view', '.view', function(e) {
        //var self = $(this);
        //console.log('hide', 'view', $.trim(self.text()));
        return false;
    });
    */

    DOM.wrapper.on('show.page', '.view-body', function(e) {
        var self = $(this);

        //remove last clicked link
        setTimeout(function() {
            self.find('a.active').removeClass('active hover');
        }, USE_ANIMATIONS ? 600 : 100);

        //init scrollers
        newThread(createScrollers, self.filter('.scroll'));
        newThread(createScrollers, self.find('.scroll'));
        return false;
    });

    DOM.wrapper.on('change.page', '.view-body', function(e) {
        //var self = $(this);
        // refresh scroller
        newThread(refreshScrollers);
        return false;
    });

    DOM.wrapper.on('hide.page', '.view-body', function(e) {
        //var self = $(this);
        //console.log('hide', 'page', $.trim(self.text()));
        clearScrollers();
        return false;
    });



    /*=== Trigger show/hide overlay ===*/
    DOM.overlay.on({
        'show.overlay': function(e) {
            var self = $(this);

            overlay_scroller = new IScroll('#overlay', ISCROLL_SETTING.get('simple'));
            setTimeout(function(){
                overlay_scroller.refresh();
            }, 4);
        },
        'hide.overlay': function(e) {
            var self = $(this);

            if(overlay_scroller && 'destroy' in overlay_scroller){
                overlay_scroller.destroy();
                overlay_scroller = null;
            }

            getCurrentPage().find('a.active').removeClass('active hover');
        },
        'change.overlay': function(e) {
            if(overlay_scroller && 'refresh' in overlay_scroller){
                newThread(overlay_scroller.refresh);
            }
        }
    });

    DOM.overlay.on('click', '.close',function(e){
        hideOverlay();
        return false;
    });



    /*=== Trigger events when click on list item ===*/
    /*
    DOM.wrapper.on('touchstart', 'ul.stacked > li.listitem > a', function(e) {
        var self = $(this).addClass('hover');
        //console.log('show', 'view', $.trim(self.text()));
    });

    DOM.wrapper.on('touchend', 'ul.stacked > li.listitem > a', function(e) {
        var self = $(this).removeClass('hover');
        //console.log('show', 'view', $.trim(self.text()));
    });
    */

    DOM.wrapper.on('click', 'a', function(e) {
        var self = $(this);
        var scroller = APP.getCurrentScroller(self.closest('.scroll'));

        if(scroller && scroller.moved){
            return false;
        }

        self.addClass('active');
    });



    /*=== Scrollers ===*/

    function createScrollers(target, settings) {
        target = $(target);

        target.each(function(i, dom) {
            var last_y = parseInt(dom.getAttribute('data-last_y'), 10),
                type = target.data('scroll-type'),
                scroller;

            if(!settings){
                settings = ISCROLL_SETTING.get(type);
            }

            if (!isNaN(last_y)) {
                settings.startY = last_y;
            }

            scroller = new IScroll(dom, settings);
            $.each(['scroll', 'scrollStart', 'scrollEnd'], function(i,e){
                if(e in settings){
                    scroller.on(e, settings[e]);
                }
            });

            Scrollers.push(scroller);
        });

        refreshScrollers();
    }


    function refreshScrollers() {
        newThread(function() {
            $.each(Scrollers, function(i, scroller) {
                scroller.refresh();
            });
        });
    }


    function clearScrollers() {
        $.each(Scrollers, function(i, scroller) {
            if ('destroy' in scroller) {
                var last_y = scroller.y;
                scroller.wrapper.setAttribute('data-last_y', last_y);
                scroller.destroy();
            }

            scroller = null;
        });

        Scrollers = [];
    }

    function getCurrentScroller(scroll_selector){
        if(scroll_selector) scroll_selector = $(scroll_selector);
        else scroll_selector = getCurrentPage();

        var found = null;

        $.each(Scrollers, function(i, scroller) {
            if(scroll_selector.length && scroller.wrapper == scroll_selector.get(0)){
                found = scroller;
                return false;
            }
        });

        return found;
    }



    /*=== Threading ===*/
    /**
     * Force calling function when DOMs are refreshed
     */

    function newThread(func) {
        if (typeof func != 'function') return;

        var args = Array.prototype.splice.call(arguments, 1);

        setTimeout(function() {
            func.apply(null, args);
        }, 4);

        return this;
    }


    /*=== Get test text (Lorem ipsum) ===*/

    function getLorem(len) {
        len = Math.min(len, lorems_len);
        var out = [];

        for (var i = 0; i < len; i++) {
            var r = Math.floor(Math.random() * lorems_len);
            out.push(lorems[r]);
        }

        return out.join(' ') + '.';
    }


    /*=== Notification ===*/

    // override window.alert
    function appAlert(title, message, button, callback){
        if('notification' in N){
            N.notification.alert(message, callback, title, button);
        }else{
            W.alert(message);

            if(typeof callback == 'function'){
                callback.call();
            }
        }

        return true;
    }

    // override window.confirm
    function appConfirm(title, message, button, callback){
        if('notification' in N){
            N.notification.confirm(message, callback, title, button);
        }else{
            var result = W.confirm(message);

            if(typeof callback == 'function'){
                callback.call(result ? 1 : 2);
            }
        }

        return true;
    }

    // override window.prompt
    function appPrompt(title, message, defaultText, button, callback){
        if('notification' in N){
            N.notification.prompt(message, callback, title, button, defaultText);
        }else{
            var result = W.prompt(message, defaultText);

            if(typeof callback == 'function'){
                callback.call(result || '');
            }
        }

        return true;
    }



    /*=== Sending SMS ===*/
    function sendSms(to, message, callback){
        if((CONFIG.OS != 'ios') || (!'plugins' in window) || (!'smsBuilder' in window.plugins)){
            if(typeof callback == 'function'){
                callback.call(2);
            }

            return false;
        };

        window.plugins.smsBuilder.showSMSBuilderWithCB(callback, to, message);
        return true;
    }



    /*=== register namespace ===*/
    if (!('APP' in W)) {
        W.APP = new Application();
    }

}(jQuery, window, document, navigator);


/*=== prevent touchmove for page ===*/
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
