const p = {
  test: !1
}, g = 4, d = "extension", f = "liteloader-napcatcore-template", u = "iteloader-napcatcore-template", y = "LiteLoaderQQNT的插件模板", m = "0.1.0", h = [
  {
    name: "Nyaruhodo",
    link: "https://github.com/nyaruhodoo"
  }
], w = [], C = [
  "win32",
  "linux",
  "darwin"
], v = {
  renderer: "./out/renderer/index.js",
  main: "./out/main/index.js",
  preload: "./out/preload/index.js"
}, l = {
  manifest_version: g,
  type: d,
  name: f,
  slug: u,
  description: y,
  version: m,
  authors: h,
  dependencies: w,
  platform: C,
  injects: v
};
class c {
  /**
   * 初始化插件配置
   */
  static async initConfig() {
    const e = await LiteLoader.api.config.get(l.slug, p), n = this.mergeConfig(e, p);
    return this.updateConfig(n), n;
  }
  /**
   * 更新插件配置
   */
  static async updateConfig(e) {
    await LiteLoader.api.config.set(l.slug, e), this.log("Config已更新", JSON.stringify(e));
  }
  /**
   * 合并配置项
   */
  static mergeConfig(e, n) {
    const t = structuredClone(n);
    for (const [s, i] of Object.entries(e))
      if (Object.hasOwn(t, s) && Object.prototype.toString.call(i) === Object.prototype.toString.call(t[s])) {
        if (Array.isArray(i)) {
          t[s] = [.../* @__PURE__ */ new Set([...i, ...t[s]])];
          continue;
        }
        if (typeof i == "object" && i) {
          t[s] = this.mergeConfig(i, t[s]);
          continue;
        }
        t[s] = i;
      }
    return t;
  }
  static {
    this.updateEventName = `${l.slug}ConfigUpdate`;
  }
  /**
   * 带有插件标识的Log
   */
  static log(...e) {
    console.log(`${l.slug}:`, ...e);
  }
  /**
   * 生成随机整数
   */
  static randomInteger(e, n) {
    const t = e + Math.random() * (n + 1 - e);
    return Math.floor(t);
  }
  /**
   * 返回一个指定时间后决议为 resolve 的 promise
   */
  static wait(e) {
    if (!(e <= 0))
      return new Promise((n) => setTimeout(n, e));
  }
  /**
   * 为对象创建深层Proxy
   */
  static createDeepProxy(e, n) {
    for (const t in e)
      typeof e[t] == "object" && e[t] && (e[t] = c.createDeepProxy(e[t], n));
    return new Proxy(e, n);
  }
  /**
   * 根据path从对象中取值
   */
  static getProperty(e, n) {
    let t = e;
    const s = n.split(".");
    for (; s.length; ) {
      const i = s.shift();
      if (!i) return;
      t = t[i];
    }
    return t;
  }
  /**
   * 根据path修改对象属性值
   */
  static setProperty(e, n, t) {
    let s = e;
    const i = n.split("."), r = i.pop();
    if (r) {
      for (; i.length; ) {
        const a = i.shift();
        if (!a) return;
        s = s[a];
      }
      return s[r] = t;
    }
  }
}
const x = (o) => [
  {
    title: "配置标题",
    foldTitle: "123",
    list: [
      {
        title: "配置项",
        type: "setting-switch",
        inputType: "text",
        keyPath: "test",
        value: o.test
      }
    ]
  }
], E = (o, e) => {
  const n = document.createElement("setting-item");
  n.setAttribute("data-direction", "row"), n.innerHTML = '<div class="setting-item-text"></div>';
  {
    const t = n.querySelector(".setting-item-text"), s = document.createElement("setting-text");
    if (s.innerHTML = o.title, t.append(s), o.description) {
      const i = document.createElement("setting-text");
      i.setAttribute("data-type", "secondary"), i.innerHTML = o.description, t.append(i);
    }
  }
  {
    const t = document.createElement(o.type);
    switch (n.append(t), o.type) {
      case "setting-switch":
        o.value && t.setAttribute("is-active", "true"), t.addEventListener("click", function() {
          const i = t.hasAttribute("is-active");
          t.toggleAttribute("is-active"), c.setProperty(e, o.keyPath, !i);
        });
        break;
      case "input":
        t instanceof HTMLInputElement && (t.type = o.inputType ?? "text", t.value = o.value, t.addEventListener("change", () => {
          const i = o.customStoreFormat ? o.customStoreFormat(t.value) : t.value;
          c.setProperty(e, o.keyPath, i);
        }));
        break;
      default:
        return o.type;
    }
  }
  return n;
}, k = (o) => x(o).map(({ title: n, list: t, foldTitle: s }) => {
  const i = document.createElement("setting-section");
  n && i.setAttribute("data-title", n), i.innerHTML = `
      <setting-panel>
        <setting-list data-direction="column"></setting-list>
      </setting-panel>
    `;
  const r = i.querySelector("setting-list");
  s && (r?.setAttribute("is-collapsible", "true"), r?.setAttribute("data-title", s));
  for (const a of t)
    r?.append(E(a, o));
  return i;
}), L = "" + new URL("index.css", import.meta.url).href, b = window[u], S = async (o) => {
  const e = await c.initConfig(), n = c.createDeepProxy(e, {
    set(t, s, i) {
      t[s] = i;
      const r = JSON.parse(JSON.stringify(n));
      return c.updateConfig(r), o?.(r), !0;
    }
  });
  return n;
};
class A extends HTMLElement {
  async connectedCallback() {
    const e = await S((s) => {
      b.configUpdate(s), new BroadcastChannel(u).postMessage(s);
    }), n = this.attachShadow({ mode: "open" });
    n.append(...k(e));
    const t = document.createElement("link");
    t.rel = "stylesheet", t.href = L, n.append(t);
  }
}
customElements.define("config-element", A);
const P = (o) => {
  o.innerHTML = "<config-element></config-element>";
};
export {
  P as onSettingWindowCreated
};
