# Tasks

- [x] Task 1: 解析逐小时预报真实数据
  - [x] SubTask 1.1: 分析 `weather1d/{cityCode}.shtml` 中 `hour3data` 结构，编写 `parseHourlyForecast(html)`
  - [x] SubTask 1.2: 替换 `fetchHourlyForecast` 为真实解析，保留 fallback
  - [x] SubTask 1.3: 添加/更新单元测试

- [x] Task 2: 解析逐天预报真实数据
  - [x] SubTask 2.1: 分析 `weather/{cityCode}.shtml` 7 天预报结构，编写 `parseDailyForecast(html)`
  - [x] SubTask 2.2: 替换 `fetchDailyForecast` 为真实解析，保留 fallback
  - [x] SubTask 2.3: 添加/更新单元测试

- [x] Task 3: 解析空气质量真实数据
  - [x] SubTask 3.1: 找到中国天气网空气质量数据源（页面或接口），编写 `parseAirQuality(html)`
  - [x] SubTask 3.2: 替换 `fetchAirQuality` 为真实解析，保留 fallback
  - [x] SubTask 3.3: 添加/更新单元测试

- [x] Task 4: 解析生活指数真实数据
  - [x] SubTask 4.1: 找到中国天气网生活指数数据源，编写 `parseLifestyleIndices(html)`
  - [x] SubTask 4.2: 替换 `fetchLifestyleIndices` 为真实解析，保留基于天气的 fallback
  - [x] SubTask 4.3: 更新 `apps/api/tests/lifestyle.test.ts` 测试

- [x] Task 5: 解析天气预警真实数据
  - [x] SubTask 5.1: 找到中国天气网天气预警数据源
  - [x] SubTask 5.2: 替换 `fetchWeatherAlerts` 为真实解析，无预警时返回空数组
  - [x] SubTask 5.3: 添加单元测试

- [x] Task 6: 解析雷达图真实数据
  - [x] SubTask 6.1: 找到中国天气网雷达图数据源
  - [x] SubTask 6.2: 替换 `fetchRadarTiles` 为真实解析
  - [x] SubTask 6.3: 添加单元测试

- [x] Task 7: 验证与测试
  - [x] SubTask 7.1: 后端 `npx tsc --noEmit` 通过
  - [x] SubTask 7.2: 后端 `npm test` 全部通过
  - [x] SubTask 7.3: 手动验证各接口返回真实结构数据

# Task Dependencies
- Task 2 依赖 无
- Task 3 依赖 无
- Task 4 依赖 无
- Task 5 依赖 无
- Task 6 依赖 无
- Task 7 依赖 Task 1-6
