window.__ModuleLoader__.load({
	id: "dsh-recent-sessions",
	factory: (require) => {
		var module = { exports: {} };
		const react = require("react");
		const reactDom = require("react-dom");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const createSnapshotStore = require("@deepseek-ai/dsh-client-store").createSnapshotStore;
		const relativeTime = primitives.relativeTime;
		/** The stock marker component: spinner for `ongoing`, colored dot otherwise. */
		const StateDot = primitives.StateDot;
		/** Stock form control rendered on the plugin's configuration page. */
		const Switch = primitives.Switch;

		//#region constants
		/** Locale namespace registered on the shared locale service. */
		const NS = "dsh-recent-sessions";
		/** Host plugin entry id: the settings namespace and the row-config key. */
		const ENTRY_ID = "recent-sessions";
		/** Package name the `plugins.row.config` key is prefixed with. */
		const PACKAGE_NAME = "dsh-recent-sessions";
		/** Defaults and bounds mirror the Host `Config` schema in `lib/index.js`. */
		const DEFAULT_LIMIT = 5;
		const MIN_LIMIT = 1;
		const MAX_LIMIT = 50;
		const DEFAULT_SHOW_SUBAGENTS = false;
		/** Slot outlet the list is portalled above (the workspace browser root outlet). */
		const ANCHOR_SELECTOR = '[data-slot="sidebar.workspaces"]';
		/** Attribute marking the plugin-owned host node. */
		const HOST_ATTRIBUTE = "data-dsh-recent-sessions";
		const h = react.createElement;

		/**
		 * Scoped stylesheet. Geometry and tokens mirror the stock workspace
		 * browser (36px section header, 32px rows, stock alias tokens) so the
		 * section reads as a sibling of the "Workspaces/工作区" header.
		 */
		const CSS = [
			`[${HOST_ATTRIBUTE}]{flex:none;min-height:0}`,
			`[${HOST_ATTRIBUTE}] .rss-root{display:flex;flex-direction:column}`,
			`[${HOST_ATTRIBUTE}] .rss-header{box-sizing:border-box;height:36px;margin-bottom:4px;padding-left:4px;display:flex;align-items:center;gap:4px;color:var(--dsw-alias-label-tertiary)}`,
			`[${HOST_ATTRIBUTE}] .rss-label{line-height:20px;overflow:hidden;white-space:nowrap}`,
			`[${HOST_ATTRIBUTE}] .rss-row{box-sizing:border-box;display:flex;align-items:center;gap:6px;height:32px;margin:0 2px;padding:0 8px;border-radius:var(--dsw-radius-md);cursor:pointer;color:var(--dsw-alias-label-primary);user-select:none}`,
			`[${HOST_ATTRIBUTE}] .rss-row:hover,[${HOST_ATTRIBUTE}] .rss-row.rss-row-active{background:var(--dsw-alias-interactive-bg-hover)}`,
			`[${HOST_ATTRIBUTE}] .rss-row:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}`,
			`[${HOST_ATTRIBUTE}] .rss-lead{width:16px;height:20px;flex:none;display:inline-flex;align-items:center;justify-content:center}`,
			`[${HOST_ATTRIBUTE}] .rss-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}`,
			`[${HOST_ATTRIBUTE}] .rss-title{flex:1 1 auto;min-width:0;font-size:14px;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`,
			`[${HOST_ATTRIBUTE}] .rss-ws{flex:0 1 auto;max-width:32%;font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`,
			`[${HOST_ATTRIBUTE}] .rss-time{flex:0 0 auto;font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary)}`,
			`[${HOST_ATTRIBUTE}] .rss-rail{display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 0}`,
			`[${HOST_ATTRIBUTE}] .rss-chip{flex:none;position:relative;box-sizing:border-box;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:13px;line-height:1;color:var(--dsw-alias-label-primary);cursor:pointer;background:var(--dsw-alias-button-elevated-fill,transparent)}`,
			`[${HOST_ATTRIBUTE}] .rss-chip-dot{position:absolute;right:0;bottom:0}`,
			`[${HOST_ATTRIBUTE}] .rss-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}`,
			`[${HOST_ATTRIBUTE}] .rss-chip:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}`,
			`[${HOST_ATTRIBUTE}] .rss-chip.rss-chip-active{box-shadow:inset 0 0 0 1.5px var(--dsw-alias-state-business-primary,#3b82f6)}`
		].join("");
		/**
		 * Configuration-page styles, scoped to the row page rather than the
		 * sidebar host: the page renders in the main area, outside the portal.
		 */
		const CONFIG_CSS = [
			`.rss-config{display:flex;flex-direction:column;gap:16px}`,
			`.rss-config-field{display:flex;flex-direction:column;gap:6px}`,
			`.rss-config-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px}`,
			`.rss-config-label{font-size:14px;line-height:20px;color:var(--dsw-alias-label-primary)}`,
			`.rss-config-input{box-sizing:border-box;width:120px;height:32px;padding:0 8px;font-size:14px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-elevated,transparent);border:1px solid var(--dsw-alias-border-default,currentColor);border-radius:var(--dsw-radius-md)}`,
			`.rss-config-input:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}`,
			`.rss-config-hint{margin:0;font-size:12px;line-height:17px;color:var(--dsw-alias-label-tertiary)}`
		].join("");
		//#endregion

		//#region locale
		/** Strings mirror the stock workspace browser's own labels. */
		const zh = {
			"section.title": "最近使用",
			"time.now": "刚刚",
			"time.minutes": "{n}分钟",
			"time.hours": "{n}小时",
			"time.days": "{n}天",
			"time.months": "{n}个月",
			"time.years": "{n}年",
			"status.running": "进行中",
			"status.waitingApproval": "等待审批",
			"status.planReview": "计划待审",
			"status.waitingAnswer": "等待回答",
			"status.subagentsRunning.one": "{n} 个子智能体运行中",
			"status.subagentsRunning.other": "{n} 个子智能体运行中",
			"status.completed": "已完成",
			"status.idle": "空闲",
			"status.compact.approval": "待审批",
			"status.compact.planReview": "计划待审",
			"status.compact.answer": "待回答",
			"config.summary": "在侧栏工作区上方显示最近使用的会话。",
			"config.limit": "显示条数",
			"config.limitHint": "侧栏中最多列出多少个最近会话（1–50）。",
			"config.showSubagents": "包含子会话",
			"config.showSubagentsHint": "开启后，子智能体创建的会话也会出现在列表里。",
			"config.invalidNumber": "请填 1 到 50 之间的整数。",
			"config.unavailable": "该插件当前未加载，暂时无法配置。"
		};
		const en = {
			"section.title": "Recent",
			"time.now": "now",
			"time.minutes": "{n}min",
			"time.hours": "{n}h",
			"time.days": "{n}d",
			"time.months": "{n}mo",
			"time.years": "{n}y",
			"config.summary": "Show recently used sessions above the workspace browser.",
			"config.limit": "Sessions shown",
			"config.limitHint": "How many recent sessions the sidebar lists (1–50).",
			"config.showSubagents": "Include subagent sessions",
			"config.showSubagentsHint": "When on, sessions created by subagents also appear in the list.",
			"config.invalidNumber": "Enter a whole number from 1 to 50.",
			"config.unavailable": "This plugin is not loaded, so it cannot be configured right now."
		};
		/** Compact relative label through the stock primitives, stock dictionary shape. */
		function timeLabel(updatedAt, now, t) {
			const { unit, n } = relativeTime(updatedAt, now);
			return unit === "now" ? t("time.now") : t(`time.${unit}`, { n });
		}
		//#endregion

		//#region helpers
		function baseName(path) {
			if (typeof path !== "string" || path === "") return "";
			const parts = path.split(/[\\/]+/).filter((part) => part !== "");
			return parts.length === 0 ? "" : parts[parts.length - 1];
		}
		function initialOf(title) {
			if (typeof title !== "string") return "?";
			const trimmed = title.trim();
			return trimmed === "" ? "?" : trimmed.slice(0, 1);
		}
		/* Status presentation, word-for-word port of the stock workspace row logic:
		   pending interaction outranks live activity, which outranks reminders. */
		function visiblePendingKind(kind) {
			switch (kind) {
				case "approval":
				case "plan-review":
				case "question": return kind;
				default: return void 0;
			}
		}
		function runningChildCount(list, parentId, statuses) {
			const catalog = list !== null && list !== void 0 ? list.projectionsBySession?.[parentId]?.values?.subagentCatalog : void 0;
			if (catalog === null || catalog === void 0) return 0;
			return catalog.reduce((count, child) => count + ((statuses?.get(child.id)?.running ?? list?.byId?.[child.id]?.running) === true ? 1 : 0), 0);
		}
		function sessionStatuses(node, t) {
			const subagents = node.runningSubagentCount === 0 ? void 0 : {
				state: "ongoing",
				label: t(node.runningSubagentCount === 1 ? "status.subagentsRunning.one" : "status.subagentsRunning.other", { n: node.runningSubagentCount })
			};
			let pending;
			switch (node.pendingInteraction) {
				case "approval":
					pending = {
						state: "warning",
						label: t("status.waitingApproval"),
						trailingLabel: t("status.compact.approval")
					};
					break;
				case "plan-review":
					pending = {
						state: "warning",
						label: t("status.planReview"),
						trailingLabel: t("status.compact.planReview")
					};
					break;
				case "question":
					pending = {
						state: "warning",
						label: t("status.waitingAnswer"),
						trailingLabel: t("status.compact.answer")
					};
					break;
				default: break;
			}
			if (pending !== void 0) return subagents === void 0 ? [pending] : [pending, subagents];
			if (node.running) {
				const primary = {
					state: "ongoing",
					label: t("status.running")
				};
				return subagents === void 0 ? [primary] : [primary, subagents];
			}
			if (subagents !== void 0) return [subagents];
			if (node.completed === true) return [{
				state: "done",
				label: t("status.completed")
			}];
			return [{
				state: "idle",
				label: t("status.idle")
			}];
		}
		/**
		 * Build the display rows for the recent list from the stock snapshots.
		 * @param config - accepted settings: how many rows to keep and whether
		 * subagent-created sessions count as recent.
		 */
		function buildRows(sessions, workspaces, statuses, t, config) {
			if (sessions === null || sessions === void 0 || workspaces === null || workspaces === void 0) return [];
			const limit = config !== null && config !== void 0 ? config.limit : DEFAULT_LIMIT;
			const showSubagents = config !== null && config !== void 0 ? config.showSubagents : DEFAULT_SHOW_SUBAGENTS;
			const archived = new Set(workspaces.archivedSessionIds ?? []);
			const titleByPath = new Map();
			for (const item of workspaces.items ?? []) if (item !== null && item !== void 0 && item.path !== void 0) titleByPath.set(item.path, item.title);
			const rows = [];
			for (const id of sessions.ids ?? []) {
				const s = sessions.byId?.[id];
				if (s === null || s === void 0) continue;
				if (s.origin === "subagent" && showSubagents !== true) continue;
				if (s.blank === true) continue;
				if (archived.has(id)) continue;
				if (typeof s.updatedAt !== "number" || s.updatedAt <= 0) continue;
				const title = typeof s.displayTitle === "string" ? s.displayTitle.trim() : "";
				if (title === "") continue;
				const wsTitle = s.cwd !== void 0 ? (titleByPath.get(s.cwd) ?? "") : "";
				const status = statuses?.get(id);
				const pendingInteraction = visiblePendingKind(status?.pendingInteraction?.kind);
				rows.push({
					id,
					title,
					updatedAt: s.updatedAt,
					running: status?.running ?? s.running,
					completed: status?.completionUnread === true,
					runningSubagentCount: runningChildCount(sessions, id, statuses),
					...(pendingInteraction === void 0 ? {} : { pendingInteraction }),
					statuses: null,
					active: (s.retainedBy?.mainView ?? 0) > 0,
					wsLabel: wsTitle.trim() !== "" ? wsTitle : (s.cwd !== void 0 ? baseName(s.cwd) : "")
				});
			}
			for (const row of rows) row.statuses = sessionStatuses(row, t);
			rows.sort((a, b) => b.updatedAt - a.updatedAt);
			return rows.slice(0, limit);
		}
		//#endregion

		//#region portal host
		/**
		 * Own a host node placed directly above the workspace browser outlet.
		 * The host is created in `regionArea` (the browser's flex column) before
		 * the `[data-slot="sidebar.workspaces"]` outlet, so the portalled list
		 * renders as a sibling section above the browser. A MutationObserver
		 * keeps the host correctly placed when the browser remounts.
		 */
		function usePortalHost() {
			const [host, setHost] = react.useState(null);
			react.useEffect(() => {
				let disposed = false;
				let raf = 0;
				let observer = null;
				let hostEl = null;
				let observedNode = null;
				let attempts = 0;

				const anchorOf = () => {
					const anchor = document.querySelector(ANCHOR_SELECTOR);
					return anchor !== null && anchor.isConnected ? anchor : null;
				};
				const armObserver = () => {
					const anchor = anchorOf();
					const node = anchor !== null ? anchor.parentNode : null;
					if (node === observedNode) return;
					observedNode = node;
					if (observer === null) observer = new MutationObserver(onMutate);
					observer.disconnect();
					if (node !== null) observer.observe(node, { childList: true });
				};
				const sync = () => {
					const anchor = anchorOf();
					if (anchor === null || anchor.parentNode === null) return false;
					const region = anchor.parentNode;
					if (hostEl === null || !hostEl.isConnected) {
						hostEl = document.createElement("div");
						hostEl.setAttribute(HOST_ATTRIBUTE, "");
						region.insertBefore(hostEl, anchor);
					} else if (anchor.previousSibling !== hostEl) {
						region.insertBefore(hostEl, anchor);
					}
					setHost((prev) => (prev === hostEl ? prev : hostEl));
					return true;
				};
				const tick = () => {
					if (disposed) return;
					if (sync()) {
						armObserver();
					} else {
						attempts += 1;
						if (attempts >= 600) return;
						raf = requestAnimationFrame(tick);
					}
				};
				const onMutate = () => {
					if (disposed) return;
					if (!sync()) {
						if (raf === 0) raf = requestAnimationFrame(tick);
					} else {
						armObserver();
					}
				};
				tick();
				return () => {
					disposed = true;
					if (raf !== 0) cancelAnimationFrame(raf);
					if (observer !== null) observer.disconnect();
					if (hostEl !== null && hostEl.isConnected) hostEl.remove();
					hostEl = null;
				};
			}, []);
			return host;
		}
		//#endregion

		//#region components
		/**
		 * Read the accepted settings through the injected snapshot store. Slot
		 * `inject()` faces arrive as props, so a change re-renders the list the
		 * same way the stock session snapshots do.
		 */
		function useRecentConfig(props) {
			return props.useRecentConfig !== void 0 ? props.useRecentConfig((snapshot) => snapshot) : void 0;
		}
		/** Entry component mounted in `sidebar.footer.action`; portals the list. */
		function Driver(props) {
			const host = usePortalHost();
			if (host === null) return null;
			return reactDom.createPortal(h(RecentList, props), host);
		}
		/** The recent-session section; renders nothing when there are no rows. */
		function RecentList(props) {
			const { useSessions, useSessionStatus, useWorkspaces, openSession, t, wide } = props;
			const config = useRecentConfig(props);
			const sessions = useSessions((state) => state);
			const statuses = useSessionStatus !== void 0 ? useSessionStatus((state) => state) : void 0;
			const workspaces = useWorkspaces((state) => state);
			const [now, setNow] = react.useState(() => Date.now());
			react.useEffect(() => {
				const timer = window.setInterval(() => setNow(Date.now()), 30000);
				return () => window.clearInterval(timer);
			}, []);
			const rows = react.useMemo(() => buildRows(sessions, workspaces, statuses, t, config), [sessions, workspaces, statuses, t, config]);
			if (rows.length === 0) return null;
			const activate = (id) => openSession(id);
			const onKeyDown = (event, id) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					activate(id);
				}
			};
			if (wide === false) {
				return h("div", { className: "rss-rail", role: "list", "aria-label": t("section.title") },
					rows.map((row) => h("span", {
						key: row.id,
						className: `rss-chip${row.active ? " rss-chip-active" : ""}`,
						role: "listitem",
						tabIndex: 0,
						title: row.title,
						onClick: () => activate(row.id),
						onKeyDown: (event) => onKeyDown(event, row.id)
					},
						initialOf(row.title),
						row.statuses[0].state !== "idle" ? h(StateDot, { state: row.statuses[0].state, size: 8, className: "rss-chip-dot" }) : null
					))
				);
			}
			return h("div", { className: "rss-root", role: "list", "aria-label": t("section.title") },
				h("div", { className: "rss-header" },
					h("span", { className: "rss-label" }, t("section.title"))
				),
				rows.map((row) => h("div", {
					key: row.id,
					className: `rss-row${row.active ? " rss-row-active" : ""}`,
					role: "listitem",
					tabIndex: 0,
					title: row.wsLabel !== "" ? `${row.title} · ${row.wsLabel}` : row.title,
					onClick: () => activate(row.id),
					onKeyDown: (event) => onKeyDown(event, row.id)
				},
					row.statuses[0].state !== "idle"
						? h("span", { className: "rss-lead" },
							h(StateDot, { state: row.statuses[0].state }),
							row.statuses.map((status, i) => h("span", { key: i, className: "rss-sr" }, status.label))
						)
						: h("span", { className: "rss-lead" }),
					h("span", { className: "rss-title" }, row.title),
					row.wsLabel !== "" ? h("span", { className: "rss-ws" }, row.wsLabel) : null,
					h("span", { className: "rss-time" }, row.statuses[0].trailingLabel ?? timeLabel(row.updatedAt, now, t))
				))
			);
		}
		/**
		 * The row's configuration page. Two controls write straight through
		 * `configForms`, so a change takes effect immediately and nothing is
		 * staged behind a save button — the same contract the Chat target uses for
		 * its link-opening preference.
		 */
		function RecentConfig(props) {
			const { t, view } = props;
			const state = props.useRecentConfig((snapshot) => snapshot);
			if (view === "summary") return t("config.summary");
			const writable = state.writable === true;
			const limit = typeof state.limit === "number" ? state.limit : DEFAULT_LIMIT;
			const showSubagents = state.showSubagents === true;
			const idLimit = `${NS}-config-limit`;
			return h("div", { className: "rss-config" },
				h("div", { className: "rss-config-field" },
					h("label", { className: "rss-config-label", htmlFor: idLimit }, t("config.limit")),
					h("input", {
						id: idLimit,
						className: "rss-config-input",
						type: "number",
						inputMode: "numeric",
						min: MIN_LIMIT,
						max: MAX_LIMIT,
						step: 1,
						value: String(limit),
						disabled: !writable,
						onChange: (event) => {
							const next = Number(event.target.value);
							if (!Number.isInteger(next) || next < MIN_LIMIT || next > MAX_LIMIT) return;
							props.write("limit", next);
						}
					}),
					h("p", { className: "rss-config-hint" }, t("config.limitHint"))
				),
				h("div", { className: "rss-config-field" },
					h("div", { className: "rss-config-toggle" },
						h("span", { className: "rss-config-label" }, t("config.showSubagents")),
						h(Switch, {
							checked: showSubagents,
							label: t("config.showSubagents"),
							disabled: !writable,
							onChange: (checked) => props.write("showSubagents", checked === true)
						})
					),
					h("p", { className: "rss-config-hint" }, t("config.showSubagentsHint"))
				)
			);
		}
		//#endregion
		/** Client services this plugin reads directly from the guarded ctx. */
		const inject = ["slots", "locale", "configForms"];
		function apply(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = NS;
				style.textContent = `${CSS}${CONFIG_CSS}`;
				document.head.append(style);
				return () => style.remove();
			}, `${NS}: styles`);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), `${NS}: dictionaries`);
			/** Same open path the stock workspace browser rows use. */
			const openSession = (sessionId) => {
				if (typeof sessionId !== "string" || sessionId === "") return;
				const uiWorkspace = ctx.get("uiWorkspace");
				if (uiWorkspace !== void 0 && typeof uiWorkspace.openSession === "function") uiWorkspace.openSession(sessionId);
			};
			/**
			 * Mirror the accepted configuration into a snapshot store so the list
			 * re-renders when either option changes. The Host stays the fact
			 * source; this only projects the fields the list reads.
			 */
			const scope = ctx.configForms.get(ENTRY_ID);
			const project = () => {
				const snapshot = scope.getSnapshot();
				const value = snapshot.value;
				return {
					limit: typeof value?.limit === "number" ? value.limit : DEFAULT_LIMIT,
					showSubagents: value?.showSubagents === true,
					writable: snapshot.writable === true
				};
			};
			const config = createSnapshotStore(project());
			ctx.effect(() => scope.subscribe(() => {
				const next = project();
				const prev = config.getSnapshot();
				if (prev.limit === next.limit && prev.showSubagents === next.showSubagents && prev.writable === next.writable) return;
				config.set(next);
			}), `${NS}: configuration subscription`);
			/** Write one option; the Host validates and answers with a new snapshot. */
			const write = (field, value) => {
				scope.set(field, value).catch(() => {});
			};
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: NS,
				locale: NS,
				inject: () => ({ hooks: { recentConfig: config } })
			}, (slotProps) => h(Driver, { ...slotProps, openSession })));
			ctx.slots.inject("plugins.row.config", () => ctx.slots.register({
				name: "plugins.row.config",
				key: `${PACKAGE_NAME}#${ENTRY_ID}`,
				locale: NS,
				inject: () => ({
					hooks: { recentConfig: config },
					write
				})
			}, RecentConfig));
		}
		module.exports.apply = apply;
		module.exports.inject = inject;
		//#endregion
		return module.exports;
	}
});
