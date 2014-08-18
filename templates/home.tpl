<div class="container">

  <div class="primary">
    
    {{ if img }}
      <div class="mod mod-fresh-pageheader">
        <a href="{{img.href}}" title="{{img.text}}">
          <img src="{{ img.src }}" title="{{ img.text }}" />
          <span class="custom">{{img.text}}</span>
        </a>
      </div>
    {{ /if }}
    
    <div class="mod mod-fresh-goods">
      <div class="mod-title">
        <h3>在这里我可以干点啥？</h3>
      </div>
      <div class="row">
        <ul class="list">
          {{ each goods as g index }}
            <li><a href="url_for('board', boardname=g[1])" title="到 g[1] 版">{{g[0]}}</a></li>
          {{ /each }}
        </ul>
      </div>
      <div class="row">
        <a class="more" href="#" title="查看全部看版">> 更多有意思的...</a>
      </div>
      <hr/>
    </div>

    <div class="mod mod-fresh-freshlist">
      <div class="mod-title">
        <h3>阅读新鲜话题</h3>
      </div>
      {{ each fresh as bs index }}
        <div class="fresh item">
          <div class="col-left">
            <span class="boardname">{{bs.boardname}}</span>
          </div>
          <div class="col-main posts">
            {{ each bs.posts as p }}
              {{ if loop.index == 4 }}
                <div class="more"><a href="#">查看被折叠的话题</a></div>
                <div class="posts-more">
              {{ /if }}
              <div class="post item">
                <div class="col-main">
                  <span></span>
                  <a class="title text" href="{{url_for('topic', tid=p.tid)}}" title="{{p.title}}">{{p.title}}</a>
                </div>
                <span class="col-right text-alt time">{{p.lastupdate|nicetime}}</span>
              </div>
            {{ /each }}
            <hr/>
            {{ if bs.posts|length > 3 }}
                </div>
            {{ /if }}
          </div>
        </div>
      {{ /each }}
      <a href="#" class="loadmore">查看较老的话题</a>
    </div>
  </div>

  <div class="aside">

    <div class="widgets">

      <div class="mod mod-fresh-self">
        <div class="col-left">
        </div>
        <div class="col-main">
          <img class="avatar" src="{{url_for('avatar', userid())}}" title="{{userid}}"/>
          <a class="userid text" href=""{{url_for('user', userid())}}" title="{{userid}}">{{userid}}</a><br/>
          <span class="score text-alt">贡献值： <em>233</em> </span>
        </div>
        <div class="row detail text-alt">
          <span>发起 <em class="text">1</em> </span>
          <span>回复 <em class="text">1</em> </span>
          <span class="last">关注 <em class="text">1</em> </span>
        </div>
        <hr/>    
      </div>
      
    </div>
  </div>
</div>
