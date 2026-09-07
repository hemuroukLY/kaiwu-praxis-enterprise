// kaiwu-praxis-enterprise 浏览器插件：独立企业管理入口与六个基础模块。
window.__ModuleLoader__.load({
  id: "kaiwu-praxis-enterprise",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");
    function defaultHubUrl() {
      if (typeof window === "undefined") return "http://127.0.0.1:3099";
      return window.location.protocol + "//" + window.location.hostname + ":3099";
    }
    var WORKER_NAMES = {
      "kaiwu-watermark": "水印工具",
      "kaiwu-docbutler": "资料管家",
      "kaiwu-content": "内容撰稿员",
      "kaiwu-competitor": "竞品分析员",
      "kaiwu-research": "情报采集员",
      "kaiwu-brand-auditor": "品牌诊断员",
      "kaiwu-data-tracker": "数据追踪员"
    };

    var CSS = [
      ".kep-fixed{position:fixed;top:0;right:0;bottom:0;left:280px;z-index:2147483647!important;background:#fcfcfc;color:#18181a;font-family:'Geist Variable','PingFang SC','Microsoft YaHei',sans-serif;display:flex;flex-direction:column;overflow:hidden;pointer-events:auto}",
      ".kep-topbar{height:60px;display:flex;align-items:center;gap:12px;padding:0 28px;border-bottom:1px solid #e8eaee;flex:none}",
      ".kep-back{border:0;background:transparent;color:#657083;cursor:pointer;font:inherit;padding:7px 10px;border-radius:8px}.kep-back:hover{background:#f0f2f5}",
      ".kep-title{font-size:16px;font-weight:700}",
      ".kep-root{flex:1;min-height:0;display:flex;padding:20px 28px 22px;gap:20px;overflow:hidden}",
      ".kep-nav{width:188px;flex:none;display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid #e4e7ec;border-radius:16px;background:#fff}",
      ".kep-brand{padding:10px 10px 14px;border-bottom:1px solid #e4e7ec;margin-bottom:4px}.kep-brand strong{display:block;font-size:14px}.kep-brand span{display:block;color:#8a94a5;font-size:11px;margin-top:4px}",
      ".kep-navBtn{display:flex;align-items:center;gap:9px;border:0;background:transparent;color:#667085;border-radius:10px;padding:9px 10px;cursor:pointer;text-align:left;font:inherit}.kep-navBtn:hover{background:#f4f6f8}.kep-navBtn[data-active=true]{background:#edf3ff;color:#245dcc;font-weight:600}",
      ".kep-panel{flex:1;min-width:0;overflow:auto;padding:2px 2px 18px}",
      ".kep-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.kep-header h2{font-size:20px;line-height:28px;margin:0}.kep-header p{font-size:12px;line-height:18px;color:#8a94a5;margin:3px 0 0}",
      ".kep-status{font-size:12px;color:#17a85b}.kep-error{font-size:12px;color:#d92d20}",
      ".kep-grid{display:grid;grid-template-columns:repeat(4,minmax(140px,1fr));gap:12px;margin-bottom:18px}.kep-card{border:1px solid #e4e7ec;border-radius:15px;background:#fff;padding:15px}.kep-card strong{display:block;font-size:24px;line-height:30px}.kep-card span{font-size:12px;color:#8a94a5}",
      ".kep-split{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}.kep-section{border:1px solid #e4e7ec;border-radius:15px;background:#fff;padding:14px;margin-bottom:14px}.kep-section h3{font-size:14px;margin:0 0 12px}.kep-desc{font-size:12px;color:#7b8493;line-height:18px}.kep-bar{height:8px;background:#edf0f4;border-radius:999px;overflow:hidden;margin-top:8px}.kep-bar i{display:block;height:100%;border-radius:inherit;background:#2563eb}",
      ".kep-tableWrap{overflow:auto}.kep-table{width:100%;border-collapse:collapse;font-size:12px}.kep-table th{text-align:left;color:#8a94a5;font-weight:500;padding:9px 10px;border-bottom:1px solid #e4e7ec;white-space:nowrap}.kep-table td{padding:11px 10px;border-bottom:1px solid #eef0f3;vertical-align:top}.kep-badge{display:inline-flex;border-radius:999px;background:#f0f2f5;color:#667085;padding:2px 8px}.kep-online{color:#17a85b}",
      ".kep-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.kep-input,.kep-textarea{width:100%;box-sizing:border-box;border:1px solid #d9dee7;border-radius:9px;background:#fff;color:#24272c;padding:8px 10px;font:inherit;font-size:12px}.kep-textarea{grid-column:1/-1;min-height:95px;resize:vertical}.kep-targets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:10px;border:1px solid #e4e7ec;border-radius:10px}.kep-targets strong{grid-column:1/-1;font-size:12px}.kep-target{display:flex;align-items:center;gap:7px;font-size:12px;color:#566174}.kep-actions{grid-column:1/-1;display:flex;align-items:center;gap:10px}.kep-primary{margin-left:auto;border:0;border-radius:9px;background:#2563eb;color:#fff;padding:8px 16px;cursor:pointer;font:inherit;font-size:12px}.kep-primary:disabled{opacity:.55;cursor:not-allowed}.kep-empty{padding:36px;text-align:center;color:#8a94a5}",
      ".kep-entry{width:100%;display:flex;align-items:center;gap:10px;border:0;border-radius:9px;background:transparent;color:inherit;padding:8px 10px;cursor:pointer;font:inherit;text-align:left}.kep-entry:hover,.kep-entry[data-active=true]{background:rgba(127,127,127,.12)}.kep-entryIcon{width:18px;height:18px;display:inline-flex}.kep-entryLabel{white-space:nowrap}",
      ".kep-login{max-width:620px;margin:50px auto}.kep-login h2{margin:0 0 8px}.kep-code{font-family:ui-monospace,Consolas,monospace;font-size:14px;word-break:break-all}.kep-warning{border:1px solid #fde68a;background:#fffbeb;color:#92400e;border-radius:10px;padding:10px 12px;font-size:12px;line-height:18px;margin-bottom:12px}",
      ".kep-guideBtn{border:1px solid #d9dee7;border-radius:9px;background:#fff;color:#475467;padding:7px 12px;cursor:pointer;font:inherit;font-size:12px}.kep-guideMask{position:fixed;inset:0;z-index:2147483648;background:rgba(15,23,42,.38);display:flex;align-items:center;justify-content:center;padding:24px}.kep-guide{width:min(620px,calc(100vw - 48px));max-height:calc(100vh - 80px);overflow:auto;border-radius:16px;background:#fff;box-shadow:0 24px 80px rgba(15,23,42,.2);padding:22px}.kep-guideHead{display:flex;align-items:center;justify-content:space-between;gap:16px}.kep-guideHead h2{margin:0;font-size:19px}.kep-guideClose{border:0;background:transparent;color:#667085;cursor:pointer;font-size:22px}.kep-guide ol{padding-left:22px;font-size:13px;line-height:1.85;color:#475467}.kep-guide h3{font-size:14px;margin:18px 0 6px}.kep-guide p{font-size:12px;line-height:1.7;color:#667085;margin:5px 0}",
      "body[data-ds-dark-theme] .kep-fixed{background:#111214;color:#f5f6f7}body[data-ds-dark-theme] .kep-topbar,body[data-ds-dark-theme] .kep-nav,body[data-ds-dark-theme] .kep-card,body[data-ds-dark-theme] .kep-section,body[data-ds-dark-theme] .kep-targets{border-color:#303238}body[data-ds-dark-theme] .kep-nav,body[data-ds-dark-theme] .kep-card,body[data-ds-dark-theme] .kep-section,body[data-ds-dark-theme] .kep-guide{background:#191a1e}body[data-ds-dark-theme] .kep-navBtn[data-active=true]{background:#263550;color:#8eb7ff}body[data-ds-dark-theme] .kep-input,body[data-ds-dark-theme] .kep-textarea,body[data-ds-dark-theme] .kep-guideBtn{background:#202227;border-color:#3a3d45;color:#f5f6f7}body[data-ds-dark-theme] .kep-table th,body[data-ds-dark-theme] .kep-table td{border-color:#303238}body[data-ds-dark-theme] .kep-badge{background:#2a2c31;color:#c3c8d0}"
    ].join("");
    var CSS_TAG = "kaiwu-praxis-enterprise/console.css";
    if (typeof document !== "undefined" && !document.querySelector('style[data-plugin-css="' + CSS_TAG + '"]')) {
      var style = document.createElement("style");
      style.dataset.plugin = "kaiwu-praxis-enterprise";
      style.dataset.pluginCss = CSS_TAG;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    var store = {
      open: false,
      listeners: [],
      toggle: function () { setOpen(!store.open); },
      subscribe: function (fn) { store.listeners.push(fn); return function () { store.listeners = store.listeners.filter(function (item) { return item !== fn; }); }; }
    };
    function setOpen(open) {
      store.open = open;
      for (var i = 0; i < store.listeners.length; i++) store.listeners[i](open);
    }

    function sidebarRoot() {
      var column = document.querySelector("[data-pane='sidebar'], [class*='sidebarCol']");
      if (!column) return undefined;
      return column.querySelector("[class*='logoRow']")?.parentElement || column.firstElementChild;
    }
    function createEntry() {
      var entry = document.createElement("button");
      entry.type = "button";
      entry.className = "kep-entry";
      entry.setAttribute("data-kaiwu-enterprise-entry", "");
      entry.setAttribute("data-dsh-plugin", "kaiwu-praxis-enterprise");
      entry.setAttribute("aria-label", "企业管理");
      entry.innerHTML = '<span class="kep-entryIcon"><svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h3"/></svg></span><span class="kep-entryLabel">企业管理</span>';
      entry.addEventListener("click", store.toggle);
      return entry;
    }
    function placeEntry(root, entry) {
      var plaza = root.querySelector("[data-kaiwu-plaza-entry]");
      if (plaza) root.insertBefore(entry, plaza);
      else {
        var button = root.querySelector("button[class*='newSession']") || root.querySelector("button");
        if (!button) return false;
        var row = button.closest("[class*='logoRow']");
        var base = row && row.parentElement === root ? row : button;
        root.insertBefore(entry, base.nextElementSibling);
      }
      return true;
    }
    function mountEntry() {
      if (typeof document === "undefined" || document.querySelector("[data-kaiwu-enterprise-entry]")) return function () {};
      var entry = createEntry();
      var root;
      function sync() { if (store.open) entry.setAttribute("data-active", "true"); else entry.removeAttribute("data-active"); }
      var unsub = store.subscribe(sync);
      function place() {
        if (!root || !root.isConnected) root = sidebarRoot();
        if (root && !root.contains(entry)) placeEntry(root, entry);
      }
      var observer = new MutationObserver(place);
      observer.observe(document.body, { childList: true, subtree: true });
      sync();
      place();
      return function () { observer.disconnect(); unsub(); entry.remove(); };
    }

    function messageOf(error) { return error instanceof Error ? error.message : String(error); }
    function workerName(id) { return WORKER_NAMES[id] || id; }
    function formatTime(value) {
      if (!value) return "—";
      try { return new Date(value).toLocaleString("zh-CN", { hour12: false }); } catch (_) { return "—"; }
    }
    function enabledCapabilities(worker) {
      return (worker.skills || []).filter(function (item) { return item.enabled !== false && item.deleted !== true; }).length +
        (worker.tools || []).filter(function (item) { return item.enabled !== false; }).length;
    }

    function EnterpriseConsole() {
      var _visible = React.useState(false), visible = _visible[0], setVisible = _visible[1];
      var _left = React.useState(280), left = _left[0], setLeft = _left[1];
      var _tab = React.useState("overview"), tab = _tab[0], setTab = _tab[1];
      var _state = React.useState({ terminals: [], audit: [] }), state = _state[0], setState = _state[1];
      var _error = React.useState(""), error = _error[0], setError = _error[1];
      var _busy = React.useState(false), busy = _busy[0], setBusy = _busy[1];
      var _message = React.useState(""), message = _message[0], setMessage = _message[1];
      var _action = React.useState("addKnowledge"), action = _action[0], setAction = _action[1];
      var _name = React.useState(""), configName = _name[0], setConfigName = _name[1];
      var _description = React.useState(""), configDescription = _description[0], setConfigDescription = _description[1];
      var _content = React.useState(""), configContent = _content[0], setConfigContent = _content[1];
      var _terminals = React.useState({}), selectedTerminals = _terminals[0], setSelectedTerminals = _terminals[1];
      var _workers = React.useState({}), selectedWorkers = _workers[0], setSelectedWorkers = _workers[1];
      var _hubUrl = React.useState(function () { return localStorage.getItem("kaiwu.enterprise.hubUrl") || defaultHubUrl(); }), hubUrl = _hubUrl[0], setHubUrl = _hubUrl[1];
      var _adminToken = React.useState(function () { return localStorage.getItem("kaiwu.enterprise.adminToken") || ""; }), adminToken = _adminToken[0], setAdminToken = _adminToken[1];
      var _draftHub = React.useState(hubUrl), draftHub = _draftHub[0], setDraftHub = _draftHub[1];
      var _draftToken = React.useState(adminToken), draftToken = _draftToken[0], setDraftToken = _draftToken[1];
      var _enrollLabel = React.useState("员工端接入"), enrollLabel = _enrollLabel[0], setEnrollLabel = _enrollLabel[1];
      var _enrollUses = React.useState("1"), enrollUses = _enrollUses[0], setEnrollUses = _enrollUses[1];
      var _createdCode = React.useState(""), createdCode = _createdCode[0], setCreatedCode = _createdCode[1];
      var _guideOpen = React.useState(false), guideOpen = _guideOpen[0], setGuideOpen = _guideOpen[1];

      React.useEffect(function () { setVisible(store.open); return store.subscribe(setVisible); }, []);
      React.useEffect(function () { if (visible && !adminToken) setTab("access"); }, [visible, adminToken]);
      React.useEffect(function () {
        function measure() {
          var col = document.querySelector("[class*='sidebarCol']") || document.querySelector("[data-pane='sidebar']");
          if (col) { var width = col.getBoundingClientRect().width; if (width > 0) setLeft(width); }
        }
        measure();
        var observer = new MutationObserver(measure);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        window.addEventListener("resize", measure);
        return function () { observer.disconnect(); window.removeEventListener("resize", measure); };
      }, []);

      function apiFetch(path, options) {
        var next = Object.assign({}, options || {});
        next.headers = Object.assign({}, next.headers || {}, { authorization: "Bearer " + adminToken });
        return fetch(hubUrl.replace(/\/$/, "") + path, next);
      }
      function saveAccess() {
        var nextHub = draftHub.trim().replace(/\/$/, "");
        var nextToken = draftToken.trim();
        localStorage.setItem("kaiwu.enterprise.hubUrl", nextHub);
        localStorage.setItem("kaiwu.enterprise.adminToken", nextToken);
        setHubUrl(nextHub); setAdminToken(nextToken); setError(""); setMessage("连接配置已保存");
      }
      function load() {
        if (!adminToken) { setError("请输入管理员令牌"); return Promise.resolve(); }
        return apiFetch("/api/state").then(function (response) {
          if (!response.ok) throw new Error("企业中枢 " + response.status);
          return response.json();
        }).then(function (next) { setState(next); setError(""); return next; })
          .catch(function (err) { setError(messageOf(err)); });
      }
      React.useEffect(function () {
        if (!visible) return;
        var alive = true;
        function refresh() { if (alive) load(); }
        refresh();
        var timer = setInterval(refresh, 3000);
        return function () { alive = false; clearInterval(timer); };
      }, [visible, hubUrl, adminToken]);

      var endpoints = state.terminals || [];
      var onlineEndpoints = endpoints.filter(function (item) { return item.status === "online"; });
      var known = {};
      endpoints.forEach(function (terminal) { Object.keys(terminal.workers || {}).forEach(function (id) { known[id] = true; }); });
      var workerIds = Object.keys(known).sort(function (a, b) { return workerName(a).localeCompare(workerName(b), "zh-CN"); });

      React.useEffect(function () {
        if (onlineEndpoints.length && !Object.keys(selectedTerminals).length) {
          var terminalMap = {}; onlineEndpoints.forEach(function (item) { terminalMap[item.id] = true; }); setSelectedTerminals(terminalMap);
        }
        if (workerIds.length && !Object.keys(selectedWorkers).length) {
          var workerMap = {}; workerIds.forEach(function (id) { workerMap[id] = true; }); setSelectedWorkers(workerMap);
        }
      }, [onlineEndpoints.map(function (item) { return item.id; }).join("|"), workerIds.join("|")]);

      if (!visible) return null;

      var installs = endpoints.reduce(function (sum, terminal) { return sum + Object.keys(terminal.workers || {}).length; }, 0);
      var capabilityTotal = endpoints.reduce(function (sum, terminal) {
        return sum + Object.keys(terminal.workers || {}).reduce(function (subtotal, id) { return subtotal + enabledCapabilities(terminal.workers[id] || {}); }, 0);
      }, 0);
      var conversationTotal = endpoints.reduce(function (sum, terminal) { return sum + (Number(terminal.sessionCount) || 0); }, 0);
      var libraryMap = {};
      endpoints.forEach(function (terminal) {
        Object.keys(terminal.workers || {}).forEach(function (workerId) {
          var worker = terminal.workers[workerId] || {};
          (worker.skills || []).filter(function (item) { return item.deleted !== true; }).forEach(function (item) {
            var key = "技能::" + (item.id || item.name);
            if (!libraryMap[key]) libraryMap[key] = { type: "技能", name: item.name, source: item.source, version: item.packageVersion, coverage: {} };
            libraryMap[key].coverage[terminal.id + "::" + workerId] = true;
          });
          (worker.tools || []).forEach(function (item) {
            var key = "工具::" + (item.id || item.name);
            if (!libraryMap[key]) libraryMap[key] = { type: "工具", name: item.name, source: item.source, version: item.packageVersion, coverage: {} };
            libraryMap[key].coverage[terminal.id + "::" + workerId] = true;
          });
        });
      });
      var library = Object.keys(libraryMap).map(function (key) { return libraryMap[key]; }).sort(function (a, b) { return a.type.localeCompare(b.type) || a.name.localeCompare(b.name); });
      var toolNames = library.filter(function (item) { return item.type === "工具"; }).map(function (item) { return item.name; }).filter(function (name, index, list) { return list.indexOf(name) === index; });

      function nav(id, label, icon) {
        return React.createElement("button", { type: "button", className: "kep-navBtn", "data-active": tab === id, "data-enterprise-nav": id, onClick: function () { setTab(id); setMessage(""); } }, React.createElement("span", null, icon), label);
      }
      function metric(value, label) { return React.createElement("div", { className: "kep-card" }, React.createElement("strong", null, String(value)), React.createElement("span", null, label)); }
      function table(headers, rows, key) {
        return React.createElement("div", { className: "kep-tableWrap" }, React.createElement("table", { className: "kep-table", "data-enterprise-table": key }, React.createElement("thead", null, React.createElement("tr", null, headers.map(function (label) { return React.createElement("th", { key: label }, label); }))), React.createElement("tbody", null, rows)));
      }
      function overviewBody() {
        var coverage = installs === 0 ? 0 : Math.round(installs / Math.max(1, endpoints.length * workerIds.length) * 100);
        return React.createElement(React.Fragment, null,
          React.createElement("div", { className: "kep-grid" }, metric(onlineEndpoints.length, "在线终端"), metric(installs, "员工实例"), metric(capabilityTotal, "能力资产"), metric(conversationTotal, "累计对话")),
          React.createElement("div", { className: "kep-split" },
            React.createElement("section", { className: "kep-section" }, React.createElement("h3", null, "纳管覆盖率"), React.createElement("div", { className: "kep-desc" }, installs + " / " + (endpoints.length * workerIds.length) + " 个员工实例已纳管"), React.createElement("div", { className: "kep-bar" }, React.createElement("i", { style: { width: coverage + "%" } }))),
            React.createElement("section", { className: "kep-section" }, React.createElement("h3", null, "最近审计"), (state.audit || []).slice(0, 4).map(function (item) { return React.createElement("div", { key: item.id, className: "kep-desc", style: { marginBottom: "8px" } }, formatTime(item.time) + " · " + item.action + " · " + item.result); }))
          ));
      }
      function terminalsBody() {
        return table(["终端", "地址", "状态", "员工端版本", "数字员工", "累计对话", "最后心跳"], endpoints.map(function (item) {
          var address = item.remoteAddress || item.hostname || "—";
          if (item.port) address += ":" + item.port;
          return React.createElement("tr", { key: item.id, "data-terminal-id": item.id }, React.createElement("td", null, item.name), React.createElement("td", null, address), React.createElement("td", null, React.createElement("span", { className: item.status === "online" ? "kep-online" : "kep-badge" }, item.status === "online" ? "在线" : "离线")), React.createElement("td", null, item.version || "—"), React.createElement("td", null, String(Object.keys(item.workers || {}).length)), React.createElement("td", null, String(Number(item.sessionCount) || 0)), React.createElement("td", null, formatTime(item.lastSeen)));
        }), "terminals");
      }
      function workersBody() {
        return table(["数字员工", "安装实例", "累计对话", "资料", "启用能力", "部门"], workerIds.map(function (id) {
          var copies = []; endpoints.forEach(function (terminal) { if (terminal.workers && terminal.workers[id]) copies.push(terminal.workers[id]); });
          var knowledge = copies.reduce(function (sum, worker) { return sum + (worker.knowledge || []).length; }, 0);
          var capabilities = copies.reduce(function (sum, worker) { return sum + enabledCapabilities(worker); }, 0);
          var conversations = endpoints.reduce(function (sum, terminal) { return sum + Number((terminal.sessionsByWorker || {})[id] || 0); }, 0);
          var departments = copies.map(function (worker) { return worker.profile && worker.profile.department; }).filter(Boolean).filter(function (value, index, list) { return list.indexOf(value) === index; }).join("、");
          return React.createElement("tr", { key: id, "data-worker-id": id }, React.createElement("td", null, workerName(id)), React.createElement("td", null, String(copies.length)), React.createElement("td", null, String(conversations)), React.createElement("td", null, String(knowledge)), React.createElement("td", null, String(capabilities)), React.createElement("td", null, departments || "—"));
        }), "workers");
      }
      function libraryBody() {
        return table(["类型", "能力名称", "来源", "版本", "覆盖范围"], library.map(function (item, index) {
          return React.createElement("tr", { key: item.type + item.name + index }, React.createElement("td", null, React.createElement("span", { className: "kep-badge" }, item.type)), React.createElement("td", null, item.name), React.createElement("td", null, item.source || "—"), React.createElement("td", null, item.version || "—"), React.createElement("td", null, Object.keys(item.coverage).length + " 个实例"));
        }), "library");
      }
      function toggle(current, setter, id) { var next = Object.assign({}, current); next[id] = !next[id]; setter(next); }
      function applyBatch() {
        var terminalIds = endpoints.filter(function (item) { return selectedTerminals[item.id]; }).map(function (item) { return item.id; });
        var targets = workerIds.filter(function (id) { return selectedWorkers[id]; });
        var effectiveName = configName.trim();
        if (!terminalIds.length || !targets.length) { setMessage("请选择员工端和数字员工"); return; }
        if (!effectiveName) { setMessage("请输入配置名称"); return; }
        var labels = { addKnowledge: "增加资料", removeKnowledge: "删除资料", addSop: "增加 SOP", removeSop: "删除 SOP", addSkill: "增加技能", removeSkill: "删除技能", enableTool: "启用工具", disableTool: "停用工具" };
        setBusy(true); setMessage("");
        apiFetch("/api/batch", { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ terminalIds: terminalIds, workerIds: targets, payload: { action: action, name: effectiveName, description: configDescription, content: configContent }, actionLabel: labels[action], detail: effectiveName + " → " + targets.map(workerName).join("、") }) })
          .then(function (response) { if (!response.ok) throw new Error("企业中枢 " + response.status); return response.json(); })
          .then(function () { setBusy(false); setMessage("配置已下发"); setTimeout(load, 3500); })
          .catch(function (err) { setBusy(false); setMessage(messageOf(err)); });
      }
      function batchBody() {
        var labels = { addKnowledge: "增加资料", removeKnowledge: "删除资料", addSop: "增加 SOP", removeSop: "删除 SOP", addSkill: "增加技能", removeSkill: "删除技能", enableTool: "启用工具", disableTool: "停用工具" };
        var toolAction = action === "enableTool" || action === "disableTool";
        var contentAction = action === "addKnowledge" || action === "addSop" || action === "addSkill";
        return React.createElement("section", { className: "kep-section", "data-enterprise-batch": "" }, React.createElement("div", { className: "kep-form" },
          React.createElement("select", { className: "kep-input", value: action, onChange: function (event) { setAction(event.target.value); setConfigName(""); } }, Object.keys(labels).map(function (value) { return React.createElement("option", { key: value, value: value }, labels[value]); })),
          toolAction ? React.createElement("select", { className: "kep-input", value: configName, onChange: function (event) { setConfigName(event.target.value); } }, React.createElement("option", { value: "" }, "选择工具"), toolNames.map(function (name) { return React.createElement("option", { key: name, value: name }, name); })) : React.createElement("input", { className: "kep-input", value: configName, placeholder: "配置名称", onChange: function (event) { setConfigName(event.target.value); } }),
          action === "addSkill" ? React.createElement("input", { className: "kep-input", value: configDescription, placeholder: "技能描述", onChange: function (event) { setConfigDescription(event.target.value); } }) : null,
          contentAction ? React.createElement("textarea", { className: "kep-textarea", value: configContent, placeholder: "配置内容", onChange: function (event) { setConfigContent(event.target.value); } }) : null,
          React.createElement("div", { className: "kep-targets" }, React.createElement("strong", null, "员工端"), endpoints.map(function (item) { return React.createElement("label", { key: item.id, className: "kep-target" }, React.createElement("input", { type: "checkbox", checked: !!selectedTerminals[item.id], disabled: item.status !== "online", onChange: function () { toggle(selectedTerminals, setSelectedTerminals, item.id); } }), item.name + (item.status === "online" ? "" : "（离线）")); })),
          React.createElement("div", { className: "kep-targets" }, React.createElement("strong", null, "数字员工"), workerIds.map(function (id) { return React.createElement("label", { key: id, className: "kep-target" }, React.createElement("input", { type: "checkbox", checked: !!selectedWorkers[id], onChange: function () { toggle(selectedWorkers, setSelectedWorkers, id); } }), workerName(id)); })),
          React.createElement("div", { className: "kep-actions" }, message ? React.createElement("span", { className: message === "配置已下发" ? "kep-status" : "kep-error" }, message) : null, React.createElement("button", { type: "button", className: "kep-primary", disabled: busy, onClick: applyBatch, "data-apply-batch": "" }, busy ? "正在下发…" : "应用配置"))
        ));
      }
      function createEnrollmentCode() {
        setBusy(true); setMessage(""); setCreatedCode("");
        apiFetch("/api/admin/enrollment-codes", { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ label: enrollLabel.trim(), maxUses: Number(enrollUses) || 1, expiresInHours: 24 }) })
          .then(function (response) { if (!response.ok) throw new Error("企业中枢 " + response.status); return response.json(); })
          .then(function (result) { setBusy(false); setCreatedCode(result.code); setMessage("注册码已生成，24 小时内有效"); load(); })
          .catch(function (err) { setBusy(false); setMessage(messageOf(err)); });
      }
      function accessBody() {
        return React.createElement(React.Fragment, null,
          React.createElement("section", { className: "kep-section", "data-enterprise-access": "" },
            React.createElement("h3", null, "中枢连接"),
            React.createElement("div", { className: "kep-warning" }, "管理员令牌只保存在本机浏览器中。正式部署时必须通过环境变量更换默认令牌，并限制中枢端口的网络访问范围。"),
            React.createElement("div", { className: "kep-form" },
              React.createElement("input", { className: "kep-input", "data-hub-url": "", value: draftHub, placeholder: "http://192.168.1.10:3099", onChange: function (event) { setDraftHub(event.target.value); } }),
              React.createElement("input", { className: "kep-input", "data-admin-token": "", type: "password", value: draftToken, placeholder: "管理员令牌", onChange: function (event) { setDraftToken(event.target.value); } }),
              React.createElement("div", { className: "kep-actions" }, React.createElement("span", { className: error ? "kep-error" : "kep-status" }, error || message), React.createElement("button", { type: "button", className: "kep-primary", "data-save-access": "", onClick: saveAccess }, "保存并连接"))
            )
          ),
          React.createElement("section", { className: "kep-section" },
            React.createElement("h3", null, "员工端注册码"),
            React.createElement("div", { className: "kep-form" },
              React.createElement("input", { className: "kep-input", value: enrollLabel, placeholder: "用途说明", onChange: function (event) { setEnrollLabel(event.target.value); } }),
              React.createElement("input", { className: "kep-input", value: enrollUses, type: "number", min: "1", max: "1000", placeholder: "可使用次数", onChange: function (event) { setEnrollUses(event.target.value); } }),
              React.createElement("div", { className: "kep-actions" }, React.createElement("button", { type: "button", className: "kep-primary", "data-create-enrollment": "", disabled: busy || !adminToken, onClick: createEnrollmentCode }, busy ? "正在生成…" : "生成注册码"))
            ),
            createdCode ? React.createElement("div", { className: "kep-warning kep-code", "data-created-code": "" }, createdCode) : null
          )
        );
      }
      function guideDialog() {
        if (!guideOpen) return null;
        return React.createElement("div", { className: "kep-guideMask", role: "presentation", onMouseDown: function (event) { if (event.target === event.currentTarget) setGuideOpen(false); } },
          React.createElement("section", { className: "kep-guide", role: "dialog", "aria-modal": "true", "aria-label": "企业管理使用引导", "data-enterprise-guide": "" },
            React.createElement("div", { className: "kep-guideHead" }, React.createElement("h2", null, "企业管理使用引导"), React.createElement("button", { type: "button", className: "kep-guideClose", "aria-label": "关闭引导", onClick: function () { setGuideOpen(false); } }, "×")),
            React.createElement("ol", null,
              React.createElement("li", null, "首次使用先进入“接入管理”，填写企业中枢地址和管理员令牌，点击“保存并连接”。"),
              React.createElement("li", null, "在“员工端注册码”中生成注册码，再到员工端的“员工设置 → 企业连接”完成注册。"),
              React.createElement("li", null, "员工端连接后，在“终端”确认在线状态，再通过“批量配置”下发资料、SOP、技能或工具策略。"),
              React.createElement("li", null, "执行结果可在“审计”查看；员工端短暂离线时，指令会排队并在恢复后继续执行。")
            ),
            React.createElement("h3", null, "为什么总览显示 0？"),
            React.createElement("p", null, "如果右上角显示“请输入管理员令牌”或“企业中枢 401”，说明当前浏览器还没有管理员鉴权。请到“接入管理”重新保存正确的中枢地址和令牌。"),
            React.createElement("p", null, "如果鉴权正常但终端仍为 0，请确认员工端已经注册、能够访问中枢地址，并查看员工端企业连接页的错误信息。")
          )
        );
      }
      function auditBody() {
        var audit = state.audit || [];
        if (!audit.length) return React.createElement("div", { className: "kep-empty" }, "暂无企业配置记录");
        return table(["时间", "操作人", "动作", "目标", "详情", "结果"], audit.map(function (item) { return React.createElement("tr", { key: item.id }, React.createElement("td", null, formatTime(item.time)), React.createElement("td", null, item.operator), React.createElement("td", null, item.action), React.createElement("td", null, item.target), React.createElement("td", null, item.detail), React.createElement("td", null, React.createElement("span", { className: "kep-badge" }, item.result))); }), "audit");
      }

      var titles = { overview: ["总览", "统一查看企业数字员工、终端与能力资产"], terminals: ["终端", "查看员工端在线状态、版本和使用情况"], workers: ["数字员工", "汇总各员工端安装的数字员工及其资产"], library: ["能力库", "统一查看技能与工具的来源、版本和覆盖范围"], batch: ["批量配置", "向一个或多个员工端批量下发资料、SOP、技能与工具策略"], audit: ["审计", "记录企业管理端产生的配置变更与执行结果"], access: ["接入管理", "配置企业中枢鉴权并生成一次性员工端注册码"] };
      var body = tab === "overview" ? overviewBody() : tab === "terminals" ? terminalsBody() : tab === "workers" ? workersBody() : tab === "library" ? libraryBody() : tab === "batch" ? batchBody() : tab === "audit" ? auditBody() : accessBody();
      return React.createElement("div", { className: "kep-fixed", style: { left: left + "px" } },
        React.createElement("div", { className: "kep-topbar" }, React.createElement("button", { type: "button", className: "kep-back", onClick: function () { setOpen(false); } }, "‹ 返回会话"), React.createElement("span", { className: "kep-title" }, "企业管理中心"), React.createElement("button", { type: "button", className: "kep-guideBtn", "data-open-enterprise-guide": "", onClick: function () { setGuideOpen(true); } }, "使用引导")),
        React.createElement("div", { className: "kep-root", "data-enterprise-console": "" },
          React.createElement("aside", { className: "kep-nav" }, React.createElement("div", { className: "kep-brand" }, React.createElement("strong", null, "开物企业管理"), React.createElement("span", null, "Enterprise · " + (state.version || "0.2.0"))), nav("overview", "总览", "◫"), nav("terminals", "终端", "▣"), nav("workers", "数字员工", "♙"), nav("library", "能力库", "◇"), nav("batch", "批量配置", "⇄"), nav("audit", "审计", "≡"), nav("access", "接入管理", "⚿")),
          React.createElement("main", { className: "kep-panel" }, React.createElement("div", { className: "kep-header" }, React.createElement("div", null, React.createElement("h2", null, titles[tab][0]), React.createElement("p", null, titles[tab][1])), React.createElement("span", { className: error ? "kep-error" : "kep-status" }, error || "企业中枢已连接")), body)
        ), guideDialog());
    }

    var inject = ["slots"];
    function apply(ctx) {
      ctx.effect(mountEntry, "kaiwu-praxis-enterprise: sidebar entry");
      ctx.inject(["slots"], function (scope) {
        scope.effect(function () {
          return scope.slots.register({ name: "shell.overlay", id: "kaiwu-enterprise-console", order: 0 }, EnterpriseConsole);
        }, "kaiwu-praxis-enterprise: console overlay");
      });
    }

    exports.name = "kaiwu-praxis-enterprise";
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
