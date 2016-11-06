/**
 * Created by panyong on 2016/10/18.
 */


//数据查询模块
//事件操作模块
//补充模块

var $$ = function () {};

$$.prototype = {
    //去除字符串当中的空格
    //去左边空格
    ltrim: function (str) {
      return str.replace(/(^\s*)/g, '');
    },
    //去除右边空格
    rtrim: function (str) {
        return str.replace(/(\s*$)/g, '');
    },
    //去除字符串中所有的空格
    trim: function (str) {
      return str.replace(/(\s*)/g, '');
    },
    //去除字符串左右的空格
    lrtrim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    },

    //数据解析方法(表示把一个数组里面的单个数据添加到另一个数组里面)
    $appendArray: function (disArray, srcArray) {
        for (var i = 0;i < srcArray.length;i++) {
            disArray.push(srcArray[i]);
        }
    },

    //类型判断模块
    //1. 类型为字符串
    $isString:function (str) {
        return typeof str === "string";
    },
    //2. 类型为数字
    $isNumber: function (num) {
        return typeof num === 'number' && isFinite(num); //is有限的Finite 表示是
    },
    //3.类型为布尔值boolean
    $isBoolean: function (bool) {
        return typeof bool === 'boolean';
    },
    //4.类型为 undefined
    $isUndefined: function (un) {
        return typeof  un === 'undefined';
    },
    //5. 类型为 null
    $isNull: function (nu) {
        return typeof nu === 'null';
    },
    //6.类型为数组Array()
    $isArray: function(arr) {
        if (this.$isNull(arr) || this.$isUndefined(arr)) {
            return false;
        }

        return arr.constructor === Array;
    },
    //7.类型为函数function
    $isObject: function (obj) {
        if (this.$isNull(obj) || this.$isUndefined(obj)) {
            return false;
        }

        return typeof obj === 'object';
    },
    //8.类型为HTMLCollection()
    $isHTMLCollection: function(arr) {
        if (this.$isNull(arr) || this.$isUndefined(arr)) {
            return false;
        }

        return arr.constructor === 'HTMLCollection';
    },

    //框架扩展方法 使用extend
    $extend: function (dis,src) { //dis表示要添加的目标 src表示添加的数据(比如对象)
        for (var attr in src) {
            dis[attr] = src[attr];
        }

        return dis;
    }
};

//这里的$$由之前的函数变成了对象
var $$ = new $$();

