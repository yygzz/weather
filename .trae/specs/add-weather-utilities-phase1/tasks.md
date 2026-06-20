# Tasks

- [ ] Task 1: 扩展后端当前天气接口支持城市代码
  - [ ] SubTask 1.1: 在 `weather.ts` 路由新增 `GET /api/weather/current/:cityCode`
  - [ ] SubTask 1.2: `weatherScraper.ts` 新增 `fetchCurrentWeatherByCityCode(cityCode)`，与坐标接口复用同一抓取逻辑
  - [ ] SubTask 1.3: 添加单元测试覆盖城市代码查询

- [ ] Task 2: 新增共享类型 `SavedCity`
  - [ ] SubTask 2.1: 在前端 `src/types/index.ts` 和后端 `src/types/index.ts` 定义 `SavedCity`（city, cityCode, province, lat, lon）

- [ ] Task 3: 实现城市管理（收藏城市）
  - [ ] SubTask 3.1: 新增 `useSavedCities` hook，使用 localStorage 持久化，提供 add/remove/select 方法
  - [ ] SubTask 3.2: 在 `CitySearch` 搜索结果项增加「+ 收藏」按钮
  - [ ] SubTask 3.3: 新增 `SavedCities` 组件，以 chip 形式展示收藏城市，点击切换，附带删除按钮
  - [ ] SubTask 3.4: 将 `SavedCities` 集成到 `Header` 下方或 Hero 区域上方

- [ ] Task 4: 实现天气分享卡片
  - [ ] SubTask 4.1: 安装 `html2canvas` 依赖
  - [ ] SubTask 4.2: 新增 `ShareCard` 组件，使用毛玻璃风格展示城市、温度、天气现象、数据来源
  - [ ] SubTask 4.3: 新增 `ShareModal` 组件，封装卡片、下载按钮、系统分享按钮
  - [ ] SubTask 4.4: 在 `HeroSection` 添加分享入口按钮
  - [ ] SubTask 4.5: 实现下载 PNG 和 Web Share API 调用

- [ ] Task 5: 实现降雨提醒
  - [ ] SubTask 5.1: 新增 `RainAlert` 组件，基于逐小时预报判断未来 3 小时降水概率 ≥ 50%
  - [ ] SubTask 5.2: 在 `App.tsx` 或 `HeroSection` 中展示降雨提醒横幅
  - [ ] SubTask 5.3: 新增「开启降雨提醒」按钮，请求浏览器通知权限，授权后显示 toast 提醒

- [ ] Task 6: 验证与测试
  - [ ] SubTask 6.1: 前端 `tsc --noEmit` 与 `npm run build` 通过
  - [ ] SubTask 6.2: 后端 `tsc --noEmit` 与单元测试通过
  - [ ] SubTask 6.3: 手动验证收藏城市切换、分享卡片下载、降雨提醒展示

# Task Dependencies
- Task 2 依赖 无
- Task 1 依赖 Task 2（需要 `SavedCity` 中的城市代码）
- Task 3 依赖 Task 2
- Task 4 依赖 无（使用已有当前天气数据）
- Task 5 依赖 无（使用已有逐小时预报数据）
- Task 6 依赖 Task 1-5
