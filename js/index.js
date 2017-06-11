//  get请求封装
function doGet(url, options, callback) {
    var serialize = function (data) {
        if (!data) { return; }
        var paris = [];
        for (var name in data) {
            if (!data.hasOwnProperty(name)) { continue; }
            if (typeof (name) == "function") { continue; }
            var value = data[name].toString();
            name = encodeURIComponent(name);
            value = encodeURIComponent(value);
            paris.push(name + '=' + value);
        }
        return paris.join("&");
    };
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                callback(xhr.responseText);
            } else {
                alert("Request was failed: " + xhr.status);
            }
        }
    };
    xhr.open("GET", url + "?" + serialize(options), true);
    xhr.send(null);
}

// 兼容事件处理
var EventUtils = {
    addHandler: function (ele, type, handler) {
        if (ele.addEventListener) {
            ele.addEventListener(type, handler, false);
        } else if (ele.attachEvnet) {
            ele.attachEvnet('on' + type, handler);
        } else {
            ele['on' + type] = handler;
        }
    },
    removeHandler: function (ele, type, handler) {
        if (ele.removeHandler) {
            ele.removeHandler(type, handler, false);
        } else if (ele.detachEvent) {
            ele.detachEvent('on' + type, handler);
        } else {
            ele['on' + type] = null;
        }
    }
};

// 兼容getElementsByClassName
function getElementsByClassName(name) {
    if (document.getElementsByClassName) {
        return document.getElementsByClassName(name);
    } else {
        var elements = document.getElementsByTagName("*");
        var arr = [];
        for (var i = 0, len = elements.length; i < len; i++) {
            if (elements[i].className.search("\\b" + name + "\\b") != -1) {
                arr.push(elements[i]);
            }
        }
    }
}

// 兼容classList
function getClassList(e) {
    if (e.classList) return e.classList;
    else return new CssClassList(e);

    function CssClassList(e) {
        this.e = e;
    }
    CssClassList.prototype.contains = function (c) {
        if (e.length === 0 || c.indexOf(' ') != -1) {
            throw new Error("Invalid class name: '" + c + "'");
        }
        var classes = this.e.className;
        if (!classes) return false;
        if (classes === c) return true;
        return classes.search("\\b" + c + "\\b") != -1;
    };

    CssClassList.prototype.add = function (c) {
        if (this.contains(c)) return;
        var classes = this.e.className;
        if (classes && classes[classes.length - 1] != " ") c += " ";
        this.e.className += c;
    };

    CssClassList.prototype.remove = function (c) {
        if (c.length === 0 || c.indexOf(" ") != -1) {
            throw new Error("Invalid class name: '" + c + "'");
        }
        this.e.className = this.e.className.replace("c", "").trime();
    }

    CssClassList.prototype.toggle = function (c) {
        if (this.contains(c)) {
            this.remove(c);
            return false;
        } else {
            this.add(c);
            return true;
        }
    }

    CssClassList.prototype.toString = function () {
        return this.e.className;
    }

    CssClassList.prototype.toArray = function () {
        return this.e.className.match(/\b\w\b/g) || [];
    }
}

var CookieUtils = {
    get: function (name) {
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null;
        if (cookieStart != -1) {
            var cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd = ! -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }
        return cookieValue;
    },
    set: function (name, value, expires) {
        var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        if (expires instanceof Date) {
            cookieText += "; expires=" + expires.toGMTString();
        }
        document.cookie = cookieText;
    }
};

// 轮播图
(function () {
    var curNum = 0;
    var pictures = getElementsByClassName("banner")[0].getElementsByTagName("li");
    var points = getElementsByClassName("pointer")[0].getElementsByTagName("i");
    var len = points.length;
    // 设置透明度
    var setOpacity = function (e, level) {
        e.filter ? e.filter = "alpha(opacity=" + level * 100 + ")" : e.style.opacity = String(level);
    };

    //淡入动画
    var fadeIn = function (ele) {
        setOpacity(ele, 0);
        var curVal = 0;
        var step = function () {
            if (curVal < 1) {
                curVal += 0.02;
                setOpacity(ele, curVal);
                setTimeout(step, 10);
            }
        }
        setTimeout(step, 10);
    };
    // 淡出动画
    var fadeOut = function (ele) {
        setOpacity(ele, 1);
        var curVal = 1;
        var step = function () {
            if (curVal > 0) {
                curVal -= 0.02;
                setOpacity(ele, curVal);
                setTimeout(step, 10);
            }
        }
        setTimeout(step, 10);
    };

    // 改变指示器
    var changeTo = function (num) {
        var curPicture = getElementsByClassName("selected")[0];
        var curPoint = getElementsByClassName("selected")[1];
        fadeOut(curPicture);
        getClassList(curPicture).remove("selected");
        getClassList(pictures[num]).add("selected");
        fadeIn(pictures[num]);
        getClassList(curPoint).remove("selected");
        getClassList(points[num]).add("selected");
    };
    // 自动切换
    var autoChange = setInterval(function () {
        curNum < len - 1 ? curNum++ : curNum = 0;
        changeTo(curNum)
    }, 5000);
    for (var i = 0; i < len; i++) {
        (function (num) {
            EventUtils.addHandler(points[num], 'click', function () {
                changeTo(num);
                curNum = num;
            });
            EventUtils.addHandler(pictures[num], 'mouseover', function () {
                clearInterval(autoChange);
            });
            EventUtils.addHandler(pictures[num], 'mouseout', function () {
                autoChange = setInterval(function () {
                    curNum < len - 1 ? curNum++ : curNum = 0;
                    changeTo(curNum)
                }, 5000);
            });
        })(i);

    }
})();

