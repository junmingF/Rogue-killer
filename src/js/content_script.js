
//这一块就是对搜索结果进行处理了
blocklist.searchpage = {};

blocklist.searchpage.blocklist = [];//这里为什么搞成一个列表腻

//MutationObserver 用法总结( 监听节点、DOM变化 )
blocklist.searchpage.mutationObserver = null; 

blocklist.searchpage.pws_option = "off";
blocklist.searchpage.SEARCH_RESULT_DIV_BOXGOOGLE = "div.g";
blocklist.searchpage.SEARCH_RESULT_DIV_BOXBAIDU = "div.result";
blocklist.searchpage.SEARCH_RESULT_DIV_BOXBING ="li.b_algo";
blocklist.searchpage.SEARCH_RESULT_DIV_BOXSOGOU ="div.vrwrap";
//c-container
//选择所有直接属于有yuRUbf类的div元素的a元素
blocklist.searchpage.LINK_TAGGOOGLE = "div.yuRUbf > a"; 
blocklist.searchpage.LINK_TAGBAIDU = "h3.c-title > a";
blocklist.searchpage.LINK_TAGBING = "div.b_title > a";
blocklist.searchpage.LINK_TAGSOGOU = "h3.vr-title > a";

//处理获取blocklist的结果 相当于存在 blocklist.searchpage.blocklist = [] 里面
blocklist.searchpage.handleGetBlocklistResponse = function (response) {
  if (response.blocklist != undefined) {
    blocklist.searchpage.blocklist = response.blocklist;
  }
};

blocklist.searchpage.afterurl="";

//foo1是决定一开始modify里面的
async function foo1(url,searchResultPattern) {
  let finalurl=await blocklist.searchpage.fetch(url);
  finalurl = finalurl.replace(/"/g, '')
  var HostLinkPattern = blocklist.common.getHostNameFromUrl(finalurl)
  if (blocklist.searchpage.isHostLinkInBlocklist(HostLinkPattern)) {

    searchResultPattern.style.display = "none";//在的话就不显示
  } else { 

    blocklist.searchpage.insertAddBlockLinkInSearchResult( 
      searchResultPattern, HostLinkPattern); 
    //第一个参数是 div 模块  第二个参数是具体域名
  }
}

//foo2是决定一开始toggleSections里面的
async function foo2(url,searchResultPattern,pattern,display) {
  let finalurl=await blocklist.searchpage.fetch(url);
  finalurl = finalurl.replace(/"/g, '')
  //正则匹配 筛选域名
  var sectionLink = finalurl.replace(blocklist.common.HOST_REGEX, '$2');
  if (pattern === sectionLink) {
    searchResultPattern.style.display = display; // 
  }
}

blocklist.searchpage.modifySearchResults = function (parent_dom) {
  //意思是如果带pws（正则匹配结果不为空）就可以暂时停用
   if (blocklist.searchpage.isPwsFeatureUsed()) return;
    var pattern =window.location.href;//获得当前url的hostname
    if(pattern.includes('baidu')){
      var searchResultPatterns = parent_dom.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXBAIDU);
      /* earchResultPatterns  对所有结果的父节点进行处理*/
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        //一个一个来处理
        var searchResultPattern = searchResultPatterns[i];
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGBAIDU); 
        //先锁定 divg 在锁定里面有 url的
        if (searchResultHostLink) {
          //获取href属性的值
          var HostLinkHref = searchResultHostLink.getAttribute("href");
          foo1(HostLinkHref,searchResultPattern);
        }
      }
    }
    
    else if(pattern.includes('google')){
      var searchResultPatterns = parent_dom.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXGOOGLE);
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        var searchResultPattern = searchResultPatterns[i];
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGGOOGLE);
        if (searchResultHostLink) {
          var HostLinkHref = searchResultHostLink.getAttribute("href");
          var HostLinkPattern = blocklist.common.getHostNameFromUrl(HostLinkHref);
    
          if (blocklist.searchpage.isHostLinkInBlocklist(HostLinkPattern)) {
            searchResultPattern.style.display = "none";
          } else {
            blocklist.searchpage.insertAddBlockLinkInSearchResult(
              searchResultPattern, HostLinkPattern);
          }
        }
      }
    }
    else if(pattern.includes('bing')){
      var searchResultPatterns = parent_dom.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXBING);
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        var searchResultPattern = searchResultPatterns[i];
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGBING);
        if (searchResultHostLink) {
          var HostLinkHref = searchResultHostLink.getAttribute("href");
          var HostLinkPattern = blocklist.common.getHostNameFromUrl(HostLinkHref);
    
          if (blocklist.searchpage.isHostLinkInBlocklist(HostLinkPattern)) {
            searchResultPattern.style.display = "none";
          } else {
            blocklist.searchpage.insertAddBlockLinkInSearchResult(
              searchResultPattern, HostLinkPattern);
          }
        }
      }
    }
    else if(pattern.includes('sogou')){
      var searchResultPatterns = parent_dom.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXSOGOU);
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        var searchResultPattern = searchResultPatterns[i];
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGSOGOU);
        if (searchResultHostLink) {
          var HostLinkHref = searchResultHostLink.getAttribute("href");
          var HostLinkPattern = blocklist.common.getHostNameFromUrl(HostLinkHref);
    
          if (blocklist.searchpage.isHostLinkInBlocklist(HostLinkPattern)) {
            searchResultPattern.style.display = "none";
          } else {
            blocklist.searchpage.insertAddBlockLinkInSearchResult(
              searchResultPattern, HostLinkPattern);
          }
        }
      }
    }


}

