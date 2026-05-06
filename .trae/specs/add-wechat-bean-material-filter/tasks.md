# Tasks

- [ ] Task 1: 项目初始化与基础架构搭建
  - [ ] SubTask 1.1: 初始化前端项目（框架选型、目录结构、基础配置）
  - [ ] SubTask 1.2: 初始化后端项目（框架选型、目录结构、基础配置）
  - [ ] SubTask 1.3: 搭建数据库模型（素材表、标签表、投放关联表）

- [ ] Task 2: 素材库管理模块
  - [ ] SubTask 2.1: 实现素材上传接口（支持视频/图片，自动提取元信息）
  - [ ] SubTask 2.2: 实现素材标签分类功能（添加/删除标签、按标签查询）
  - [ ] SubTask 2.3: 实现素材审核状态管理（状态流转、变更记录）
  - [ ] SubTask 2.4: 实现素材列表展示页面

- [ ] Task 3: 素材筛选功能
  - [ ] SubTask 3.1: 实现后端筛选 API（支持素材类型、尺寸比例、时长、审核状态、标签等多维度筛选）
  - [ ] SubTask 3.2: 实现组合条件筛选逻辑（多条件交集查询）
  - [ ] SubTask 3.3: 实现筛选结果排序（上传时间/播放量/互动率）
  - [ ] SubTask 3.4: 实现前端筛选页面（筛选条件面板 + 结果列表）

- [ ] Task 4: 素材预览功能
  - [ ] SubTask 4.1: 实现视频素材在线预览弹窗
  - [ ] SubTask 4.2: 实现图片素材在线预览弹窗
  - [ ] SubTask 4.3: 展示素材基本信息（时长、尺寸、大小等）

- [ ] Task 5: 微信豆投放专属筛选
  - [ ] SubTask 5.1: 实现微信豆投放规格校验逻辑（时长限制、尺寸要求等）
  - [ ] SubTask 5.2: 实现投放模式筛选（自动过滤不合规素材并标注原因）
  - [ ] SubTask 5.3: 实现素材投放效果回溯（消耗微信豆数、曝光量、互动率）

- [ ] Task 6: 投放关联功能
  - [ ] SubTask 6.1: 实现从筛选结果创建投放（跳转投放创建页，自动填充素材）
  - [ ] SubTask 6.2: 实现批量选择素材操作（批量创建投放、批量添加标签、批量删除）

- [ ] Task 7: 测试与验证
  - [ ] SubTask 7.1: 编写素材筛选 API 单元测试
  - [ ] SubTask 7.2: 编写素材库管理功能集成测试
  - [ ] SubTask 7.3: 前端页面功能验证

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 2]
- [Task 5] depends on [Task 3]
- [Task 6] depends on [Task 3, Task 5]
- [Task 7] depends on [Task 2, Task 3, Task 4, Task 5, Task 6]
