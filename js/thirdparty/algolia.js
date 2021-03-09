/**
 * Created by Administrator on 2017/5/12.
 */
$(document).ready(function () {
        var algoliaSettings = CONFIG.algolia;
        var isAlgoliaSettingsValid = algoliaSettings.applicationID &&
            algoliaSettings.apiKey &&
            algoliaSettings.indexName;

        if (!isAlgoliaSettingsValid) {
            window.console.error('Algolia Settings are invalid.');
            return;
        }

        var search = instantsearch({
            appId: algoliaSettings.applicationID,
            apiKey: algoliaSettings.apiKey,
            indexName: algoliaSettings.indexName,
            searchFunction: function (helper) {
                var searchInput = $('#algolia-search-input').find('input');

                if (searchInput.val()) {
                    helper.search();
                }
            }
        });

        // Registering Widgets
        [
            instantsearch.widgets.searchBox({
                container: '#algolia-search-input',
                placeholder: algoliaSettings.labels.input_placeholder
            }),

            instantsearch.widgets.hits({
                container: '#algolia-hits',
                hitsPerPage: algoliaSettings.hits.per_page || 10,
                templates: {
                    item: function (data) {
                        return (
                            '<a href="' + CONFIG.root + data.path + '" class="algolia-hit-item-link">' +
                            data._highlightResult.title.value +
                            '</a>'
                        );
                    },
                    empty: function (data) {
                        return (
                            '<div id="algolia-hits-empty">' +
                            algoliaSettings.labels.hits_empty.replace(/\$\{query}/, data.query) +
                            '</div>'
                        );
                    }
                },
                cssClasses: {
                    item: 'algolia-hit-item'
                }
            }),

            instantsearch.widgets.stats({
                container: '#algolia-stats',
                templates: {
                    body: function (data) {
                        var stats = algoliaSettings.labels.hits_stats
                            .replace(/\$\{hits}/, data.nbHits)
                            .replace(/\$\{time}/, data.processingTimeMS);
                        return (
                            stats +
                            '<span class="algolia-powered">' +
                            //'  <img src="' + CONFIG.root + 'images/algolia_logo.svg" alt="Algolia" />' +
                            '</span>' +
                            '<hr />'
                        );
                    }
                }
            }),

            instantsearch.widgets.pagination({
                container: '#algolia-pagination',
                scrollTo: false,
                showFirstLast: false,
                labels: {
                    first: '<i class="fa fa-angle-double-left"></i>',
                    last: '<i class="fa fa-angle-double-right"></i>',
                    previous: '<i class="fa fa-angle-left"></i>',
                    next: '<i class="fa fa-angle-right"></i>'
                },
                cssClasses: {
                    root: 'pagination',
                    item: 'pagination-item',
                    link: 'page-number',
                    active: 'current',
                    disabled: 'disabled-item'
                }
            })
        ].forEach(search.addWidget, search);

        search.start();

        $('.popup-trigger').click(function(e) {
            e.stopPropagation();
            $('body').append('<div class="popoverlay">').css('overflow', 'hidden');
            $('.popup').animate({
                top:'10%'
            },300);
            $('#algolia-search-input').find('input').focus();
        });

        $('.popup-btn-close').click(function(){
            $('.popup').animate({
                top:'100%'
            },300);
            $('.popoverlay').remove();
            $('body').css('overflow', '');
        });

    });
    $(document).ready(function () {
        if ( $('#local-search-input').size() === 0) {
            return;
        }

        // Popup Window;
        var isfetched = false;
        // Search DB path;
        var search_path = "search.xml";
        if (search_path.length == 0) {
            search_path = "search.xml";
        }
        var path = "/" + search_path;
        // monitor main search box;

        function proceedsearch() {
            $("body").append('<div class="popoverlay">').css('overflow', 'hidden');
            $('.popup').toggle();

        }
        // search function;
        var searchFunc = function(path, search_id, content_id) {
            'use strict';
            $.ajax({
                url: path,
                dataType: "xml",
                async: true,
                success: function( xmlResponse ) {
                    // get the contents from search data
                    isfetched = true;
                    $('.popup').detach().appendTo('.header-inner');
                    var datas = $( "entry", xmlResponse ).map(function() {
                        return {
                            title: $( "title", this ).text(),
                            content: $("content",this).text(),
                            url: $( "url" , this).text()
                        };
                    }).get();
                    var $input = document.getElementById(search_id);
                    var $resultContent = document.getElementById(content_id);
                    $input.addEventListener('input', function(){
                        var matchcounts = 0;
                        var str='<ul class=\"search-result-list\">';
                        var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                        $resultContent.innerHTML = "";
                        if (this.value.trim().length > 1) {
                            // perform local searching
                            datas.forEach(function(data) {
                                var isMatch = true;
                                var content_index = [];
                                var data_title = data.title.trim().toLowerCase();
                                var data_content = data.content.trim().replace(/<[^>]+>/g,"").toLowerCase();
                                var data_url = data.url;
                                var index_title = -1;
                                var index_content = -1;
                                var first_occur = -1;
                                // only match artiles with not empty titles and contents
                                if(data_title != '' && data_content != '') {
                                    keywords.forEach(function(keyword, i) {
                                        index_title = data_title.indexOf(keyword);
                                        index_content = data_content.indexOf(keyword);
                                        if( index_title < 0 && index_content < 0 ){
                                            isMatch = false;
                                        } else {
                                            if (index_content < 0) {
                                                index_content = 0;
                                            }
                                            if (i == 0) {
                                                first_occur = index_content;
                                            }
                                        }
                                    });
                                }
                                // show search results
                                if (isMatch) {
                                    matchcounts += 1;
                                    str += "<li><a href='"+ data_url +"' class='search-result-title'>"+ data_title +"</a>";
                                    var content = data.content.trim().replace(/<[^>]+>/g,"");
                                    if (first_occur >= 0) {
                                        // cut out 100 characters
                                        var start = first_occur - 20;
                                        var end = first_occur + 80;
                                        if(start < 0){
                                            start = 0;
                                        }
                                        if(start == 0){
                                            end = 50;
                                        }
                                        if(end > content.length){
                                            end = content.length;
                                        }
                                        var match_content = content.substring(start, end);
                                        // highlight all keywords
                                        keywords.forEach(function(keyword){
                                            var regS = new RegExp(keyword, "gi");
                                            match_content = match_content.replace(regS, "<b class=\"search-keyword\">"+keyword+"</b>");
                                        });

                                        str += "<p class=\"search-result\">" + match_content +"...</p>"
                                    }
                                    str += "</li>";
                                }
                            })};
                        str += "</ul>";
                        if (matchcounts == 0) { str = '<div id="no-result"><i class="fa fa-frown-o fa-5x" /></div>' }
                        if (keywords == "") { str = '<div id="no-result"><i class="fa fa-search fa-5x" /></div>' }
                        $resultContent.innerHTML = str;
                    });
                    proceedsearch();
                }
            });}

        // handle and trigger popup window;
        $('.popup-trigger').mousedown(function(e) {
            e.stopPropagation();
            if (isfetched == false) {
                searchFunc(path, 'local-search-input', 'local-search-result');
            } else {
                proceedsearch();
            };

        });

        $('.popup-btn-close').click(function(e){
            $('.popup').hide();
            $(".popoverlay").remove();
            $('body').css('overflow', '');
        });
        $('.popup').click(function(e){
            e.stopPropagation();
        });
    });