// 顶部通知条
(function () {
    var closeMessage = document.getElementById("close-message");
    var topMessage = getElementsByClassName("message")[0];
    EventUtils.addHandler(closeMessage, 'click', function () {
        getClassList(topMessage).add("hide-message");
        CookieUtils.set("closeMessage", "closeMessage", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    });

    // 初始时检查是否需要隐藏顶部通知
    if (!CookieUtils.get("closeMessage")) {
        getClassList(topMessage).remove("hide-message");
    } else {
        getClassList(topMessage).add("hide-message");
    }

})();

// 右侧热门课程列表
(function () {
    var courseList = document.getElementById("course-list");
    function createCourseNode(course) {
        return '<li><img src="' + course.smallPhotoUrl + '" >\
      <div><h6>' + course.name + '</h6> <span>' + course.learnerCount + '</span></div></li>';
    }
    doGet(
        "http://study.163.com/webDev/hotcouresByCategory.htm",
        {},
        function (responseText) {
            var coursesData = JSON.parse(responseText);
            var coursesHtml = "";
            if (coursesData) {
                // var len = coursesData.length > 10 ? 10 : coursesData.length;
                for (var i = 0; i < coursesData.length; i++) {
                    coursesHtml += createCourseNode(coursesData[i]);
                }
            }
            courseList.innerHTML = coursesHtml;
        }
    );
    setInterval(function () {
        if (courseList.childNodes.length > 0) {
            courseList.appendChild(courseList.firstChild);
        }
    }, 5000);
})();

//  左侧课程列表内容区
(function () {
    var courseList = getElementsByClassName("content-left-list")[0];
    var createCourseNode = function (course) {
        var html = '<li><img src="';
        html += course.middlePhotoUrl;
        html += '"><h6>';
        html += course.name;
        html += '</h6><p class="provider">';
        html += course.provider;
        html += '</p><p class="learnerCount border">';
        html += course.learnerCount;
        html += '</p><p class="price">'
        if (course.price == 0) {
            html += "免费";
        } else {
            html += '￥' + course.price;
        }

        // 以下为弹窗部分
        html += '<div class="dialog"><img src="';
        html += course.middlePhotoUrl;
        html += '"><div class="right"><h6>';
        html += course.name;
        html += '</h6><p class="learnerCount">';
        html += course.learnerCount;
        html += '<span>人在学</span></p>';
        html += '<p class="provider"><span>发布者：</span>';
        html += course.provider;
        html += '</p><p class="category"><span>分类：</span>';
        if (course.categoryName) {
            html += course.categoryName;
        } else {
            html += '无';
        }
        html += '</p>';
        html += '</div><p class="description">';
        html += course.description;
        html += '</p></div></li>';

        return html;
    };

    var options = {
        pageNo: 1,
        psize: 20,
        type: 10
    };

    var showIndicator = function (num) {
        var pageIndicator = getElementsByClassName('page-indicator')[0];
        var indicators = pageIndicator.getElementsByTagName('li');
        for (var i = 0; i < num; i++) {
            if (getClassList(indicators[i]).contains('hide')) {
                getClassList(indicators[i]).remove('hide');
            }
        }
        for (var j = num, len=indicators.length; j < len; j++) {
            if (!getClassList(indicators[j]).contains('hide')) {
                getClassList(indicators[j]).add('hide');
            }
        }
    };

    var totalPage = 0;
    var loadCourseData = function (options) {
        doGet(
            "http://study.163.com/webDev/couresByCategory.htm",
            options,
            function (responseText) {
                var courseHtml = "";
                var courseData = JSON.parse(responseText);
                var courses = courseData.list;
                for (var i = 0; i < courses.length; i++) {
                    courseHtml += createCourseNode(courses[i]);
                }
                courseList.innerHTML = courseHtml;

                totalPage = courseData.totalPage;
                showIndicator(totalPage);
            }
        );
    };

    loadCourseData(options);

    // 页面指示器
    var pageIndicator = getElementsByClassName('page-indicator')[0];
    var indicators = pageIndicator.getElementsByTagName('li');
    var len = indicators.length;
    var changePage = function (index) {
        for (var i = 0; i < len; i++) {
            if (getClassList(indicators[i]).contains('selected')) {
                getClassList(indicators[i]).remove('selected');
            }
        }
        getClassList(indicators[index]).add('selected');
        options.pageNo = index;
        loadCourseData(options);
    };
    for (var i = 0; i < len; i++) {
        (function (i) {
            EventUtils.addHandler(indicators[i], 'click', function () {
                changePage(i);
            });
        })(i);
    }
    EventUtils.addHandler(document.getElementById('prev'), 'click', function () {
        options.pageNo > 0 ? options.pageNo-- : options.pageNo = 0;
        changePage(options.pageNo);
    });
    EventUtils.addHandler(document.getElementById('next'), 'click', function () {
        options.pageNo < len - 1 ? options.pageNo++ : options.pageNo = len - 1;
        changePage(options.pageNo);
    });

    // 根据窗口大小切换布局
    EventUtils.addHandler(window, 'resize', function () {
        if (document.body.clientWidth >= 1205) {
            options.psize = 20;
            loadCourseData(options);
        } else {
            options.psize = 15;
            loadCourseData(options);
        }
    });

    // tab切换课程
    var tab1 = getElementsByClassName('left-title')[0];
    var tab2 = getElementsByClassName('left-title')[1];
    EventUtils.addHandler(tab1, 'click', function () {
        if (getClassList(tab2).contains('selected')) {
            getClassList(tab2).remove('selected');
        }
        if (!getClassList(tab1).contains('selected')) {
            getClassList(tab1).add('selected');
            options.type = 10;
            loadCourseData(options);
        }
    });
    EventUtils.addHandler(tab2, 'click', function () {
        if (getClassList(tab1).contains('selected')) {
            getClassList(tab1).remove('selected');
        }
        if (!getClassList(tab2).contains('selected')) {
            getClassList(tab2).add('selected');
            options.type = 20;
            loadCourseData(options);
        }
    });

})();


// 视频介绍
(function () {
    var ele = getElementsByClassName('video-intr')[0];
    var videoImg = ele.getElementsByTagName('img')[0];
    var mask = getElementsByClassName('mask')[0];
    var videoPlayer = document.getElementById('video-player');
    EventUtils.addHandler(videoImg, 'click', function () {
        getClassList(getElementsByClassName('player')[0]).remove('hide');
        getClassList(mask).remove('hide');
    });
    EventUtils.addHandler(document.getElementById('close-video'), 'click', function () {
        getClassList(getElementsByClassName('player')[0]).add('hide');
        videoPlayer.pause();
        getClassList(mask).add('hide');
    });
})();

// 登录
(function () {
    var followBtn = document.getElementById('followBtn');
    var unfollowBtn = document.getElementById('hasFollow');
    var login = getElementsByClassName('login')[0];
    var mask = getElementsByClassName('mask')[0];
    EventUtils.addHandler(followBtn, 'click', function () {
        if (!CookieUtils.get('loginSuc')) {
            getClassList(login).add('show');
            getClassList(mask).remove('hide');
        } else {
            getClassList(login).remove('show');
            getClassList(mask).add('hide');
            getClassList(followBtn).add('hide');
            getClassList(unfollowBtn).add('show');
            follow();
        }
    });
    EventUtils.addHandler(document.getElementById('closeLogin'), 'click', function () {
        getClassList(login).remove('show');
        getClassList(mask).add('hide');
    });

    var userNameInput = document.getElementById('userName');
    var passwordInput = document.getElementById('password');
    var loginButton = document.getElementById('loginButton');
    function follow() {
        doGet(
            'http://study.163.com/webDev/attention.htm',
            {},
            function (responseText) {
                if (responseText == 1) {
                    // 关注成功
                    getClassList(followBtn).add('hide');
                    getClassList(unfollowBtn).add('show');
                    CookieUtils.set('followSuc', 'followSuc', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
                } else {
                    alert('关注失败');
                }
            }
        );
    }
    EventUtils.addHandler(loginButton, 'click', function () {
        doGet(
            'http://study.163.com/webDev/login.htm',
            {
                userName: MD5(userNameInput.value),
                password: MD5(passwordInput.value)
            },
            function (responseText) {
                if (responseText == 1) {
                    // 登录成功
                    getClassList(login).remove('show');
                    getClassList(mask).add('hide');
                    CookieUtils.set('loginSuc', 'loginSuc', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
                    follow();
                } else {
                    // 登录失败
                    alert('用户名或密码不正确');
                }
            }
        );
    });
    EventUtils.addHandler(unfollowBtn, 'click', function (event) {
        if (event.target == document.getElementById('unfollow')) {
            getClassList(followBtn).remove('hide');
            getClassList(unfollowBtn).remove('show');
            CookieUtils.set('followSuc', 'followSuc', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        }
    });
    if (CookieUtils.get('followSuc')) {
        getClassList(followBtn).add('hide');
        getClassList(unfollowBtn).add('show');
    } else {
        getClassList(followBtn).remove('hide');
        getClassList(unfollowBtn).remove('show');
    }
})();