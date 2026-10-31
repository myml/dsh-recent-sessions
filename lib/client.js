window.__ModuleLoader__.load({
	id: "dsh-recent-sessions",
	factory: (require) => {
		var module = { exports: {} };
		const react = require("react");
		const reactDom = require("react-dom");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const relativeTime = primitives.relativeTime;
		/** The stock marker component: spinner for `ongoing`, colored dot otherwise. */
		const StateDot = primitives.StateDot;

		//#region constants
		/** Locale namespace registered on the shared locale service. */
		const NS = "dsh-recent-sessions";
		/** Number of recent sessions shown above the workspace browser. */
		const RECENT_COUNT = 5;
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
			"status.compact.answer": "待回答"
		};
		const en = {
			"section.title": "Recent",
			"time.now": "now",
			"time.minutes": "{n}min",
			"time.hours": "{n}h",
			"time.days": "{n}d",
			"time.months": "{n}mo",
			"time.years": "{n}y"
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
		/** Build the display rows for the recent list from the stock snapshots. */
		function buildRows(sessions, workspaces, statuses, t) {
			if (sessions === null || sessions === void 0 || workspaces === null || workspaces === void 0) return [];
			const archived = new Set(workspaces.archivedSessionIds ?? []);
			const titleByPath = new Map();
			for (const item of workspaces.items ?? []) if (item !== null && item !== void 0 && item.path !== void 0) titleByPath.set(item.path, item.title);
			const rows = [];
			for (const id of sessions.ids ?? []) {
				const s = sessions.byId?.[id];
				if (s === null || s === void 0) continue;
				if (s.origin === "subagent") continue;
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
			return rows.slice(0, RECENT_COUNT);
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
		/** Entry component mounted in `sidebar.footer.action`; portals the list. */
		function Driver(props) {
			const host = usePortalHost();
			if (host === null) return null;
			return reactDom.createPortal(h(RecentList, props), host);
		}
		/** The recent-session section; renders nothing when there are no rows. */
		function RecentList(props) {
			const { useSessions, useSessionStatus, useWorkspaces, openSession, t, wide } = props;
			const sessions = useSessions((state) => state);
			const statuses = useSessionStatus !== void 0 ? useSessionStatus((state) => state) : void 0;
			const workspaces = useWorkspaces((state) => state);
			const [now, setNow] = react.useState(() => Date.now());
			react.useEffect(() => {
				const timer = window.setInterval(() => setNow(Date.now()), 30000);
				return () => window.clearInterval(timer);
			}, []);
			const rows = react.useMemo(() => buildRows(sessions, workspaces, statuses, t), [sessions, workspaces, statuses, t]);
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
		//#endregion

		//#region entry point
		/** Client services this plugin reads directly from the guarded ctx. */
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = NS;
				style.textContent = CSS;
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
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: NS,
				locale: NS
			}, (slotProps) => h(Driver, { ...slotProps, openSession })));
		}
		module.exports.apply = apply;
		module.exports.inject = inject;
		//#endregion
		return module.exports;
	}
});
