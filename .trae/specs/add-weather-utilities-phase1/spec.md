# 实用工具第一阶段 Spec

## Why
当前天气网站已具备定位、当前天气、预报、雷达与搜索等核心能力。为了让用户能更高效地管理常去城市、分享天气信息，并在降雨前获得提醒，本阶段追加三个高频实用工具：多城市管理、天气分享卡片和降雨提醒。

## What Changes
- 新增「城市管理」能力：用户可将多个城市加入收藏，快速切换查看天气。
- 新增「天气分享卡片」：基于当前天气生成可下载/分享的 Liquid Glass 风格卡片。
- 新增「降雨提醒」：根据逐小时预报，在即将降雨时给出醒目提示。
- 前端本地持久化收藏城市列表（localStorage）。
- 后端新增 `/api/weather/current/:cityCode` 端点，便于按城市代码批量获取当前天气，减少逆地理编码开销。

## Impact
- 受影响能力：城市切换、当前天气展示、逐小时预报、数据分享。
- 受影响代码：
  - 前端：`Header`、`CitySearch`、`HeroSection`、新增 `SavedCities`、`ShareCard`。
  - 后端：`weather.ts` 路由、`weatherScraper.ts`。
  - 共享类型：新增 `SavedCity`。

## ADDED Requirements

### Requirement: 城市管理
The system SHALL 允许用户收藏多个城市，并在页面中快速切换。

#### Scenario: 添加城市
- **GIVEN** 用户通过搜索栏选中一个城市
- **WHEN** 点击城市项旁边的「+ 收藏」按钮
- **THEN** 该城市被加入收藏列表，并写入 localStorage

#### Scenario: 切换城市
- **GIVEN** 用户已收藏多个城市
- **WHEN** 点击顶部收藏城市 chip 或展开城市管理面板
- **THEN** 页面切换为该城市天气，同时更新当前定位状态

#### Scenario: 删除城市
- **GIVEN** 用户已收藏城市
- **WHEN** 在城市管理面板点击删除
- **THEN** 该城市从列表和 localStorage 中移除

### Requirement: 天气分享卡片
The system SHALL 基于当前城市天气生成一张可下载/分享的卡片。

#### Scenario: 打开分享卡片
- **WHEN** 用户点击 Hero 区域的分享按钮
- **THEN** 弹出 Liquid Glass 风格模态框，展示包含城市、温度、天气现象、数据来源的卡片

#### Scenario: 下载卡片
- **WHEN** 用户点击「下载图片」
- **THEN** 使用 html2canvas 将卡片转为 PNG 并触发浏览器下载

#### Scenario: 系统分享
- **WHEN** 用户点击「分享」且浏览器支持 Web Share API
- **THEN** 调用 navigator.share 分享生成的图片

### Requirement: 降雨提醒
The system SHALL 根据逐小时预报，在即将降雨时主动提示用户。

#### Scenario: 进入页面时检测降雨
- **GIVEN** 用户打开页面
- **WHEN** 未来 3 小时内任意一小时降水概率 ≥ 50%
- **THEN** 在 Hero 区域下方显示降雨提醒横幅：「未来 3 小时可能有雨，记得带伞」

#### Scenario: 用户主动订阅提醒
- **WHEN** 用户点击「开启降雨提醒」
- **THEN** 请求浏览器通知权限；授权后，若检测到降雨，在页面内以 toast 形式再次提醒

## MODIFIED Requirements

### Requirement: 当前天气接口支持城市代码查询
为了支持收藏城市列表的并行刷新，当前天气接口应支持直接通过城市代码查询：

- `GET /api/weather/current?lat={}&lon={}` 保持原有行为。
- 新增 `GET /api/weather/current/:cityCode` 按城市代码返回当前天气。
- 两种方式共享同一套抓取与缓存逻辑。

## REMOVED Requirements
无移除项。
