# dsh-recent-sessions

DSH Web GUI 客户端插件：在侧栏**工作区浏览器上方**显示「最近使用」会话列表，点击直接切回该会话。

## 效果

- **宽栏**：36px 小节头「最近使用 / Recent」+ 最多 5 行（标题、工作区名、相对时间，如「2小时」），样式沿用原生工作区浏览器的 36px 节头 / 32px 行 / 原生 token（`--dsw-alias-*`），与下方「工作区」节头对齐。
- **窄栏（rail）**：5 个圆形头像 chip（标题首字），点击同样打开会话；当前会话 chip 有描边高亮。
- 状态标记复用原生 `StateDot` 组件（与下方工作区会话行同一组件）：运行中 = 旋转 spinner，等待审批/回答/计划待审 = 警示色圆点，子智能体运行中 = spinner，完成未读 = 成功色圆点，空闲 = 不显示（与原生行一致）；等待交互时行尾显示紧凑文案（「待审批」等）代替相对时间。
- 当前主视图会话整行高亮。
- 时间标签复用原生 `@deepseek-ai/dsh-client-ui-primitives` 的 `relativeTime`（zh「刚刚/5分钟/…」、en「now/5min/…」），30 秒刷新。
- 无符合条件的会话时整节自动隐藏。

## 行为与复用

- 数据来源全部是现有 store：`useSessions`（`byId` 投影，排除 blank/已归档/子代理，按 `updatedAt` 降序取前 5）+ `useWorkspaces`（工作区名匹配 `cwd`）+ `useSessionStatus`（状态 map，与原生行同一判定路径）。
- 打开会话走**现有** `uiWorkspace.openSession(id)` 通道（与原生浏览器会话行的点击路径相同），不新增任何协议/服务。
- 列表通过 portal 渲染到 `regionArea`（`[data-slot="sidebar.workspaces"]` 出口的同级 flex 列）内、浏览器出口之前；宿主节点由 MutationObserver 跟随浏览器重挂载自动归位；插件卸载时宿主节点移除，不留 DOM。
- 入口注册在 `sidebar.footer.action`（list 槽，安全，不挤占 single 槽的浏览器本体）。
- 纯只读 + 导航：无网络请求、无文件读写。

## 安装

任意 DSH（Web GUI）→ **插件 → 添加插件**，三选一：

1. **GitHub 仓库地址**（推荐）：

   ```
   git+https://github.com/myml/dsh-recent-sessions.git
   ```

2. **npm 包名**：`dsh-recent-sessions`（如已发布）；界面内可切换中国大陆镜像源。
3. **本地目录路径**：指向本仓库 checkout。

安装器会自动将包加入 profile 的 `dsh.profile.bundles`，下次启动（或 live patchReload）生效。

## 版本兼容

清单声明 `engines.dsh: >=0.2.1-rc.2`。插件依赖该版本的原生内部实现（`sidebar.workspaces` 插槽、根 hook、`StateDot`/`relativeTime` 导出、`--dsw-` CSS 变量）；DSH 大版本更新后若内部变化，需升级本包并重新安装（DSH 会按 engines 在安装前明确拒绝不兼容组合）。

## 文件

- `package.json` — 清单：`dsh.bundle.patch`（boot graph 补丁）、`dsh.client.platform=web`，`immediately: true`，`inject` 声明加载顺序依赖。
- `cordis.patch.yml` — boot graph 插入项（`- insert:` 形式，顶层 `id`）。
- `lib/index.js` — host 端加载入口（浏览器-only 插件，无 host 行为）。
- `lib/client.js` — 浏览器 IIFE bundle（`window.__ModuleLoader__.load`），导出对象形式 `{ apply, inject: ["slots","locale"] }`。
- 样式以 `<style data-plugin="dsh-recent-sessions">` 注入，全部按 `[data-dsh-recent-sessions]` 作用域隔离。

## 卸载

```bash
dsh plugin --profile web remove dsh-recent-sessions
```

或 设置 → 插件 中移除。
