/**
 * 禁果短剧 ForwardWidget
 * 站点: https://jinguoduanju.app
 * 分类：navigationId（官方剧场导航）+ 本地 tags 过滤
 * 宣传: https://t.me/nostremby
 */
WidgetMetadata = {
  id: "forward.jinguoduanju.tut",
  title: "禁果短剧",
  version: "1.1.1",
  requiredVersion: "0.0.1",
  description: "禁果短剧：热度/最新/官方导航分类/标签/搜索/分集播放 | 宝宝巴士乐园 t.me/nostremby",
  author: "宝宝巴士",
  site: "https://t.me/nostremby",
  detailCacheDuration: 180,
  globalParams: [
    {
      name: "apiBase",
      title: "API 地址",
      type: "input",
      value: "https://jinguoduanju.app"
    }
  ],
  modules: [
    { id: "heat", title: "热度", functionName: "loadHeat", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "latest", title: "最新", functionName: "loadLatest", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "landing", title: "首页推荐", functionName: "loadLanding", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "nav_all", title: "全部", functionName: "loadNavAll", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "nav_original", title: "原创精品", functionName: "loadNavOriginal", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "nav_single", title: "单体作品", functionName: "loadNavSingle", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "nav_anime", title: "动漫改编", functionName: "loadNavAnime", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "nav_movie", title: "影视改编", functionName: "loadNavMovie", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "len_multi", title: "多集", functionName: "loadLenMulti", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "len_single", title: "单集", functionName: "loadLenSingle", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "tag_mogai", title: "魔改", functionName: "loadTagMogai", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "tag_dushi", title: "都市", functionName: "loadTagDushi", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "tag_zhichang", title: "职场", functionName: "loadTagZhichang", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "tag_qihuan", title: "奇幻", functionName: "loadTagQihuan", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "tag_guzhuang", title: "古装", functionName: "loadTagGuzhuang", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    { id: "tag_dongman", title: "动漫", functionName: "loadTagDongman", cacheDuration: 300, params: [{ name: "page", title: "页码", type: "page" }] },
    {
      id: "loadResource",
      title: "播放资源",
      functionName: "loadResource",
      type: "stream",
      cacheDuration: 0,
      params: []
    }
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input" },
      { name: "page", title: "页码", type: "page" }
    ]
  }
};

var UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
var _token = "";
var _deviceId = "";
var PAGE_SIZE = 24;

function t(v) {
  return String(v == null ? "" : v).trim();
}

function cfg(params) {
  params = params || {};
  return {
    apiBase: t(params.apiBase || "https://jinguoduanju.app").replace(/\/+$/, "")
  };
}

function qs(obj) {
  var parts = [];
  Object.keys(obj || {}).forEach(function (k) {
    var v = obj[k];
    if (v == null || v === "") return;
    if (Array.isArray(v)) {
      for (var i = 0; i < v.length; i++) {
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v[i])));
      }
    } else {
      parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
    }
  });
  return parts.length ? "?" + parts.join("&") : "";
}

function absUrl(base, u) {
  u = t(u);
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.indexOf("//") === 0) return "https:" + u;
  return base + (u.charAt(0) === "/" ? "" : "/") + u;
}

function randDevice() {
  var s = "";
  var hex = "0123456789abcdef";
  for (var i = 0; i < 32; i++) s += hex.charAt((Math.random() * 16) | 0);
  return s;
}

async function ensureToken(c) {
  if (_token) return _token;
  if (!_deviceId) _deviceId = randDevice();
  var url = c.apiBase + "/api/v1/auth/device";
  var body = {
    deviceId: "h5:" + _deviceId,
    channelCode: "",
    attributionToken: ""
  };
  var headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": UA,
    Referer: c.apiBase + "/",
    Origin: c.apiBase
  };
  var res = null;
  var d = null;
  if (Widget.http.post) {
    try {
      res = await Widget.http.post(url, body, { headers: headers });
      d = res && res.data;
    } catch (e) {}
  }
  if ((!d || !d.token) && Widget.http.request) {
    res = await Widget.http.request({
      url: url,
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });
    d = res && res.data;
  }
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch (e) {}
  }
  _token = t(d && d.token);
  if (!_token) throw new Error("设备登录失败");
  return _token;
}

async function apiGet(c, path, query, retry) {
  await ensureToken(c);
  var url = c.apiBase + "/api/v1" + path + qs(query || {});
  var headers = {
    Accept: "application/json",
    "User-Agent": UA,
    Referer: c.apiBase + "/",
    Origin: c.apiBase,
    Authorization: "Bearer " + _token
  };
  var res = await Widget.http.get(url, { headers: headers });
  var d = res && res.data;
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch (e) {}
  }
  if (d && d.status === 401 && !retry) {
    _token = "";
    return apiGet(c, path, query, true);
  }
  return d;
}

