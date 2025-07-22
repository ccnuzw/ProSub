var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = parse;
    exports.serialize = serialize3;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parse(str2, options) {
      const obj = new NullObject();
      const len = str2.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = str2.indexOf("=", index);
        if (eqIdx === -1)
          break;
        const colonIdx = str2.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
          index = str2.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const keyStartIdx = startIndex(str2, index, eqIdx);
        const keyEndIdx = endIndex(str2, eqIdx, keyStartIdx);
        const key = str2.slice(keyStartIdx, keyEndIdx);
        if (obj[key] === void 0) {
          let valStartIdx = startIndex(str2, eqIdx + 1, endIdx);
          let valEndIdx = endIndex(str2, endIdx, valStartIdx);
          const value = dec(str2.slice(valStartIdx, valEndIdx));
          obj[key] = value;
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function startIndex(str2, index, max) {
      do {
        const code = str2.charCodeAt(index);
        if (code !== 32 && code !== 9)
          return index;
      } while (++index < max);
      return max;
    }
    function endIndex(str2, index, min) {
      while (index > min) {
        const code = str2.charCodeAt(--index);
        if (code !== 32 && code !== 9)
          return index + 1;
      }
      return min;
    }
    function serialize3(name, val, options) {
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
      }
      const value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
      }
      let str2 = name + "=" + value;
      if (!options)
        return str2;
      if (options.maxAge !== void 0) {
        if (!Number.isInteger(options.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str2 += "; Max-Age=" + options.maxAge;
      }
      if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
          throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str2 += "; Domain=" + options.domain;
      }
      if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
          throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str2 += "; Path=" + options.path;
      }
      if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str2 += "; Expires=" + options.expires.toUTCString();
      }
      if (options.httpOnly) {
        str2 += "; HttpOnly";
      }
      if (options.secure) {
        str2 += "; Secure";
      }
      if (options.partitioned) {
        str2 += "; Partitioned";
      }
      if (options.priority) {
        const priority = typeof options.priority === "string" ? options.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str2 += "; Priority=Low";
            break;
          case "medium":
            str2 += "; Priority=Medium";
            break;
          case "high":
            str2 += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
      }
      if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str2 += "; SameSite=Strict";
            break;
          case "lax":
            str2 += "; SameSite=Lax";
            break;
          case "none":
            str2 += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
      }
      return str2;
    }
    function decode(str2) {
      if (str2.indexOf("%") === -1)
        return str2;
      try {
        return decodeURIComponent(str2);
      } catch (e) {
        return str2;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// functions/auth/login.ts
var import_cookie = __toESM(require_dist(), 1);
function arrayBufferToHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
async function hashPassword(password) {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = arrayBufferToHex(saltBuffer.buffer);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
  const hashHex = arrayBufferToHex(hashBuffer);
  return `${salt}:${hashHex}`;
}
async function comparePassword(password, hash) {
  try {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + salt);
    const derivedKeyBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
    const derivedKeyHex = arrayBufferToHex(derivedKeyBuffer);
    return derivedKeyHex === key;
  } catch (e) {
    console.error("Password comparison failed", e);
    return false;
  }
}
var getKV = (env) => {
  if (env.KV) {
    return env.KV;
  }
  throw new Error("KV Namespace not found.");
};
async function ensureAdminUserExists(KV) {
  const adminUserKey = "user:admin";
  const adminUser = await KV.get(adminUserKey);
  if (!adminUser) {
    const hashedPassword = await hashPassword("admin");
    const newAdmin = { id: "admin", name: "admin", password: hashedPassword, profiles: [], defaultPasswordChanged: false };
    await KV.put(adminUserKey, JSON.stringify(newAdmin));
    console.log("Default admin user created.");
  }
}
async function handleLogin(request, env) {
  const { name, password } = await request.json();
  if (!name || !password) {
    return new Response(JSON.stringify({ message: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u662F\u5FC5\u586B\u9879" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const KV = getKV(env);
  await ensureAdminUserExists(KV);
  const userList = await KV.list({ prefix: "user:" });
  const users = await Promise.all(
    userList.keys.map(async ({ name: keyName }) => {
      const userJson = await KV.get(keyName);
      return userJson ? JSON.parse(userJson) : null;
    })
  );
  const user = users.filter(Boolean).find((u) => u.name === name);
  if (!user || !user.password) {
    return new Response(JSON.stringify({ message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u4E0D\u6B63\u786E" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const passwordMatch = await comparePassword(password, user.password);
  if (!passwordMatch) {
    return new Response(JSON.stringify({ message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u4E0D\u6B63\u786E" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const token = user.id;
  const cookie = (0, import_cookie.serialize)("auth_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    // Assuming NODE_ENV is available in Workers env
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    // 1 day
    path: "/"
  });
  const responseBody = {
    message: "\u767B\u5F55\u6210\u529F",
    user: { id: user.id, name: user.name }
  };
  if (user.name === "admin" && user.defaultPasswordChanged === false) {
    responseBody.forcePasswordChange = true;
  }
  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: { "Set-Cookie": cookie, "Content-Type": "application/json" }
  });
}

// functions/auth/logout.ts
var import_cookie2 = __toESM(require_dist(), 1);
async function handleLogout(request, env) {
  const cookie = (0, import_cookie2.serialize)("auth_token", "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    // Expire the cookie immediately
    path: "/"
  });
  return new Response(JSON.stringify({ message: "\u767B\u51FA\u6210\u529F" }), {
    status: 200,
    headers: { "Set-Cookie": cookie, "Content-Type": "application/json" }
  });
}

// functions/lib/auth.ts
async function authenticateUser(request, env) {
  let kv;
  if (env && env.KV && typeof env.KV.get === "function") {
    kv = env.KV;
  } else {
    console.warn("Warning: env.KV is not a fully functional KVNamespace. Using in-memory mock for local development.");
    const inMemoryStore = {};
    kv = {
      get: async (key) => {
        console.log(`Mock KV.get called for key: ${key}`);
        return inMemoryStore[key] || null;
      },
      put: async (key, value) => {
        console.log(`Mock KV.put called for key: ${key}`);
        inMemoryStore[key] = value;
      },
      delete: async (key) => {
        console.log(`Mock KV.delete called for key: ${key}`);
        delete inMemoryStore[key];
      },
      list: async () => {
        console.log("Mock KV.list called");
        return { keys: Object.keys(inMemoryStore).map((key) => ({ name: key })), list_complete: true };
      }
    };
  }
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookieHeader ? Object.fromEntries(cookieHeader.split("; ").map((c) => c.split("="))) : {};
  const token = cookies["auth_token"];
  if (!token) {
    return null;
  }
  const userJson = await kv.get(`user:${token}`);
  if (!userJson) {
    return null;
  }
  return JSON.parse(userJson);
}

// functions/auth/me.ts
async function handleMe(request, env) {
  const user = await authenticateUser(request, env);
  if (!user) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const { password: _, ...userWithoutPassword } = user;
  return new Response(JSON.stringify(userWithoutPassword), { status: 200, headers: { "Content-Type": "application/json" } });
}

// functions/node-health-check.ts
async function handleNodeHealthCheck(request, env) {
  const { server, port, nodeId } = await request.json();
  if (!server || !port || !nodeId) {
    return new Response(JSON.stringify({ error: "Server, port, and nodeId are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
  const KV = env.KV;
  const healthStatus = {
    status: "offline",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5e3);
  try {
    const startTime = Date.now();
    await fetch(`http://${server}:${port}`, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "ProSub Health Check/1.0"
      }
    });
    const endTime = Date.now();
    healthStatus.status = "online";
    healthStatus.latency = endTime - startTime;
  } catch (error) {
    healthStatus.status = "offline";
    if (error instanceof Error) {
      healthStatus.error = error.message;
    } else {
      healthStatus.error = String(error);
    }
  } finally {
    clearTimeout(timeoutId);
  }
  await KV.put(`node-status:${nodeId}`, JSON.stringify(healthStatus));
  return new Response(JSON.stringify(healthStatus), { status: 200, headers: { "Content-Type": "application/json" } });
}

// functions/node-statuses.ts
async function handleNodeStatuses(request, env) {
  try {
    const KV = env.KV;
    const statusList = await KV.list({ prefix: "node-status:" });
    const nodeStatuses = {};
    await Promise.all(
      statusList.keys.map(async ({ name }) => {
        const nodeId = name.replace("node-status:", "");
        const statusJson = await KV.get(name);
        if (statusJson) {
          nodeStatuses[nodeId] = JSON.parse(statusJson);
        }
      })
    );
    return new Response(JSON.stringify(nodeStatuses), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to fetch node statuses:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch node statuses" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/nodes.ts
async function handleNodesGet(request, env) {
  try {
    const KV = env.KV;
    const nodeList = await KV.list({ prefix: "node:" });
    const nodes = await Promise.all(
      nodeList.keys.map(async ({ name }) => {
        const nodeJson = await KV.get(name);
        return nodeJson ? JSON.parse(nodeJson) : null;
      })
    );
    return new Response(JSON.stringify(nodes.filter(Boolean)), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to fetch nodes:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch nodes" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleNodesPost(request, env) {
  try {
    const { name, server, port, password, type: type2 } = await request.json();
    const id = crypto.randomUUID();
    const newNode = { id, name, server, port, password, type: type2 };
    const KV = env.KV;
    await KV.put(`node:${id}`, JSON.stringify(newNode));
    return new Response(JSON.stringify(newNode), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to create node:", error);
    return new Response(JSON.stringify({ error: "Failed to create node" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/nodes-id.ts
async function handleNodeGet(request, env, id) {
  try {
    const KV = env.KV;
    const nodeJson = await KV.get(`node:${id}`);
    if (!nodeJson) {
      return new Response(JSON.stringify({ error: "Node not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(JSON.parse(nodeJson)), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to fetch node ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to fetch node" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleNodePut(request, env, id) {
  try {
    const { name, server, port, password, type: type2 } = await request.json();
    const updatedNode = { id, name, server, port, password, type: type2 };
    const KV = env.KV;
    await KV.put(`node:${id}`, JSON.stringify(updatedNode));
    return new Response(JSON.stringify(updatedNode), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to update node ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to update node" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleNodeDelete(request, env, id) {
  try {
    const KV = env.KV;
    await KV.delete(`node:${id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete node ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to delete node" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/nodes-batch-delete.ts
async function handleNodesBatchDelete(request, env) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ message: "\u8BF7\u6C42\u4F53\u4E2D\u9700\u8981\u63D0\u4F9B\u4E00\u4E2A\u5305\u542B\u8282\u70B9 ID \u7684\u6570\u7EC4" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const KV = env.KV;
    const deletePromises = ids.map((id) => KV.delete(`node:${id}`));
    await Promise.all(deletePromises);
    return new Response(JSON.stringify({ message: `${ids.length} \u4E2A\u8282\u70B9\u5DF2\u6210\u529F\u5220\u9664` }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to batch delete nodes:", error);
    return new Response(JSON.stringify({ error: "\u6279\u91CF\u5220\u9664\u8282\u70B9\u65F6\u53D1\u751F\u9519\u8BEF" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/nodes-batch-import.ts
async function handleNodesBatchImport(request, env) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { nodes } = await request.json();
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return new Response(JSON.stringify({ message: "\u8BF7\u6C42\u4F53\u4E2D\u9700\u8981\u63D0\u4F9B nodes \u6570\u7EC4" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const KV = env.KV;
    const nodeList = await KV.list({ prefix: "node:" });
    const existingNodesJson = await Promise.all(
      nodeList.keys.map(async ({ name }) => KV.get(name))
    );
    const existingNodes = existingNodesJson.filter(Boolean).map((json2) => JSON.parse(json2));
    const existingNodeSet = new Set(
      existingNodes.map((node) => `${node.server}:${node.port}:${node.password || ""}`)
    );
    let importedCount = 0;
    let skippedCount = 0;
    const putPromises = [];
    for (const node of nodes) {
      if (node && node.server && node.port) {
        const uniqueKey = `${node.server}:${node.port}:${node.password || ""}`;
        if (!existingNodeSet.has(uniqueKey)) {
          const newNode = {
            id: crypto.randomUUID(),
            ...node
          };
          putPromises.push(KV.put(`node:${newNode.id}`, JSON.stringify(newNode)));
          existingNodeSet.add(uniqueKey);
          importedCount++;
        } else {
          skippedCount++;
        }
      }
    }
    if (putPromises.length > 0) {
      await Promise.all(putPromises);
    }
    return new Response(JSON.stringify({
      message: `\u6210\u529F\u5BFC\u5165 ${importedCount} \u4E2A\u8282\u70B9\uFF0C\u8DF3\u8FC7 ${skippedCount} \u4E2A\u91CD\u590D\u8282\u70B9\u3002`,
      importedCount,
      skippedCount
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("\u5904\u7406\u6279\u91CF\u5BFC\u5165\u8282\u70B9\u5931\u8D25:", error);
    return new Response(JSON.stringify({ message: "\u5904\u7406\u6279\u91CF\u5BFC\u5165\u8282\u70B9\u5931\u8D25" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/nodes-clear-all.ts
async function handleNodesClearAll(request, env) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const KV = env.KV;
    const nodeList = await KV.list({ prefix: "node:" });
    const deletePromises = [];
    for (const key of nodeList.keys) {
      deletePromises.push(KV.delete(key.name));
    }
    await Promise.all(deletePromises);
    return new Response(JSON.stringify({ message: "\u6240\u6709\u8282\u70B9\u5DF2\u6E05\u7A7A" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("\u6E05\u7A7A\u8282\u70B9\u5931\u8D25:", error);
    return new Response(JSON.stringify({ message: "\u6E05\u7A7A\u8282\u70B9\u5931\u8D25" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/profiles.ts
async function handleProfilesGet(request, env) {
  try {
    const KV = env.KV;
    const profileList = await KV.list({ prefix: "profile:" });
    const profiles = await Promise.all(
      profileList.keys.map(async ({ name }) => {
        const profileJson = await KV.get(name);
        return profileJson ? JSON.parse(profileJson) : null;
      })
    );
    return new Response(JSON.stringify(profiles.filter(Boolean)), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to fetch profiles:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch profiles" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleProfilesPost(request, env) {
  try {
    const { name, nodes = [], subscriptions = [], alias } = await request.json();
    if (!name) {
      return new Response("Profile name is required", { status: 400 });
    }
    const KV = env.KV;
    if (alias) {
      if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
        return new Response("Invalid characters in custom path. Use only letters, numbers, hyphen, and underscore.", { status: 400 });
      }
      const existingAlias = await KV.get(`alias:${alias}`);
      if (existingAlias) {
        return new Response("This custom path is already in use.", { status: 409 });
      }
    }
    const newProfile = {
      id: crypto.randomUUID(),
      name,
      alias: alias || void 0,
      nodes,
      subscriptions,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await KV.put(`profile:${newProfile.id}`, JSON.stringify(newProfile));
    if (alias) {
      await KV.put(`alias:${alias}`, JSON.stringify({ id: newProfile.id }));
    }
    return new Response(JSON.stringify(newProfile), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to create profile:", error);
    return new Response("Failed to create profile", { status: 500 });
  }
}

// functions/profiles-id.ts
async function handleProfileGet(request, env, id) {
  try {
    const KV = env.KV;
    const profileJson = await KV.get(`profile:${id}`);
    if (!profileJson) {
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(JSON.parse(profileJson)), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to fetch profile ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to fetch profile" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleProfilePut(request, env, id) {
  try {
    const KV = env.KV;
    const profileId = id;
    const profileJson = await KV.get(`profile:${profileId}`);
    if (!profileJson) {
      return new Response("Profile not found", { status: 404 });
    }
    const existingProfile = JSON.parse(profileJson);
    const body = await request.json();
    const { name, nodes, subscriptions, alias } = body;
    const oldAlias = existingProfile.alias;
    const newAlias = alias;
    if (newAlias && newAlias !== oldAlias) {
      const existingAlias = await KV.get(`alias:${newAlias}`);
      if (existingAlias) {
        const owner = JSON.parse(existingAlias);
        if (owner.id !== profileId) {
          return new Response("This custom path is already in use by another profile.", { status: 409 });
        }
      }
      await KV.put(`alias:${newAlias}`, JSON.stringify({ id: profileId }));
    }
    if (oldAlias && oldAlias !== newAlias) {
      await KV.delete(`alias:${oldAlias}`);
    }
    const updatedProfile = {
      ...existingProfile,
      name: name ?? existingProfile.name,
      nodes: nodes ?? existingProfile.nodes,
      subscriptions: subscriptions ?? existingProfile.subscriptions,
      alias: newAlias || void 0,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await KV.put(`profile:${profileId}`, JSON.stringify(updatedProfile));
    return new Response(JSON.stringify(updatedProfile), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to update profile ${id}:`, error);
    return new Response("Failed to update profile", { status: 500 });
  }
}
async function handleProfileDelete(request, env, id) {
  try {
    const KV = env.KV;
    const profile = await KV.get(`profile:${id}`);
    if (profile) {
      const { alias } = JSON.parse(profile);
      if (alias) {
        await KV.delete(`alias:${alias}`);
      }
    }
    await KV.delete(`profile:${id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete profile ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to delete profile" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    if (keyNode === "__proto__") {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");

// functions/lib/clash-proxy-groups.ts
var filterNodes = (nodes, keyword) => {
  const regex = typeof keyword === "string" ? new RegExp(keyword, "i") : keyword;
  return nodes.filter((node) => regex.test(node.name)).map((node) => node.name);
};
var getClashProxyGroups = (nodes) => {
  const nodeNames = nodes.map((n) => n.name);
  const hkNodes = filterNodes(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodes(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodes(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodes(nodes, /日|JP|Japan/i);
  const usNodes = filterNodes(nodes, /美|US|United States/i);
  const krNodes = filterNodes(nodes, /韩|KR|Korea/i);
  const allProxies = ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", "DIRECT", ...nodeNames];
  return [
    {
      name: "\u{1F680} \u8282\u70B9\u9009\u62E9",
      type: "select",
      proxies: allProxies
    },
    {
      name: "\u2611\uFE0F \u624B\u52A8\u5207\u6362",
      type: "select",
      proxies: nodeNames
    },
    {
      name: "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9",
      type: "url-test",
      proxies: nodeNames,
      url: "http://www.gstatic.com/generate_204",
      interval: 300
    },
    {
      name: "\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C",
      type: "select",
      proxies: ["REJECT", "DIRECT"]
    },
    {
      name: "\u{1F6D1} \u5E7F\u544A\u62E6\u622A",
      type: "select",
      proxies: ["REJECT", "DIRECT"]
    },
    {
      name: "\u{1F30F} \u56FD\u5185\u5A92\u4F53",
      type: "select",
      proxies: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"]
    },
    {
      name: "\u{1F30D} \u56FD\u5916\u5A92\u4F53",
      type: "select",
      proxies: ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", ...hkNodes, ...twNodes, ...usNodes]
    },
    {
      name: "\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891",
      type: "select",
      proxies: ["\u{1F30D} \u56FD\u5916\u5A92\u4F53"]
    },
    {
      name: "\u{1F3A5} \u5948\u98DE\u89C6\u9891",
      type: "select",
      proxies: ["\u{1F30D} \u56FD\u5916\u5A92\u4F53"]
    },
    {
      name: "\u{1F916} OpenAi",
      type: "select",
      proxies: ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", ...usNodes, ...jpNodes]
    },
    {
      name: "\u{1F4F2} \u7535\u62A5\u6D88\u606F",
      type: "select",
      proxies: ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9"]
    },
    {
      name: "\u{1F34E} \u82F9\u679C\u670D\u52A1",
      type: "select",
      proxies: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"]
    },
    {
      name: "\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1",
      type: "select",
      proxies: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"]
    },
    {
      name: "\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
      type: "select",
      proxies: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"]
    },
    // Region-specific auto-test groups
    {
      name: "\u{1F1ED}\u{1F1F0} \u9999\u6E2F\u8282\u70B9",
      type: "url-test",
      proxies: hkNodes.length > 0 ? hkNodes : nodeNames,
      url: "http://www.gstatic.com/generate_204",
      interval: 300
    },
    {
      name: "\u{1F1F9}\u{1F1FC} \u53F0\u6E7E\u8282\u70B9",
      type: "url-test",
      proxies: twNodes.length > 0 ? twNodes : nodeNames,
      url: "http://www.gstatic.com/generate_204",
      interval: 300
    },
    {
      name: "\u{1F1F8}\u{1F1EC} \u72EE\u57CE\u8282\u70B9",
      type: "url-test",
      proxies: sgNodes.length > 0 ? sgNodes : nodeNames,
      url: "http://www.gstatic.com/generate_204",
      interval: 300
    },
    {
      name: "\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8282\u70B9",
      type: "url-test",
      proxies: jpNodes.length > 0 ? jpNodes : nodeNames,
      url: "http://www.gstatic.com/generate_204",
      interval: 300
    },
    {
      name: "\u{1F1FA}\u{1F1F2} \u7F8E\u56FD\u8282\u70B9",
      type: "url-test",
      proxies: usNodes.length > 0 ? usNodes : nodeNames,
      url: "http://www.gstatic.com/generate_204",
      interval: 300
    },
    {
      name: "\u{1F1F0}\u{1F1F7} \u97E9\u56FD\u8282\u70B9",
      type: "url-test",
      proxies: krNodes.length > 0 ? krNodes : nodeNames,
      url: "http://www.gstatic.com/generate_204",
      interval: 300
    }
  ];
};

// functions/lib/clash-rules.ts
var ruleProviders = {
  "ads": {
    "type": "http",
    "behavior": "domain",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list",
    "path": "./ruleset/ads.list",
    "interval": 86400
  },
  "microsoft": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list",
    "path": "./ruleset/microsoft.list",
    "interval": 86400
  },
  "apple": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list",
    "path": "./ruleset/apple.list",
    "interval": 86400
  },
  "telegram": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list",
    "path": "./ruleset/telegram.list",
    "interval": 86400
  },
  "openai": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list",
    "path": "./ruleset/openai.list",
    "interval": 86400
  },
  "youtube": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list",
    "path": "./ruleset/youtube.list",
    "interval": 86400
  },
  "netflix": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list",
    "path": "./ruleset/netflix.list",
    "interval": 86400
  },
  "proxy_media": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list",
    "path": "./ruleset/proxy_media.list",
    "interval": 86400
  },
  "china_media": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list",
    "path": "./ruleset/china_media.list",
    "interval": 86400
  },
  "gfw": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list",
    "path": "./ruleset/gfw.list",
    "interval": 86400
  },
  "direct": {
    "type": "http",
    "behavior": "classical",
    "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list",
    "path": "./ruleset/direct.list",
    "interval": 86400
  }
};
var clashRules = [
  "RULE-SET,ads,\u{1F6D1} \u5E7F\u544A\u62E6\u622A",
  "RULE-SET,microsoft,\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1",
  "RULE-SET,apple,\u{1F34E} \u82F9\u679C\u670D\u52A1",
  "RULE-SET,telegram,\u{1F4F2} \u7535\u62A5\u6D88\u606F",
  "RULE-SET,openai,\u{1F916} OpenAi",
  "RULE-SET,youtube,\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891",
  "RULE-SET,netflix,\u{1F3A5} \u5948\u98DE\u89C6\u9891",
  "RULE-SET,proxy_media,\u{1F30D} \u56FD\u5916\u5A92\u4F53",
  "RULE-SET,china_media,\u{1F30F} \u56FD\u5185\u5A92\u4F53",
  "RULE-SET,gfw,\u{1F680} \u8282\u70B9\u9009\u62E9",
  "RULE-SET,direct,\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "GEOIP,LAN,\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "GEOIP,CN,\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "MATCH,\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C"
];

// functions/lib/surge-proxy-groups.ts
var filterNodes2 = (nodes, keyword) => {
  const regex = typeof keyword === "string" ? new RegExp(keyword, "i") : keyword;
  return nodes.filter((node) => regex.test(node.name)).map((node) => node.name);
};
var getSurgeProxyGroups = (nodes) => {
  const nodeNames = nodes.map((n) => n.name);
  const hkNodes = filterNodes2(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodes2(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodes2(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodes2(nodes, /日|JP|Japan/i);
  const usNodes = filterNodes2(nodes, /美|US|United States/i);
  const krNodes = filterNodes2(nodes, /韩|KR|Korea/i);
  const allProxies = ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", "DIRECT", ...nodeNames].join(", ");
  const groups = [
    `\u{1F680} \u8282\u70B9\u9009\u62E9 = select, ${allProxies}`,
    `\u2611\uFE0F \u624B\u52A8\u5207\u6362 = select, ${nodeNames.join(", ")}`,
    `\u267B\uFE0F \u81EA\u52A8\u9009\u62E9 = url-test, ${nodeNames.join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, DIRECT`,
    `\u{1F6D1} \u5E7F\u544A\u62E6\u622A = select, REJECT, DIRECT`,
    `\u{1F30F} \u56FD\u5185\u5A92\u4F53 = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u{1F30D} \u56FD\u5916\u5A92\u4F53 = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, ${[...hkNodes, ...twNodes, ...usNodes].join(", ")}`,
    `\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891 = select, \u{1F30D} \u56FD\u5916\u5A92\u4F53`,
    `\u{1F3A5} \u5948\u98DE\u89C6\u9891 = select, \u{1F30D} \u56FD\u5916\u5A92\u4F53`,
    `\u{1F916} OpenAi = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, ${[...usNodes, ...jpNodes].join(", ")}`,
    `\u{1F4F2} \u7535\u62A5\u6D88\u606F = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9`,
    `\u{1F34E} \u82F9\u679C\u670D\u52A1 = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1 = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u{1F3AF} \u5168\u7403\u76F4\u8FDE = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    // Region-specific auto-test groups
    `\u{1F1ED}\u{1F1F0} \u9999\u6E2F\u8282\u70B9 = url-test, ${(hkNodes.length > 0 ? hkNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1F9}\u{1F1FC} \u53F0\u6E7E\u8282\u70B9 = url-test, ${(twNodes.length > 0 ? twNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1F8}\u{1F1EC} \u72EE\u57CE\u8282\u70B9 = url-test, ${(sgNodes.length > 0 ? sgNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8282\u70B9 = url-test, ${(jpNodes.length > 0 ? jpNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1FA}\u{1F1F2} \u7F8E\u56FD\u8282\u70B9 = url-test, ${(usNodes.length > 0 ? usNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1F0}\u{1F1F7} \u97E9\u56FD\u8282\u70B9 = url-test, ${(krNodes.length > 0 ? krNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`
  ];
  return groups;
};

// functions/lib/surge-rules.ts
var surgeRules = [
  "# > Advertising",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list,\u{1F6D1} \u5E7F\u544A\u62E6\u622A",
  "",
  "# > Microsoft",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list,\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1",
  "",
  "# > Apple",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list,\u{1F34E} \u82F9\u679C\u670D\u52A1",
  "",
  "# > Telegram",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list,\u{1F4F2} \u7535\u62A5\u6D88\u606F",
  "",
  "# > OpenAI",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list,\u{1F916} OpenAi",
  "",
  "# > Streaming Media",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list,\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list,\u{1F3A5} \u5948\u98DE\u89C6\u9891",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list,\u{1F30D} \u56FD\u5916\u5A92\u4F53",
  "",
  "# > China Media",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list,\u{1F30F} \u56FD\u5185\u5A92\u4F53",
  "",
  "# > GFW",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,\u{1F680} \u8282\u70B9\u9009\u62E9",
  "",
  "# > China",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list,\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "GEOIP,CN,\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "",
  "# > Final",
  "FINAL,\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C"
];

// functions/lib/quantumult-x-policies.ts
var filterNodes3 = (nodes, keyword) => {
  const regex = typeof keyword === "string" ? new RegExp(keyword, "i") : keyword;
  return nodes.filter((node) => regex.test(node.name)).map((node) => `"${node.name}"`);
};
var getQuantumultXPolicies = (nodes) => {
  const nodeNames = nodes.map((n) => `"${n.name}"`);
  const hkNodes = filterNodes3(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodes3(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodes3(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodes3(nodes, /日|JP|Japan/i);
  const usNodes = filterNodes3(nodes, /美|US|United States/i);
  const krNodes = filterNodes3(nodes, /韩|KR|Korea/i);
  const allProxies = ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", "DIRECT", ...nodeNames].join(", ");
  const policies = [
    `\u{1F680} \u8282\u70B9\u9009\u62E9 = static, ${allProxies}`,
    `\u2611\uFE0F \u624B\u52A8\u5207\u6362 = static, ${nodeNames.join(", ")}`,
    `\u267B\uFE0F \u81EA\u52A8\u9009\u62E9 = available, ${nodeNames.join(", ")}`,
    `\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C = static, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, DIRECT`,
    `\u{1F6D1} \u5E7F\u544A\u62E6\u622A = static, REJECT, DIRECT`,
    `\u{1F30F} \u56FD\u5185\u5A92\u4F53 = static, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u{1F30D} \u56FD\u5916\u5A92\u4F53 = static, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, ${[...hkNodes, ...twNodes, ...usNodes].join(", ")}`,
    `\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891 = static, \u{1F30D} \u56FD\u5916\u5A92\u4F53`,
    `\u{1F3A5} \u5948\u98DE\u89C6\u9891 = static, \u{1F30D} \u56FD\u5916\u5A92\u4F53`,
    `\u{1F916} OpenAi = static, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, ${[...usNodes, ...jpNodes].join(", ")}`,
    `\u{1F4F2} \u7535\u62A5\u6D88\u606F = static, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9`,
    `\u{1F34E} \u82F9\u679C\u670D\u52A1 = static, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1 = static, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u{1F3AF} \u5168\u7403\u76F4\u8FDE = static, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    // Region-specific policies
    `\u{1F1ED}\u{1F1F0} \u9999\u6E2F\u8282\u70B9 = available, ${(hkNodes.length > 0 ? hkNodes : nodeNames).join(", ")}`,
    `\u{1F1F9}\u{1F1FC} \u53F0\u6E7E\u8282\u70B9 = available, ${(twNodes.length > 0 ? twNodes : nodeNames).join(", ")}`,
    `\u{1F1F8}\u{1F1EC} \u72EE\u57CE\u8282\u70B9 = available, ${(sgNodes.length > 0 ? sgNodes : nodeNames).join(", ")}`,
    `\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8282\u70B9 = available, ${(jpNodes.length > 0 ? jpNodes : nodeNames).join(", ")}`,
    `\u{1F1FA}\u{1F1F2} \u7F8E\u56FD\u8282\u70B9 = available, ${(usNodes.length > 0 ? usNodes : nodeNames).join(", ")}`,
    `\u{1F1F0}\u{1F1F7} \u97E9\u56FD\u8282\u70B9 = available, ${(krNodes.length > 0 ? krNodes : nodeNames).join(", ")}`
  ];
  return policies;
};

// functions/lib/quantumult-x-rules.ts
var quantumultXRules = [
  "# > Advertising",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list, tag=\u{1F6D1} \u5E7F\u544A\u62E6\u622A, force-policy=REJECT, enabled=true",
  "",
  "# > Microsoft",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list, tag=\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1, force-policy=DIRECT, enabled=true",
  "",
  "# > Apple",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list, tag=\u{1F34E} \u82F9\u679C\u670D\u52A1, force-policy=DIRECT, enabled=true",
  "",
  "# > Telegram",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list, tag=\u{1F4F2} \u7535\u62A5\u6D88\u606F, force-policy=\u{1F680} \u8282\u70B9\u9009\u62E9, enabled=true",
  "",
  "# > OpenAI",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list, tag=\u{1F916} OpenAi, force-policy=\u{1F680} \u8282\u70B9\u9009\u62E9, enabled=true",
  "",
  "# > Streaming Media",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list, tag=\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891, force-policy=\u{1F30D} \u56FD\u5916\u5A92\u4F53, enabled=true",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list, tag=\u{1F3A5} \u5948\u98DE\u89C6\u9891, force-policy=\u{1F30D} \u56FD\u5916\u5A92\u4F53, enabled=true",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list, tag=\u{1F30D} \u56FD\u5916\u5A92\u4F53, force-policy=\u{1F30D} \u56FD\u5916\u5A92\u4F53, enabled=true",
  "",
  "# > China Media",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list, tag=\u{1F30F} \u56FD\u5185\u5A92\u4F53, force-policy=DIRECT, enabled=true",
  "",
  "# > GFW",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list, tag=\u{1F680} \u8282\u70B9\u9009\u62E9, force-policy=\u{1F680} \u8282\u70B9\u9009\u62E9, enabled=true",
  "",
  "# > China",
  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list, tag=\u{1F3AF} \u5168\u7403\u76F4\u8FDE, force-policy=DIRECT, enabled=true",
  "",
  "# > GeoIP",
  "geoip=cn, \u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "",
  "# > Final",
  "final=\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C"
];

// functions/lib/loon-proxy-groups.ts
var filterNodes4 = (nodes, keyword) => {
  const regex = typeof keyword === "string" ? new RegExp(keyword, "i") : keyword;
  return nodes.filter((node) => regex.test(node.name)).map((node) => node.name);
};
var getLoonProxyGroups = (nodes) => {
  const nodeNames = nodes.map((n) => n.name);
  const hkNodes = filterNodes4(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodes4(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodes4(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodes4(nodes, /日|JP|Japan/i);
  const usNodes = filterNodes4(nodes, /美|US|United States/i);
  const krNodes = filterNodes4(nodes, /韩|KR|Korea/i);
  const allProxies = ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", "DIRECT", ...nodeNames].join(", ");
  const groups = [
    `\u{1F680} \u8282\u70B9\u9009\u62E9 = select, ${allProxies}`,
    `\u2611\uFE0F \u624B\u52A8\u5207\u6362 = select, ${nodeNames.join(", ")}`,
    `\u267B\uFE0F \u81EA\u52A8\u9009\u62E9 = url-test, ${nodeNames.join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, DIRECT`,
    `\u{1F6D1} \u5E7F\u544A\u62E6\u622A = select, REJECT, DIRECT`,
    `\u{1F30F} \u56FD\u5185\u5A92\u4F53 = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u{1F30D} \u56FD\u5916\u5A92\u4F53 = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, ${[...hkNodes, ...twNodes, ...usNodes].join(", ")}`,
    `\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891 = select, \u{1F30D} \u56FD\u5916\u5A92\u4F53`,
    `\u{1F3A5} \u5948\u98DE\u89C6\u9891 = select, \u{1F30D} \u56FD\u5916\u5A92\u4F53`,
    `\u{1F916} OpenAi = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9, ${[...usNodes, ...jpNodes].join(", ")}`,
    `\u{1F4F2} \u7535\u62A5\u6D88\u606F = select, \u{1F680} \u8282\u70B9\u9009\u62E9, \u267B\uFE0F \u81EA\u52A8\u9009\u62E9`,
    `\u{1F34E} \u82F9\u679C\u670D\u52A1 = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1 = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    `\u{1F3AF} \u5168\u7403\u76F4\u8FDE = select, DIRECT, \u{1F680} \u8282\u70B9\u9009\u62E9`,
    // Region-specific auto-test groups
    `\u{1F1ED}\u{1F1F0} \u9999\u6E2F\u8282\u70B9 = url-test, ${(hkNodes.length > 0 ? hkNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1F9}\u{1F1FC} \u53F0\u6E7E\u8282\u70B9 = url-test, ${(twNodes.length > 0 ? twNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1F8}\u{1F1EC} \u72EE\u57CE\u8282\u70B9 = url-test, ${(sgNodes.length > 0 ? sgNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8282\u70B9 = url-test, ${(jpNodes.length > 0 ? jpNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1FA}\u{1F1F2} \u7F8E\u56FD\u8282\u70B9 = url-test, ${(usNodes.length > 0 ? usNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`,
    `\u{1F1F0}\u{1F1F7} \u97E9\u56FD\u8282\u70B9 = url-test, ${(krNodes.length > 0 ? krNodes : nodeNames).join(", ")}, url = http://www.gstatic.com/generate_204, interval=300`
  ];
  return groups;
};

// functions/lib/loon-rules.ts
var loonRules = [
  "# > Advertising",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list,\u{1F6D1} \u5E7F\u544A\u62E6\u622A",
  "",
  "# > Microsoft",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list,\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1",
  "",
  "# > Apple",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list,\u{1F34E} \u82F9\u679C\u670D\u52A1",
  "",
  "# > Telegram",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list,\u{1F4F2} \u7535\u62A5\u6D88\u606F",
  "",
  "# > OpenAI",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list,\u{1F916} OpenAi",
  "",
  "# > Streaming Media",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list,\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list,\u{1F3A5} \u5948\u98DE\u89C6\u9891",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list,\u{1F30D} \u56FD\u5916\u5A92\u4F53",
  "",
  "# > China Media",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list,\u{1F30F} \u56FD\u5185\u5A92\u4F53",
  "",
  "# > GFW",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list,\u{1F680} \u8282\u70B9\u9009\u62E9",
  "",
  "# > China",
  "RULE-SET,https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list,\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "GEOIP,CN,\u{1F3AF} \u5168\u7403\u76F4\u8FDE",
  "",
  "# > Final",
  "FINAL,\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C"
];

// functions/lib/sing-box-outbounds.ts
var filterNodeTags = (nodes, keyword) => {
  const regex = typeof keyword === "string" ? new RegExp(keyword, "i") : keyword;
  return nodes.filter((node) => regex.test(node.name)).map((node) => node.name);
};
var getSingBoxOutbounds = (nodes) => {
  const nodeOutbounds = nodes.map((node) => {
    const baseOutbound = {
      tag: node.name,
      type: node.type,
      server: node.server,
      server_port: node.port
    };
    switch (node.type) {
      case "ss":
        baseOutbound.method = node.params?.method;
        baseOutbound.password = node.password;
        break;
      case "vmess":
        baseOutbound.uuid = node.password;
        baseOutbound.security = "auto";
        baseOutbound.alter_id = 0;
        break;
      case "vless":
        baseOutbound.uuid = node.password;
        baseOutbound.flow = node.params?.flow || "";
        break;
      case "trojan":
        baseOutbound.password = node.password;
        break;
    }
    if (node.params?.net === "ws") {
      baseOutbound.transport = {
        type: "ws",
        path: node.params.path || "/",
        headers: {
          Host: node.params.host || node.server
        }
      };
    }
    if (node.params?.tls === "tls" || node.params?.tls === true) {
      baseOutbound.tls = {
        enabled: true,
        server_name: node.params.host || node.server,
        insecure: node.params.allowInsecure === "true"
      };
    }
    return baseOutbound;
  });
  const nodeNames = nodes.map((n) => n.name);
  const hkNodes = filterNodeTags(nodes, /港|HK|Hong Kong/i);
  const twNodes = filterNodeTags(nodes, /台|TW|Taiwan/i);
  const sgNodes = filterNodeTags(nodes, /新|SG|Singapore/i);
  const jpNodes = filterNodeTags(nodes, /日|JP|Japan/i);
  const usNodes = filterNodeTags(nodes, /美|US|United States/i);
  const krNodes = filterNodeTags(nodes, /韩|KR|Korea/i);
  const groupOutbounds = [
    // --- Functional Groups ---
    { tag: "\u{1F680} \u8282\u70B9\u9009\u62E9", type: "select", outbounds: ["\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", "DIRECT", ...nodeNames] },
    { tag: "\u2611\uFE0F \u624B\u52A8\u5207\u6362", type: "select", outbounds: nodeNames },
    { tag: "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", type: "url-test", outbounds: nodeNames, url: "http://www.gstatic.com/generate_204", interval: "5m" },
    { tag: "\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C", type: "select", outbounds: ["BLOCK", "DIRECT"] },
    { tag: "\u{1F6D1} \u5E7F\u544A\u62E6\u622A", type: "select", outbounds: ["BLOCK", "DIRECT"] },
    { tag: "\u{1F30F} \u56FD\u5185\u5A92\u4F53", type: "select", outbounds: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"] },
    { tag: "\u{1F30D} \u56FD\u5916\u5A92\u4F53", type: "select", outbounds: ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", ...hkNodes, ...twNodes, ...usNodes] },
    { tag: "\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891", type: "select", outbounds: ["\u{1F30D} \u56FD\u5916\u5A92\u4F53"] },
    { tag: "\u{1F3A5} \u5948\u98DE\u89C6\u9891", type: "select", outbounds: ["\u{1F30D} \u56FD\u5916\u5A92\u4F53"] },
    { tag: "\u{1F916} OpenAi", type: "select", outbounds: ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9", ...usNodes, ...jpNodes] },
    { tag: "\u{1F4F2} \u7535\u62A5\u6D88\u606F", type: "select", outbounds: ["\u{1F680} \u8282\u70B9\u9009\u62E9", "\u267B\uFE0F \u81EA\u52A8\u9009\u62E9"] },
    { tag: "\u{1F34E} \u82F9\u679C\u670D\u52A1", type: "select", outbounds: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"] },
    { tag: "\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1", type: "select", outbounds: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"] },
    { tag: "\u{1F3AF} \u5168\u7403\u76F4\u8FDE", type: "select", outbounds: ["DIRECT", "\u{1F680} \u8282\u70B9\u9009\u62E9"] },
    // --- Region Groups ---
    { tag: "\u{1F1ED}\u{1F1F0} \u9999\u6E2F\u8282\u70B9", type: "url-test", outbounds: hkNodes.length > 0 ? hkNodes : nodeNames, url: "http://www.gstatic.com/generate_204", interval: "5m" },
    { tag: "\u{1F1F9}\u{1F1FC} \u53F0\u6E7E\u8282\u70B9", type: "url-test", outbounds: twNodes.length > 0 ? twNodes : nodeNames, url: "http://www.gstatic.com/generate_204", interval: "5m" },
    { tag: "\u{1F1F8}\u{1F1EC} \u72EE\u57CE\u8282\u70B9", type: "url-test", outbounds: sgNodes.length > 0 ? sgNodes : nodeNames, url: "http://www.gstatic.com/generate_204", interval: "5m" },
    { tag: "\u{1F1EF}\u{1F1F5} \u65E5\u672C\u8282\u70B9", type: "url-test", outbounds: jpNodes.length > 0 ? jpNodes : nodeNames, url: "http://www.gstatic.com/generate_204", interval: "5m" },
    { tag: "\u{1F1FA}\u{1F1F2} \u7F8E\u56FD\u8282\u70B9", type: "url-test", outbounds: usNodes.length > 0 ? usNodes : nodeNames, url: "http://www.gstatic.com/generate_204", interval: "5m" },
    { tag: "\u{1F1F0}\u{1F1F7} \u97E9\u56FD\u8282\u70B9", type: "url-test", outbounds: krNodes.length > 0 ? krNodes : nodeNames, url: "http://www.gstatic.com/generate_204", interval: "5m" },
    // --- Built-in Groups ---
    { tag: "DIRECT", type: "direct" },
    { tag: "BLOCK", type: "block" },
    { tag: "DNS-OUT", type: "dns" }
  ];
  return [...nodeOutbounds, ...groupOutbounds];
};

// functions/lib/sing-box-rules.ts
var getSingBoxRoute = () => {
  const ruleSets = [
    { tag: "ads", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list", download_detour: "DIRECT" },
    { tag: "microsoft", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list", download_detour: "DIRECT" },
    { tag: "apple", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list", download_detour: "DIRECT" },
    { tag: "telegram", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list", download_detour: "DIRECT" },
    { tag: "openai", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/OpenAi.list", download_detour: "DIRECT" },
    { tag: "youtube", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list", download_detour: "DIRECT" },
    { tag: "netflix", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list", download_detour: "DIRECT" },
    { tag: "proxy_media", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list", download_detour: "DIRECT" },
    { tag: "china_media", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaMedia.list", download_detour: "DIRECT" },
    { tag: "gfw", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list", download_detour: "DIRECT" },
    { tag: "direct", type: "remote", format: "text", url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list", download_detour: "DIRECT" },
    { tag: "geoip-cn", type: "remote", format: "binary", url: "https://raw.githubusercontent.com/SagerNet/sing-geoip/rule-set/geoip-cn.srs", download_detour: "DIRECT" }
  ];
  const rules = [
    { rule_set: "ads", outbound: "\u{1F6D1} \u5E7F\u544A\u62E6\u622A" },
    { rule_set: "microsoft", outbound: "\u24C2\uFE0F \u5FAE\u8F6F\u670D\u52A1" },
    { rule_set: "apple", outbound: "\u{1F34E} \u82F9\u679C\u670D\u52A1" },
    { rule_set: "telegram", outbound: "\u{1F4F2} \u7535\u62A5\u6D88\u606F" },
    { rule_set: "openai", outbound: "\u{1F916} OpenAi" },
    { rule_set: "youtube", outbound: "\u{1F4F9} \u6CB9\u7BA1\u89C6\u9891" },
    { rule_set: "netflix", outbound: "\u{1F3A5} \u5948\u98DE\u89C6\u9891" },
    { rule_set: "proxy_media", outbound: "\u{1F30D} \u56FD\u5916\u5A92\u4F53" },
    { rule_set: "china_media", outbound: "\u{1F30F} \u56FD\u5185\u5A92\u4F53" },
    { rule_set: "gfw", outbound: "\u{1F680} \u8282\u70B9\u9009\u62E9" },
    { rule_set: "direct", outbound: "\u{1F3AF} \u5168\u7403\u76F4\u8FDE" },
    { rule_set: "geoip-cn", outbound: "\u{1F3AF} \u5168\u7403\u76F4\u8FDE" },
    { network: "udp", port: 443, outbound: "BLOCK" },
    // QUIC
    { protocol: ["dns"], outbound: "DNS-OUT" }
  ];
  return {
    rule_set: ruleSets,
    rules,
    final: "\u{1F41F} \u6F0F\u7F51\u4E4B\u9C7C"
  };
};

// functions/lib/node-parser.ts
function base64Decode(str2) {
  try {
    const normalizedStr = str2.replace(/_/g, "/").replace(/-/g, "+");
    return atob(normalizedStr);
  } catch (e) {
    console.error("Failed to decode base64 string:", str2, e);
    return "";
  }
}
function parseNodeLink(link) {
  link = link.trim();
  if (link.startsWith("vmess://")) {
    try {
      const jsonStr = base64Decode(link.substring(8));
      const config = JSON.parse(jsonStr);
      return {
        name: config.ps || `${config.add}:${config.port}`,
        server: config.add,
        port: parseInt(config.port, 10),
        password: config.id,
        // a.k.a UUID
        type: "vmess",
        params: {
          net: config.net,
          tls: config.tls,
          aid: config.aid,
          host: config.host,
          path: config.path,
          type: config.type
          // header type for http
        }
      };
    } catch (e) {
      console.error("Failed to parse VMess link:", e);
      return null;
    }
  }
  if (link.startsWith("ss://")) {
    try {
      const atIndex = link.indexOf("@");
      const hashIndex = link.lastIndexOf("#");
      if (atIndex === -1 || hashIndex === -1) throw new Error("Invalid SS link format");
      const name = decodeURIComponent(link.substring(hashIndex + 1));
      const serverInfo = link.substring(atIndex + 1, hashIndex);
      const lastColonIndex = serverInfo.lastIndexOf(":");
      if (lastColonIndex === -1) throw new Error("Port not found in SS link");
      let server = serverInfo.substring(0, lastColonIndex);
      const port = parseInt(serverInfo.substring(lastColonIndex + 1), 10);
      if (server.startsWith("[") && server.endsWith("]")) {
        server = server.substring(1, server.length - 1);
      }
      const credentialsBase64 = link.substring(5, atIndex);
      const credentials = base64Decode(credentialsBase64);
      const [method, password] = credentials.split(":");
      return {
        name: name || `${server}:${port}`,
        server,
        port,
        password,
        type: "ss",
        params: { method }
      };
    } catch (e) {
      console.error("Failed to parse SS link:", e);
      return null;
    }
  }
  if (link.startsWith("ssr://")) {
    try {
      const decoded = base64Decode(link.substring(6));
      const mainParts = decoded.split("/?");
      const [server, port, protocol, method, obfs, passwordBase64] = mainParts[0].split(":");
      const password = base64Decode(passwordBase64);
      const params = {};
      if (mainParts[1]) {
        const searchParams = new URLSearchParams(mainParts[1]);
        searchParams.forEach((value, key) => {
          if (key === "remarks") {
            params[key] = base64Decode(value);
          } else {
            params[key] = value;
          }
        });
      }
      return {
        name: params.remarks || `${server}:${port}`,
        server,
        port: parseInt(port, 10),
        password,
        type: "ssr",
        params: {
          protocol,
          method,
          obfs,
          obfsparam: params.obfsparam ? base64Decode(params.obfsparam) : void 0,
          protoparam: params.protoparam ? base64Decode(params.protoparam) : void 0
        }
      };
    } catch (e) {
      console.error("Failed to parse SSR link:", e);
      return null;
    }
  }
  try {
    const url = new URL(link);
    const protocol = url.protocol.replace(":", "");
    const supportedUrlProtocols = ["vless", "trojan", "socks5", "tuic", "hysteria", "hysteria2"];
    if (supportedUrlProtocols.includes(protocol)) {
      const params = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      let nodeType = protocol;
      if (protocol === "vless" && params.security === "reality") {
        nodeType = "vless-reality";
      }
      return {
        name: url.hash ? decodeURIComponent(url.hash.substring(1)) : `${url.hostname}:${url.port}`,
        server: url.hostname,
        port: parseInt(url.port, 10),
        password: url.username ? decodeURIComponent(url.username) : void 0,
        type: nodeType,
        params
      };
    }
  } catch (e) {
  }
  console.warn(`Unsupported or malformed link: ${link}`);
  return null;
}

// functions/lib/subscription-generator.ts
function convertNodeToUri(node) {
  const encodedName = encodeURIComponent(node.name);
  try {
    switch (node.type) {
      case "vmess":
        const vmessConfig = {
          v: "2",
          ps: node.name,
          add: node.server,
          port: node.port,
          id: node.password,
          aid: node.params?.aid ?? "0",
          net: node.params?.net ?? "tcp",
          type: node.params?.type ?? "none",
          host: node.params?.host ?? "",
          path: node.params?.path ?? "",
          tls: node.params?.tls ?? ""
        };
        return `vmess://${btoa(JSON.stringify(vmessConfig))}`;
      case "vless":
      case "trojan":
        const url = new URL(`${node.type}://${node.password}@${node.server}:${node.port}`);
        url.hash = encodedName;
        if (node.params) {
          for (const key in node.params) {
            url.searchParams.set(key, node.params[key]);
          }
        }
        return url.toString();
      case "ss":
        const creds = `${node.params?.method}:${node.password}`;
        const encodedCreds = btoa(creds).replace(/=+$/, "");
        return `ss://${encodedCreds}@${node.server}:${node.port}#${encodedName}`;
      default:
        return "";
    }
  } catch (e) {
    console.error(`Failed to convert node to URI: ${node.name}`, e);
    return "";
  }
}
function generateBase64Subscription(nodes) {
  const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
  if (nodeLinks.length === 0) return new Response("", { status: 200 });
  const combinedContent = nodeLinks.join("\n");
  const base64Content = btoa(combinedContent);
  return new Response(base64Content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
function generateShadowrocketSubscription(nodes) {
  const nodeLinks = nodes.map(convertNodeToUri).filter(Boolean);
  if (nodeLinks.length === 0) return new Response("", { status: 200 });
  const content = nodeLinks.join("\n");
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosub_shadowrocket.txt"`
    }
  });
}
function generateClashSubscription(nodes) {
  const proxies = nodes.map((node) => {
    const proxy = {
      name: node.name,
      type: node.type,
      server: node.server,
      port: node.port,
      password: node.type !== "vmess" && node.type !== "vless" ? node.password : void 0,
      uuid: node.type === "vmess" || node.type === "vless" ? node.password : void 0,
      cipher: node.type === "ss" ? node.params?.method : void 0,
      tls: node.params?.tls === "tls" || node.params?.tls === true ? true : void 0,
      network: node.params?.net,
      "ws-opts": node.params?.net === "ws" ? { path: node.params?.path, headers: { Host: node.params?.host } } : void 0
    };
    Object.keys(proxy).forEach((key) => proxy[key] === void 0 && delete proxy[key]);
    return proxy;
  });
  const proxyGroups = getClashProxyGroups(nodes);
  const clashConfig = {
    "port": 7890,
    "socks-port": 7891,
    "allow-lan": false,
    "mode": "rule",
    "log-level": "info",
    "external-controller": "127.0.0.0.1:9090",
    "proxies": proxies,
    "proxy-groups": proxyGroups,
    "rule-providers": ruleProviders,
    "rules": clashRules
  };
  const yamlString = dump(clashConfig, { sortKeys: false });
  return new Response(yamlString, {
    headers: {
      "Content-Type": "text/yaml; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosub_clash_acl4ssr.yaml"`
    }
  });
}
function generateSurgeSubscription(nodes) {
  const proxyLines = nodes.map((node) => {
    const params = new URLSearchParams();
    if (node.password) {
      params.set("password", node.password);
    }
    if (node.type === "ss" && node.params?.method) {
      params.set("encrypt-method", node.params.method);
    }
    if (node.params?.tls === "tls" || node.params?.tls === true) {
      params.set("tls", "true");
    }
    if (node.params?.net === "ws") {
      params.set("ws", "true");
      if (node.params.host) {
        params.set("ws-headers", `Host:${node.params.host}`);
      }
    }
    const paramString = Array.from(params.entries()).map(([key, value]) => `${key}=${value}`).join(", ");
    let line = `${node.name} = ${node.type}, ${node.server}, ${node.port}`;
    if (paramString) {
      line += `, ${paramString}`;
    }
    return line;
  });
  const proxyGroups = getSurgeProxyGroups(nodes);
  const content = `
[Proxy]
${proxyLines.join("\n")}

[Proxy Group]
${proxyGroups.join("\n")}

[Rule]
${surgeRules.join("\n")}
    `.trim();
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosub_surge.conf"`
    }
  });
}
function generateQuantumultXSubscription(nodes) {
  const serverLines = nodes.map((node) => {
    let line = "";
    const remark = `remark=${node.name}`;
    const tag = `tag=${node.name}`;
    switch (node.type) {
      case "ss":
        line = `shadowsocks=${node.server}:${node.port}, method=${node.params?.method}, password=${node.password}, ${remark}`;
        break;
      case "vmess":
        const tls = node.params?.tls === "tls" || node.params?.tls === true ? ", obfs=wss" : "";
        line = `vmess=${node.server}:${node.port}, method=aes-128-gcm, password=${node.password}, obfs=ws, obfs-uri=${node.params?.path}, obfs-header="Host: ${node.params?.host}[Rr][Nn]User-Agent: okhttp/3.12.1"${tls}, ${remark}`;
        break;
      case "trojan":
        line = `trojan=${node.server}:${node.port}, password=${node.password}, ${remark}`;
        break;
    }
    return line ? `${line}, ${tag}` : "";
  }).filter(Boolean);
  const policies = getQuantumultXPolicies(nodes);
  const content = `
[server_local]
${serverLines.join("\n")}

[filter_remote]
${quantumultXRules.join("\n")}

[policy]
${policies.join("\n")}
    `.trim();
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosub_quantumultx.conf"`
    }
  });
}
function generateLoonSubscription(nodes) {
  const proxyLines = nodes.map((node) => {
    let line = `${node.name} = ${node.type}, ${node.server}, ${node.port}, password=${node.password}`;
    if (node.type === "ss") {
      line += `, method=${node.params?.method}`;
    }
    if (node.params?.tls === "tls" || node.params?.tls === true) {
      line += ", tls=true";
    }
    if (node.params?.net === "ws") {
      line += ", transport=ws";
      if (node.params.host) {
        line += `, ws-header=Host:${node.params.host}`;
      }
    }
    return line;
  });
  const proxyGroups = getLoonProxyGroups(nodes);
  const content = `
[Proxy]
${proxyLines.join("\n")}

[Proxy Group]
${proxyGroups.join("\n")}

[Rule]
${loonRules.join("\n")}
    `.trim();
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosub_loon.conf"`
    }
  });
}
function generateSingBoxSubscription(nodes) {
  const outbounds = getSingBoxOutbounds(nodes);
  const route = getSingBoxRoute();
  const singboxConfig = {
    log: { level: "info", timestamp: true },
    dns: {
      servers: [
        { address: "https://223.5.5.5/dns-query", detour: "DIRECT" },
        { address: "https://1.1.1.1/dns-query", detour: "\u{1F680} \u8282\u70B9\u9009\u62E9" }
      ],
      strategy: "ipv4_only"
    },
    inbounds: [
      { type: "tun", interface_name: "tun0", inet4_address: "172.19.0.1/30", mtu: 1500, auto_route: true, strict_route: true },
      { type: "mixed", listen: "0.0.0.0", listen_port: 7890 }
    ],
    outbounds,
    route
  };
  const jsonString = JSON.stringify(singboxConfig, null, 2);
  return new Response(jsonString, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="prosub_singbox.json"`
    }
  });
}
async function generateSubscriptionResponse(request, profile, env) {
  const allNodes = await fetchAllNodes(profile, env);
  let targetClient = new URL(request.url).searchParams.get("target")?.toLowerCase();
  if (!targetClient) {
    const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
    if (userAgent.includes("clash")) targetClient = "clash";
    else if (userAgent.includes("surge")) targetClient = "surge";
    else if (userAgent.includes("quantumult x")) targetClient = "quantumultx";
    else if (userAgent.includes("loon")) targetClient = "loon";
    else if (userAgent.includes("sing-box")) targetClient = "sing-box";
    else if (userAgent.includes("shadowrocket")) targetClient = "shadowrocket";
    else targetClient = "base64";
  }
  switch (targetClient) {
    case "clash":
    case "mihomo":
      return generateClashSubscription(allNodes);
    case "surge":
      return generateSurgeSubscription(allNodes);
    case "quantumultx":
      return generateQuantumultXSubscription(allNodes);
    case "loon":
      return generateLoonSubscription(allNodes);
    case "sing-box":
      return generateSingBoxSubscription(allNodes);
    case "shadowrocket":
      return generateShadowrocketSubscription(allNodes);
    default:
      return generateBase64Subscription(allNodes);
  }
}
async function fetchNodesFromSubscription(url) {
  try {
    const response = await fetch(url, { headers: { "User-Agent": "ProSub/1.0" } });
    if (!response.ok) return [];
    const content = await response.text();
    const decodedContent = atob(content);
    return decodedContent.split(/[\r\n]+/).filter(Boolean);
  } catch (error) {
    console.error(`Failed to fetch subscription from ${url}:`, error);
    return [];
  }
}
async function fetchAllNodes(profile, env) {
  const KV = env.KV;
  const nodeIds = profile.nodes || [];
  const subIds = profile.subscriptions || [];
  const nodesJson = await Promise.all(nodeIds.map((id) => KV.get(`node:${id}`)));
  const manualNodes = nodesJson.filter(Boolean).map((json2) => JSON.parse(json2));
  const subsJson = await Promise.all(subIds.map((id) => KV.get(`subscription:${id}`)));
  const subscriptions = subsJson.filter(Boolean).map((json2) => JSON.parse(json2));
  const subLinksPromises = subscriptions.map((sub) => fetchNodesFromSubscription(sub.url));
  const subLinksArrays = await Promise.all(subLinksPromises);
  const allSubLinks = subLinksArrays.flat();
  const parsedSubNodes = allSubLinks.map((link) => parseNodeLink(link)).filter(Boolean);
  return [...manualNodes, ...parsedSubNodes];
}

// functions/subscribe.ts
async function getProfile(KV, profileId) {
  const profileJson = await KV.get(`profile:${profileId}`);
  return profileJson ? JSON.parse(profileJson) : null;
}
async function recordTraffic(KV, profileId) {
  try {
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const key = `traffic:${profileId}:${timestamp2}`;
    await KV.put(key, JSON.stringify({ timestamp: timestamp2, profileId }));
  } catch (error) {
    console.error("Failed to record traffic:", error);
  }
}
async function handleSubscribe(request, env, profile_id) {
  try {
    const KV = env.KV;
    const profile = await getProfile(KV, profile_id);
    if (!profile) return new Response("Profile not found", { status: 404 });
    await recordTraffic(KV, profile_id);
    return await generateSubscriptionResponse(request, profile, env);
  } catch (error) {
    console.error(`Failed to generate subscription for profile ${profile_id}:`, error);
    return new Response("Failed to generate subscription", { status: 500 });
  }
}

// functions/subscription-statuses.ts
async function handleSubscriptionStatuses(request, env) {
  try {
    const KV = env.KV;
    const statusList = await KV.list({ prefix: "sub-status:" });
    const statuses = {};
    await Promise.all(
      statusList.keys.map(async ({ name }) => {
        const subId = name.replace("sub-status:", "");
        const statusJson = await KV.get(name);
        if (statusJson) {
          statuses[subId] = JSON.parse(statusJson);
        }
      })
    );
    return new Response(JSON.stringify(statuses), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to fetch subscription statuses:", error);
    return new Response(JSON.stringify({ error: "\u83B7\u53D6\u8BA2\u9605\u72B6\u6001\u5931\u8D25" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/subscriptions.ts
async function handleSubscriptionsGet(request, env) {
  try {
    const KV = env.KV;
    const subList = await KV.list({ prefix: "subscription:" });
    const subscriptions = await Promise.all(
      subList.keys.map(async ({ name }) => {
        const subJson = await KV.get(name);
        return subJson ? JSON.parse(subJson) : null;
      })
    );
    return new Response(JSON.stringify(subscriptions.filter(Boolean)), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleSubscriptionsPost(request, env) {
  try {
    const { name, url } = await request.json();
    const id = crypto.randomUUID();
    const newSubscription = { id, name, url };
    const KV = env.KV;
    await KV.put(`subscription:${id}`, JSON.stringify(newSubscription));
    return new Response(JSON.stringify(newSubscription), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return new Response(JSON.stringify({ error: "Failed to create subscription" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/subscriptions-id.ts
async function handleSubscriptionGet(request, env, id) {
  try {
    const KV = env.KV;
    const subJson = await KV.get(`subscription:${id}`);
    if (!subJson) {
      return new Response(JSON.stringify({ error: "Subscription not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(JSON.parse(subJson)), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to fetch subscription ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to fetch subscription" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleSubscriptionPut(request, env, id) {
  try {
    const { name, url } = await request.json();
    const updatedSubscription = { id, name, url };
    const KV = env.KV;
    await KV.put(`subscription:${id}`, JSON.stringify(updatedSubscription));
    return new Response(JSON.stringify(updatedSubscription), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to update subscription ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to update subscription" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleSubscriptionDelete(request, env, id) {
  try {
    const KV = env.KV;
    await KV.delete(`subscription:${id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete subscription ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to delete subscription" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/subscriptions-batch-import.ts
var isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};
async function handleSubscriptionsBatchImport(request, env) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { urls } = await request.json();
    if (!urls) {
      return new Response(JSON.stringify({ message: "\u8BF7\u6C42\u4F53\u4E2D\u9700\u8981\u63D0\u4F9B urls \u5B57\u7B26\u4E32" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const urlArray = urls.split(new RegExp("[\n]+")).filter(Boolean);
    if (urlArray.length === 0) {
      return new Response(JSON.stringify({ message: "\u672A\u63D0\u4F9B\u4EFB\u4F55\u94FE\u63A5" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const KV = env.KV;
    const subList = await KV.list({ prefix: "subscription:" });
    const existingSubsJson = await Promise.all(
      subList.keys.map(async ({ name }) => KV.get(name))
    );
    const existingSubs = existingSubsJson.filter(Boolean).map((json2) => JSON.parse(json2));
    const existingUrlSet = new Set(existingSubs.map((sub) => sub.url));
    let importedCount = 0;
    let skippedCount = 0;
    let invalidCount = 0;
    const putPromises = [];
    for (const url of urlArray) {
      if (!isValidUrl(url)) {
        invalidCount++;
        continue;
      }
      if (!existingUrlSet.has(url)) {
        const id = crypto.randomUUID();
        let name = `\u5BFC\u5165\u7684\u8BA2\u9605 ${importedCount + 1}`;
        try {
          const urlObject = new URL(url);
          if (urlObject.hostname) {
            name = urlObject.hostname;
          }
        } catch (e) {
        }
        const newSubscription = { id, name, url };
        putPromises.push(KV.put(`subscription:${id}`, JSON.stringify(newSubscription)));
        existingUrlSet.add(url);
        importedCount++;
      } else {
        skippedCount++;
      }
    }
    if (putPromises.length > 0) {
      await Promise.all(putPromises);
    }
    return new Response(JSON.stringify({
      message: `\u5BFC\u5165\u5B8C\u6210\uFF01\u6210\u529F\u5BFC\u5165 ${importedCount} \u4E2A\u65B0\u8BA2\u9605\uFF0C\u8DF3\u8FC7 ${skippedCount} \u4E2A\u91CD\u590D\u94FE\u63A5\u548C ${invalidCount} \u4E2A\u65E0\u6548\u94FE\u63A5\u3002`
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to batch import subscriptions:", error);
    return new Response(JSON.stringify({ error: "\u6279\u91CF\u5BFC\u5165\u8BA2\u9605\u65F6\u53D1\u751F\u9519\u8BEF" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/subscriptions-preview.ts
function base64Decode2(str2) {
  try {
    return atob(str2.replace(/_/g, "/").replace(/-/g, "+"));
  } catch (e) {
    return "";
  }
}
async function handleSubscriptionsPreview(request, env, id) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const KV = env.KV;
  try {
    const subJson = await KV.get(`subscription:${id}`);
    if (!subJson) {
      return new Response(JSON.stringify({ error: "\u8BA2\u9605\u4E0D\u5B58\u5728" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const subscription = JSON.parse(subJson);
    const response = await fetch(subscription.url, {
      headers: { "User-Agent": "ProSub/1.0" }
    });
    if (!response.ok) {
      throw new Error(`\u8BF7\u6C42\u8BA2\u9605\u94FE\u63A5\u5931\u8D25\uFF0C\u72B6\u6001\u7801: ${response.status}`);
    }
    const content = await response.text();
    const decodedContent = base64Decode2(content);
    const nodes = decodedContent.split(/[\r\n]+/).filter(Boolean);
    return new Response(JSON.stringify({ nodes }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to preview subscription ${id}:`, error);
    return new Response(JSON.stringify({ error: `\u9884\u89C8\u8BA2\u9605\u5931\u8D25: ${errorMessage}` }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/subscriptions-update.ts
function base64Decode3(str2) {
  try {
    return atob(str2.replace(/_/g, "/").replace(/-/g, "+"));
  } catch (e) {
    return "";
  }
}
async function handleSubscriptionsUpdate(request, env, id) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const KV = env.KV;
  try {
    const subJson = await KV.get(`subscription:${id}`);
    if (!subJson) {
      return new Response(JSON.stringify({ error: "\u8BA2\u9605\u4E0D\u5B58\u5728" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const subscription = JSON.parse(subJson);
    const response = await fetch(subscription.url, {
      headers: { "User-Agent": "ProSub/1.0" }
    });
    if (!response.ok) {
      throw new Error(`\u8BF7\u6C42\u8BA2\u9605\u94FE\u63A5\u5931\u8D25\uFF0C\u72B6\u6001\u7801: ${response.status}`);
    }
    const content = await response.text();
    const decodedContent = base64Decode3(content);
    const nodeCount = decodedContent.split(/\r?\n|\r/).filter(Boolean).length;
    const status = {
      status: "success",
      nodeCount,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    await KV.put(`sub-status:${id}`, JSON.stringify(status));
    return new Response(JSON.stringify(status), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const status = {
      status: "error",
      nodeCount: 0,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
    await KV.put(`sub-status:${id}`, JSON.stringify(status));
    console.error(`Failed to update subscription ${id}:`, error);
    return new Response(JSON.stringify(status), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/traffic.ts
async function handleTrafficGet(request, env) {
  const { searchParams } = new URL(request.url);
  const granularity = searchParams.get("granularity") || "day";
  const profileId = searchParams.get("profileId");
  try {
    const KV = env.KV;
    const trafficList = await KV.list({ prefix: "traffic:" });
    let trafficRecords = await Promise.all(
      trafficList.keys.map(async ({ name }) => {
        const recordJson = await KV.get(name);
        return recordJson ? JSON.parse(recordJson) : null;
      })
    );
    trafficRecords = trafficRecords.filter(Boolean);
    if (profileId) {
      trafficRecords = trafficRecords.filter((record) => record.profileId === profileId);
    }
    const aggregatedTraffic = {};
    trafficRecords.forEach((record) => {
      const date = new Date(record.timestamp);
      let key;
      switch (granularity) {
        case "week":
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          key = startOfWeek.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          break;
        case "day":
        default:
          key = date.toISOString().split("T")[0];
          break;
      }
      aggregatedTraffic[key] = (aggregatedTraffic[key] || 0) + 1;
    });
    const sortedTraffic = Object.keys(aggregatedTraffic).sort().map((date) => ({ date, count: aggregatedTraffic[date] }));
    return new Response(JSON.stringify(sortedTraffic), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to fetch traffic records:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch traffic records" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/users-id.ts
function arrayBufferToHex2(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
async function hashPassword2(password) {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = arrayBufferToHex2(saltBuffer.buffer);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
  const hashHex = arrayBufferToHex2(hashBuffer);
  return `${salt}:${hashHex}`;
}
async function handleUserGet(request, env, id) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const KV = env.KV;
    const userJson = await KV.get(`user:${id}`);
    if (!userJson) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const user = JSON.parse(userJson);
    delete user.password;
    return new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to fetch user" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleUserPut(request, env, id) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { name, password, profiles } = await request.json();
    const KV = env.KV;
    const userJson = await KV.get(`user:${id}`);
    if (!userJson) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const existingUser = JSON.parse(userJson);
    let hashedPassword = existingUser.password;
    let defaultPasswordChanged = existingUser.defaultPasswordChanged;
    if (password) {
      hashedPassword = await hashPassword2(password);
      if (existingUser.name === "admin" && existingUser.defaultPasswordChanged === false) {
        defaultPasswordChanged = true;
      }
    }
    const updatedUser = {
      ...existingUser,
      id,
      name: name || existingUser.name,
      password: hashedPassword,
      profiles: profiles || existingUser.profiles,
      defaultPasswordChanged
    };
    await KV.put(`user:${id}`, JSON.stringify(updatedUser));
    const { password: _, ...userWithoutPassword } = updatedUser;
    return new Response(JSON.stringify(userWithoutPassword), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to update user" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleUserDelete(request, env, id) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const KV = env.KV;
    await KV.delete(`user:${id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete user ${id}:`, error);
    return new Response(JSON.stringify({ error: "Failed to delete user" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/users.ts
function arrayBufferToHex3(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
async function hashPassword3(password) {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
  const salt = arrayBufferToHex3(saltBuffer.buffer);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
  const hashHex = arrayBufferToHex3(hashBuffer);
  return `${salt}:${hashHex}`;
}
async function comparePassword2(password, hash) {
  try {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + salt);
    const derivedKeyBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);
    const derivedKeyHex = arrayBufferToHex3(derivedKeyBuffer);
    return derivedKeyHex === key;
  } catch (e) {
    console.error("Password comparison failed", e);
    return false;
  }
}
async function handleUsersGet(request, env) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const KV = env.KV;
    const userList = await KV.list({ prefix: "user:" });
    const users = await Promise.all(
      userList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName);
        const user = userJson ? JSON.parse(userJson) : null;
        if (user) {
          delete user.password;
        }
        return user;
      })
    );
    return new Response(JSON.stringify(users.filter(Boolean)), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleUsersPost(request, env) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { name, password, profiles } = await request.json();
    if (!name || !password) {
      return new Response(JSON.stringify({ message: "\u7528\u6237\u540D\u548C\u5BC6\u7801\u662F\u5FC5\u586B\u9879" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const KV = env.KV;
    const existingUserList = await KV.list({ prefix: "user:" });
    const existingUsers = await Promise.all(
      existingUserList.keys.map(async ({ name: keyName }) => {
        const userJson = await KV.get(keyName);
        return userJson ? JSON.parse(userJson) : null;
      })
    );
    if (existingUsers.filter(Boolean).some((u) => u.name === name)) {
      return new Response(JSON.stringify({ message: "\u7528\u6237\u5DF2\u5B58\u5728" }), { status: 409, headers: { "Content-Type": "application/json" } });
    }
    const hashedPassword = await hashPassword3(password);
    const id = crypto.randomUUID();
    const newUser = { id, name, password: hashedPassword, profiles: profiles || [], defaultPasswordChanged: true };
    await KV.put(`user:${id}`, JSON.stringify(newUser));
    const { password: _, ...userWithoutPassword } = newUser;
    return new Response(JSON.stringify(userWithoutPassword), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to create user:", error);
    return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
async function handleUserChangePassword(request, env) {
  const authenticatedUser = await authenticateUser(request, env);
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ message: "\u672A\u6388\u6743" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const { oldPassword, newPassword } = await request.json();
    if (!oldPassword || !newPassword) {
      return new Response(JSON.stringify({ message: "\u65E7\u5BC6\u7801\u548C\u65B0\u5BC6\u7801\u662F\u5FC5\u586B\u9879" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const KV = env.KV;
    const userJson = await KV.get(`user:${authenticatedUser.id}`);
    if (!userJson) {
      return new Response(JSON.stringify({ message: "\u7528\u6237\u672A\u627E\u5230" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    const user = JSON.parse(userJson);
    const passwordMatch = await comparePassword2(oldPassword, user.password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: "\u65E7\u5BC6\u7801\u4E0D\u6B63\u786E" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const hashedPassword = await hashPassword3(newPassword);
    user.password = hashedPassword;
    user.defaultPasswordChanged = true;
    await KV.put(`user:${user.id}`, JSON.stringify(user));
    return new Response(JSON.stringify({ message: "\u5BC6\u7801\u4FEE\u6539\u6210\u529F" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Failed to change password:", error);
    return new Response(JSON.stringify({ error: "Failed to change password" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// functions/api-handler.ts
var api_handler_default = {
  async fetch(request, env, ctx) {
    console.log("env.KV:", env.KV);
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const getIdFromPath = (prefix) => {
      const parts = path.split("/");
      if (parts.length > 0 && parts[parts.length - 1] !== "") {
        return parts[parts.length - 1];
      }
      return null;
    };
    if (path.startsWith("/api/")) {
      if (path === "/api/auth/login" && method === "POST") {
        return handleLogin(request, env);
      } else if (path === "/api/auth/logout" && method === "POST") {
        return handleLogout(request, env);
      } else if (path === "/api/auth/me" && method === "GET") {
        return handleMe(request, env);
      } else if (path === "/api/nodes" && method === "GET") {
        return handleNodesGet(request, env);
      } else if (path === "/api/nodes" && method === "POST") {
        return handleNodesPost(request, env);
      } else if (path.startsWith("/api/nodes/") && method === "GET") {
        const id = getIdFromPath("/api/nodes/");
        if (id) return handleNodeGet(request, env, id);
      } else if (path.startsWith("/api/nodes/") && method === "PUT") {
        const id = getIdFromPath("/api/nodes/");
        if (id) return handleNodePut(request, env, id);
      } else if (path.startsWith("/api/nodes/") && method === "DELETE") {
        const id = getIdFromPath("/api/nodes/");
        if (id) return handleNodeDelete(request, env, id);
      } else if (path === "/api/nodes/batch-delete" && method === "POST") {
        return handleNodesBatchDelete(request, env);
      } else if (path === "/api/nodes/batch-import" && method === "POST") {
        return handleNodesBatchImport(request, env);
      } else if (path === "/api/node-health-check" && method === "POST") {
        return handleNodeHealthCheck(request, env);
      } else if (path === "/api/nodes/clear-all" && method === "POST") {
        return handleNodesClearAll(request, env);
      } else if (path === "/api/profiles" && method === "GET") {
        return handleProfilesGet(request, env);
      } else if (path === "/api/profiles" && method === "POST") {
        return handleProfilesPost(request, env);
      } else if (path.startsWith("/api/profiles/") && method === "GET") {
        const id = getIdFromPath("/api/profiles/");
        if (id) return handleProfileGet(request, env, id);
      } else if (path.startsWith("/api/profiles/") && method === "PUT") {
        const id = getIdFromPath("/api/profiles/");
        if (id) return handleProfilePut(request, env, id);
      } else if (path.startsWith("/api/profiles/") && method === "DELETE") {
        const id = getIdFromPath("/api/profiles/");
        if (id) return handleProfileDelete(request, env, id);
      } else if (path.startsWith("/api/subscribe/") && method === "GET") {
        const profile_id = getIdFromPath("/api/subscribe/");
        if (profile_id) return handleSubscribe(request, env, profile_id);
      } else if (path === "/api/subscription-statuses" && method === "GET") {
        return handleSubscriptionStatuses(request, env);
      } else if (path === "/api/node-statuses" && method === "GET") {
        return handleNodeStatuses(request, env);
      } else if (path === "/api/subscriptions" && method === "GET") {
        return handleSubscriptionsGet(request, env);
      } else if (path === "/api/subscriptions" && method === "POST") {
        return handleSubscriptionsPost(request, env);
      } else if (path.startsWith("/api/subscriptions/") && method === "GET") {
        const id = getIdFromPath("/api/subscriptions/");
        if (id) return handleSubscriptionGet(request, env, id);
      } else if (path.startsWith("/api/subscriptions/") && method === "PUT") {
        const id = getIdFromPath("/api/subscriptions/");
        if (id) return handleSubscriptionPut(request, env, id);
      } else if (path.startsWith("/api/subscriptions/") && method === "DELETE") {
        const id = getIdFromPath("/api/subscriptions/");
        if (id) return handleSubscriptionDelete(request, env, id);
      } else if (path === "/api/subscriptions/batch-import" && method === "POST") {
        return handleSubscriptionsBatchImport(request, env);
      } else if (path.startsWith("/api/subscriptions/preview/") && method === "GET") {
        const id = getIdFromPath("/api/subscriptions/preview/");
        if (id) return handleSubscriptionsPreview(request, env, id);
      } else if (path.startsWith("/api/subscriptions/update/") && method === "POST") {
        const id = getIdFromPath("/api/subscriptions/update/");
        if (id) return handleSubscriptionsUpdate(request, env, id);
      } else if (path === "/api/traffic" && method === "GET") {
        return handleTrafficGet(request, env);
      } else if (path === "/api/users" && method === "GET") {
        return handleUsersGet(request, env);
      } else if (path === "/api/users" && method === "POST") {
        return handleUsersPost(request, env);
      } else if (path.startsWith("/api/users/") && method === "GET") {
        const id = getIdFromPath("/api/users/");
        if (id) return handleUserGet(request, env, id);
      } else if (path.startsWith("/api/users/") && method === "PUT") {
        const id = getIdFromPath("/api/users/");
        if (id) return handleUserPut(request, env, id);
      } else if (path.startsWith("/api/users/") && method === "DELETE") {
        const id = getIdFromPath("/api/users/");
        if (id) return handleUserDelete(request, env, id);
      } else if (path === "/api/users/change-password" && method === "POST") {
        return handleUserChangePassword(request, env);
      }
    }
    if (path.startsWith("/sub/") && method === "GET") {
      const alias = getIdFromPath("/sub/");
      if (alias) {
        try {
          const KV = env.KV;
          const idRecord = await KV.get(`alias:${alias}`);
          if (!idRecord) {
            return new Response("Subscription alias not found", { status: 404 });
          }
          const { id: profileId } = JSON.parse(idRecord);
          const profileJson = await KV.get(`profile:${profileId}`);
          if (!profileJson) {
            return new Response("Profile data not found for the alias", { status: 404 });
          }
          const profile = JSON.parse(profileJson);
          try {
            const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
            const key = `traffic:${profileId}:${timestamp2}`;
            await KV.put(key, JSON.stringify({ timestamp: timestamp2, profileId, alias }));
          } catch (error) {
            console.error("Failed to record traffic:", error);
          }
          return await handleSubscribe(request, env, profileId);
        } catch (error) {
          console.error(`Failed to generate subscription for alias ${alias}:`, error);
          return new Response("Failed to generate subscription", { status: 500 });
        }
      }
    }
    return new Response("Not Found", { status: 404 });
  }
};
export {
  api_handler_default as default
};
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT *)
*/
