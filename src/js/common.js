let blocklist = {};
blocklist.common = {};
/* blocklist是一个变量，它被赋值为一个空对象{}。blocklist.common也是一个变量，它是blocklist对象的一个属性，也被赋值为一个空对象{}。
这样做的目的可能是为了给blocklist对象添加一些分类或者功能，比如blocklist.common可以存储一些常见的屏蔽词或者规则 */
blocklist.common.pws_option_val = "off"; //pws值相当于使用该插件的开关 当搜索时需要查询该值
blocklist.common.GET_BLOCKLIST = 'getBlocklist'; //对于获取黑名单列表的响应
blocklist.common.ADD_TO_BLOCKLIST = 'addToBlocklist';//添加黑名单
blocklist.common.ADD_LIST_TO_BLOCKLIST = 'addListToBlocklist';//批量添加一整个文本进入黑名单的功能
blocklist.common.DELETE_FROM_BLOCKLIST = 'deleteFromBlocklist';//移除黑名单
blocklist.common.GET_PWS_OPTION_VAL = "getPwsOptionVal";//获取pws值
blocklist.common.CHANGE_PWS_OPTION_VAL = "changePwsOptionVal";//改变pws值
blocklist.common.UPDATE="updateBlocklist"
blocklist.common.FETCH = "fetch"// 获取跳转url
//创建一个正则表达式对象，用于转化url为域名
blocklist.common.HOST_REGEX = new RegExp(
  '^https?://(www[.])?([0-9a-zA-Z.-]+).*$');