function pageSlice(arr, page) {
  page = Number(page || 1) || 1;
  if (!Array.isArray(arr)) return [];
  var start = (page - 1) * PAGE_SIZE;
  return arr.slice(start, start + PAGE_SIZE);
}

function toItem(c, it) {
  if (!it) return null;
  var id = t(it.id);
  if (!id) return null;
  var cover = absUrl(c.apiBase, it.coverUrl || it.cover || "");
  var ep = it.episodeCount || "";
  var remark = ep ? "全" + ep + "集" : "";
  var tags = Array.isArray(it.tags) ? it.tags.join(" · ") : "";
  if (tags) remark = remark ? remark + " · " + tags : tags;
  return {
    id: "jgdj:" + id,
    type: "url",
    title: t(it.title) || id,
    coverUrl: cover,
    posterPath: cover,
    backdropPath: cover,
    description: remark,
    mediaType: "tv",
    link: "jgdj:" + id
  };
}

function mapList(c, arr) {
  var out = [];
  for (var i = 0; i < (arr || []).length; i++) {
    var it = toItem(c, arr[i]);
    if (it) out.push(it);
  }
  return out;
}

/**
 * query:
 *  sort, navigationId, length
 *  _tagFilter: 本地 tags 精确匹配（服务端 tags 参数会 400）
 */
async function loadDramas(params, query) {
  params = params || {};
  var c = cfg(params);
  var page = Number(params.page || 1) || 1;
  var q = Object.assign({ sort: "latest" }, query || {});
  var tagFilter = q._tagFilter || "";
  delete q._tagFilter;
  var list = await apiGet(c, "/dramas", q);
  if (!Array.isArray(list)) list = [];
  if (tagFilter) {
    var filtered = [];
    for (var i = 0; i < list.length; i++) {
      var tags = list[i].tags || [];
      var hit = false;
      if (Array.isArray(tags)) {
        for (var j = 0; j < tags.length; j++) {
          if (String(tags[j]) === tagFilter) {
            hit = true;
            break;
          }
        }
      }
      if (hit) filtered.push(list[i]);
    }
    list = filtered;
  }
  return mapList(c, pageSlice(list, page));
}

async function loadHeat(params) {
  return loadDramas(params, { sort: "heat" });
}
async function loadLatest(params) {
  return loadDramas(params, { sort: "latest" });
}

async function loadLanding(params) {
  params = params || {};
  var c = cfg(params);
  var page = Number(params.page || 1) || 1;
  var data = await apiGet(c, "/landing");
  var list = (data && data.dramas) || [];
  return mapList(c, pageSlice(list, page));
}

// 官方剧场导航 navigationId（实测内容不同）
async function loadNavAll(params) {
  return loadDramas(params, { sort: "latest", navigationId: 2 });
}
async function loadNavOriginal(params) {
  return loadDramas(params, { sort: "latest", navigationId: 7 });
}
async function loadNavSingle(params) {
  return loadDramas(params, { sort: "latest", navigationId: 3 });
}
async function loadNavAnime(params) {
  return loadDramas(params, { sort: "latest", navigationId: 6 });
}
async function loadNavMovie(params) {
  return loadDramas(params, { sort: "latest", navigationId: 5 });
}

// 长度
async function loadLenMulti(params) {
  return loadDramas(params, { sort: "latest", length: "multi" });
}
async function loadLenSingle(params) {
  return loadDramas(params, { sort: "latest", length: "single" });
}

// 标签（本地过滤）
async function loadTagMogai(params) {
  return loadDramas(params, { sort: "latest", _tagFilter: "魔改" });
}
async function loadTagDushi(params) {
  return loadDramas(params, { sort: "latest", _tagFilter: "都市" });
}
async function loadTagZhichang(params) {
  return loadDramas(params, { sort: "latest", _tagFilter: "职场" });
}
async function loadTagQihuan(params) {
  return loadDramas(params, { sort: "latest", _tagFilter: "奇幻" });
}
async function loadTagGuzhuang(params) {
  return loadDramas(params, { sort: "latest", _tagFilter: "古装" });
}
async function loadTagDongman(params) {
  return loadDramas(params, { sort: "latest", _tagFilter: "动漫" });
}

async function search(params) {
  params = params || {};
  var c = cfg(params);
  var kw = t(params.keyword);
  if (!kw) return [];
  var page = Number(params.page || 1) || 1;
  var list = await apiGet(c, "/dramas", { sort: "latest", q: kw });
  if (!Array.isArray(list)) list = [];
  return mapList(c, pageSlice(list, page));
}

