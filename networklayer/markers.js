(function () {
  /* ========= 基本設定 ========= */

  const COLLAPSE_OTHERS_BY_DEFAULT = true;

  // ✅ 顯示本頁 meta related 的「最近鄰居」區塊
  const SHOW_RELATED_NEIGHBORS = true;

  // ✅ meta related 最大顯示數量（避免太長）
  const MAX_RELATED = 12;

  /* ========= series 容錯對齊 ========= */

  const SERIES_ALIASES = {
    // Governance
    governance: "governance",

    // Identity
    identity: "identity_data",
    "identity-data": "identity_data",
    identitydata: "identity_data",
    identity_data: "identity_data",

    // Synthetic
    synthetic: "synthetic_systems",
    "synthetic-systems": "synthetic_systems",
    syntheticsystems: "synthetic_systems",
    synthetic_systems: "synthetic_systems",

    // Civilization
    civilization: "civilization",
    civilisation: "civilization",
    "offworld-governance": "civilization",
    offworld_governance: "civilization",

    // Sovereign Infrastructure
    "sovereign-infrastructure": "sovereign_infrastructure",
    sovereign_infrastructure: "sovereign_infrastructure",

    // Monetary / Financial / Resource
    monetary: "monetary_infrastructure",
    financial: "monetary_infrastructure",
    finance: "monetary_infrastructure",
    "monetary-infrastructure": "monetary_infrastructure",
    monetary_infrastructure: "monetary_infrastructure",

    resource: "monetary_infrastructure",
    resources: "monetary_infrastructure",
    "strategic-resources": "monetary_infrastructure",
    strategic_resources: "monetary_infrastructure",

    // Cross-series legacy labels
    "synthetic-governance": "governance",
    synthetic_governance: "governance",
    "cognition-economy": "identity_data",
    cognition_economy: "identity_data",
  };

  /* ========= 群組資料（請維持你目前最新版） ========= */

  const groups = [
    {
      id: "governance",
      label: "Governance & Legitimacy",
      items: [
        ["algorithmiclegitimacy.com", "https://algorithmiclegitimacy.com/"],
        ["algorithmiclegitimacy.ai", "https://algorithmiclegitimacy.ai/"],
        ["algorithmicmartiallaw.com", "https://algorithmicmartiallaw.com/"],
        ["automatedjurisprudence.com", "https://automatedjurisprudence.com/"],
        ["syntheticjurisdiction.com", "https://syntheticjurisdiction.com/"],
        ["jurisdictionaldrift.com", "https://jurisdictionaldrift.com/"],
        ["defaultpower.com", "https://defaultpower.com/"],
        ["thepowerofdefault.com", "https://thepowerofdefault.com/"],
        ["unannouncedsovereignty.com", "https://unannouncedsovereignty.com/"],
        ["theincrementalism.com", "https://theincrementalism.com/"],
        ["invisibledetermination.com", "https://invisibledetermination.com/"],
        ["algorithmicenforcement.com", "https://algorithmicenforcement.com/"],
        ["algorithmicsovereignty.com", "https://algorithmicsovereignty.com/"],
      ],
    },

    {
      id: "identity_data",
      label: "Identity & Data Rights",
      items: [
        ["biologicaldatacenter.com", "https://biologicaldatacenter.com/"],
        ["biometricsovereignty.com", "https://biometricsovereignty.com/"],
        ["organicdatarights.com", "https://organicdatarights.com/"],
        ["cognitiveassetclass.com", "https://cognitiveassetclass.com/"],
        ["posthumousidentity.com", "https://posthumousidentity.com/"],
        ["posttruthresilience.com", "https://posttruthresilience.com/"],
        ["biometricliability.com", "https://biometricliability.com/"],
      ],
    },

    {
      id: "synthetic_systems",
      label: "Synthetic Systems & Metabolism",
      items: [
        ["syntheticpollution.com", "https://syntheticpollution.com/"],
        ["syntheticrealitycrisis.com", "https://syntheticrealitycrisis.com/"],
        ["siliconmetabolism.com", "https://siliconmetabolism.com/"],
        ["modelautophagy.com", "https://modelautophagy.com/"],
        ["emotionalquantification.com", "https://emotionalquantification.com/"],
        ["technologicalpathdependency.com", "https://technologicalpathdependency.com/"],
        ["syntheticliability.com", "https://syntheticliability.com/"],
        ["syntheticsolvency.com", "https://syntheticsolvency.com/"],
        ["syntheticsolvency.ai", "https://syntheticsolvency.ai/"],
      ],
    },

    {
      id: "civilization",
      label: "Civilization & Horizon",
      items: [
        ["civilizationcaching.com", "https://civilizationcaching.com/"],
        ["civilizationprotocols.com", "https://civilizationprotocols.com/"],
        ["climateinterventionism.com", "https://climateinterventionism.com/"],
        ["dollardisruption.com", "https://dollardisruption.com/"],
        ["lunarresourceprotocol.com", "https://lunarresourceprotocol.com/"],
        ["offworldsovereignty.com", "https://offworldsovereignty.com/"],
        ["offworldassetrights.com", "https://offworldassetrights.com/"],
        ["orbitallockdown.com", "https://orbitallockdown.com/"],
        ["theageoffusion.com", "https://theageoffusion.com/"],
        ["thepacificpivot.com", "https://thepacificpivot.com/"],
        ["theanswerisblowininthewind.com", "https://theanswerisblowininthewind.com/"],
        ["thefirstmarscitizen.com", "https://thefirstmarscitizen.com/"],
        [
          "thefutureisalreadyhereitisjustnotevenlydistributed.com",
          "https://thefutureisalreadyhereitisjustnotevenlydistributed.com/",
        ],
        ["humanintelligenceisirreplaceable.com", "https://humanintelligenceisirreplaceable.com/"],
      ],
    },

    {
      id: "monetary_infrastructure",
      label: "Monetary & Resource Infrastructure",
      items: [
        ["postfiatreservesystems.com", "https://postfiatreservesystems.com/"],
        ["aurumreserveprotocol.com", "https://aurumreserveprotocol.com/"],
        ["strategicresourceresilience.com", "https://strategicresourceresilience.com/"],
        ["volatilityasinfrastructure.com", "https://volatilityasinfrastructure.com/"],
        ["computationalscarcity.com", "https://computationalscarcity.com/"],
        ["algorithmicallocation.com", "https://algorithmicallocation.com/"],
        ["algorithmicallocation.ai", "https://algorithmicallocation.ai/"],
        ["algorithmicallocation.systems", "https://algorithmicallocation.systems/"],
        ["algorithmicreserves.com", "https://algorithmicreserves.com/"],
        ["energyjurisdiction.com", "https://energyjurisdiction.com/"],
      ],
    },

    {
      id: "sovereign_infrastructure",
      label: "Sovereign Infrastructure & Digital Sovereignty Layer",
      items: [
        ["sovereigndigitalarchitecture.com", "https://sovereigndigitalarchitecture.com/"],
        ["sovereignairesilience.com", "https://sovereignairesilience.com/"],
      ],
    },
  ];

  /* ========= 工具 ========= */

  function normalizeHost(s) {
    return (s || "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .replace(/\/$/, "");
  }

  function hostKey(s) {
    return normalizeHost(s).toLowerCase();
  }

  function normalizeUrl(u) {
    const h = normalizeHost(u);
    if (!h) return "";
    return `https://${h}/`;
  }

  function esc(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }

  function guessFromFolder() {
    const parts = (location.pathname || "").split("/").filter(Boolean);
    return parts.length >= 2 ? parts[parts.length - 2] : "";
  }

  function getCurrentSiteHost() {
    const host = normalizeHost(location.hostname || "");
    if (!host || host === "localhost" || host === "127.0.0.1") {
      return normalizeHost(guessFromFolder() || host || "site");
    }
    return host;
  }

  const currentHost = hostKey(getCurrentSiteHost());

  function isSameSite(nameOrUrl) {
    return hostKey(nameOrUrl) === currentHost;
  }

  function linkHTML(nameOrHost, url) {
    const label = esc(normalizeHost(nameOrHost) || nameOrHost);
    const href = url ? url : normalizeUrl(nameOrHost);
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"
      style="color:inherit;text-decoration:none;border-bottom:1px solid rgba(0,0,0,0.15)">
      ${label}
    </a>`;
  }

  /* ========= 建立快速索引：host -> url ========= */

  const hostToUrl = new Map();
  for (const g of groups) {
    for (const [name, url] of g.items) {
      const h = hostKey(name);
      if (h && url) hostToUrl.set(h, url);
    }
  }

  /* ========= series 取得 ========= */

  const rawSeries = document.documentElement.getAttribute("data-series") || "";
  const preferredGroupId = SERIES_ALIASES[rawSeries] || rawSeries || null;

  /* ========= 讀取 meta related ========= */

  function getRelatedHostsFromMeta() {
    if (!SHOW_RELATED_NEIGHBORS) return [];
    const meta = document.querySelector('meta[name="related"]');
    if (!meta) return [];
    const content = (meta.getAttribute("content") || "").trim();
    if (!content) return [];

    const parts = content
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);

    const out = [];
    const seen = new Set();

    for (const p of parts) {
      const h = normalizeHost(p);
      const key = hostKey(h);
      if (!key) continue;
      if (isSameSite(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(key);
      if (out.length >= MAX_RELATED) break;
    }
    return out;
  }

  function renderRelatedBlock() {
    const relHosts = getRelatedHostsFromMeta();
    if (!relHosts.length) return "";

    const links = relHosts
      .map((h) => {
        const url = hostToUrl.get(hostKey(h)) || normalizeUrl(h);
        return linkHTML(h, url);
      })
      .join(" · ");

    return `
      <details open style="margin-top:0.75rem">
        <summary style="cursor:pointer;font-weight:600;list-style:none;color:#666">
          Closest links
        </summary>
        <div style="margin-top:0.5rem;line-height:1.7">${links}</div>
      </details>
    `;
  }

  /* ========= 排序（本 series 群組優先） ========= */

  const sorted = [...groups].sort((a, b) => {
    if (!preferredGroupId) return 0;
    if (a.id === preferredGroupId) return -1;
    if (b.id === preferredGroupId) return 1;
    return 0;
  });

  function getDisplayItems(g) {
    const seenHosts = new Set();
    return g.items.filter(([name]) => {
      const key = hostKey(name);
      if (!key) return false;
      if (isSameSite(key)) return false;
      if (seenHosts.has(key)) return false;
      seenHosts.add(key);
      return true;
    });
  }

  function renderItems(g) {
    const items = getDisplayItems(g).map(([name, url]) => linkHTML(name, url));

    return items.length ? items.join(" · ") : "<span style='color:#999'>—</span>";
  }

  function renderGroupBlock(g, index) {
    const content = renderItems(g);
    const isPreferred = !!(preferredGroupId && g.id === preferredGroupId);
    const shouldOpen = isPreferred || !COLLAPSE_OTHERS_BY_DEFAULT;

    // 用 details 做折疊：讓結構「像目錄」而不是「像連結農場」
    return `
      <details ${shouldOpen ? "open" : ""} style="margin-top:0.75rem">
        <summary style="cursor:pointer;font-weight:600;list-style:none">
          ${esc(g.label)}
        </summary>
        <div style="margin-top:0.5rem;line-height:1.7">${content}</div>
      </details>
    `;
  }

  /* ========= Footer 渲染 ========= */

  const el = document.getElementById("markerFooter");
  if (el) {
    let container = el.querySelector(".marker-links");
    if (!container) {
      container = document.createElement("div");
      container.className = "marker-links";
      container.style.marginTop = "0.75rem";
      el.appendChild(container);
    }
    container.style.display = "block";
    container.style.lineHeight = "1.7";
    const blocks = sorted.map((g, i) => renderGroupBlock(g, i)).join("");
    container.innerHTML = blocks + renderRelatedBlock();
  }

  /* ========= ✅ Atlas 渲染（只在存在 #networkIndex 的頁面啟用） ========= */

  function renderAtlasIndex() {
    const atlas = document.getElementById("networkIndex");
    if (!atlas) return;

    // Atlas 不需要折疊細節：它就是「總覽」。
    // 但我們仍保留群組邏輯，保持你那套模組化宇宙的秩序。
    const blocks = sorted
      .map((g) => {
        const links = getDisplayItems(g)
          .map(([name, url]) => linkHTML(name, url))
          .join(" · ");

        const safeLinks = links || "<span style='color:#999'>—</span>";

        return `
        <div class="group">
          <div class="group-title">${esc(g.label)}</div>
          <div class="group-links" style="line-height:1.7">${safeLinks}</div>
        </div>
      `;
      })
      .join("");

    atlas.innerHTML = blocks;
  }

  renderAtlasIndex();
})();
