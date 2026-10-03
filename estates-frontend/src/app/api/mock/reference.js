import { ROLES, withAdmin } from "../../routing/roles";
import { INSTITUTIONAL_DOMAINS, categories, locations, supervisorCategories } from "./data";
import { cleaningAreas, contractorSupervisor } from "./cleaningData";
import { readRequests, requireRoles } from "./store";

const REFERENCE_KEY = "mock_reference";
const INSPECTIONS_KEY = "mock_inspections";
const REFERENCE_ROLES = withAdmin(ROLES.MANAGER);
const LOCATION_TYPES = ["compound", "building", "floor", "room", "road", "park"];
const DOMAIN_PATTERN = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

export const contractorCompanies = [
  { id: 1, name: "BrightClean Services Ltd", contract_ref: "EST/CLN/2025/014", active: true },
];

const replaceArray = (target, source) => target.splice(0, target.length, ...source);

export const persistReference = () =>
  localStorage.setItem(
    REFERENCE_KEY,
    JSON.stringify({
      locations,
      categories,
      domains: INSTITUTIONAL_DOMAINS,
      companies: contractorCompanies,
      contractorCompany: contractorSupervisor.company,
    })
  );

export const hydrateReference = () => {
  let stored = null;

  try {
    stored = JSON.parse(localStorage.getItem(REFERENCE_KEY));
  } catch {
    stored = null;
  }

  if (!stored) return;

  if (Array.isArray(stored.locations)) replaceArray(locations, stored.locations);
  if (Array.isArray(stored.categories)) replaceArray(categories, stored.categories);
  if (Array.isArray(stored.domains)) replaceArray(INSTITUTIONAL_DOMAINS, stored.domains);
  if (Array.isArray(stored.companies)) replaceArray(contractorCompanies, stored.companies);
  if (stored.contractorCompany) contractorSupervisor.company = stored.contractorCompany;
};

const readInspections = () => {
  try {
    return JSON.parse(localStorage.getItem(INSPECTIONS_KEY)) ?? [];
  } catch {
    return [];
  }
};

const countAssignments = (map, id) =>
  Object.values(map).filter((ids) => ids.includes(id)).length;

const withTotal = (usage) => ({
  ...usage,
  total: Object.values(usage).reduce((sum, value) => sum + value, 0),
});

const USAGE_LABELS = {
  requests: ["request", "requests"],
  inspections: ["inspection", "inspections"],
  assignments: ["assignment", "assignments"],
  children: ["sub-location", "sub-locations"],
  supervisors: ["contractor supervisor", "contractor supervisors"],
};

const describeUsage = (usage) =>
  Object.entries(USAGE_LABELS)
    .filter(([key]) => usage[key] > 0)
    .map(([key, [one, many]]) => `${usage[key]} ${usage[key] === 1 ? one : many}`)
    .join(", ");

const nextId = (items) => Math.max(0, ...items.map((item) => item.id)) + 1;

const fail = (status, detail) => ({ error: [status, { detail }] });

const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

