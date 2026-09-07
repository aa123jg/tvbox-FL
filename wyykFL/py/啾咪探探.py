# -*- coding: utf-8 -*-
"""
啾咪探探 Spider - 适配 papapa.ggmimicc.top
苹果CMS, 服务端渲染, 图片未加密, 播放地址直链
"""
import sys, json, re
from html import unescape

sys.path.append('..')

try:
    from base.spider import Spider
except ImportError:
    import requests as rq
    class Spider:
        def fetch(self, url, headers=None, **kw):
            kw.pop('timeout', None)
            r = rq.get(url, headers=headers, timeout=15, **kw)
            r.encoding = 'utf-8'
            return r


class Spider(Spider):
    HOSTS = [
        "https://papapa.ggmimicc.top",
    ]
    HOST = HOSTS[0]

    CATEGORIES = [
        {"type_id": "49", "type_name": "国产情色"},
        {"type_id": "50", "type_name": "日本无码"},
        {"type_id": "51", "type_name": "日本有码"},
        {"type_id": "52", "type_name": "中文字幕"},
        {"type_id": "53", "type_name": "欧美极品"},
        {"type_id": "54", "type_name": "动漫精品"},
        {"type_id": "55", "type_name": "强奸乱伦"},
        {"type_id": "56", "type_name": "变态另类"},
        {"type_id": "57", "type_name": "自拍偷拍"},
        {"type_id": "58", "type_name": "cosplay"},
        {"type_id": "59", "type_name": "童颜巨乳"},
        {"type_id": "61", "type_name": "抖阴视频"},
        {"type_id": "62", "type_name": "三级伦理"},
        {"type_id": "63", "type_name": "丝袜OL"},
        {"type_id": "64", "type_name": "主播秀色"},
        {"type_id": "65", "type_name": "国产主播"},
        {"type_id": "66", "type_name": "探花约炮"},
        {"type_id": "67", "type_name": "网曝吃瓜"},
        {"type_id": "68", "type_name": "剧情介绍"},
        {"type_id": "69", "type_name": "明星换脸"},
        {"type_id": "70", "type_name": "性感人妻"},
        {"type_id": "71", "type_name": "网红黑料"},
        {"type_id": "72", "type_name": "传媒剧情"},
        {"type_id": "73", "type_name": "少女萝莉"},
        {"type_id": "201", "type_name": "综合传媒"},
        {"type_id": "202", "type_name": "麻豆传媒"},
        {"type_id": "203", "type_name": "葫芦影业"},
        {"type_id": "204", "type_name": "猫爪影像"},
        {"type_id": "205", "type_name": "天美传媒"},
        {"type_id": "206", "type_name": "果冻传媒"},
        {"type_id": "207", "type_name": "91制片厂"},
        {"type_id": "208", "type_name": "蜜桃传媒"},
        {"type_id": "209", "type_name": "精东影业"},
        {"type_id": "210", "type_name": "皇家华人"},
        {"type_id": "211", "type_name": "SWAG"},
        {"type_id": "212", "type_name": "JVID"},
        {"type_id": "213", "type_name": "逼哩逼哩"},
        {"type_id": "214", "type_name": "杏吧专区"},
        {"type_id": "215", "type_name": "兔子先生"},
        {"type_id": "216", "type_name": "PsychoPornTW"},
        {"type_id": "217", "type_name": "MINI传媒"},
        {"type_id": "218", "type_name": "陌丽传媒"},
        {"type_id": "221", "type_name": "乐播传媒"},
        {"type_id": "225", "type_name": "肉肉传媒"},
        {"type_id": "301", "type_name": "200GANA"},
        {"type_id": "302", "type_name": "300MIUM"},
        {"type_id": "303", "type_name": "SIRO"},
        {"type_id": "305", "type_name": "259LUXU"},
        {"type_id": "306", "type_name": "261ARA"},
        {"type_id": "307", "type_name": "277DCV"},
        {"type_id": "309", "type_name": "300NTK"},
        {"type_id": "311", "type_name": "328HMDN"},
        {"type_id": "312", "type_name": "332NAMA"},
        {"type_id": "313", "type_name": "336KNB"},
        {"type_id": "314", "type_name": "348NTR"},
        {"type_id": "315", "type_name": "390JAC"},
        {"type_id": "316", "type_name": "MIFD"},
        {"type_id": "317", "type_name": "428SUKE"},
        {"type_id": "318", "type_name": "DCV"},
        {"type_id": "321", "type_name": "PPT"},
        {"type_id": "328", "type_name": "ADN"},
        {"type_id": "329", "type_name": "AARM"},
        {"type_id": "333", "type_name": "ATID"},
        {"type_id": "350", "type_name": "综合番号"},
        {"type_id": "401", "type_name": "夢乃愛華"},
        {"type_id": "402", "type_name": "波多野结衣"},
        {"type_id": "403", "type_name": "三上悠亚"},
        {"type_id": "404", "type_name": "河北彩花"},
        {"type_id": "405", "type_name": "高桥圣子"},
        {"type_id": "406", "type_name": "葵司"},
        {"type_id": "407", "type_name": "水卜櫻"},
        {"type_id": "408", "type_name": "紗倉真菜"},
        {"type_id": "409", "type_name": "桃乃木香奈"},
        {"type_id": "410", "type_name": "安齋拉拉"},
        {"type_id": "411", "type_name": "天使萌"},
        {"type_id": "412", "type_name": "相澤南"},
        {"type_id": "413", "type_name": "櫻空桃"},
        {"type_id": "414", "type_name": "Miru"},
        {"type_id": "415", "type_name": "羽咲美晴"},
        {"type_id": "416", "type_name": "山岸逢花"},
        {"type_id": "417", "type_name": "七澤米亞"},
        {"type_id": "418", "type_name": "松本一香"},
        {"type_id": "419", "type_name": "木下日葵"},
        {"type_id": "426", "type_name": "沙月芽衣"},
        {"type_id": "501", "type_name": "91沈先生"},
        {"type_id": "502", "type_name": "文轩探花"},
        {"type_id": "503", "type_name": "千人斩"},
        {"type_id": "504", "type_name": "太子探花"},
        {"type_id": "505", "type_name": "屌哥全国探花"},
        {"type_id": "506", "type_name": "鸭哥探花"},
        {"type_id": "507", "type_name": "9总全国探花"},
        {"type_id": "508", "type_name": "小天探花"},
        {"type_id": "509", "type_name": "李寻欢探花"},
        {"type_id": "510", "type_name": "小陈头星选探花"},
        {"type_id": "511", "type_name": "综合探花"},
        {"type_id": "512", "type_name": "主播探花"},
        {"type_id": "513", "type_name": "酒店"},
        {"type_id": "514", "type_name": "小宝寻花"},
        {"type_id": "515", "type_name": "午夜寻花"},
        {"type_id": "516", "type_name": "91系列"},
    ]

    def getName(self):
        return "啾咪探探"

    def init(self, extend=""):
        if isinstance(extend, list):
            self.extend = ''
        else:
            self.extend = extend or ''
        self.header = {'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36', 'Referer': self.HOST + '/'}

    def homeContent(self, filter):
        return {"class": self.CATEGORIES}

    def homeVideoContent(self):
        html = self._fetch("/papapa/")
        videos = self._parse_list(html)
        return {"list": videos[:72]}

    def categoryContent(self, tid, pg, filter, extend):
        page = int(pg) if pg else 1
        if page == 1:
            path = f"/vodtype/{tid}/"
        else:
            path = f"/vodtype/{tid}/page/{page}/"
        html = self._fetch(path)
        videos = self._parse_list(html)
        return {"list": videos, "page": page, "pagecount": 99, "limit": 20}

    def detailContent(self, ids):
        if isinstance(ids, str):
            ids = [ids]
        vod_id = ids[0]
        html = self._fetch(f"/voddetail/{vod_id}/")

        vod_name = vod_id
        poster = ""
        m = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
        if m:
            vod_name = unescape(m.group(1)).strip() or vod_id
        # 封面: data-original(任意位置)
        pic_match = re.search(r'data-original="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"', html)
        if pic_match:
            poster = pic_match.group(1)

        # 解析播放地址 (在播放页 /vodplay/{id}-1-1/)
        play_url = ""
        # 详情页可能直接有player_aaaa
        m3 = re.search(r'var\s+player_aaaa\s*=\s*(\{[^}]+\})', html)
        if m3:
            try:
                data = json.loads(m3.group(1))
                play_url = data.get("url", "")
            except:
                pass
        # 否则请求播放页
        if not play_url:
            play_html = self._fetch(f"/vodplay/{vod_id}-1-1/")
            m4 = re.search(r'var\s+player_aaaa\s*=\s*(\{[^}]+\})', play_html)
            if m4:
                try:
                    data = json.loads(m4.group(1))
                    play_url = data.get("url", "")
                except:
                    pass
            if not play_url:
                # 备用: 直接找m3u8
                m5 = re.search(r'https?://[^"\'<>\s]+\.m3u8[^"\'<>\s]*', play_html)
                if m5:
                    play_url = m5.group(0)

        vod = {
            "vod_id": str(vod_id),
            "vod_name": vod_name,
            "vod_pic": poster,
            "type_name": "",
            "vod_year": "", "vod_area": "", "vod_remarks": "",
            "vod_actor": "", "vod_director": "", "vod_content": "",
            "vod_play_from": "默认线路",
            "vod_play_url": f"播放${play_url}" if play_url else "",
        }
        return {"list": [vod]}

    def searchContent(self, key, quick, pg="1"):
        import urllib.parse
        kw = urllib.parse.quote(key)
        html = self._fetch(f"/vodsearch/{kw}-------------/")
        videos = self._parse_list(html)
        return {"list": videos, "page": 1, "pagecount": 1, "limit": 20, "total": len(videos)}

    def playerContent(self, flag, id, vipFlags):
        url = id if str(id).startswith("http") else self._url(id)
        return {"parse": 0, "playUrl": "", "url": url, "header": self.header}

    def localProxy(self, param):
        return [200, "video/MP2T", b"", ""]

    def destroy(self):
        pass
    def close(self):
        self.destroy()

    def _fetch(self, path):
        url = self.HOST + path
        try:
            import urllib.request, ssl
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(url, headers=self.header)
            resp = urllib.request.urlopen(req, context=ctx, timeout=15)
            text = resp.read().decode('utf-8', errors='replace')
            return text
        except:
            return ""

    def _parse_list(self, html):
        """提取视频列表"""
        videos = []
        if not html:
            return videos
        seen = set()

        # 视频卡片: <a href="/voddetail/{id}/" ... data-original="封面" ...>标题</a>
        for block in re.finditer(r'<a[^>]*href="(/voddetail/(\d+)/)"[^>]*title="([^"]*)"[^>]*data-original="([^"]*)"', html, re.S):
            href, vid, title, pic = block.group(1), block.group(2), block.group(3), block.group(4)
            if vid in seen:
                continue
            seen.add(vid)
            title = unescape(title).strip() or vid
            videos.append({
                "vod_id": vid,
                "vod_name": title,
                "vod_pic": pic,
                "vod_remarks": "",
            })

        # 备用: 标题在h4里
        if not videos:
            for block in re.finditer(r'<a[^>]*href="(/voddetail/(\d+)/)"[^>]*>([^<]*)</a>[^<]*<[^>]*data-original="([^"]*)"', html, re.S):
                href, vid, title, pic = block.group(1), block.group(2), block.group(3), block.group(4)
                if vid in seen:
                    continue
                seen.add(vid)
                title = unescape(title).strip() or vid
                videos.append({
                    "vod_id": vid,
                    "vod_name": title,
                    "vod_pic": pic,
                    "vod_remarks": "",
                })

        # 兜底: 纯链接+data-original
        if not videos:
            for block in re.finditer(r'href="/voddetail/(\d+)/"[^>]*data-original="([^"]*)"[^>]*alt="([^"]*)"', html, re.S):
                vid, pic, title = block.group(1), block.group(2), block.group(3)
                if vid in seen:
                    continue
                seen.add(vid)
                title = unescape(title).strip() or vid
                videos.append({
                    "vod_id": vid,
                    "vod_name": title,
                    "vod_pic": pic,
                    "vod_remarks": "",
                })

        return videos

    def _url(self, path):
        if path.startswith("http"):
            return path
        return self.HOST + ("/" + path if not path.startswith("/") else path)