blocklist.searchpage.toggleSections = function (pattern, display) {

    var href =window.location.href;//获得当前url的hostname
    if(href.includes('baidu')){
      var searchResultPatterns = document.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXBAIDU);
      //遍历搜索结果
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        var searchResultPattern = searchResultPatterns[i];
        //定义带有url的模块                             ,blocklist.searchpage.LINK_TAG
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGBAIDU);
    
        if (searchResultHostLink) {
          //提取出域名
           var HostLinkHref = searchResultHostLink.getAttribute("href");
           foo2(HostLinkHref,searchResultPattern,pattern,display);
        }
      }
    }
    else if(href.includes('google')){
      var searchResultPatterns = document.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXGOOGLE);
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        var searchResultPattern = searchResultPatterns[i];
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGGOOGLE);
        if (searchResultHostLink) {
          var HostLinkHref = searchResultHostLink.getAttribute("href");
          var sectionLink = HostLinkHref.replace(blocklist.common.HOST_REGEX, '$2');
          if (pattern === sectionLink) {
            searchResultPattern.style.display = display;
          }
        }
      }   
    }
    else if(href.includes('bing')){
      var searchResultPatterns = document.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXBING);
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        var searchResultPattern = searchResultPatterns[i];
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGBING);
        if (searchResultHostLink) {
          var HostLinkHref = searchResultHostLink.getAttribute("href");
          var sectionLink = HostLinkHref.replace(blocklist.common.HOST_REGEX, '$2');
          if (pattern === sectionLink) {
            searchResultPattern.style.display = display;
          }
        }
      }   
    }
    else if(href.includes('sogou')){
      var searchResultPatterns = document.querySelectorAll(blocklist.searchpage.SEARCH_RESULT_DIV_BOXSOGOU);
      for (let i = 0, length = searchResultPatterns.length; i < length; i++) {
        var searchResultPattern = searchResultPatterns[i];
        var searchResultHostLink = searchResultPattern.querySelector(blocklist.searchpage.LINK_TAGSOGOU);
        if (searchResultHostLink) {
          var HostLinkHref = searchResultHostLink.getAttribute("href");
          var sectionLink = HostLinkHref.replace(blocklist.common.HOST_REGEX, '$2');
          if (pattern === sectionLink) {
            searchResultPattern.style.display = display;
          }
        }
      }   
    }
}

//获取 真实url 请求
blocklist.searchpage.fetch = function(url){
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      type: "fetch", 
      urls: url
    }, response => {
      blocklist.searchpage.afterurl = response.url;
      resolve(blocklist.searchpage.afterurl);
    });
  })
};


//判断搜索结果在不在blocklist里面
blocklist.searchpage.isHostLinkInBlocklist = function (hostlink) {
  if (blocklist.searchpage.blocklist.indexOf(hostlink) != -1) {
    return true;
  } else {
    return false;
  }
};
//处理从搜索结果中添加到黑名单后 更新 Blocklist
blocklist.searchpage.handleAddBlocklistFromSerachResult = function (response) {
  if (response.blocklist != undefined) {
    blocklist.searchpage.blocklist = response.blocklist;
  }
};

//这里是在搜索结果下面设置一个添加功能，点击后展示已经成功添加黑名单
blocklist.searchpage.showAddBlocklistMessage = function (pattern, section) {
  let showMessage = document.createElement('div');
  showMessage.style.cssText = 'font-size:15px;background:#d8f7eb;padding:30px;margin:20px 0;box-sizing:border-box;';
  /* 不对呀，completely是以及拉黑完了 */
  showMessage.innerHTML = chrome.i18n.getMessage("completeBlocked", pattern);

  let cancelMessage = document.createElement('div');
  cancelMessage.classList.add("cancleBlock");
  cancelMessage.style.cssText = "cursor: pointer;margin-top:20px;font-size:16px;font-weight: 700; color: #0066c0;";
  cancelMessage.innerHTML = chrome.i18n.getMessage("cancleBlocked", pattern);
  //点击拉黑之后，还可以有个取消屏蔽功能，所以需要获取这个父节点的一些特征，所以会复杂很多
  cancelMessage.addEventListener("click", function (e) {
    blocklist.searchpage.removePatternFromBlocklists(pattern);
    blocklist.searchpage.removeBlockMessage(e.target.parentNode);
  }, false);
  /* showMessage.appendChild(cancelMessage)将cancelMessage作为showMessage的子节点添加。根据，let parent = section.parentNode;
   parent.insertBefore(showMessage, section);将showMessage插入到parent的子节点中，位于section之前 */
  showMessage.appendChild(cancelMessage);
  let parent = section.parentNode;
  parent.insertBefore(showMessage, section);

}

