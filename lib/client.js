// kaiwu-praxis-enterprise 浏览器插件：独立企业管理入口与六个基础模块。
window.__ModuleLoader__.load({
  id: "kaiwu-praxis-enterprise",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var React = require("react");

/* BEGIN_KAIWU_USAGE_DISPLAY */
    var KaiwuUsageDisplay = (function () {
      function createKaiwuUsageDisplay() {
        function emptyFeedbackBucket() {
          return { totalFeedback: 0, upCount: 0, downCount: 0 };
        }
      
        function normalizeFeedbackBucket(raw) {
          if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptyFeedbackBucket();
          var totalFeedback = Math.max(0, Number(raw.totalFeedback) || 0);
          var upCount = Math.max(0, Number(raw.upCount) || 0);
          var downCount = Math.max(0, Number(raw.downCount) || 0);
          if (upCount + downCount > totalFeedback) totalFeedback = upCount + downCount;
          return { totalFeedback: totalFeedback, upCount: upCount, downCount: downCount };
        }
      
        function sumFeedbackBuckets(buckets) {
          var acc = emptyFeedbackBucket();
          var list = Array.isArray(buckets) ? buckets : [];
          for (var i = 0; i < list.length; i++) {
            var bucket = normalizeFeedbackBucket(list[i]);
            acc.totalFeedback += bucket.totalFeedback;
            acc.upCount += bucket.upCount;
            acc.downCount += bucket.downCount;
          }
          return acc;
        }
      
        function employeeDashboardMetrics(sessions, feedback) {
          var bucket = normalizeFeedbackBucket(feedback);
          var feedbackCount = bucket.totalFeedback;
          var conversationCount = Array.isArray(sessions)
            ? sessions.length
            : Math.max(0, Number(sessions) || 0);
          return {
            conversationCount: conversationCount,
            feedbackCount: feedbackCount,
            positiveRate: feedbackCount ? Math.round((bucket.upCount / feedbackCount) * 100) : 0,
            negativeRate: feedbackCount ? Math.round((bucket.downCount / feedbackCount) * 100) : 0
          };
        }
      
        function conversationCountForWorker(sessionsByWorker, workerId) {
          var id = String(workerId || "").trim();
          if (!id) return 0;
          return Math.max(0, Number((sessionsByWorker && sessionsByWorker[id]) || 0) || 0);
        }
      
        return {
          emptyFeedbackBucket: emptyFeedbackBucket,
          normalizeFeedbackBucket: normalizeFeedbackBucket,
          sumFeedbackBuckets: sumFeedbackBuckets,
          employeeDashboardMetrics: employeeDashboardMetrics,
          conversationCountForWorker: conversationCountForWorker
        };
      }
      return createKaiwuUsageDisplay();
    })();
/* END_KAIWU_USAGE_DISPLAY */

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
      ".kep-profileSelect{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.kep-profileSelect button{border:1px solid #d9dee7;border-radius:999px;background:#fff;padding:6px 12px;font:inherit;font-size:12px;cursor:pointer;color:#475467}.kep-profileSelect button[data-active=true]{border-color:#2563eb;background:#edf3ff;color:#245dcc;font-weight:600}",
      ".kep-profileHero{display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap}.kep-profileAvatarCol{display:flex;flex-direction:column;align-items:center;gap:10px;flex:none}.kep-profileAvatar{width:112px;height:132px;border-radius:18px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;border:1px solid #e8eaee}.kep-profileAvatar[data-tone=blue]{background:linear-gradient(160deg,#dbeafe,#eff6ff)}.kep-profileAvatar[data-tone=teal]{background:linear-gradient(160deg,#ccfbf1,#f0fdfa)}.kep-profileAvatar[data-tone=amber]{background:linear-gradient(160deg,#fef3c7,#fffbeb)}.kep-profileAvatar[data-tone=rose]{background:linear-gradient(160deg,#ffe4e6,#fff1f2)}.kep-profileAvatar[data-tone=violet]{background:linear-gradient(160deg,#ede9fe,#f5f3ff)}.kep-profileAvatar span{font-size:42px;font-weight:700;color:#1e3a8a;line-height:1;padding-bottom:14px}.kep-heroBtns{display:flex;gap:8px}.kep-heroBtn{display:inline-flex;align-items:center;gap:4px;border:.5px solid #e3e7f1;border-radius:14px;background:#fff;color:#858b9c;padding:8px 12px;font:inherit;font-size:12px;cursor:pointer;box-shadow:0 6px 6px rgba(0,0,0,.05)}.kep-heroBtn:hover{background:#f6f6f6}.kep-profileHeroMain{flex:1;min-width:260px}.kep-profileHeroMain h3{margin:0;font-size:22px;font-weight:600}.kep-profileRole{margin-left:10px;font-size:13px;color:#757f9c;font-weight:400}.kep-profileMeta{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;font-size:12px;color:#757f9c;align-items:center}.kep-statusPill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#f6f6f6;padding:2px 10px}.kep-statusDot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 1.5px #fff}.kep-statusDot[data-off=true]{background:#c4c9d4}.kep-chip{display:inline-flex;padding:3px 10px;border-radius:999px;background:#f6f6f6;color:#59627a;border:1px solid #eef0f3}.kep-heroMetrics{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.kep-heroMetric{min-width:72px;border-radius:12px;background:#f6f6f6;padding:8px 12px;text-align:center}.kep-heroMetric strong{display:block;font-size:16px}.kep-heroMetric span{font-size:11px;color:#8a94a5}",
      ".kep-profileTabs{display:flex;gap:4px;margin:16px 0 12px;border-bottom:1px solid #eef0f3;padding-bottom:0}.kep-profileTab{border:0;background:transparent;color:#8a94a5;padding:10px 14px;font:inherit;font-size:13px;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}.kep-profileTab[data-active=true]{color:#18181a;font-weight:600;border-bottom-color:#18181a}",
      ".kep-workPanel{border:1px solid #e4e7ec;border-radius:18px;background:#fff;padding:16px;margin-bottom:14px;box-shadow:0 20px 42px rgba(21,26,38,.045)}.kep-metricGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 18px}.kep-metric{border:1px solid #e3e7f1;border-radius:14px;padding:14px;background:#fff;cursor:pointer;text-align:left;font:inherit}.kep-metric:hover{box-shadow:0 8px 18px rgba(21,26,38,.06)}.kep-metric strong{display:block;font-size:22px}.kep-metric span{font-size:12px;color:#8a94a5}.kep-metricPositive strong{color:#2cb360}.kep-metricNegative strong{color:#d20b0b}",
      ".kep-activity{border:1px dashed #e3e7f1;border-radius:14px;padding:18px;margin-bottom:18px}.kep-activityHead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}.kep-activityModes{display:flex;gap:4px;background:#f6f6f6;border-radius:10px;padding:3px}.kep-activityModes button{border:0;background:transparent;border-radius:8px;padding:6px 10px;font:inherit;font-size:12px;color:#757f9c;cursor:pointer}.kep-activityModes button[data-active=true]{background:#fff;color:#18181a;box-shadow:0 1px 3px rgba(0,0,0,.08)}.kep-activityEmpty{min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#8a94a5;font-size:13px}",
      ".kep-growthHead{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:#757f9c;margin-bottom:10px}.kep-growthRail{display:flex;gap:16px;overflow-x:auto;padding:6px 0 12px}.kep-growthItem{min-width:140px;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative}.kep-growthItem::before{content:'';position:absolute;left:-10px;right:-10px;top:28px;height:1px;background:#e3e7f1;z-index:0}.kep-growthDot{width:8px;height:8px;border-radius:50%;background:#18181a;position:relative;z-index:1}.kep-growthCard{width:136px;border-radius:14px;background:#f6f6f6;padding:10px 12px;position:relative}.kep-growthKind{font-size:10px;color:#757f9c}.kep-growthTitle{font-size:12px;color:#464c5e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kep-growthDate{font-size:12px;font-weight:500;color:#18181a}",
      ".kep-capCards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:8px}.kep-capCard{border:1px solid #f6f6f6;border-radius:20px;padding:18px 20px;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.05);min-height:160px;text-align:left;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:6px}.kep-capCard:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(0,0,0,.08)}.kep-capCard[data-dark=true]{background:#29282d;border-color:#29282d;color:#fff;box-shadow:none}.kep-capCard strong{display:block;font-size:28px;margin:2px 0}.kep-capCardLabel{font-size:13px;color:#858b9c}.kep-capCard[data-dark=true] .kep-capCardLabel,.kep-capCard[data-dark=true] .kep-capCardBody{color:#f6f6f6}.kep-capCardBody{font-size:11px;color:#757f9c;line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical}",
      ".kep-evo{margin-top:18px;border:1px solid #e4e7ec;border-radius:16px;padding:16px;background:#fafbfc}.kep-evoHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}.kep-evoHead h4{margin:0;font-size:14px}.kep-evoHead p{margin:4px 0 0;font-size:12px;color:#667085;line-height:1.6}.kep-evoEmpty{border:1px dashed #d9dee7;border-radius:12px;padding:22px;text-align:center;color:#8a94a5;font-size:12px;margin-top:10px}",
      ".kep-uiOnly{display:inline-flex;align-items:center;gap:4px;margin-left:8px;padding:1px 8px;border-radius:999px;border:1px solid #f5c2c7;background:#fff5f5;color:#b42318;font-size:10px;font-weight:600;letter-spacing:.02em;vertical-align:middle}",
      ".kep-uiOnlyBlock{position:relative;outline:1px dashed #f5c2c7;outline-offset:2px;border-radius:14px}",
      ".kep-uiOnlyNote{margin:0 0 12px;padding:8px 12px;border-radius:10px;border:1px solid #f5c2c7;background:#fff8f8;color:#912018;font-size:12px;line-height:1.55}",
      ".kep-metric[data-ui-only=true]{opacity:.92;cursor:default}.kep-metric[data-ui-only=true]:hover{box-shadow:none}",
      ".kep-profileForm label{display:flex;flex-direction:column;gap:4px;font-size:11px;color:#8a94a5}.kep-profileForm label>span{padding-left:2px}.kep-tagPick{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.kep-tagPick button{border:1px solid #e3e7f1;border-radius:999px;background:#fff;padding:4px 10px;font:inherit;font-size:11px;color:#59627a;cursor:pointer}.kep-tagPick button[data-on=true]{background:#edf3ff;border-color:#2563eb;color:#245dcc}.kep-switchRow{display:flex;align-items:center;justify-content:space-between;gap:12px;grid-column:1/-1;padding:8px 0;font-size:12px;color:#475467}",
      "@media(max-width:900px){.kep-metricGrid,.kep-capCards{grid-template-columns:1fr 1fr}.kep-split{grid-template-columns:1fr}}",
      "body[data-ds-dark-theme] .kep-fixed{background:#111214;color:#f5f6f7}body[data-ds-dark-theme] .kep-topbar,body[data-ds-dark-theme] .kep-nav,body[data-ds-dark-theme] .kep-card,body[data-ds-dark-theme] .kep-section,body[data-ds-dark-theme] .kep-targets,body[data-ds-dark-theme] .kep-metric,body[data-ds-dark-theme] .kep-capCard,body[data-ds-dark-theme] .kep-growthCard,body[data-ds-dark-theme] .kep-workPanel,body[data-ds-dark-theme] .kep-evo{border-color:#303238}body[data-ds-dark-theme] .kep-nav,body[data-ds-dark-theme] .kep-card,body[data-ds-dark-theme] .kep-section,body[data-ds-dark-theme] .kep-guide,body[data-ds-dark-theme] .kep-metric,body[data-ds-dark-theme] .kep-capCard,body[data-ds-dark-theme] .kep-workPanel{background:#191a1e}body[data-ds-dark-theme] .kep-navBtn[data-active=true]{background:#263550;color:#8eb7ff}body[data-ds-dark-theme] .kep-input,body[data-ds-dark-theme] .kep-textarea,body[data-ds-dark-theme] .kep-guideBtn,body[data-ds-dark-theme] .kep-profileSelect button,body[data-ds-dark-theme] .kep-heroBtn{background:#202227;border-color:#3a3d45;color:#f5f6f7}body[data-ds-dark-theme] .kep-table th,body[data-ds-dark-theme] .kep-table td{border-color:#303238}body[data-ds-dark-theme] .kep-badge,body[data-ds-dark-theme] .kep-chip,body[data-ds-dark-theme] .kep-growthCard,body[data-ds-dark-theme] .kep-heroMetric,body[data-ds-dark-theme] .kep-statusPill{background:#2a2c31;color:#c3c8d0}"
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
      var _profileWorker = React.useState(""), profileWorkerId = _profileWorker[0], setProfileWorkerId = _profileWorker[1];
      var _profileDraft = React.useState(null), profileDraft = _profileDraft[0], setProfileDraft = _profileDraft[1];
      var _profileEditing = React.useState(false), profileEditing = _profileEditing[0], setProfileEditing = _profileEditing[1];
      var _profileSubTab = React.useState("work"), profileSubTab = _profileSubTab[0], setProfileSubTab = _profileSubTab[1];
      var _activityMode = React.useState("day"), activityMode = _activityMode[0], setActivityMode = _activityMode[1];

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
      if (!workerIds.length) {
        Object.keys(WORKER_NAMES).forEach(function (id) { workerIds.push(id); });
        workerIds.sort(function (a, b) { return workerName(a).localeCompare(workerName(b), "zh-CN"); });
      }
      React.useEffect(function () {
        if (!profileWorkerId && workerIds.length) setProfileWorkerId(workerIds[0]);
        else if (profileWorkerId && workerIds.length && workerIds.indexOf(profileWorkerId) < 0) setProfileWorkerId(workerIds[0]);
      }, [workerIds.join("|"), profileWorkerId]);

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
          var conversations = endpoints.reduce(function (sum, terminal) {
            return sum + KaiwuUsageDisplay.conversationCountForWorker(terminal.sessionsByWorker || {}, id);
          }, 0);
          var departments = copies.map(function (worker) { return worker.profile && worker.profile.department; }).filter(Boolean).filter(function (value, index, list) { return list.indexOf(value) === index; }).join("、");
          return React.createElement("tr", { key: id, "data-worker-id": id }, React.createElement("td", null, React.createElement("button", { type: "button", className: "kep-back", style: { padding: 0 }, onClick: function () { setProfileWorkerId(id); setTab("profile"); setProfileEditing(false); } }, workerName(id))), React.createElement("td", null, String(copies.length)), React.createElement("td", null, String(conversations)), React.createElement("td", null, String(knowledge)), React.createElement("td", null, String(capabilities)), React.createElement("td", null, departments || "—"));
        }), "workers");
      }

      function asTags(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
      function tagsText(value) { return asTags(value).join("，"); }
      function parseTags(value) { return String(value || "").split(/[,，]/).map(function (item) { return item.trim(); }).filter(Boolean); }
      var STYLE_OPTIONS = ["目标明确", "证据优先", "动作可追溯", "事实先行", "流程推进", "风险克制", "及时追问"];
      var EXPERTISE_OPTIONS = ["业务问答", "SOP 执行", "工具调用", "代码检索", "报销核对", "事务跟进", "资料维护"];
      var WORK_MODE_OPTIONS = ["识别意图", "补齐信息", "调用 SOP", "查询资料", "执行并复盘", "确认后执行", "必要时转人工"];
      function compactSummary(text, max) {
        var value = String(text || "").replace(/\s+/g, " ").trim();
        if (!value) return "暂无看板摘要";
        if (value.length <= max) return value;
        return value.slice(0, max - 1) + "…";
      }
      function aggregateFeedbackForWorker(terminals, workerId) {
        return KaiwuUsageDisplay.sumFeedbackBuckets(terminals.map(function (terminal) {
          return ((terminal.feedbackByWorker || {})[workerId]) || null;
        }));
      }
      function uiOnlyBadge(extra) {
        return React.createElement("span", { className: "kep-uiOnly", "data-ui-only": "true", title: "仅有界面，无对应后端/数据源" }, "仅 UI" + (extra ? (" · " + extra) : ""));
      }
      function uiOnlyNote(text) {
        return React.createElement("div", { className: "kep-uiOnlyNote", "data-ui-only-note": "" }, text);
      }
      function toggleTag(list, option) {
        var current = asTags(list);
        if (current.indexOf(option) >= 0) return current.filter(function (item) { return item !== option; });
        if (current.length >= 12) return current;
        return current.concat([option]);
      }
      function tagPicker(label, value, options, key) {
        return React.createElement("label", { style: { gridColumn: "1 / -1" } },
          React.createElement("span", null, label),
          React.createElement("input", { className: "kep-input", value: tagsText(value), placeholder: "可手输，逗号分隔；或点选下方预设", onChange: function (ev) { patchProfileDraft(Object.fromEntries([[key, parseTags(ev.target.value)]])); } }),
          React.createElement("div", { className: "kep-tagPick" }, options.map(function (option) {
            return React.createElement("button", {
              type: "button", key: option, "data-on": asTags(value).indexOf(option) >= 0,
              onClick: function () { patchProfileDraft(Object.fromEntries([[key, toggleTag(value, option)]])); }
            }, option);
          }))
        );
      }
      function resolveWorkerProfile(workerId) {
        var stored = (state.workerProfiles && state.workerProfiles[workerId]) || {};
        var terminalProfile = {};
        endpoints.forEach(function (terminal) {
          if (terminal.workers && terminal.workers[workerId] && terminal.workers[workerId].profile) terminalProfile = terminal.workers[workerId].profile;
        });
        return Object.assign({
          displayName: "", staffNo: "", roleName: "", description: "", personaPrompt: "", summary: "",
          owner: "admin", department: "运营中心", joinedAt: "", status: "active", publishedToGallery: false,
          harnessMaxActions: 32, avatarText: "", avatarTone: "blue",
          workStyles: [], expertiseTags: [], workModes: []
        }, terminalProfile, stored);
      }
      function aggregateWorker(workerId) {
        var merged = { knowledge: [], sops: [], skills: [], tools: [], tasks: [] };
        var seen = { knowledge: {}, sops: {}, skills: {}, tools: {}, tasks: {} };
        endpoints.forEach(function (terminal) {
          var worker = terminal.workers && terminal.workers[workerId];
          if (!worker) return;
          (worker.knowledge || []).forEach(function (item) { if (!seen.knowledge[item.name]) { seen.knowledge[item.name] = true; merged.knowledge.push(item); } });
          (worker.sops || []).forEach(function (item) { if (!seen.sops[item.name]) { seen.sops[item.name] = true; merged.sops.push(item); } });
          (worker.skills || []).forEach(function (item) { var key = item.id || item.name; if (!seen.skills[key]) { seen.skills[key] = true; merged.skills.push(item); } });
          (worker.tools || []).forEach(function (item) { var key = item.id || item.name; if (!seen.tools[key]) { seen.tools[key] = true; merged.tools.push(item); } });
          (worker.tasks || []).forEach(function (item) { if (!seen.tasks[item.name]) { seen.tasks[item.name] = true; merged.tasks.push(item); } });
        });
        return merged;
      }
      function capabilityOf(worker) {
        var skills = (worker.skills || []).filter(function (item) { return item && item.enabled !== false && item.deleted !== true; });
        var tools = (worker.tools || []).filter(function (item) { return item && item.enabled !== false; });
        var tasks = (worker.tasks || []).filter(function (item) { return item && item.enabled !== false; });
        return {
          skillCount: skills.length, knowledgeCount: (worker.knowledge || []).length, toolCount: tools.length, sopCount: (worker.sops || []).length, taskCount: tasks.length,
          skillNames: skills.map(function (item) { return item.name || item.id; }).filter(Boolean),
          knowledgeNames: (worker.knowledge || []).map(function (item) { return item.name; }).filter(Boolean),
          toolNames: tools.map(function (item) { return item.name || item.id; }).filter(Boolean),
          sopNames: (worker.sops || []).map(function (item) { return item.name; }).filter(Boolean),
          taskNames: tasks.map(function (item) { return item.name; }).filter(Boolean)
        };
      }
      function growthOf(worker) {
        function stamp(item) {
          var meta = item && item.metadata || {};
          var candidates = [meta.learned_at, meta.assigned_at, meta.installed_at, meta.imported_at, meta.created_at, item && item.createdAt, item && item.created_at, item && item.updatedAt, item && item.updated_at];
          for (var i = 0; i < candidates.length; i += 1) if (typeof candidates[i] === "string" && !Number.isNaN(Date.parse(candidates[i]))) return candidates[i];
          return "";
        }
        var events = [];
        (worker.sops || []).forEach(function (item, index) { events.push({ id: "sop-" + index, kind: "新增 SOP", title: item.name || ("SOP " + (index + 1)), timestamp: stamp(item) }); });
        (worker.skills || []).filter(function (item) { return item && item.enabled !== false && item.deleted !== true; }).forEach(function (item, index) {
          var upgraded = (Number(item.localRevision) || 0) > 0 || item.modified === true;
          events.push({ id: "skill-" + (item.id || index), kind: upgraded ? "技能升级" : "新增技能", title: item.name || item.id || ("技能 " + (index + 1)), timestamp: stamp(item) });
        });
        (worker.tools || []).filter(function (item) { return item && item.enabled !== false; }).forEach(function (item, index) {
          events.push({ id: "tool-" + (item.id || index), kind: "新增工具", title: item.name || item.id || ("工具 " + (index + 1)), timestamp: stamp(item) });
        });
        return events
          .filter(function (item) { return item.title && item.timestamp && !Number.isNaN(Date.parse(item.timestamp)); })
          .sort(function (a, b) { return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); });
      }
      function formatGrowthStamp(value) {
        if (!value) return "—";
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return (date.getMonth() + 1) + "." + date.getDate();
      }
      function startProfileEdit() {
        setProfileDraft(Object.assign({}, resolveWorkerProfile(profileWorkerId)));
        setProfileEditing(true);
        setMessage("");
      }
      function patchProfileDraft(patch) { setProfileDraft(Object.assign({}, profileDraft, patch)); }
      function saveProfileAndPush() {
        if (!profileDraft || !profileWorkerId) return;
        var terminalIds = onlineEndpoints.filter(function (item) { return selectedTerminals[item.id]; }).map(function (item) { return item.id; });
        if (!terminalIds.length) { setMessage("请先勾选至少一个在线员工端，以便下发档案"); return; }
        setBusy(true); setMessage("");
        var profile = Object.assign({}, profileDraft);
        delete profile.title; delete profile.boundary; delete profile.style; delete profile.growth; delete profile.updatedAt;
        profile.status = profile.status === "archived" ? "archived" : "active";
        profile.publishedToGallery = profile.publishedToGallery === true;
        profile.harnessMaxActions = Math.max(1, Math.min(100, Number(profile.harnessMaxActions) || 32));
        profile.displayName = String(profile.displayName || "").trim();
        profile.avatarText = String(profile.avatarText || "").trim().slice(0, 2);
        profile.avatarTone = profile.avatarTone || "blue";
        apiFetch("/api/workers/" + encodeURIComponent(profileWorkerId) + "/profile", { method: "PUT", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ profile: profile }) })
          .then(function (response) { if (!response.ok) throw new Error("保存档案失败 " + response.status); return response.json(); })
          .then(function () {
            return apiFetch("/api/batch", {
              method: "POST",
              headers: { "content-type": "application/json; charset=utf-8" },
              body: JSON.stringify({
                terminalIds: terminalIds,
                workerIds: [profileWorkerId],
                payload: { action: "updateProfile", profile: profile },
                actionLabel: "更新员工档案",
                detail: workerName(profileWorkerId) + " → " + terminalIds.length + " 个终端"
              })
            });
          })
          .then(function (response) { if (!response.ok) throw new Error("下发档案失败 " + response.status); return load(); })
          .then(function () { setBusy(false); setProfileEditing(false); setProfileDraft(null); setMessage("档案已保存并下发"); })
          .catch(function (err) { setBusy(false); setMessage(messageOf(err)); });
      }
      function profileBody() {
        var workerId = profileWorkerId || workerIds[0] || "";
        if (!workerId) return React.createElement("div", { className: "kep-empty" }, "暂无数字员工");
        var profile = profileEditing && profileDraft ? profileDraft : resolveWorkerProfile(workerId);
        var aggregated = aggregateWorker(workerId);
        var caps = capabilityOf(aggregated);
        var growth = growthOf(aggregated);
        var conversationCount = endpoints.reduce(function (sum, terminal) {
          return sum + KaiwuUsageDisplay.conversationCountForWorker(terminal.sessionsByWorker || {}, workerId);
        }, 0);
        var metrics = KaiwuUsageDisplay.employeeDashboardMetrics(conversationCount, aggregateFeedbackForWorker(endpoints, workerId));
        var isActive = profile.status !== "archived";
        var displayName = (profile.displayName && String(profile.displayName).trim()) || workerName(workerId);
        var avatarGlyph = (profile.avatarText && String(profile.avatarText).trim()) || displayName.slice(0, 1);
        var avatarTone = profile.avatarTone || "blue";
        // StaffDeck DashboardPage: persona_prompt → system_prompt_summary → description
        var summaryText = compactSummary(profile.personaPrompt || profile.summary || profile.description, 132);
        var activityEmpty = activityMode === "week" ? "本周暂无活动记录" : activityMode === "month" ? "本月暂无活动记录" : "当日暂无活动记录";
        var sessionSnippet = [];
        endpoints.forEach(function (terminal) {
          var rows = (terminal.sessionsByWorkerDetail && terminal.sessionsByWorkerDetail[workerId]) || [];
          if (Array.isArray(rows) && rows[0]) sessionSnippet.push(rows[0].summary || rows[0].title || rows[0].displayTitle);
        });
        var logBody = sessionSnippet[0] || (conversationCount ? ("累计 " + conversationCount + " 次对话") : "暂无对话任务");

        function goLogs() { setProfileSubTab("logs"); }
        function subTab(id, label, onlyUi) {
          return React.createElement("button", { type: "button", key: id, className: "kep-profileTab", "data-active": profileSubTab === id, "data-profile-subtab": id, "data-ui-only": onlyUi ? "true" : "false", onClick: function () { setProfileSubTab(id); } }, label, onlyUi ? uiOnlyBadge() : null);
        }
        function workRecordPanel() {
          return React.createElement("section", { className: "kep-workPanel", "data-profile-work": "" },
            React.createElement("div", { className: "kep-metricGrid", "data-profile-metrics": "" },
              [
                [metrics.conversationCount, "对话次数", ""],
                [metrics.feedbackCount, "反馈次数", ""],
                [metrics.positiveRate, "好评率", "kep-metricPositive", "%"],
                [metrics.negativeRate, "差评率", "kep-metricNegative", "%"]
              ].map(function (item) {
                var suffix = item[3] || "";
                return React.createElement("button", { type: "button", key: item[1], className: "kep-metric " + item[2], onClick: goLogs },
                  React.createElement("strong", null, String(item[0]) + suffix),
                  React.createElement("span", null, item[1])
                );
              })
            ),
            React.createElement("div", { className: "kep-activity kep-uiOnlyBlock", "data-profile-activity": "", "data-ui-only": "true" },
              React.createElement("div", { className: "kep-activityHead" },
                React.createElement("strong", { style: { fontSize: "13px" } }, "活动记录", uiOnlyBadge("无 timeline API")),
                React.createElement("div", { className: "kep-activityModes" },
                  [["day", "Day"], ["week", "Week"], ["month", "Month"]].map(function (mode) {
                    return React.createElement("button", { type: "button", key: mode[0], "data-active": activityMode === mode[0], onClick: function () { setActivityMode(mode[0]); } }, mode[1]);
                  })
                )
              ),
              React.createElement("div", { className: "kep-activityEmpty" },
                React.createElement("span", { "aria-hidden": "true" }, "📅"),
                React.createElement("span", null, activityEmpty + "（壳层）")
              )
            ),
            React.createElement("div", { "data-profile-growth": "" },
              React.createElement("div", { className: "kep-growthHead" }, "↗ 成长记录"),
              growth.length
                ? React.createElement("div", { className: "kep-growthRail" }, growth.map(function (item) {
                    return React.createElement("div", { key: item.id, className: "kep-growthItem" },
                      React.createElement("span", { className: "kep-growthDate" }, formatGrowthStamp(item.timestamp)),
                      React.createElement("span", { className: "kep-growthDot" }),
                      React.createElement("div", { className: "kep-growthCard" }, React.createElement("div", { className: "kep-growthKind" }, item.kind), React.createElement("div", { className: "kep-growthTitle", title: item.title }, item.title))
                    );
                  }))
                : React.createElement("div", { className: "kep-empty", style: { padding: "24px" } }, "暂无成长轨迹")
            ),
            React.createElement("div", { className: "kep-capCards", "data-profile-capabilities": "" },
              [
                { title: "知识库", count: caps.knowledgeCount, body: caps.knowledgeNames.slice(0, 3).join(" / ") || "暂无知识库", dark: false, go: function () { setTab("library"); } },
                { title: "技能", count: caps.skillCount, body: caps.skillNames.slice(0, 3).join(" / ") || "暂无启用技能", dark: false, go: function () { setTab("library"); } },
                { title: "SOP", count: caps.sopCount, body: caps.sopNames.slice(0, 3).join(" / ") || "暂无启用 SOP", dark: false, go: function () { setTab("library"); } },
                { title: "工具", count: caps.toolCount, body: caps.toolNames.slice(0, 3).join(" / ") || "暂无启用工具", dark: true, go: function () { setTab("library"); } },
                { title: "定时任务", count: caps.taskCount, body: caps.taskNames.slice(0, 2).join(" / ") || "暂无启用定时任务", dark: true, go: function () { setProfileSubTab("scheduled"); } },
                { title: "对话日志", count: conversationCount, body: logBody, dark: true, go: goLogs }
              ].map(function (card) {
                return React.createElement("button", { type: "button", key: card.title, className: "kep-capCard", "data-dark": card.dark, onClick: card.go },
                  React.createElement("span", { className: "kep-capCardLabel" }, card.title),
                  React.createElement("strong", null, String(card.count)),
                  React.createElement("span", { className: "kep-capCardBody" }, card.body)
                );
              })
            ),
            React.createElement("div", { className: "kep-evo kep-uiOnlyBlock", "data-profile-evolution": "", "data-ui-only": "true" },
              React.createElement("div", { className: "kep-evoHead" },
                React.createElement("div", null,
                  React.createElement("h4", null, "反馈自进化", uiOnlyBadge("无反馈/扫描 API")),
                  React.createElement("p", null, "从小问题归因与执行轨迹生成候选改动；仅管理员审批写入后，才会进入该员工的 Skill/SOP 运行链。")
                ),
                React.createElement("button", { type: "button", className: "kep-guideBtn", style: { borderColor: "#86efac", color: "#15803d", background: "#f0fdf4" }, onClick: function () { setMessage("仅 UI：候选扫描与审批写入尚未接通；反馈次数已可汇总，但不驱动自进化"); } }, "扫描反馈并生成候选")
              ),
              React.createElement("textarea", { className: "kep-textarea", placeholder: "可选：补充改进目标，例如「只修确认节点，不改工具绑定」", readOnly: true, value: "" }),
              React.createElement("div", { className: "kep-evoEmpty" }, "仅 UI 壳层：暂无候选，也无扫描后端。")
            )
          );
        }
        function scheduledPanel() {
          return React.createElement("section", { className: "kep-section kep-uiOnlyBlock", "data-profile-scheduled": "", "data-ui-only": "true" },
            uiOnlyNote("定时任务调度页为仅 UI：待完成/已完成/执行记录与「新增任务」未接调度 API；下方任务名来自能力清单只读展示。"),
            React.createElement("div", { className: "kep-metricGrid", style: { gridTemplateColumns: "repeat(3,minmax(0,1fr))" } },
              [[0, "待完成"], [0, "已完成"], [0, "执行记录"]].map(function (item) {
                return React.createElement("div", { key: item[1], className: "kep-metric", "data-ui-only": "true", style: { cursor: "default" } }, React.createElement("strong", null, String(item[0])), React.createElement("span", null, item[1], uiOnlyBadge()));
              })
            ),
            React.createElement("div", { className: "kep-actions", style: { marginBottom: "12px" } },
              React.createElement("button", { type: "button", className: "kep-primary", onClick: function () { setTab("batch"); setMessage("仅 UI：定时任务调度尚未接通后台；可先在批量配置维护任务内容"); } }, "+ 新增任务", uiOnlyBadge())
            ),
            React.createElement("h3", null, "任务列表"),
            React.createElement("div", { className: "kep-empty" }, caps.taskCount ? caps.taskNames.join("、") : "暂无定时任务"),
            React.createElement("h3", { style: { marginTop: "18px" } }, "执行记录", uiOnlyBadge("无 run log")),
            React.createElement("div", { className: "kep-empty" }, "暂无执行记录（壳层）")
          );
        }
        function memoriesPanel() {
          return React.createElement("section", { className: "kep-section kep-uiOnlyBlock", "data-profile-memories": "", "data-ui-only": "true" },
            uiOnlyNote("记忆页为仅 UI：企业端未接 memory 查询 API，不读取员工端记忆库。"),
            React.createElement("h3", null, "记忆查询", uiOnlyBadge()),
            React.createElement("p", { className: "kep-desc" }, "按用户隔离沉淀；当前无后端数据源。"),
            React.createElement("div", { className: "kep-empty" }, "仅 UI：未接通记忆查询。")
          );
        }
        function logsPanel() {
          return React.createElement("section", { className: "kep-section", "data-profile-logs": "" },
            uiOnlyNote("对话/反馈次数来自员工端心跳汇总（真）；会话明细列表仍未在管理端实现。"),
            React.createElement("div", { className: "kep-metricGrid", "data-profile-metrics": "" },
              [
                [metrics.conversationCount, "对话", ""],
                [metrics.feedbackCount, "反馈", ""],
                [metrics.positiveRate + "%", "好评率", "kep-metricPositive"],
                [metrics.negativeRate + "%", "差评率", "kep-metricNegative"]
              ].map(function (item) {
                return React.createElement("div", { key: item[1], className: "kep-metric " + item[2], style: { cursor: "default" } }, React.createElement("strong", null, String(item[0])), React.createElement("span", null, item[1]));
              })
            ),
            React.createElement("p", { className: "kep-desc" }, "反馈来自 DSH 消息点赞/点踩汇总；无反馈时次数与比率保持 0。"),
            React.createElement("div", { className: "kep-empty" }, conversationCount ? ("该员工累计对话 " + conversationCount + " 次；明细请在各员工端会话中查看。") : "暂无对话日志"),
            React.createElement("div", { className: "kep-empty", "data-ui-only": "true" }, "会话明细列表", uiOnlyBadge("管理端无 session list API"))
          );
        }

        return React.createElement("div", { "data-enterprise-profile": "", "data-worker-id": workerId },
          React.createElement("div", { className: "kep-profileSelect" }, workerIds.map(function (id) {
            return React.createElement("button", { type: "button", key: id, "data-active": id === workerId, onClick: function () { setProfileWorkerId(id); setProfileEditing(false); setProfileDraft(null); setProfileSubTab("work"); } }, (resolveWorkerProfile(id).displayName && resolveWorkerProfile(id).displayName.trim()) || workerName(id));
          })),
          React.createElement("section", { className: "kep-section" },
            React.createElement("div", { className: "kep-profileHero" },
              React.createElement("div", { className: "kep-profileAvatarCol" },
                React.createElement("div", { className: "kep-profileAvatar", "data-tone": avatarTone, "aria-hidden": "true" }, React.createElement("span", null, avatarGlyph)),
                React.createElement("div", { className: "kep-heroBtns" },
                  React.createElement("button", { type: "button", className: "kep-heroBtn", onClick: function () { setOpen(false); } }, "去对话"),
                  React.createElement("button", { type: "button", className: "kep-heroBtn", "data-edit-profile": "", onClick: startProfileEdit }, "编辑资料")
                )
              ),
              React.createElement("div", { className: "kep-profileHeroMain" },
                React.createElement("h3", null, displayName, React.createElement("span", { className: "kep-profileRole" }, profile.roleName || "待补充岗位")),
                React.createElement("div", { className: "kep-profileMeta" },
                  React.createElement("span", { className: "kep-statusPill", title: "仅展示态，未门禁会话入口" },
                    React.createElement("span", { className: "kep-statusDot", "data-off": !isActive }),
                    isActive ? "在线" : "下线",
                    uiOnlyBadge("展示")
                  ),
                  React.createElement("span", null, "创建者：" + (profile.owner || "—")),
                  React.createElement("span", null, "入职时间：" + (profile.joinedAt || "—")),
                  asTags(profile.workStyles).slice(0, 3).map(function (item) { return React.createElement("span", { key: item, className: "kep-chip" }, item); })
                ),
                React.createElement("p", { className: "kep-desc", style: { marginTop: "12px", maxWidth: "720px" } }, summaryText),
                React.createElement("div", { className: "kep-heroMetrics" },
                  [[caps.knowledgeCount, "资料"], [caps.skillCount, "技能"], [caps.sopCount, "SOP"], [caps.taskCount, "定时任务"]].map(function (item) {
                    return React.createElement("div", { key: item[1], className: "kep-heroMetric" }, React.createElement("strong", null, String(item[0])), React.createElement("span", null, item[1]));
                  })
                )
              )
            )
          ),
          profileEditing ? React.createElement("section", { className: "kep-section kep-profileForm", "data-profile-editor": "" },
            React.createElement("h3", null, "编辑数字员工档案：" + displayName),
            React.createElement("div", { className: "kep-form" },
              React.createElement("label", null, React.createElement("span", null, "数字员工姓名"), React.createElement("input", { className: "kep-input", value: profile.displayName || "", placeholder: workerName(workerId), onChange: function (ev) { patchProfileDraft({ displayName: ev.target.value }); } })),
              React.createElement("label", null, React.createElement("span", null, "岗位"), React.createElement("input", { className: "kep-input", value: profile.roleName || "", onChange: function (ev) { patchProfileDraft({ roleName: ev.target.value }); } })),
              React.createElement("label", null, React.createElement("span", null, "入职时间"), React.createElement("input", { className: "kep-input", type: "date", value: profile.joinedAt || "", onChange: function (ev) { patchProfileDraft({ joinedAt: ev.target.value }); } })),
              React.createElement("label", null, React.createElement("span", null, "工作状态", uiOnlyBadge("展示态，不门禁会话")), React.createElement("select", { className: "kep-input", value: profile.status === "archived" ? "archived" : "active", onChange: function (ev) { patchProfileDraft({ status: ev.target.value }); } }, React.createElement("option", { value: "active" }, "在线"), React.createElement("option", { value: "archived" }, "下线"))),
              React.createElement("label", null, React.createElement("span", null, "创建者"), React.createElement("input", { className: "kep-input", value: profile.owner || "", onChange: function (ev) { patchProfileDraft({ owner: ev.target.value }); } })),
              React.createElement("label", null, React.createElement("span", null, "所属部门"), React.createElement("input", { className: "kep-input", value: profile.department || "", onChange: function (ev) { patchProfileDraft({ department: ev.target.value }); } })),
              React.createElement("label", null, React.createElement("span", null, "头像文字（1–2 字）"), React.createElement("input", { className: "kep-input", value: profile.avatarText || "", maxLength: 2, placeholder: displayName.slice(0, 1), onChange: function (ev) { patchProfileDraft({ avatarText: ev.target.value }); } })),
              React.createElement("label", null, React.createElement("span", null, "头像色调"), React.createElement("select", { className: "kep-input", value: profile.avatarTone || "blue", onChange: function (ev) { patchProfileDraft({ avatarTone: ev.target.value }); } }, ["blue", "teal", "amber", "rose", "violet"].map(function (tone) { return React.createElement("option", { key: tone, value: tone }, tone); }))),
              React.createElement("label", null, React.createElement("span", null, "Harness 最大调用轮次", uiOnlyBadge("存档不下发 runtime")), React.createElement("input", { className: "kep-input", type: "number", min: "1", max: "100", value: profile.harnessMaxActions == null ? 32 : profile.harnessMaxActions, onChange: function (ev) { patchProfileDraft({ harnessMaxActions: Number(ev.target.value) || 32 }); } })),
              React.createElement("label", null, React.createElement("span", null, "工号（可选）"), React.createElement("input", { className: "kep-input", value: profile.staffNo || "", onChange: function (ev) { patchProfileDraft({ staffNo: ev.target.value }); } })),
              React.createElement("textarea", { className: "kep-textarea", placeholder: "岗位描述", value: profile.description || "", onChange: function (ev) { patchProfileDraft({ description: ev.target.value }); } }),
              React.createElement("textarea", { className: "kep-textarea", placeholder: "看板摘要（system_prompt_summary）", value: profile.summary || "", onChange: function (ev) { patchProfileDraft({ summary: ev.target.value }); } }),
              React.createElement("textarea", { className: "kep-textarea", placeholder: "岗位执行约束 persona_prompt（写入员工 persona）", value: profile.personaPrompt || "", onChange: function (ev) { patchProfileDraft({ personaPrompt: ev.target.value }); } }),
              tagPicker("工作风格", profile.workStyles, STYLE_OPTIONS, "workStyles"),
              tagPicker("掌握方向", profile.expertiseTags, EXPERTISE_OPTIONS, "expertiseTags"),
              tagPicker("工作模式", profile.workModes, WORK_MODE_OPTIONS, "workModes"),
              React.createElement("div", { className: "kep-switchRow", "data-ui-only": "true" },
                React.createElement("span", null, "发布到广场（员工端仅展示已发布）", uiOnlyBadge("字段可存，过滤未接")),
                React.createElement("input", { type: "checkbox", checked: profile.publishedToGallery === true, onChange: function (ev) { patchProfileDraft({ publishedToGallery: ev.target.checked }); } })
              )
            ),
            React.createElement("p", { className: "kep-desc" }, "字段对照本机 StaffDeck 0.5.6。保存会写入中枢并下发 updateProfile（persona 真接通）。标「仅 UI」的字段：可存档但不驱动运行时/广场过滤/会话门禁。"),
            React.createElement("div", { className: "kep-targets", style: { marginTop: "10px" } }, React.createElement("strong", null, "下发员工端"), onlineEndpoints.map(function (item) {
              return React.createElement("label", { key: item.id, className: "kep-target" }, React.createElement("input", { type: "checkbox", checked: !!selectedTerminals[item.id], onChange: function () { toggle(selectedTerminals, setSelectedTerminals, item.id); } }), item.name);
            })),
            React.createElement("div", { className: "kep-actions", style: { marginTop: "12px" } },
              React.createElement("button", { type: "button", className: "kep-guideBtn", disabled: busy, onClick: function () { setProfileEditing(false); setProfileDraft(null); } }, "取消"),
              React.createElement("button", { type: "button", className: "kep-primary", disabled: busy, onClick: saveProfileAndPush, "data-save-profile": "" }, busy ? "保存中…" : "保存并下发")
            )
          ) : null,
          React.createElement("div", { className: "kep-profileTabs", role: "tablist", "aria-label": "个人档案分区" },
            subTab("work", "工作记录", false),
            subTab("scheduled", "定时任务", true),
            subTab("memories", "记忆", true),
            subTab("logs", "对话日志", false)
          ),
          profileSubTab === "work" ? workRecordPanel() : profileSubTab === "scheduled" ? scheduledPanel() : profileSubTab === "memories" ? memoriesPanel() : logsPanel(),
          message ? React.createElement("div", { className: message.indexOf("失败") >= 0 || message.indexOf("请先") >= 0 || message.indexOf("需先") >= 0 ? "kep-error" : "kep-status", style: { marginTop: "8px" } }, message) : null
        );
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
              React.createElement("li", null, "首次使用先进入“接入管理”。中央部署时，本机管理页面填写 http://127.0.0.1:3099，员工端填写企业中枢内网地址。"),
              React.createElement("li", null, "在“员工端注册码”中生成注册码，再到员工端的“员工设置 → 企业连接”完成注册。"),
              React.createElement("li", null, "员工端连接后，在“终端”确认在线状态；员工档案在「员工档案」编辑并下发，能力变更仍走「批量配置」。"),
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

      var titles = { overview: ["总览", "统一查看企业数字员工、终端与能力资产"], profile: ["员工档案", "对照 StaffDeck：头像区、工作记录/定时任务/记忆/对话日志；编辑资料后下发员工端"], terminals: ["终端", "查看员工端在线状态、版本和使用情况"], workers: ["数字员工", "汇总各员工端安装的数字员工及其资产"], library: ["能力库", "统一查看技能与工具的来源、版本和覆盖范围"], batch: ["批量配置", "向一个或多个员工端批量下发资料、SOP、技能与工具策略"], audit: ["审计", "记录企业管理端产生的配置变更与执行结果"], access: ["接入管理", "配置企业中枢鉴权并生成一次性员工端注册码"] };
      var body = tab === "overview" ? overviewBody() : tab === "profile" ? profileBody() : tab === "terminals" ? terminalsBody() : tab === "workers" ? workersBody() : tab === "library" ? libraryBody() : tab === "batch" ? batchBody() : tab === "audit" ? auditBody() : accessBody();
      return React.createElement("div", { className: "kep-fixed", style: { left: left + "px" } },
        React.createElement("div", { className: "kep-topbar" }, React.createElement("button", { type: "button", className: "kep-back", onClick: function () { setOpen(false); } }, "‹ 返回会话"), React.createElement("span", { className: "kep-title" }, "企业管理中心"), React.createElement("button", { type: "button", className: "kep-guideBtn", "data-open-enterprise-guide": "", onClick: function () { setGuideOpen(true); } }, "使用引导")),
        React.createElement("div", { className: "kep-root", "data-enterprise-console": "" },
          React.createElement("aside", { className: "kep-nav" }, React.createElement("div", { className: "kep-brand" }, React.createElement("strong", null, "开物企业管理"), React.createElement("span", null, "Enterprise · " + (state.version || "0.2.2"))), nav("overview", "总览", "◫"), nav("profile", "员工档案", "♟"), nav("terminals", "终端", "▣"), nav("workers", "数字员工", "♙"), nav("library", "能力库", "◇"), nav("batch", "批量配置", "⇄"), nav("audit", "审计", "≡"), nav("access", "接入管理", "⚿")),
          React.createElement("main", { className: "kep-panel" }, React.createElement("div", { className: "kep-header" }, React.createElement("div", null, React.createElement("h2", null, titles[tab][0]), React.createElement("p", null, titles[tab][1])), React.createElement("span", { className: error ? "kep-error" : "kep-status" }, error || "企业中枢已连接")), body)
        ), guideDialog());
    }

    var inject = ["slots"];
    function apply(ctx) {
      ctx.effect(mountEntry, "kaiwu-praxis-enterprise: sidebar entry");
      ctx.inject(["slots"], function (scope) {
        scope.effect(function () {
          return scope.slots.inject("shell.overlay", function () {
            return scope.slots.register({ name: "shell.overlay", id: "kaiwu-enterprise-console", order: 0 }, EnterpriseConsole);
          });
        }, "kaiwu-praxis-enterprise: console overlay");
      });
    }

    exports.name = "kaiwu-praxis-enterprise";
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
