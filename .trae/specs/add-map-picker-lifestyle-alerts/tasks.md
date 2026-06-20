# Tasks

- [x] Task 1: 扩展后端反向地理编码能力
  - [x] SubTask 1.1: 在 `geocodeService.ts` 中新增 `reverseGeocode(lat, lon)`，返回最近城市信息
  - [x] SubTask 1.2: 在 `geocode.ts` 路由新增 `GET /api/geocode/reverse?lat=&lon=` 端点
  - [x] SubTask 1.3: 添加单元测试覆盖反向地理编码

- [x] Task 2: 后端新增生活指数接口
  - [x] SubTask 2.1: 在 `weatherScraper.ts` 新增 `fetchLifestyleIndices(cityCode)` 抓取逻辑
  - [x] SubTask 2.2: 新增 `src/routes/lifestyle.ts` 路由，提供 `GET /api/weather/lifestyle/:cityCode`
  - [x] SubTask 2.3: 在 `src/routes/index.ts` 注册 lifestyle 路由
  - [x] SubTask 2.4: 定义 `LifestyleIndex` 相关类型
  - [x] SubTask 2.5: 添加单元测试

- [x] Task 3: 前端新增地图选点组件
  - [x] SubTask 3.1: 安装 `leaflet` 与 `react-leaflet` 依赖（如尚未安装）
  - [x] SubTask 3.2: 新增 `MapPicker.tsx` 组件，使用 OpenStreetMap 底图
  - [x] SubTask 3.3: 实现点击地图调用反向地理编码并切换城市
  - [x] SubTask 3.4: 实现「定位到我」按钮
  - [x] SubTask 3.5: 在移动端以模态/弹层呈现，桌面端集成到搜索面板

- [x] Task 4: 前端扩展生活指数展示
  - [x] SubTask 4.1: 在前端类型中定义 `LifestyleIndex`
  - [x] SubTask 4.2: 在 `services/api.ts` 封装生活指数 API 调用
  - [x] SubTask 4.3: 扩展 `LifestyleIndex.tsx` 组件，展示多种指数及详情
  - [x] SubTask 4.4: 在 `App.tsx` 或合适位置集成并加载数据

- [x] Task 5: 前端实现个性化天气提醒
  - [x] SubTask 5.1: 新增 `useWeatherAlerts` hook，管理规则与通知权限
  - [x] SubTask 5.2: 新增 `AlertSettings.tsx` 组件，设置收藏城市的阈值规则
  - [x] SubTask 5.3: 实现基于天气数据的规则匹配与 toast 提醒
  - [x] SubTask 5.4: 实现浏览器通知权限申请与系统通知发送
  - [x] SubTask 5.5: 将规则持久化到 localStorage

- [x] Task 6: 验证与测试
  - [x] SubTask 6.1: 前端 `tsc --noEmit` 与 `npm run build` 通过
  - [x] SubTask 6.2: 后端 `tsc --noEmit` 与单元测试通过
  - [x] SubTask 6.3: 手动验证地图选点、生活指数加载、提醒触发

# Task Dependencies
- Task 3 依赖 Task 1（需要反向地理编码接口）
- Task 4 依赖 Task 2（需要生活指数接口）
- Task 5 依赖 无（基于已有天气数据）
- Task 6 依赖 Task 1-5