/* 给定一个元素elm，找到它的父元素，并从父元素中移除elm。这样，elm就不会再显示在网页上了 */
blocklist.searchpage.removeBlockMessage = function (elm) {
  elm.parentNode.removeChild(elm);
}

//在下面点击拉黑后的处理
blocklist.searchpage.removePatternFromBlocklists = function (pattern) {
  chrome.runtime.sendMessage({
    type: blocklist.common.DELETE_FROM_BLOCKLIST, //先发送删除请求
    pattern: pattern
  }, blocklist.searchpage.handleRemoveBlocklistFromSerachResult); //处理删除结果

  blocklist.searchpage.displaySectionsFromSearchResult(pattern); 
}

/* 处理结果后 更新黑名单 */ 
blocklist.searchpage.handleRemoveBlocklistFromSerachResult = function (response) {
  if (response.blocklist != undefined) {
    blocklist.searchpage.blocklist = response.blocklist;
  }
}

//与delete相对应，点击取消屏蔽后显示出来 
blocklist.searchpage.displaySectionsFromSearchResult = function (pattern) {
  blocklist.searchpage.toggleSections(pattern, "block");
}

//要删除某个pattern 具体调用的方法
blocklist.searchpage.deleteSectionsFromSearchResult = function (pattern) {
  blocklist.searchpage.toggleSections(pattern, "none");
};



//从搜索结果中添加黑名单，搜索结果模块最下面有个拉黑该域名按钮
blocklist.searchpage.addBlocklistFromSearchResult = function (hostlink, searchresult) {
  var pattern = hostlink;
  chrome.runtime.sendMessage({
    type: blocklist.common.ADD_TO_BLOCKLIST, //先发送请求更新黑名单
    pattern: pattern
  },
  blocklist.searchpage.handleAddBlocklistFromSerachResult);  //更新黑名单
  blocklist.searchpage.deleteSectionsFromSearchResult(pattern);  //把原来的div删除掉 //显示出来原来的结果
  blocklist.searchpage.showAddBlocklistMessage(pattern, searchresult); //展示添加完后的结果
};

//在每一个元素后面添加一个p，里面可以选择是否拉黑
blocklist.searchpage.insertAddBlockLinkInSearchResult = function (searchResult, hostlink) {
  var insertLink = document.createElement('p');
  insertLink.innerHTML = chrome.i18n.getMessage("addBlocklist", hostlink);
  insertLink.style.cssText =
    "color:#1a0dab;margin:0;text-decoration:underline;cursor: pointer;";
  searchResult.appendChild(insertLink);
  //点击拉黑以后的处理
  insertLink.addEventListener("click", function () {
    blocklist.searchpage.addBlocklistFromSearchResult(hostlink, searchResult);
  }, false);
};

//判断是否带有pws
blocklist.searchpage.isPwsFeatureUsed = function () {
  if (blocklist.searchpage.pws_option == "off") return false;
   //是否以&pws=0 或者 ？pws=0 结尾
  const PWS_REGEX = /(&|[?])pws=0/;
  return PWS_REGEX.test(location.href);
};


//修改搜索结果：

//刷新第一步，先获取blocklist 获取之后 处理结果:
blocklist.searchpage.refreshBlocklist = function () {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_BLOCKLIST
  },
    blocklist.searchpage.handleGetBlocklistResponse);
};

//获取pws的值
blocklist.searchpage.getPwsOption = function () {
  chrome.runtime.sendMessage({
    type: blocklist.common.GET_PWS_OPTION_VAL //发送请求 blocklist.common.GET_PWS_OPTION_VAL 2
  },
    blocklist.searchpage.handleGetPwsOptionResponse); //获得 pws value 后进行处理 3
}

//具体处理函数（获取后赋值） 使blocklist.searchpage.pws_option = response.pws_option 这些逻辑好奇怪！一定要这一信息传递么，全局变量不行么
blocklist.searchpage.handleGetPwsOptionResponse = function (response) {
  blocklist.searchpage.pws_option = response.pws_option;
}




