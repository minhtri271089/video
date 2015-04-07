/*
Copyright (c) 2013 by Shin.  All Rights Reserved.
*/

$(function() {
    'use strict';

    var VIEWS = {
        home: $('#home'),
        detail: $('#detail'),
        search: $('#search')
    };

    /* select default view and page */
    APP.view(DEFAULT_VIEW || 0, 'animated bounceInUp').addClass('loading');
    APP.page(null, DEFAULT_PAGE || 0);

    /**
     * add event listener for PhoneGap
     */
    var PhoneGapReady = false;
    var PhoneGapTimeout = 5000;
    var PhoneGapTimer = 0;

    document.addEventListener('deviceready', deviceReady, false);

    PhoneGapTimer = setTimeout(function() {
        deviceReady(true);
    }, PhoneGapTimeout);

    function deviceReady(noPhoneGap) {
        PhoneGapReady = !noPhoneGap;
        document.removeEventListener('deviceready', deviceReady, false);
        clearTimeout(PhoneGapTimer);

        load();
    }

    function load() {
        if(PhoneGapReady){
            //back button
            if(CONFIG.OS == 'android' || CONFIG.OS == 'windowsphone'){
                document.addEventListener("backbutton", onBackKeyDown, false);
            }

            //update imei
            if(device && device.uuid)
                ApiRequestDefinition.version.imei = device.uuid;
        }else{
            APP.alert('Thông báo', 'Ứng dụng có thể hoạt động không ổn định trên thiết bị này.');
        }

        //check version
        APP.newThread(function() {
            APP.api('version', {device: 'ios'}, function(json) {
                if(json && 'status' in json && json.status == 0){
                    APP.showOverlay('Cập nhật mới', json.msg);
                }
            });
        });

        initHome();
    }

    // search button
    var search_view = VIEWS.search;
    var search_page = APP.getPage(search_view, 0);
    var search_results = APP.getPageHolder(search_page);
    var search_form = $('#search .search-form');
    var search_input = $('#search .search-input');
    var search_submit = $('#search .search-submit');
    var search_clear = $('#search .search-clear');
    var search_cancel = $('#search .search-cancel');
    var search_typehead_timeout = 500;
    var search_typehead_timer = 0;


    /*=== App page ===*/

    function onBackKeyDown(e) {
        var active_back = APP.current_view.find('.nav.back:visible');

        if(active_back.length){
            active_back.trigger('click');
        }else{
            APP.confirm('Thoát?', 'Bạn có muốn thoát ứng dụng này?', function(r){
                if(k)
                    try{
                        navigator.app.exitApp();
                    }catch(e){}
            }, 'Thoát,Không thoát');
        }

        e.preventDefault();
        return false;
    }

    // click handler
    var click_protect = false;
    APP.doms.wrapper.on('click', 'ul.stacked > li.listitem > a', function(e) {
        var self = $(this);
        var scroller = APP.getCurrentScroller(self.closest('.scroll'));

        search_input.blur();

        if(scroller && scroller.moved){
            return false;
        }

        if(click_protect){
            e.preventDefault();
            return false;
        }else{
            click_protect = true;
            setTimeout(function(){click_protect = false;}, 500);
        }

        var type = self.data('type') || 'content';
        var id = self.data('id') || null;

        if(!id){
            APP.alert('Lỗi', 'ID không tồn tại.');
            self.removeClass('active');
            return false;
        }

        if(type == 'content'){
            displayContent(id);
        }else{
            displayCategories('category', id, 1, false);
        }

        e.preventDefault();
        return false;
    });

    // APP.doms.wrapper.on('load', 'img', APP.refresh);
    // APP.doms.wrapper.on('error', 'img', function(){
    //     this.src = NOIMAGE;
    //     APP.refresh();
    // });

    function displayCategories(type, id, page, appendMode){
        if(!page) page = 1;

        var current_view = APP.current_view;
        var current_page = APP.current_page;
        var current_back = current_view.find('.back:visible');
        var new_page = current_page;
        var new_holder = APP.getPageHolder(new_page);
        var result = null, content = '';

        if(type != 'search' && !appendMode){
            new_page = APP.createPage(current_view);
            new_holder = APP.getPageHolder(new_page);
            new_page.append('<span class="top"/><span class="bottom"/>');
            new_holder.html('<span class="spinner center active" />');
            APP.page(current_view, new_page, 'animated slideInRight');

            current_back.hide();

            var back = $('<a class="nav back"><i class="icon-chevron-left"></i></a>').prependTo(current_view.find('.view-header'));

            back.one('click', function(){
                APP.page(current_view, current_page, 'animated slideInLeft');

                setTimeout(function(){
                    if(current_back.length){
                        current_back.show();
                    }else{
                        back.siblings('.nav').show();
                    }

                    new_page.remove();
                }, USE_ANIMATIONS ? 1000 : 4);

                back.remove();

                return false;
            });
        }

        new_page.data({'scroll-type': 'pull', 'last_y': 0, 'id': id, 'type': type});

        if(type == 'search'){
            result = APP.api('search', {val:id, paging:page});
        }else{
            result = APP.api('category', {id:id, paging:page});
        }

        return result.done(function(json) {
            var content = parseResult(json, appendMode ? true : false);
            var refresh_flag = false;

            new_holder.find('.loadmore').remove();

            if(content != false){
                new_page.data('page', page);

                if(appendMode == 'bottom'){
                    var list = new_holder.find('> ul');

                    list.append(content);
                    while(list.find('>li').length > LISTVIEW_MAX_ITEMS){
                        var rem = list.find('>li:eq(0)');
                        var rem_height = rem.height();

                        rem.remove();

                        if(APP.Scrollers.length > 0){
                            APP.Scrollers[0].scrollBy(0, rem_height)
                        }

                        refresh_flag = true;
                    }
                    //list.find('>li[rel='+(page - 3)+']').remove();
                }else if(appendMode == 'top'){
                    new_holder.html('<ul class="stacked">' + content + '</ul>');
                }else{
                    new_holder.html(content);
                }

                if(CONFIG.OS == 'android' || CONFIG.OS == 'windowsphone'){
                    var list = new_holder.find('> ul');

                    if(json.limit <= json.data.length){
                        var loadmore = $('<li class="loadmore"><i class="icon-circle-arrow-down"></i> Xem nhiều hơn nữa</li>');
                        list.append(loadmore);

                        loadmore.click(function(){
                            if(loadmore.hasClass('loading')) return false;

                            displayCategories(type, id, page + 1, 'bottom');
                            loadmore.addClass('loading').html('Đang tải dữ liệu...');
                            return false;
                        });
                    }

                    if(refresh_flag && list.find('.refresh').length == 0){
                        var loadmore = $('<li class="refresh"><i class="icon-refresh"></i> Làm mới nội dung</li>');
                        list.prepend(loadmore);

                        loadmore.click(function(){
                            if(loadmore.hasClass('loading')) return false;

                            displayCategories(type, id, 1, 'top');
                            loadmore.addClass('loading').html('Đang tải dữ liệu...');
                            return false;
                        });
                    }
                }
            }

            new_page.trigger('change.page');

            if(json && 'ads' in json){
                displayAds(json.ads);
            }
        }).fail(function() {
            search_input.blur();

            if(!appendMode){
                new_holder.html('<p>Không thể tải dữ liệu do mất kết nối.</p>');
            }else{
                APP.showOverlay('Lỗi kết nối', '<p>Không thể tải dữ liệu do mất kết nối.</p>');
            }

            new_page.trigger('change.page');
        }).always(function() {
            current_view.removeClass('idle loading');
            new_holder.find('.loadmore').removeClass('loading').html('<i class="icon-circle-arrow-down"></i> Xem nhiều hơn nữa');
            new_holder.find('.refresh').removeClass('loading').html('<i class="icon-refresh"></i> Làm mới nội dung');
        });
    }

    function displayContent(id){
        var current_view = APP.current_view;
        var view = VIEWS.detail.addClass('loading');
        var page = APP.getPage(view, 0).data('last_y', 0);
        var header = view.find('h1').text('Loading...');
        var back = view.find('.nav.back').off('click');
        var download = view.find('.nav.download').addClass('invisible').off('click');
        var holder = APP.getPageHolder(page);
        var result = APP.api('content', {id:id}), content = '', files = null;

        holder.html('<div class="spinner center"> </div>');
        APP.view(view, 'animated slideInRight');

        result.done(function(json) {
            var content = $(parseResult(json));

            if('content' in json && 'title' in json.content){
                header.text(json.content.title);
            }else{
                header.text('Chi tiết');
            }

            if('file' in json && json.file.length > 0){
                files = renderFiles(json.file);
            }

            // content.find('img:not(:eq(0))').each(function(i,e){
            //     var _e = $(e);

            //     if(!e.src) return;

            //     files.images.push({
            //         url: e.src,
            //         title: e.alt ? e.alt : '',
            //         download: 0,
            //     });

            //     _e.attr({
            //          onload: "APP.refresh();",
            //          onerror: "this.src=NOIMAGE;"
            //     });
            // });

            holder.html(content);

            if(files && 'files' in files && files.files.length > 0){
                download.on('click', function(){
                    APP.showOverlay('Download', renderDownloads(files.files));
                    return false;
                }).removeClass('invisible');
            }

            if(files && 'images' in files && files.images.length > 0){
                var photos = renderPhotos(files.images);
                holder.append(photos);
                photos.photos.show(0);
            }

            page.trigger('change.page');

            if(json && 'ads' in json){
                displayAds(json.ads);
            }
        }).fail(function() {
            header.text('Lỗi!!!');
            holder.html('<p>Không thể tải dữ liệu do mất kết nối.</p>');
            page.trigger('change.page');
        }).always(function() {
            view.removeClass('loading');
        });

        back.one('click', function(){
            APP.view(current_view, 'animated slideInLeft');
            return false;
        });

        return result;
    }

    function initHome(){
        var view = VIEWS.home.addClass('loading');
        var page = APP.getPage(view, 0);
        var holder = APP.getPageHolder(page);

        return APP.api('list').done(function(json) {
            var content = parseResult(json);
            holder.html(content);
            page.trigger('change.page');

            if(json && 'ads' in json){
                displayAds(json.ads);
            }
        }).fail(function() {
            holder.html('<p>Không thể tải dữ liệu do quá thời gian kết nối.</p>');
            page.trigger('change.page');
        }).always(function() {
            view.removeClass('loading');
        });
    }

    if(CONFIG.OS == 'android' || CONFIG.OS == 'windowsphone'){
        ISCROLL_SETTING.pull.probeType = 0;
        ISCROLL_SETTING.pull.scroll = undefined;

        if(CONFIG.OS == 'windowsphone'){
            ISCROLL_SETTING.get = function(name) {
                return {
                    click: touchSupport,
                    freeScroll: true,
                    probeType: 0
                };
            };
        }
    }else{
        /* trigger pull action */
        ISCROLL_SETTING.pull.scroll = function () {
            var top_pull = this.y,
                bottom_pull = this.maxScrollY - this.y,
                progress = 0,
                wrapper = $(this.wrapper);

            if(top_pull < 1 && bottom_pull < 1) return;
            if(wrapper.hasClass('loading')) return;

            var top = wrapper.find('> .top'),
                bottom = wrapper.find('> .bottom');

            this.wrapper.className = this.wrapper.className.replace(/(\s*pending-\d+\s*)+/ig, ' ');

            if(top_pull > 0){
                progress = Math.floor(top_pull / PULL_TO_REFRESH_HEIGHT * 100);
                wrapper.addClass('pending top pending-'+progress);
                top.html('Kéo xuống để tải trang trước (' + progress + '%)');

                if(top_pull >= PULL_TO_REFRESH_HEIGHT){
                    this.y -= PULL_TO_REFRESH_HEIGHT;
                    wrapper.removeClass('pending').addClass('loading top');
                    top.html('<span class="spinner active"> </span>');
                    loadData(this);
                }
            }else{
                progress = Math.floor(bottom_pull / PULL_TO_REFRESH_HEIGHT * 100);
                wrapper.addClass('pending bottom pending-'+progress);
                bottom.html('Kéo lên để tải trang sau (' + progress + '%)');

                if(bottom_pull >= PULL_TO_REFRESH_HEIGHT){
                    wrapper.removeClass('pending').addClass('loading bottom');
                    bottom.html('<span class="spinner active"> </span>');
                    loadData(this);
                }
            }
        }
    }


    function loadData(scroller){
        var wrapper = $(scroller.wrapper);
        var type = wrapper.data('type');
        var page = wrapper.data('page');
        var id = wrapper.data('id');

        if(wrapper.hasClass('bottom')){
            displayCategories(type, id, page + 1, 'bottom').always(removeLoading);
        }else{
            displayCategories(type, id, 1, 'top').always(removeLoading);
        }

        scroller.maxScrollY -= PULL_TO_REFRESH_HEIGHT;

        function removeLoading(){$
            wrapper.removeClass('loading top bottom');
            scroller.refresh()
        }
    }


    /*=== Search page ===*/

    APP.doms.wrapper.on('click', '.search-open', function(e) {
        var view = APP.current_view,
            page = APP.current_page,
            content_id = page.data('content-id') || null;

        search_view.addClass('idle').data('content-id', content_id);
        APP.view(search_view, 'animated fadeIn', true);
        search_input.val('');

        return false;
    });

    search_input.on('keyup', function(e) {
        clearTimeout(search_typehead_timer);

        var string = $.trim(search_input.val());

        if (string == '') {
            search_results.empty();
            search_page.trigger('change.page');
            search_clear.hide();
            return;
        }else{
            search_clear.show();
        }

        search_typehead_timer = setTimeout(getSearchResults, search_typehead_timeout);
    }).trigger('keyup');

    search_clear.click(function(){
        search_input.val('').trigger('keyup').focus();
        return false;
    })

    search_submit.click(function() {
        search_input.blur();
        getSearchResults();
        return false;
    })

    search_cancel.click(function(){
        search_input.blur();
        APP.view('.inactive:first', '');
        return false;
    })

    function getSearchResults(page) {
        if(!page) page = 1;

        var string = $.trim(search_input.val());

        search_view.addClass('loading');

        return displayCategories('search', string, page, 'top');
    }

    /*=== Advertisement ===*/
    var ads_timer = 0;
    var ads_waiting = 0;
    var last_ads = null;
    var is_closed = true;

    function displayAds(adsData){
        if(last_ads){
            var old_ads = last_ads;
            last_ads = null;
            is_closed = true;

            old_ads.fadeOut(function() {
                old_ads.remove();
            });
        }

        var ads_html = renderAds(adsData);
        if(ads_html == '') return;

        last_ads = $(ads_html);
        ads_waiting = (parseInt(adsData.timer, 10) || 30) * 1000;

        last_ads.find('.close').click(hideAd);
    }

    function showAd(){
        if(last_ads){
            last_ads.appendTo(APP.current_page);
            last_ads.fadeIn().show();
            is_closed = false;

            clearInterval(ads_timer);
            ads_timer = setTimeout(hideAd, ADS_TIMEOUT);
        }
    }

    function hideAd(){
        if(last_ads && !is_closed){
            is_closed = true;
            last_ads.fadeOut();
        }

        clearInterval(ads_timer);
        ads_timer = setTimeout(showAd, ads_waiting);
    }


    /*=== Element helpers ===*/

    // parse JSON data to HTML

    function parseResult(json, append){
        if(!json) return '<p>No data found.</p>';

        var page = 'paging' in json ? json.paging : 1;
        var type = ('type' in json && json.type == 'category') ? 'list' : 'content';
        var output = '';

        if('data' in json){
            $.each(json.data, function(i,itemData){
                itemData.type = type;
                output += renderItem(itemData, page);
            });

            if(!append) output = '<ul class="stacked">' + output + '</ul>';
        }else if('content' in json){
            output = renderPage(json.content);
        }else{
            output = append ? false : '<p>Không tìm thấy dữ liệu.</p>';
        }

        return output;
    }

    // render item in list, return <li> tag

    function renderItem(itemData, page) {
        if(!itemData || !itemData.id) return '';
        if(!page) page = 1;

        var id = itemData.id;
        var type = itemData.type || 'content';
        var title = itemData.title || 'no title';
        var desc = itemData.desc || '';
        var icon = itemData.icon || NOIMAGE;
        var button = itemData.button || '';
        var class_name = itemData.button || '';

        var output = '<li class="listitem '+class_name+' label-'+button+'" rel="'+page+'">'
                        + '<a data-type="'+type+'" data-id="'+id+'" data-button="'+button+'" href="#detail-'+id+'" title="'+title+'">'
                            + '<img src="'+icon+'" class="preview lazy" alt="'+title+'" width="64" height="64" onload="APP.refresh();" onerror="this.src=NOIMAGE;" />'
                            + '<h3>'+title+'</h3>'
                            + '<span>'+desc+'</span>'
                        + '</a>'
                    + '</li>';

        return output;
    }

    // render content item to page

    function renderPage(data) {
        if(!data) return '';

        var title = data.title || 'no title';
        var desc = data.desc || '';
        var icon = data.icon || NOIMAGE;
        var button = data.button || '';
        var class_name = data.button || '';

        var output  = '<div class="news '+class_name+' label-'+button+'">'
                        + '<img src="'+icon+'" class="preview lazy" alt="'+title+'" width="64" height="64" onload="APP.refresh();" onerror="this.src=NOIMAGE;" />'
                        + '<h3>'+title+'</h3>'
                        + '<div>'+desc+'</div>'
                    + '</div>';

        return output;
    }

    // render ads content

    function renderAds(adsData) {
        if(!adsData || !adsData.url_images) return '';

        var timeout = adsData.timer || 5000,
            url     = adsData.href || '#',
            image   = adsData.url_images,
            position = (adsData.position || 'bottom').toLowerCase().split('/')[0];

        var output  = '<div class="ads ads-'+position+'">'
                        + '<span href="javascript:;" class="close">&times;</span>'
                        + '<a href="'+url+'" target="_blank" class="ad-link" title="advertising">'
                            + '<img alt="Ads image" src="'+image+'" border="0" onload="APP.refresh();" onerror="this.src=NOIMAGE;" />'
                        + '</a>'
                    + '</div>';

        return output;
    }

    // render file
    function renderFiles(files){
        var img_filter = (/\.(jpg|jpeg|png|gif|tif|tiff|bmp|ico)$/i);
        var output = {files: [], images: []};

        $.each(files, function(i, file){
            if(!('url' in file))
                return;

            if(img_filter.test(file.url)){
                //file.url += '?_=' + Math.random();
                output.images.push(file);
            }else{
                output.files.push(file);
            }
        });

        return output;
    }

    // render photos
    function renderPhotos(images){
        var target = $('<div class="gallery"><span class="fullscreen"><img src="img/zoom_in.png" border="0" width="40" height="40" /></span><div class="photos" /></div>');
        var instance = window.Code.PhotoSwipe.attach(images, {
            target: target.find('>.photos').get(0),
            preventHide: true,
            autoStartSlideshow: false,
            cacheMode: true,
            doubleTapZoomLevel: 1,
            captionAndToolbarAutoHideDelay: 0,
            getImageSource: function(obj){
                return obj.url;
            },
            getImageCaption: function(obj){
                return obj.title;
            }
        });

        var instanceFull = window.Code.PhotoSwipe.attach(images, {
            preventHide: false,
            autoStartSlideshow: false,
            cacheMode: true,
            doubleTapZoomLevel: 1,
            captionAndToolbarAutoHideDelay: 0,
            getImageSource: function(obj){
                return obj.url;
            },
            getImageCaption: function(obj){
                return obj.title;
            }
        });

        target.photos = instance;
        target.photos_fullscreen = instanceFull;

        var double_tap = false;

        instance.addEventHandler(window.Code.PhotoSwipe.EventTypes.onTouch, function(e){
            if(e.action === 'doubleTap'){
                double_tap = false;
                instanceFull.show(0);
            }else if (e.action === 'tap'){
                if(double_tap){
                    instanceFull.show(0);
                    double_tap = false;
                }else{
                    double_tap = true;
                    setTimeout(function(){double_tap = false}, 500);
                }
            }
        });

        target.find('>.fullscreen').click(function(e){
            instanceFull.show(0);
            e.stopPropagation();
            return false;
        })

        return target;
    }

    function renderDownloads(files){
        if(!files) return 'Không có tập tin để download.';

        var target = $('<p class="download" />');
        var html = '';

        $.each(files, function(i, e){
            html += '<a target="_blank" href="'+e.url+'" title="'+e.title+'" class="btn">'+e.title+'</a>';
        });

        target.html(html);

        return target;
    }
});