const KINDS = {
  locations: {
    items: () => locations,
    usage: (location) =>
      withTotal({
        requests: readRequests().filter((r) => r.location_id === location.id).length,
        inspections: readInspections().filter((i) => i.location_id === location.id).length,
        assignments: countAssignments(cleaningAreas, location.id),
        children: locations.filter((l) => l.parent_id === location.id).length,
      }),
    view(location) {
      return {
        id: location.id,
        parent_id: location.parent_id,
        name: location.name,
        type: location.type,
        level: location.level,
        active: location.active !== false,
        usage: this.usage(location),
      };
    },
    validate(body, existing) {
      const name = String(body.name ?? "").trim();
      if (!name || name.length > 150) return fail(422, "Enter a name of up to 150 characters.");
      if (!LOCATION_TYPES.includes(body.type)) return fail(422, "Choose a valid type.");

      const parentId = existing ? existing.parent_id : (body.parent_id ?? null);
      const clash = locations.some(
        (l) => l.parent_id === parentId && l.id !== existing?.id && sameName(l.name, name)
      );
      if (clash) return fail(409, "A location with that name already exists here.");

      return { name, type: body.type, parentId };
    },
    create(body) {
      const checked = this.validate(body, null);
      if (checked.error) return checked;

      const parent =
        checked.parentId === null ? null : locations.find((l) => l.id === checked.parentId);

      if (checked.parentId !== null && !parent) return fail(422, "The parent location does not exist.");
      if (parent && parent.active === false) {
        return fail(422, "You cannot add inside a deactivated location.");
      }

      const item = {
        id: nextId(locations),
        parent_id: checked.parentId,
        name: checked.name,
        type: checked.type,
        level: parent ? parent.level + 1 : 0,
        active: true,
      };
      locations.push(item);
      return { item };
    },
    update(item, body) {
      const checked = this.validate(body, item);
      if (checked.error) return checked;

      item.name = checked.name;
      item.type = checked.type;
      return { item };
    },
  },

  categories: {
    items: () => categories,
    usage: (category) =>
      withTotal({
        requests: readRequests().filter((r) => r.category_id === category.id).length,
        assignments: countAssignments(supervisorCategories, category.id),
      }),
    view(category) {
      return {
        id: category.id,
        name: category.name,
        active: category.active !== false,
        usage: this.usage(category),
      };
    },
    validate(body, existing) {
      const name = String(body.name ?? "").trim();
      if (!name || name.length > 80) return fail(422, "Enter a name of up to 80 characters.");

      const clash = categories.some((c) => c.id !== existing?.id && sameName(c.name, name));
      if (clash) return fail(409, "A category with that name already exists.");

      return { name };
    },
    create(body) {
      const checked = this.validate(body, null);
      if (checked.error) return checked;

      const item = { id: nextId(categories), name: checked.name, active: true };
      categories.push(item);
      return { item };
    },
    update(item, body) {
      const checked = this.validate(body, item);
      if (checked.error) return checked;

      item.name = checked.name;
      return { item };
    },
  },

  companies: {
    items: () => contractorCompanies,
    usage: (company) =>
      withTotal({
        supervisors: contractorSupervisor.company === company.name ? 1 : 0,
      }),
    view(company) {
      return {
        id: company.id,
        name: company.name,
        contract_ref: company.contract_ref ?? null,
        active: company.active !== false,
        usage: this.usage(company),
      };
    },
    validate(body, existing) {
      const name = String(body.name ?? "").trim();
      const contractRef = String(body.contract_ref ?? "").trim();

      if (!name || name.length > 150) return fail(422, "Enter a name of up to 150 characters.");
      if (contractRef.length > 60) return fail(422, "The contract reference can be up to 60 characters.");

      const clash = contractorCompanies.some((c) => c.id !== existing?.id && sameName(c.name, name));
      if (clash) return fail(409, "A company with that name already exists.");

      return { name, contractRef: contractRef || null };
    },
    create(body) {
      const checked = this.validate(body, null);
      if (checked.error) return checked;

      const item = {
        id: nextId(contractorCompanies),
        name: checked.name,
        contract_ref: checked.contractRef,
        active: true,
      };
      contractorCompanies.push(item);
      return { item };
    },
    update(item, body) {
      const checked = this.validate(body, item);
      if (checked.error) return checked;

      if (contractorSupervisor.company === item.name) contractorSupervisor.company = checked.name;
      item.name = checked.name;
      item.contract_ref = checked.contractRef;
      return { item };
    },
  },
};

const ITEM_URL = /\/reference\/(locations|categories|companies)\/(\d+)$/;
const ACTION_URL = /\/reference\/(locations|categories|companies)\/(\d+)\/(activate|deactivate)$/;
const LIST_URL = /\/reference\/(locations|categories|companies)$/;

