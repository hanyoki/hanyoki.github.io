$(function(){
    (function() {
        var $archivePage = $getEClass('archive-page');
        var num = 0;
        //文章列表在时间轴上慢慢出现
        if ($archivePage && $archivePage.length != 0) {
            var time = setInterval(function () {
                $archivePage[num].setAttribute('class', $archivePage[num].getAttribute('class') + ' transition');
                num++;
                if (num == $archivePage.length) {
                    num = 0;
                    clearInterval(time);
                }
            }, 150);
        }
        //键盘组合键弹出搜索框
        var $a = document.getElementById('my-search-a');
        document.onkeydown = function (ev) {
            var ev = ev || event;
            if (ev.altKey && ev.ctrlKey) {
                $a.click();
            }
        };
    })()
});
//page img 博客文章中图片的弹出框
addevent(window,'load',function(){
    (function(){
        if(document.getElementById('page-post-content')){
            //获取所有图片元素
            var $imgs=document.getElementById('page-post-content').getElementsByTagName('img');
            //创建弹出框节点
            var $aside=document.createElement('aside');
            var num=0;
            $aside.setAttribute('id','popup');
            var htm=[
                '<div class="popup-content">',
                '<img src="#">',
                '</div>',
                '<a href="javascript:void(0);" class="popup-close"></a>',
                '<a href="javascript:void(0);" class="popup-left m"></a>',
                '<a href="javascript:void(0);" class="popup-right m"></a>'
            ].join('');
            $aside.innerHTML=htm;
            document.body.appendChild($aside);
            //给每个图片添加点击事件
            for(var i=0;i<$imgs.length;i++) {
                (function(i) {
                    $imgs[i].onclick = function () {
                        num = i;
                        var $content = $aside.children[0].children[0];
                        $content.src = this.src;
                        $aside.style.display = 'block';
                        document.body.style.overflow = 'hidden';
                        mid($aside,$content);
                    };
                })(i)
            }
            //添加关闭弹窗事件
            var $close=$aside.children[1];
            $close.onclick=function(){
                $aside.style.display='none';
                document.body.style.overflow='auto';
            };
            //添加上下查看图片点击事件
            var $next=$aside.children[3];
            var $prev=$aside.children[2];
            var $img=$aside.children[0].children[0];
            $next.onclick=function(){
                if(num>=$imgs.length-1){
                    num=-1;
                }
                num++;
                $img.src=$imgs[num].src;
                $img.parentNode.removeAttribute('style');
                mid($aside,$img);
            };
            $prev.onclick=function(){
                if(num<=0){
                    num=$imgs.length;
                }
                num--;
                $img.src=$imgs[num].src;
                $img.parentNode.removeAttribute('style');
                mid($aside,$img);
            }
        }
    })();
});
//移动端个人信息滑动菜单
addevent(window,'load',function(){
    (function() {
        var leftInformation = $getEId('left-information');
        var leftInformationLabel = document.querySelectorAll('label[for="left-information"]');
        console.log(leftInformationLabel);
        for (var i = 0; i < leftInformationLabel.length; i++) {
            addevent(leftInformationLabel[i], 'click', function () {
                if (!leftInformation.checked) {
                    document.documentElement.style.overflow = 'hidden';
                    document.body.style.overflow = 'hidden';
                } else {
                    document.documentElement.style.overflow = 'auto';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    })()
});
function mid($asid,$conten){
    var clientw=document.documentElement.clientWidth;
    var clienth=document.documentElement.clientHeight;
    var offsetw=$conten.offsetWidth;
    var offseth=$conten.offsetHeight;
    if(offsetw>clientw&&offseth<clienth){
        $conten.style.maxWidth=clientw-20+'px';
    }else{
        $conten.style.maxHeight=clienth-50+'px';
    }
    offsetw=$conten.offsetWidth;
    offseth=$conten.offsetHeight;
    console.log(offsetw);
    $asid.children[0].style.top=(clienth-offseth-20)/2+'px';
    $asid.children[0].style.left=(clientw-offsetw-20)/2+'px';
}
function style($obj,pos){
    return getComputedStyle($obj)
        ?getComputedStyle($obj)[pos]
        :$obj.currentStyle[pos];
}
function addevent($ele,ev,fun,tab){
    $ele.addEventListener ? $ele.addEventListener(ev,fun,tab||false)
        : $ele.attachEvent('on'+ev,fun);
}
function $(fun){
    window.onload=fun;
}
function $getEId(id){
    return document.getElementById(id);
}
function $getETag(tag){
    return document.getElementsByTagName(tag);
}
function $getEClass(clas){
    return document.getElementsByClassName(clas);
}