//启动黑名单监听
blocklist.common.startBackgroundListeners = function () {
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      //请求类型为 blocklist.common.GET_BLOCKLIST = 'getBlocklist' 获取blocklist 对应处理
      if (request.type == blocklist.common.GET_BLOCKLIST) {
        console.log(localStorage['blocklist_pws_option']); //为什么要输出这个 blocklist_pws_option 呢？
        let blocklistPatterns = []; //先自定义一个列表
        if (!localStorage.blocklist) {  
          localStorage['blocklist'] = JSON.stringify(blocklistPatterns); 
        } else {
          blocklistPatterns = JSON.parse(localStorage['blocklist']);
        }
        /* 检查本地存储中是否有 blocklist 这个键，如果没有，就把 blocklistPatterns 这个变量的值转换成 JSON 格式并存储在本地存储中；
        如果有，就把本地存储中的 blocklist 的值解析成 JavaScript 对象并赋给 blocklistPatterns 这个变量 */
        sendResponse({
          blocklist: blocklistPatterns
        });//发送回复 一个json对象
      } else if (request.type == blocklist.common.ADD_TO_BLOCKLIST) { //如果请求的是 blocklist.common.ADD_TO_BLOCKLIST = 'addToBlocklist';
        let blocklists = JSON.parse(localStorage['blocklist']); //还是先获取存储的blocklist 
        if (blocklists.indexOf(request.pattern) == -1) { //如果遍历完发现没有 request.pattern 
          blocklists.push(request.pattern); //把 request.pattern 加进去
          blocklists.sort();
          localStorage['blocklist'] = JSON.stringify(blocklists); //更新blocklist
        }
        sendResponse({
          success: 1,
          pattern: request.pattern
        });
      /* 接收一个请求对象，然后把请求对象中的 pattern 属性的值添加到本地存储中的 blocklist 这个键对应的数组中，
      如果数组中没有这个值的话。然后把数组按字母顺序排序，并转换成 JSON 格式存储在本地存储中。
      最后发送一个响应对象，包含 success 和 pattern 两个属性。 */
      
      //这里表示使用列表添加黑名单
      } else if (request.type == blocklist.common.ADD_LIST_TO_BLOCKLIST) { 
        //(\r\n|\n)?表示匹配零个或多个(\r\n|\n)，也就是说，可以匹配\r\n、\n、\r\n\r\n、\n\n等等。这样可以适应不同操作系统中换行符的差异
        //let regex = /(https?:\/\/)?(www[.])?([0-9a-zA-Z.-]+)(\r\n|\n)?/g;
        let regex = /(https?:\/\/)?(www[.])?([0-9a-zA-Z.-]+).*(\r\n|\n)?/g;
        // alert(request.pattern)
        let arr = [];
        while ((m = regex.exec(request.pattern)) !== null) {
          arr.push(m[3]);
        }
        let blocklists = JSON.parse(localStorage['blocklist']);
        for (let i = 0, length = arr.length; i < length; i++) {
          if (blocklists.indexOf(arr[i]) == -1) {
            blocklists.push(arr[i]);
          }
        }
        blocklists.sort();
        localStorage['blocklist'] = JSON.stringify(blocklists);
        sendResponse({
          success: 1,
          pattern: request.pattern
        });
         //使用 JSON.stringify() 方法将 JavaScript 对象转换为字符串。
         //移除黑名单
      } else if (request.type == blocklist.common.DELETE_FROM_BLOCKLIST) {
        let blocklists = JSON.parse(localStorage['blocklist']);
        let index = blocklists.indexOf(request.pattern);
        if (index != -1) {
          blocklists.splice(index, 1);
          localStorage['blocklist'] = JSON.stringify(blocklists);
          sendResponse({
            pattern: request.pattern
          });
        }
        /* 接收一个请求对象，然后检查本地存储中是否有 blocklist_pws_option 这个键，如果没有，就把它的值设为 “off”。
        然后发送一个响应对象，包含 pws_option 这个属性，它的值就是本地存储中的 blocklist_pws_option 的值。 */
      } else if (request.type == blocklist.common.GET_PWS_OPTION_VAL) {
        if (!localStorage.blocklist_pws_option)
          localStorage['blocklist_pws_option'] = "off";

        sendResponse({
          pws_option: localStorage['blocklist_pws_option']
        });

        /* 接收一个请求对象，然后把本地存储中的 blocklist_pws_option 这个键的值设为请求对象中的 val 属性的值。
        然后发送一个响应对象，包含 pws_option 这个属性，它的值就是请求对象中的 val 属性的值。
        感觉这两个部分是和什么时候不屏蔽有关的，具体再看看后面的语法 */
      } else if (request.type == blocklist.common.CHANGE_PWS_OPTION_VAL) { 
        localStorage['blocklist_pws_option'] = request.val;
        /* 这里相当于再发一个回复回去，在manager页面修改回结果，没什么必要呀我觉得... */
        sendResponse({
          pws_option: request.val
        });
        /* 更新url模块 */
      } else if(request.type ==blocklist.common.UPDATE){
        var xmlhttp;
        xmlhttp=new XMLHttpRequest();
        xmlhttp.onreadystatechange=function()
        {
          if (xmlhttp.readyState==4 && xmlhttp.status==200)
          {
            xmlDoc=xmlhttp.responseText;
            //alert(xmlDoc) 
            txt=JSON.parse(xmlDoc)
            alert("已成功同步Rogue killer最新黑名单")
            let regex = /(https?:\/\/)?(www[.])?([0-9a-zA-Z.-]+).*/;
            let linshi = [];
            for(let j=0;j<txt.length;j++) {
              //alert(txt[j].username)
              //url=JSON.stringify(txt[j].username);
              //alert(txt[j].username)
              m = regex.exec(txt[j].username)
             // alert(m[3])
              linshi.push(m[3]);
            };
            let blocklist = JSON.parse(localStorage['blocklist']);
            for (let i = 0, length = linshi.length; i < length; i++) {
              if (blocklist.indexOf(linshi[i]) == -1) {
                blocklist.push(linshi[i]);
              }
            }
            blocklist.sort();
            localStorage['blocklist'] = JSON.stringify(blocklist);
          }
        }
        xmlhttp.open("GET","http://localhost:8088/test",true);
        xmlhttp.send();
      }
      else if (request.type ==blocklist.common.FETCH ){
        
        let myHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain'
        });
        var tem= "";
        async function geturl(){
            let res = await fetch(request.urls,{
                headers: myHeaders,
                mode: 'cors'
            })     
            tem = res.url
            tem=JSON.stringify(tem)
            await sent ()
        };
        function sent(){
            sendResponse({
                url:tem
            });
        }
        geturl();
        return true;
      }
    }
  )

};

//获取根据url获得hostname  用正则表达式blocklist.common.HOST_REGEX匹配pattern，并返回匹配结果的第二个分组
blocklist.common.getHostNameFromUrl = function (pattern) {
  return pattern.replace(blocklist.common.HOST_REGEX, '$2');
}

//本身就是个监听函数，前面定义，这里启动
blocklist.common.startBackgroundListeners();


//监听是否浏览黑名单
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    //console.log(details.url);
    var url= blocklist.common.getHostNameFromUrl(details.url)
    var arr=JSON.parse(localStorage['blocklist'])
    if (arr.includes(url) ) {
        var notifyOptions = {
          // type:basic,imge,simple,list
          type: 'basic',
          title: '提示',
          iconUrl: '../images/icon.png',
          message: '你正在预览危险网站'+url,
      }
      chrome.notifications.create('Notify',notifyOptions)
   
  }
  },
  {urls: ["<all_urls>"]}
);