const locate = (config, pattern) => {
  const denied = requireRoles(REFERENCE_ROLES);
  if (denied) return { denied };

  const match = config.url.match(pattern);
  const kind = KINDS[match[1]];
  const item = match[2] ? kind.items().find((entry) => entry.id === Number(match[2])) : null;

  if (match[2] && !item) return { denied: [404, { detail: "Not found." }] };

  return { kind, item, action: match[3] };
};

export function registerReferenceMocks(mock) {
  mock.onGet(LIST_URL).reply((config) => {
    const ctx = locate(config, LIST_URL);
    if (ctx.denied) return ctx.denied;

    return [200, ctx.kind.items().map((item) => ctx.kind.view(item))];
  });

  mock.onPost(LIST_URL).reply((config) => {
    const ctx = locate(config, LIST_URL);
    if (ctx.denied) return ctx.denied;

    const result = ctx.kind.create(JSON.parse(config.data));
    if (result.error) return result.error;

    persistReference();
    return [201, ctx.kind.view(result.item)];
  });

  mock.onPatch(ITEM_URL).reply((config) => {
    const ctx = locate(config, ITEM_URL);
    if (ctx.denied) return ctx.denied;

    const result = ctx.kind.update(ctx.item, JSON.parse(config.data));
    if (result.error) return result.error;

    persistReference();
    return [200, ctx.kind.view(ctx.item)];
  });

  mock.onPost(ACTION_URL).reply((config) => {
    const ctx = locate(config, ACTION_URL);
    if (ctx.denied) return ctx.denied;

    const activate = ctx.action === "activate";
    const isActive = ctx.item.active !== false;

    if (activate === isActive) {
      return [409, { detail: isActive ? "Already active." : "Already deactivated." }];
    }

    ctx.item.active = activate;
    persistReference();

    return [200, ctx.kind.view(ctx.item)];
  });

  mock.onDelete(ITEM_URL).reply((config) => {
    const ctx = locate(config, ITEM_URL);
    if (ctx.denied) return ctx.denied;

    const usage = ctx.kind.usage(ctx.item);

    if (usage.total > 0) {
      return [409, { detail: `This is in use (${describeUsage(usage)}). Deactivate it instead.` }];
    }

    const items = ctx.kind.items();
    items.splice(items.indexOf(ctx.item), 1);
    persistReference();

    return [204];
  });

  mock.onGet("/reference/domains").reply(
    () => requireRoles(REFERENCE_ROLES) ?? [200, INSTITUTIONAL_DOMAINS.map((domain) => ({ domain }))]
  );

  mock.onPost("/reference/domains").reply((config) => {
    const denied = requireRoles(REFERENCE_ROLES);
    if (denied) return denied;

    const domain = String(JSON.parse(config.data).domain ?? "")
      .trim()
      .toLowerCase()
      .replace(/^@/, "");

    if (!DOMAIN_PATTERN.test(domain)) {
      return [422, { detail: "Enter a valid domain, such as example.ac.ke." }];
    }

    if (INSTITUTIONAL_DOMAINS.includes(domain)) {
      return [409, { detail: "That domain is already on the list." }];
    }

    INSTITUTIONAL_DOMAINS.push(domain);
    persistReference();

    return [201, { domain }];
  });

  mock.onDelete(/\/reference\/domains\/.+$/).reply((config) => {
    const denied = requireRoles(REFERENCE_ROLES);
    if (denied) return denied;

    const domain = decodeURIComponent(config.url.split("/").pop());
    const index = INSTITUTIONAL_DOMAINS.indexOf(domain);

    if (index === -1) return [404, { detail: "Domain not found." }];

    if (INSTITUTIONAL_DOMAINS.length === 1) {
      return [422, { detail: "At least one institutional domain is required." }];
    }

    INSTITUTIONAL_DOMAINS.splice(index, 1);
    persistReference();

    return [204];
  });
}