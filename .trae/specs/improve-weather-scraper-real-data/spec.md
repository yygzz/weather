# 完善中国天气网真实数据解析 Spec

## Why
当前后端爬虫 `weatherScraper.ts` 仅对「当前天气」做了中国天气网的真实解析，逐小时预报、逐天预报、空气质量、生活指数、天气预警、雷达图等接口仍返回 mock 或模拟数据。为了提升前端展示准确性与产品可信度，需要把这些接口都替换为从中国天气网实际页面解析的数据。

## What Changes
- 替换 `fetchHourlyForecast`：从中国天气网 `weather1d/{cityCode}.shtml` 的 `hour3data` 中解析未来 24 小时逐小时预报。
- 替换 `fetchDailyForecast`：从中国天气网 `weather/{cityCode}.shtml` 解析未来 7 天逐天预报。
- 替换 `fetchAirQuality`：从中国天气网空气质素相关页面或接口解析 AQI、PM2.5、PM10 等指标。
- 替换 `fetchLifestyleIndices`：从中国天气网生活指数接口/页面解析真实指数，替代基于当前天气的模拟生成。
- 替换 `fetchWeatherAlerts`：解析中国天气网天气预警信息。
- 替换 `fetchRadarTiles`：解析雷达图瓦片地址或图片序列。
- 所有解析失败时仍保留合理的 fallback 数据，避免页面空白。
- 更新相关单元测试，确保解析逻辑可验证且不依赖真实网络请求。

## Impact
- 受影响能力：逐小时预报、逐天预报、空气质量、生活指数、天气预警、雷达图。
- 受影响代码：
  - 后端：`apps/api/src/services/weatherScraper.ts`
  - 后端路由：`apps/api/src/routes/weather.ts`（必要时调整缓存键或调用方式）
  - 后端测试：`apps/api/tests/weather.test.ts`、`apps/api/tests/lifestyle.test.ts` 等

## ADDED Requirements

### Requirement: 逐小时预报真实解析
The system SHALL 从中国天气网解析未来 24 小时逐小时预报。

#### Scenario: 解析成功
- **GIVEN** 后端收到 `GET /api/weather/hourly?lat=&lon=` 请求
- **WHEN** 爬虫成功抓取并解析 `weather1d/{cityCode}.shtml` 的 `hour3data`
- **THEN** 返回包含 time、temperature、precipitationProbability、windDirection、windSpeed、weatherText 的数组

#### Scenario: 解析失败回退
- **WHEN** 页面结构变化或网络失败导致解析失败
- **THEN** 返回基于当前温度的合理 fallback 逐小时数据，并标记 source 为 fallback

### Requirement: 逐天预报真实解析
The system SHALL 从中国天气网解析未来 7 天逐天预报。

#### Scenario: 解析成功
- **GIVEN** 后端收到 `GET /api/weather/daily?lat=&lon=` 请求
- **WHEN** 爬虫成功抓取并解析 `weather/{cityCode}.shtml`
- **THEN** 返回包含 date、dayWeather、nightWeather、highTemperature、lowTemperature、windDirection、windSpeed、precipitationProbability 的数组

### Requirement: 空气质量真实解析
The system SHALL 从中国天气网解析空气质量数据。

#### Scenario: 解析成功
- **GIVEN** 后端收到 `GET /api/weather/air?lat=&lon=` 请求
- **WHEN** 爬虫成功抓取空气质量页面/接口
- **THEN** 返回包含 aqi、level、primaryPollutant、pm25、pm10、o3、no2、so2、co、advice 的对象

### Requirement: 生活指数真实解析
The system SHALL 从中国天气网解析生活指数，替代现有模拟生成逻辑。

#### Scenario: 解析成功
- **GIVEN** 后端收到 `GET /api/weather/lifestyle/:cityCode` 请求
- **WHEN** 爬虫成功抓取生活指数接口/页面
- **THEN** 返回真实的紫外线、洗车、运动、感冒、过敏、化妆、钓鱼等指数

### Requirement: 天气预警真实解析
The system SHALL 从中国天气网解析天气预警信息。

#### Scenario: 解析成功
- **GIVEN** 后端收到 `GET /api/weather/alerts?lat=&lon=` 请求
- **WHEN** 存在有效预警
- **THEN** 返回预警标题、级别、内容、发布时间等

### Requirement: 雷达图真实解析
The system SHALL 从中国天气网解析雷达图基础信息。

#### Scenario: 解析成功
- **GIVEN** 后端收到雷达图相关请求
- **WHEN** 爬虫成功解析雷达图配置
- **THEN** 返回雷达图瓦片或图片序列地址

## MODIFIED Requirements
### Requirement: 现有生活指数接口
`fetchLifestyleIndices` 不再基于当前天气模拟生成指数，而是从中国天气网解析真实数据；在解析失败时仍保留基于天气的 fallback。

## REMOVED Requirements
无移除项。