//为原型对象添加事件扩充方法
$$.$extend($$,{
    $: function (str) {
        switch (this.$type(str)) {
            case 'id':
                return $$.$id(str);
                break;
            case 'class':
                return $$.$class(str);
                break;
            case 'tag':
                return $$.$tag(str);
                break;
            default :
                return '无法查找';
        }
    },
    //数据查询方式
    $type: function (str) {
        if (str.match(/#/)) {
            return 'id';
        } else if (str.match(/\./)) {
            return 'class';
        } else {
            return 'tag';
        }
    },

    //以id查询的封装
    $id: function (idStr) {
        //移除id选择器前面的#
        var result = idStr.replace('#', '');
        //使用正则表达式来去除#
        //var result = idStr.replace(/#/, '');

        return document.getElementById(result);
    },

    //以class查询
    $class: function (classStr) {
        var result = classStr.replace(/./, '');

        return document.getElementsByClassName(result);
    },

    //以标签名查询
    $tag: function (tagStr) {
        return document.getElementsByTagName(tagStr);
    },

    //以name查询 ---> name查询主要用于表单元素
    $name: function (name) {
        return document.getElementsByName(name);
    },
    //以父节点查找子节点, 举例(div>p)
    $tab: function (tabStr) {
        //使用正则表达式的方式查找
        var array = tabStr.match(/\w+/g);
        //得到一个Dom元素
        var father = this.$tag(array[0]);
        //创建空数组接收子元素
        var result = [];
        var child = this.$tag(array[1]);
        for (var index = 0;index < child.length;index++) {
            if (child[index].parentNode == father[0]) {
                result.push(child[index]);
            }
        }
        return result;
    },

    //组查询 如div,#p,h1,.span
    $group: function (groupStr) {
        var result = groupStr.match(/([0-9A-Za-z#._-]+)/g);
        var array = [];

        /*for (var index = 0;index < result.length;index++) {
            if (result[index].match(/#/)) {
             array.push($$.$id(result[index]));
             } else if (result[index].match(/\./)) {

             //分离数组
             var temp = $$.$class(result[index]);
             for (var i = 0;i < temp.length;i++) {
             array.push(temp[i]);
             }
             } else {

             var temp1 = $$.$tag(result[index]);
             for (var i1 = 0;i1 < temp.length;i1++) {
             array.push(temp1[i1]);
             }
             }
        }*/
        //id class tag已经做过判断, 将代码用新方法重写如下
        for (var index = 0;index < result.length;index++) {
            switch (result[index]) {
                case 'id':
                    array.push($$.$id(result[index]));
                    break;
                case 'class':
                    $$.$appendArray(array, $$.$class(result[index]));
                    break;
                case 'tag':
                    $$.$appendArray(array, $$.$tag(result[index]));
                    break;
            }
        }
        return array;
    },

    //事件绑定
    onMany: function (str, type, func) {
        //这里给用户操作有两种方式: 1. 给条件 2. 给查询完的结果; 为了使用这个框架变得简单,优先选择让用户给条件, 然后得到结果
        //当用户给的是条件, 则需要进行下面的操作: 1). 如果条件是直接对象 2). 如果条件是字符串
      if ($$.$isObject(str)) {
          $$.on(str, type,  func);
      } else {
          var result = $$.$(str);

          if (!($$.$isArray(result) || $$.$isHTMLCollection(result))) {
              $$.on(result, type,  func);
          }

          for (var i = 0;i < result.length;i++) {
              $$.on(result[i], type,  func);
          }
      }
    },

    //事件绑定
    on: function (id, type, func) { //id可能是真正的对象, 也可能是字符串 type表示事件类型(如click) func事件的响应(就是要做的事儿)

        //判断id的类型, 找到真正的需要添加事件的对象
        //这里可以直接做成一个判断函数写在原对象里面, 不用写到扩展里面
        /*var result = typeof id === 'string';
        var dom = result ? this.$id(id) : id;*/
        //使用判断函数的形式
        var dom = this.$isString(id) ? this.$id(id) : id;

        //添加事件绑定(其实就是原生js当中的事件监听), 要先做浏览器兼容判断
        if(dom.addEventListener){
            dom.addEventListener(type,func);
        }
        //兼容IE
        if(dom.attachEvent) {
            dom.attachEvent('on' + type, func);
        }
    },

    //事件解绑
    un: function (id, type, func) {
        var dom = this.$isString(id) ? this.$id(id) : id;

        if(dom.removeEventListener){
            dom.removeEventListener(type,func);
        }
        //兼容IE
        if(dom.detachEvent) {
            dom.detachEvent('on' + type, func);
        }
    },

    //特征事件的封装(如单击 双击 三击...)

    click:function (id,func) {
        this.on(id,"click",func);
    },

    dblClick:function (id,func) {
        this.on(id,"dblclick",func);
    },

    triClick:function (id,func) {
        this.on(id,"triclick",func);
    },

    nClick: function (id, func) {

    }



    //鼠标事件
    //键盘事件
    //拖拽事件(onmousemove+onmousedown)
});

//css html attr 的设置

//json等数据获取模块

//ajax 等设置
$$.$extend($$,{
    myAjax:function(URL,func){
        var xhr = createXHR();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    func(xhr.responseText);
                }else{
                    alert("¥ÌŒÛµƒŒƒº˛£°");
                }
            }
        };
        xhr.open("get",URL,true);
        xhr.send();

        function createXHR() {
            if (typeof XMLHttpRequest != "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject != "undefined") {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
                            "MSXML2.XMLHttp"
                        ],
                        i, len;

                    for (i = 0, len = versions.length; i < len; i++) {
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex) {
                            //skip
                        }
                    }
                }

                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error("No XHR object available.");
            }
        }
    }
});