# Tasks

- [x] Task 1: 项目初始化与基础架构搭建
  - [x] SubTask 1.1: 初始化前端项目（框架选型、目录结构、基础配置）
  - [x] SubTask 1.2: 初始化后端项目（框架选型、目录结构、基础配置）
  - [x] SubTask 1.3: 搭建数据库模型（视频素材表、投放数据表、ROI 快照表）

- [x] Task 2: 投放数据管理模块
  - [x] SubTask 2.1: 实现投放数据手动录入接口（微信豆消耗、曝光量、点击量、互动量、转化数、GMV、日期）
  - [x] SubTask 2.2: 实现投放数据批量导入接口（CSV/Excel 解析、数据校验、批量写入）
  - [x] SubTask 2.3: 实现投放数据查询接口（按视频、按日期范围、按日/周/月聚合）
  - [x] SubTask 2.4: 实现投放数据录入前端页面

- [x] Task 3: ROI 计算引擎
  - [x] SubTask 3.1: 实现 ROI 核心计算逻辑（ROI、单豆产出、点击率、互动率、转化率）
  - [x] SubTask 3.2: 实现分时段 ROI 计算（近7天/近30天/自定义时间范围）
  - [x] SubTask 3.3: 实现 ROI 自动更新机制（投放数据变更时触发重新计算）
  - [x] SubTask 3.4: 实现 ROI 计算 API（单视频 ROI、批量视频 ROI、分时段 ROI）

- [x] Task 4: 素材 ROI 筛选页面
  - [x] SubTask 4.1: 实现后端筛选 API（按 ROI 范围、排序、多维度组合筛选）
  - [x] SubTask 4.2: 实现高/低 ROI 自动标签逻辑（可配置阈值）
  - [x] SubTask 4.3: 实现前端素材列表页面（展示 ROI、辅助指标、标签）
  - [x] SubTask 4.4: 实现前端筛选条件面板（ROI 范围、素材类型、时长、时间范围等）

- [x] Task 5: ROI 趋势分析
  - [x] SubTask 5.1: 实现单视频 ROI 趋势数据 API（按日/周聚合）
  - [x] SubTask 5.2: 实现多视频 ROI 对比数据 API
  - [x] SubTask 5.3: 实现前端 ROI 趋势折线图（叠加微信豆消耗和 GMV 趋势）
  - [x] SubTask 5.4: 实现前端多视频 ROI 对比图表

- [x] Task 6: 素材操作功能
  - [x] SubTask 6.1: 实现筛选结果导出功能（含 ROI 数据导出为 Excel）
  - [x] SubTask 6.2: 实现低 ROI 素材标记淘汰功能

- [x] Task 7: 测试与验证
  - [x] SubTask 7.1: 编写 ROI 计算逻辑单元测试
  - [x] SubTask 7.2: 编写投放数据管理集成测试
  - [x] SubTask 7.3: 前端页面功能验证

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 3]
- [Task 6] depends on [Task 4]
- [Task 7] depends on [Task 2, Task 3, Task 4, Task 5, Task 6]
