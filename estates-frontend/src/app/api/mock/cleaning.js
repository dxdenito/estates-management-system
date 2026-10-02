import { ROLES, withAdmin } from "../../routing/roles";
import { demoUsers, locations } from "./data";
import { cleaningAreas, contractorSupervisor } from "./cleaningData";
import { buildSeedInspections } from "./cleaningSeed";
import { currentUser, locationPath, requireRoles } from "./store";

const INSPECTIONS_KEY = "mock_inspections";
const DAY_MS = 24 * 60 * 60 * 1000;
const CLEANING_ROLES = withAdmin(ROLES.CLEANING_SUPERVISOR);

const readInspections = () => {
  try {
    return JSON.parse(localStorage.getItem(INSPECTIONS_KEY)) ?? [];
  } catch {
    return [];
  }
};

const writeInspections = (inspections) =>
  localStorage.setItem(INSPECTIONS_KEY, JSON.stringify(inspections));

const isAdmin = (user) => user.roles.includes(ROLES.SUPER_ADMIN);

const areaIdsFor = (user) => cleaningAreas[user.id] ?? [];

const isWithin = (locationId, areaIds) => {
  let node = locations.find((n) => n.id === locationId);

  while (node) {
    if (areaIds.includes(node.id)) return true;
    node = locations.find((n) => n.id === node.parent_id);
  }

  return false;
};

const canSee = (inspection, user) =>
  isAdmin(user) || isWithin(inspection.location_id, areaIdsFor(user));

const lastAction = (deficiency) =>
  deficiency.corrective_actions[deficiency.corrective_actions.length - 1] ?? null;

const needsVerification = (deficiency) =>
  deficiency.status === "open" && lastAction(deficiency)?.status === "completed";

const userName = (id) => demoUsers.find((user) => user.id === id)?.name ?? null;

export const cleaningCounts = (user) => {
  if (!user) {
    return { cleaning_open_deficiencies: 0, cleaning_to_verify: 0, cleaning_inspections_week: 0 };
  }

  const visible = readInspections().filter((inspection) => canSee(inspection, user));
  const deficiencies = visible.flatMap((inspection) => inspection.deficiencies);
  const weekAgo = Date.now() - 7 * DAY_MS;

  return {
    cleaning_open_deficiencies: deficiencies.filter((d) => d.status === "open").length,
    cleaning_to_verify: deficiencies.filter(needsVerification).length,
    cleaning_inspections_week: visible.filter(
      (inspection) => new Date(inspection.inspected_at).getTime() >= weekAgo
    ).length,
  };
};

const toDeficiencyItem = (inspection, deficiency) => ({
  id: deficiency.id,
  inspection_id: inspection.id,
  description: deficiency.description,
  status: deficiency.status,
  location_path: locationPath(inspection.location_id),
  inspected_at: inspection.inspected_at,
  corrective_actions: deficiency.corrective_actions,
});

const toInspectionItem = (inspection) => ({
  id: inspection.id,
  location_path: locationPath(inspection.location_id),
  inspected_at: inspection.inspected_at,
  inspector_name: userName(inspection.staff_user_id),
  deficiency_count: inspection.deficiencies.length,
  open_count: inspection.deficiencies.filter((d) => d.status === "open").length,
});

const toInspectionDetail = (inspection) => ({
  id: inspection.id,
  location_path: locationPath(inspection.location_id),
  inspected_at: inspection.inspected_at,
  inspector_name: userName(inspection.staff_user_id),
  notes: inspection.notes,
  contractor: contractorSupervisor,
  deficiencies: inspection.deficiencies.map((deficiency) => ({
    id: deficiency.id,
    description: deficiency.description,
    status: deficiency.status,
    corrective_actions: deficiency.corrective_actions,
  })),
});

const findDeficiency = (config) => {
  const denied = requireRoles(CLEANING_ROLES);
  if (denied) return { denied };

  const user = currentUser();
  const id = Number(config.url.split("/").slice(-2)[0]);
  const inspections = readInspections();

  for (const inspection of inspections) {
    const deficiency = inspection.deficiencies.find((d) => d.id === id);
    if (deficiency && canSee(inspection, user)) {
      return { user, inspections, inspection, deficiency };
    }
  }

  return { denied: [404, { detail: "Deficiency not found." }] };
};