function parseLink(link) {
  var s = t(link).replace(/^jinguo:/, "jgdj:");
  if (s.indexOf("jgdj:") === 0) s = s.slice(5);
  var parts = s.split(":");
  return { id: t(parts[0]), ep: t(parts[1] || "") };
}

async function loadDetail(link) {
  var p = parseLink(link);
  if (!p.id) return null;
  var c = cfg({});
  var data = await apiGet(c, "/dramas/" + encodeURIComponent(p.id));
  var drama = (data && data.drama) || {};
  var eps = (data && data.episodes) || [];
  var cover = absUrl(c.apiBase, drama.coverUrl || "");
  var episodeItems = [];
  for (var i = 0; i < eps.length; i++) {
    var ep = eps[i];
    var n = ep.number || i + 1;
    var epLink = "jgdj:" + p.id + ":" + n + ":" + t(ep.id);
    episodeItems.push({
      id: epLink,
      type: "url",
      title: t(ep.title || "第" + n + "集"),
      mediaType: "tv",
      seasonNumber: 1,
      episodeNumber: Number(n) || i + 1,
      link: epLink,
      videoUrl: "",
      playerType: "app"
    });
  }
  if (!episodeItems.length) {
    episodeItems.push({
      id: "jgdj:" + p.id + ":1",
      type: "url",
      title: "第1集",
      mediaType: "tv",
      seasonNumber: 1,
      episodeNumber: 1,
      link: "jgdj:" + p.id + ":1",
      videoUrl: "",
      playerType: "app"
    });
  }

  // 预填播放地址，支持自动切集
  var warmN = Math.min(episodeItems.length, 40);
  for (var wi = 0; wi < warmN; wi++) {
    try {
      var linkW = String(episodeItems[wi].link || "");
      var sW = linkW.replace(/^jgdj:/, "").replace(/^jinguo:/, "");
      var partsW = sW.split(":");
      var epNumW = partsW[1] || String(episodeItems[wi].episodeNumber || wi + 1);
      var episodeIdW = partsW[2] || "";
      if (!episodeIdW) episodeIdW = await resolveEpisodeId(c, p.id, epNumW);
      if (!episodeIdW) continue;
      var playW = await apiGet(c, "/episodes/" + encodeURIComponent(episodeIdW) + "/play");
      var urlW = t((playW && playW.videoUrl) || "");
      if (urlW) {
        episodeItems[wi].videoUrl = urlW;
        episodeItems[wi].customHeaders = {
          "User-Agent": UA,
          Referer: c.apiBase + "/",
          Origin: c.apiBase,
          "X-Forward-Skip-Redirect-Probe": "1"
        };
      }
    } catch (eW) {}
  }

  var tags = Array.isArray(drama.tags) ? drama.tags.join(" · ") : "";
  return {
    id: "jgdj:" + p.id,
    type: "url",
    title: t(drama.title || p.id),
    coverUrl: cover,
    posterPath: cover,
    backdropPath: cover,
    description: t(data.description || tags || ""),
    mediaType: "tv",
    link: "jgdj:" + p.id,
    episodeItems: episodeItems
  };
}

async function resolveEpisodeId(c, dramaId, epNum) {
  var data = await apiGet(c, "/dramas/" + encodeURIComponent(dramaId));
  var eps = (data && data.episodes) || [];
  for (var i = 0; i < eps.length; i++) {
    if (String(eps[i].number) === String(epNum) || String(eps[i].id) === String(epNum)) {
      return t(eps[i].id);
    }
  }
  return eps.length ? t(eps[0].id) : "";
}

async function loadResource(params) {
  params = params || {};
  var c = cfg(params);
  var raw = t(params.link || params.id || "");
  var s = raw.replace(/^jinguo:/, "jgdj:");
  if (s.indexOf("jgdj:") === 0) s = s.slice(5);
  var parts = s.split(":");
  var dramaId = t(parts[0]);
  var epNum = t(parts[1] || "1") || "1";
  var episodeId = t(parts[2] || "");
  if (!dramaId) return [];
  if (!episodeId) {
    episodeId = await resolveEpisodeId(c, dramaId, epNum);
  }
  if (!episodeId) return [];
  var play = await apiGet(c, "/episodes/" + encodeURIComponent(episodeId) + "/play");
  var url = t((play && play.videoUrl) || "");
  if (!url) return [];
  return [
    {
      name: "禁果",
      description: "第" + epNum + "集",
      url: url,
      playerType: "app",
      customHeaders: {
        "User-Agent": UA,
        Referer: c.apiBase + "/",
        Origin: c.apiBase,
        "X-Forward-Skip-Redirect-Probe": "1"
      }
    }
  ];
}
