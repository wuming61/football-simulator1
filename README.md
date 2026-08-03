# Football Simulator v1.3

这是一个无需后端即可运行的响应式 H5/PWA 足球生涯模拟器，支持电脑与手机浏览器。v1.3 新增可持续的俱乐部财政：新赛季转播分成、经营收入、老板注资和动态转会预算会共同推动更活跃的 AI 转会市场。

## 运行

不要直接双击 `index.html`，PWA 离线缓存需要 HTTP 环境。在本目录运行：

```bash
python3 -m http.server 8876
```

然后打开 `http://127.0.0.1:8876/`。部署时可将整个目录上传到任意静态网站托管服务。

## 数据与存档

- 生涯存档和 MOD 数据包保存在当前浏览器的本地存储中。
- 五大联赛一、二级球队与球员快照见 `DATA-SOURCE.md`。
- 评级、潜力、工资、预算与声望均为游戏模型估算。
- 奖杯素材的再分发说明见 `ASSET-NOTICE.md`。
- MOD 示例见 `data/mod-schema.example.json`。
- 引擎和状态结构见 `ARCHITECTURE.md`。
- 当前版本及每次功能更新记录见 `CHANGELOG.md`。
