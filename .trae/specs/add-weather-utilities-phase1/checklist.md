# Checklist

- [ ] 后端 `GET /api/weather/current/:cityCode` 可正确返回指定城市当前天气
- [ ] `SavedCity` 类型在前端与后端均已定义
- [ ] 用户可通过搜索栏收藏城市，收藏列表持久化到 localStorage
- [ ] 收藏城市以 chip 形式展示，点击可切换当前城市天气
- [ ] 用户可删除已收藏的城市
- [ ] Hero 区域有分享按钮，点击弹出分享卡片模态框
- [ ] 分享卡片可下载为 PNG
- [ ] 浏览器支持时可通过 Web Share API 分享卡片
- [ ] 未来 3 小时降水概率 ≥ 50% 时显示降雨提醒横幅
- [ ] 降雨提醒支持请求通知权限并在授权后弹出 toast 提醒
- [ ] 前端 `npx tsc --noEmit` 与 `npm run build` 通过
- [ ] 后端 `npx tsc --noEmit` 与测试通过