export function registerCleaningMocks(mock) {
  if (readInspections().length === 0) {
    writeInspections(buildSeedInspections());
  }

  mock.onGet("/cleaning/areas").reply(() => {
    const denied = requireRoles(CLEANING_ROLES);
    if (denied) return denied;

    const user = currentUser();
    const ids = isAdmin(user)
      ? locations.filter((l) => l.parent_id === null).map((l) => l.id)
      : areaIdsFor(user);

    const areas = ids
      .map((id) => locations.find((l) => l.id === id))
      .filter(Boolean)
      .map(({ id, name }) => ({ id, name }));

    return [200, areas];
  });

  mock.onGet("/cleaning/deficiencies").reply((config) => {
    const denied = requireRoles(CLEANING_ROLES);
    if (denied) return denied;

    const user = currentUser();
    const scope = config.params?.scope === "open" ? "open" : "verify";

    const items = readInspections()
      .filter((inspection) => canSee(inspection, user))
      .flatMap((inspection) =>
        inspection.deficiencies
          .filter((d) =>
            scope === "verify" ? needsVerification(d) : d.status === "open" && !needsVerification(d)
          )
          .map((d) => toDeficiencyItem(inspection, d))
      )
      .sort((a, b) => new Date(a.inspected_at) - new Date(b.inspected_at));

    return [200, items];
  });

  mock.onGet("/cleaning/inspections").reply(() => {
    const denied = requireRoles(CLEANING_ROLES);
    if (denied) return denied;

    const user = currentUser();

    const items = readInspections()
      .filter((inspection) => canSee(inspection, user))
      .map(toInspectionItem)
      .sort((a, b) => new Date(b.inspected_at) - new Date(a.inspected_at));

    return [200, items];
  });

  mock.onGet(/\/cleaning\/inspections\/\d+$/).reply((config) => {
    const denied = requireRoles(CLEANING_ROLES);
    if (denied) return denied;

    const user = currentUser();
    const id = Number(config.url.split("/").pop());
    const inspection = readInspections().find((i) => i.id === id);

    return inspection && canSee(inspection, user)
      ? [200, toInspectionDetail(inspection)]
      : [404, { detail: "Inspection not found." }];
  });

  mock.onPost("/cleaning/inspections").reply((config) => {
    const denied = requireRoles(CLEANING_ROLES);
    if (denied) return denied;

    const user = currentUser();
    const { location_id, notes, deficiencies } = JSON.parse(config.data);

    if (!locations.some((l) => l.id === location_id)) {
      return [422, { detail: "Choose where you inspected." }];
    }

    if (!isAdmin(user) && !isWithin(location_id, areaIdsFor(user))) {
      return [422, { detail: "That location is outside the areas you oversee." }];
    }

    const inspections = readInspections();
    const nextDeficiencyId =
      Math.max(0, ...inspections.flatMap((i) => i.deficiencies.map((d) => d.id))) + 1;

    const descriptions = (deficiencies ?? [])
      .map((text) => String(text).trim())
      .filter(Boolean);

    const inspection = {
      id: Math.max(0, ...inspections.map((i) => i.id)) + 1,
      staff_user_id: user.id,
      location_id,
      notes: notes?.trim() || null,
      inspected_at: new Date().toISOString(),
      deficiencies: descriptions.map((description, index) => ({
        id: nextDeficiencyId + index,
        description,
        status: "open",
        corrective_actions: [],
      })),
    };

    writeInspections([...inspections, inspection]);

    return [201, toInspectionDetail(inspection)];
  });

  mock.onPost(/\/cleaning\/deficiencies\/\d+\/verify$/).reply((config) => {
    const ctx = findDeficiency(config);
    if (ctx.denied) return ctx.denied;

    if (!needsVerification(ctx.deficiency)) {
      return [409, { detail: "This deficiency has no completed corrective action to verify." }];
    }

    ctx.deficiency.status = "resolved";
    ctx.deficiency.closed_at = new Date().toISOString();
    ctx.deficiency.verified_by_id = ctx.user.id;
    writeInspections(ctx.inspections);

    return [200, toInspectionDetail(ctx.inspection)];
  });

  mock.onPost(/\/cleaning\/deficiencies\/\d+\/reject$/).reply((config) => {
    const ctx = findDeficiency(config);
    if (ctx.denied) return ctx.denied;

    const { note } = JSON.parse(config.data);

    if (!note || !note.trim()) {
      return [422, { detail: "Say what is still wrong." }];
    }

    if (!needsVerification(ctx.deficiency)) {
      return [409, { detail: "This deficiency has no completed corrective action to send back." }];
    }

    const action = lastAction(ctx.deficiency);
    action.status = "pending";
    action.resolved_at = null;
    action.review_note = note.trim();
    writeInspections(ctx.inspections);

    return [200, toInspectionDetail(ctx.inspection)];
  });
}