/* 如果已经有一个变动观察器，就不做任何事；否则，就创建一个新的变动观察器，并给它一个回调函数，当发生变动时，就调用这个函数来修改搜索结果。
然后，选择一个元素作为目标，并设置一些配置选项，让变动观察器监视目标的子节点和后代节点的变化。 */
blocklist.searchpage.initMutationObserver = function () {
  if (blocklist.searchpage.mutationObserver != null) return;
  /* 用来创建一个新的变动观察器。给变动观察器一个匿名函数作为参数，这个函数接收一个变动数组作为参数，并调用另一个函数来修改搜索结果。
  这个匿名函数就是变动观察器的回调函数，它会在监视的目标发生变动时被执行 */

  blocklist.searchpage.mutationObserver = new MutationObserver(function ( mutations ) {
    blocklist.searchpage.modifySearchResultsAdded(mutations); 
    /* MutationObserver 对象的回调函数是在 MutationObserver 对象观察的节点发生变化时被调用的函数。
    回调函数接收一个参数，即 MutationRecord 对象的数组，该数组描述了发生的变化。回调函数的返回值是 undefined。 */
    //console.log('callback that runs when observer is triggered');
  });

/* 定义一个常量SEARCH_RESULTS_WRAP，它的值是一个CSS选择器，表示有center_colid的div元素；然后，使用document.querySelector
方法来选择这个元素，并把它赋值给一个变量target；接着，定义一个变量config，它的值是一个对象，
表示要监视目标的子节点和后代节点的变化；最后，使用变动观察器的observe方法来开始监视目标元素，并传入配置选项。 */
  var href =window.location.href;//获得当前url的hostname
  if(href.includes('baidu')){
    const SEARCH_RESULTS_WRAPBAIDU = "div#content_left";  /* ,SEARCH_RESULTS_WRAP */
    let target = document.querySelector(SEARCH_RESULTS_WRAPBAIDU);
    let config = { childList: true, subtree: true };
    blocklist.searchpage.mutationObserver.observe(target, config);
  }
  else if (href.includes('google')){
    const SEARCH_RESULTS_WRAPGOOGLE = "div#center_col";
    let target = document.querySelector(SEARCH_RESULTS_WRAPGOOGLE);
    let config = { childList: true, subtree: true };
    blocklist.searchpage.mutationObserver.observe(target, config);
  }
  else if (href.includes('bing')){
    const SEARCH_RESULTS_WRAPBING = "ol#b_results";
    let target = document.querySelector(SEARCH_RESULTS_WRAPBING);
    let config = { childList: true, subtree: true };
    blocklist.searchpage.mutationObserver.observe(target, config);
  }
  else if (href.includes('sogou')){
    const SEARCH_RESULTS_WRAPSOGOU = "div#wrapper";
    let target = document.querySelector(SEARCH_RESULTS_WRAPSOGOU);
    let config = { childList: true, subtree: true };
    blocklist.searchpage.mutationObserver.observe(target, config);
  }
}

/* 它用来修改添加的搜索结果。它的意思是，给定一个变动数组mutations，遍历每一个变动对象mutation；
然后，获取变动对象的添加节点数组nodes；如果添加节点的长度不等于3，就跳过这个变动对象；然后，
获取添加节点中的第二个元素div_tag；如果这个元素不是一个div标签，就跳过这个变动对象；然后，获取这个元素的父节点n
ew_srp_div；如果这个节点的id不符合一个正则表达式，就跳过这个变动对象；最后，调用另一个函数来修改搜索结果，并传入这个节点作为参数。 */
blocklist.searchpage.modifySearchResultsAdded = function (mutations) {
  for (let i = 0; i < mutations.length; i++) {
    let mutation = mutations[i];
    let nodes = mutation.addedNodes;//获取突变对象的nodelist
    if (nodes.length !== 3) continue; //为什么等于3要跳过呢
    let div_tag = nodes[1];
    if (div_tag.tagName !== "DIV") continue;
    //div_tag 是一个 DOM 元素。这行代码的意思是将 new_srp_div 变量设置为 div_tag 元素的父节点
    let new_srp_div = div_tag.parentNode;
    if (!(/arc-srp_([0-9]+)/).test(new_srp_div.id)) continue;
    /* 匹配字符串中的 /arc-srp_ 后面跟着一个或多个数字的部分。例如，它可以匹配 /arc-srp_123 
    或 /arc-srp_4567，但不能匹配 /arc-srp_ 或 /arc-srp_abc。 */
    blocklist.searchpage.modifySearchResults(new_srp_div);
  };
}


blocklist.searchpage.refreshBlocklist();// 刷新blocklist
blocklist.searchpage.getPwsOption();//获取pws选项 1



//触发顺序不同 DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
   
   blocklist.searchpage.initMutationObserver(); //初始化搜索结果
   blocklist.searchpage.modifySearchResults(document);
  
   //修改搜索结果
}, false);//false 表示在冒泡阶段处理 

