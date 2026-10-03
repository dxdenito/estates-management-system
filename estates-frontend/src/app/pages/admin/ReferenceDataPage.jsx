import { useSearchParams } from "react-router-dom";
import LocationsTab from "./reference/LocationsTab";
import NamedListTab from "./reference/NamedListTab";
import DomainsTab from "./reference/DomainsTab";

const NAME_FIELD = [{ key: "name", label: "Name", required: true }];

const COMPANY_FIELDS = [
  { key: "name", label: "Name", required: true },
  { key: "contract_ref", label: "Contract reference", required: false },
];

const TABS = [
  { key: "locations", label: "Locations" },
  { key: "categories", label: "Repair categories" },
  { key: "domains", label: "Email domains" },
  { key: "companies", label: "Contractor companies" },
];

export default function ReferenceDataPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.find((tab) => tab.key === searchParams.get("tab")) ?? TABS[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reference data</h1>
        <p className="mt-1 text-sm text-ink-muted">
          The lists the rest of the system is built on. Things that are in use can be deactivated but
          not deleted, so history stays intact.
        </p>
      </div>

      <div
        role="tablist"
        className="inline-flex flex-wrap gap-1 rounded-control border border-line bg-surface p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab.key === tab.key}
            onClick={() => setSearchParams(tab.key === "locations" ? {} : { tab: tab.key })}
            className={`rounded-control px-3 py-1.5 text-sm font-medium ${
              activeTab.key === tab.key
                ? "bg-primary-soft text-primary-strong"
                : "text-ink-muted hover:bg-surface-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab.key === "locations" && <LocationsTab />}

      {activeTab.key === "categories" && (
        <NamedListTab
          kind="categories"
          noun="category"
          fields={NAME_FIELD}
          intro="Repair categories are what the officer assigns at triage and what field supervisors are set up to cover."
        />
      )}

      {activeTab.key === "domains" && <DomainsTab />}

      {activeTab.key === "companies" && (
        <NamedListTab
          kind="companies"
          noun="company"
          fields={COMPANY_FIELDS}
          intro="Outsourced cleaning contractors. Contractor supervisors are attached to one of these companies."
        />
      )}
    </div>
  );
}