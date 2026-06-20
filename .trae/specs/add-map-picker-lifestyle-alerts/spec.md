# 地图选点与生活指数提醒 Spec

## Why
当前天气应用已具备定位、预报、雷达和收藏城市等核心能力，但用户仍需要更直观的地点选择方式（地图）以及更全面的生活决策信息（生活指数、个性化提醒）。本阶段通过引入开源地图选点、扩展生活指数和增加个性化天气提醒，进一步提升产品的易用性和实用价值。

## What Changes
- 新增「地图选点」能力：用户可在地图上点击任意位置查询天气，支持定位到我。
- 新增「生活指数」扩展：增加紫外线、洗车、运动、感冒、过敏、化妆、钓鱼等指数展示。
- 新增「个性化天气提醒」：用户可为收藏城市设置阈值条件，触发时给出页面内 toast 与浏览器通知。
- 后端新增 `GET /api/weather/lifestyle/:cityCode` 接口返回生活指数数据。
- 后端扩展反向地理编码能力，支持坐标到最近城市的解析。
- 前端新增 `MapPicker`、`AlertSettings` 等组件，并扩展 `LifestyleIndex`。
- 提醒规则与授权状态持久化到 localStorage。

## Impact
- 受影响能力：城市搜索、当前天气展示、收藏城市管理、生活指数展示、通知权限管理。
- 受影响代码：
  - 前端：`CitySearch`、`LifestyleIndex`、新增 `MapPicker`、`AlertSettings`、新增 `useWeatherAlerts` hook。
  - 后端：`geocodeService.ts`（扩展反向地理编码）、新增生活指数抓取、`weather.ts` 或新增 `lifestyle.ts` 路由。
  - 共享类型：新增 `LifestyleIndex`、`WeatherAlertRule` 等类型。

## ADDED Requirements

### Requirement: 地图选点查天气
The system SHALL 提供可交互地图，允许用户点击位置查询天气。

#### Scenario: 在地图上选择位置
- **GIVEN** 用户打开地图选点组件
- **WHEN** 点击地图上的某个位置
- **THEN** 系统通过反向地理编码找到最近城市，并加载该城市天气

#### Scenario: 定位到当前位置
- **GIVEN** 用户打开地图选点组件
- **WHEN** 点击「定位到我」按钮
- **THEN** 地图移动到当前位置，并可选中该位置天气

### Requirement: 生活指数扩展
The system SHALL 展示多维度生活指数，帮助用户做日常决策。

#### Scenario: 查看生活指数
- **GIVEN** 用户查看某个城市天气
- **WHEN** 生活指数数据加载完成
- **THEN** 页面展示紫外线、洗车、运动、感冒、过敏、化妆、钓鱼等指数及建议

### Requirement: 个性化天气提醒
The system SHALL 允许用户为收藏城市设置天气阈值提醒。

#### Scenario: 设置提醒规则
- **GIVEN** 用户进入提醒设置
- **WHEN** 为某个收藏城市添加阈值条件（如温度>35°C、降雨概率>70%、风力>6级）
- **THEN** 规则被保存到 localStorage，并在条件满足时触发提醒

#### Scenario: 触发提醒
- **GIVEN** 用户已设置提醒规则并已授权通知
- **WHEN** 天气数据满足某条规则条件
- **THEN** 页面显示 toast 提醒，并尝试发送浏览器系统通知

## MODIFIED Requirements
### Requirement: 现有城市搜索与切换
为支持地图选点结果，城市切换逻辑应能接受由地图选点触发的城市变更，与搜索、收藏城市切换行为一致。

## REMOVED Requirements
无移除项。
