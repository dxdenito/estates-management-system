const DAY_MS = 24 * 60 * 60 * 1000;

const SAMPLES = [
  { name: "Grace Wanjiru", pf_number: "10234", email: "grace.wanjiru@uni.ac.ke", phone_extension: "2214", location_id: 4, description: "Several ceiling lights in the reading hall flicker and two tubes are completely dead.", age_days: 3.2 },
  { name: "Peter Otieno", pf_number: "10877", email: "peter.otieno@uni.ac.ke", phone_extension: "2350", location_id: 9, description: "The tap in Lab 1 leaks continuously and the floor around the sink is always wet.", age_days: 2.4 },
  { name: "Mercy Achieng", pf_number: "11002", email: "mercy.achieng@uni.ac.ke", phone_extension: "2101", location_id: 17, description: "Window pane cracked near the main stairwell and the glass is loose.", age_days: 1.3 },
  { name: "John Kamau", pf_number: "10455", email: "john.kamau@uni.ac.ke", phone_extension: "2088", location_id: 14, description: "Deep potholes forming near the gate are damaging vehicles entering the campus.", age_days: 0.6 },
  { name: "Lucy Njeri", pf_number: "11239", email: "lucy.njeri@uni.ac.ke", phone_extension: "2467", location_id: 12, description: "The records room door lock jams and will not open with the key.", age_days: 0.2 },
  { name: "Samuel Mutua", pf_number: "10990", email: "samuel.mutua@uni.ac.ke", phone_extension: "2199", location_id: 15, description: "A section of the perimeter fence has fallen over beside the walkway.", age_days: 5.1 },
  { name: "Ann Chebet", pf_number: "10611", email: "ann.chebet@uni.ac.ke", phone_extension: "2320", location_id: 6, description: "The roof leaks into the corridor whenever it rains.", age_days: 4, category_id: 6, triaged_days_ago: 3 },
  { name: "Daniel Kiprop", pf_number: "11350", email: "daniel.kiprop@uni.ac.ke", phone_extension: "2401", location_id: 5, description: "Sockets along the reference desks have no power.", age_days: 2.6, category_id: 1, triaged_days_ago: 2 },
  { name: "Esther Mwangi", pf_number: "10788", email: "esther.mwangi@uni.ac.ke", phone_extension: "2266", location_id: 10, description: "The sink in Lab 2 drains very slowly and smells.", age_days: 1.8, category_id: 2, triaged_days_ago: 1 },
  { name: "Brian Ouma", pf_number: "11120", email: "brian.ouma@uni.ac.ke", phone_extension: "2150", location_id: 13, description: "Paint is peeling off the walls of the first-floor corridor.", age_days: 3.5, category_id: 5, triaged_days_ago: 2.5 },
  {
    name: "Rose Atieno", pf_number: "10345", email: "rose.atieno@uni.ac.ke", phone_extension: "2077", location_id: 3,
    description: "Two study desks have broken legs and wobble badly.",
    age_days: 4, category_id: 4, triaged_days_ago: 3.5, status: "assigned_to_supervisor", supervisor_id: 2, updated_days_ago: 0.5,
  },
  {
    name: "Kevin Barasa", pf_number: "11077", email: "kevin.barasa@uni.ac.ke", phone_extension: "2288", location_id: 18,
    description: "The main water pipe in Block B is corroded and leaking at the joint.",
    age_days: 6, category_id: 2, triaged_days_ago: 5.5, status: "awaiting_materials", supervisor_id: 2, updated_days_ago: 1.5,
    assessment: { materials_available: false, work_required: "Replace 3 m of 50 mm galvanised pipe and two elbow joints. Materials needed: pipe, elbows, sealant tape.", notes: "The shut-off valve is in the plant room.", days_ago: 1.5 },
    requisition: { status: "pending_approval", procurement_ref: null, days_ago: 1.5 },
  },
  {
    name: "Irene Wafula", pf_number: "10902", email: "irene.wafula@uni.ac.ke", phone_extension: "2135", location_id: 11,
    description: "Plaster is falling off the outside wall near the main entrance.",
    age_days: 5, category_id: 3, triaged_days_ago: 4.5, status: "assessed", supervisor_id: 2, updated_days_ago: 0.8,
    assessment: { materials_available: true, work_required: "Chip off loose plaster, re-plaster 4 square metres and repaint.", notes: null, days_ago: 0.8 },
  },
  {
    name: "Tom Njoroge", pf_number: "10566", email: "tom.njoroge@uni.ac.ke", phone_extension: "2390", location_id: 8,
    description: "The corridor lights on the first floor of the Science Complex are out.",
    age_days: 7, category_id: 1, triaged_days_ago: 6.5, status: "in_progress", supervisor_id: 2, updated_days_ago: 3,
    assessment: { materials_available: true, work_required: "Replace failed ballasts and six fluorescent tubes.", notes: null, days_ago: 5 },
    assignment: { artisan_id: 5, artisan_name: "Arthur Artisan", days_ago: 3 },
  },
  {
    name: "Hellen Cherono", pf_number: "11188", email: "hellen.cherono@uni.ac.ke", phone_extension: "2422", location_id: 4,
    description: "The emergency exit sign in the reading hall is not lit.",
    age_days: 9, category_id: 1, triaged_days_ago: 8.5, status: "completed", supervisor_id: 2, updated_days_ago: 0.3,
    assessment: { materials_available: true, work_required: "Replace the exit sign battery pack and lamp.", notes: null, days_ago: 7 },
    assignment: { artisan_id: 5, artisan_name: "Arthur Artisan", days_ago: 6 },
    completion_reports: [
      { description: "Replaced the lamp.", materials_used: "1 x LED lamp", days_ago: 4, review: { outcome: "rejected", suggested_fixes: "The battery pack is still dead. Replace it and test the three-hour backup.", days_ago: 3 } },
      { description: "Replaced the battery pack and ran the backup test for three hours.", materials_used: "1 x battery pack", days_ago: 0.3, review: null },
    ],
  },
  {
    name: "Peter Waweru", pf_number: "11400", email: "peter.waweru@uni.ac.ke", phone_extension: "2500", location_id: 16,
    description: "Roof sheets are loose on Block A after the wind and rain is getting in.",
    age_days: 2, category_id: 6, triaged_days_ago: 1.5, status: "assigned_to_supervisor", supervisor_id: 8, updated_days_ago: 0.4,
  },
    {
    name: "Norah Wekesa", pf_number: "11455", email: "norah.wekesa@uni.ac.ke", phone_extension: "2510", location_id: 13,
    description: "The concrete steps at the Administration Block entrance are cracked and crumbling.",
    age_days: 8, category_id: 3, triaged_days_ago: 7.5, status: "approved", supervisor_id: 2, updated_days_ago: 1,
    assessment: { materials_available: false, work_required: "Break out and recast three steps. Materials needed: cement, sand, ballast, reinforcement mesh.", notes: null, days_ago: 4 },
    requisition: { status: "approved", procurement_ref: null, days_ago: 4 },
  },
  {
    name: "Victor Langat", pf_number: "10933", email: "victor.langat@uni.ac.ke", phone_extension: "2233", location_id: 12,
    description: "The water heater in the staff kitchenette has stopped working.",
    age_days: 10, category_id: 2, triaged_days_ago: 9.5, status: "approved", supervisor_id: 2, updated_days_ago: 2,
    assessment: { materials_available: false, work_required: "Replace the heater element and thermostat. Materials needed: element, thermostat.", notes: null, days_ago: 6 },
    requisition: { status: "submitted", procurement_ref: "PR-2026-0412", days_ago: 6 },
  },
  {
    name: "Joyce Nekesa", pf_number: "11290", email: "joyce.nekesa@uni.ac.ke", phone_extension: "2544", location_id: 17,
    description: "The distribution board in Block A trips repeatedly.",
    age_days: 11, category_id: 1, triaged_days_ago: 10.5, status: "materials_issued", supervisor_id: 2, updated_days_ago: 0.6,
    assessment: { materials_available: false, work_required: "Replace the main breaker and two circuit breakers. Materials needed: 1 x 63A breaker, 2 x 20A breakers.", notes: null, days_ago: 8 },
    requisition: { status: "issued", procurement_ref: "PR-2026-0398", days_ago: 8 },
  },
  {
    name: "Alice Muthoni", pf_number: "10412", email: "alice.muthoni@uni.ac.ke", phone_extension: "2019", location_id: 3,
    description: "The lock on the first-floor library storeroom door is broken.",
    age_days: 12, category_id: 8, triaged_days_ago: 11.5, status: "closed", supervisor_id: 8, updated_days_ago: 1, closed_days_ago: 1,
    assessment: { materials_available: true, work_required: "Replace the mortice lock and cut two keys.", notes: null, days_ago: 10 },
    assignment: { artisan_id: 10, artisan_name: "Beatrice Banda", days_ago: 9 },
    completion_reports: [
      { description: "Fitted a new mortice lock and cut two keys.", materials_used: "1 x mortice lock", days_ago: 2, review: { outcome: "approved", suggested_fixes: null, days_ago: 1 } },
    ],
  },
    {
    name: "Gideon Sang", pf_number: "10744", email: "gideon.sang@uni.ac.ke", phone_extension: "2601", location_id: 18,
    description: "Two toilets on the Block B ground floor are blocked and overflowing.",
    age_days: 4, category_id: 2, triaged_days_ago: 3.5, status: "assigned_to_artisan", supervisor_id: 2, updated_days_ago: 0.2,
    assessment: { materials_available: true, work_required: "Clear the blocked drains in both toilets and check the soil pipe connection.", notes: "Bring drain rods. The water shut-off is inside the caretaker's room.", days_ago: 1 },
    assignment: { artisan_id: 5, artisan_name: "Arthur Artisan", days_ago: 0.2 },
  },
  {
    name: "Mildred Anyango", pf_number: "11033", email: "mildred.anyango@uni.ac.ke", phone_extension: "2688", location_id: 8,
    description: "The ceiling in the first-floor lab has a water stain and is sagging.",
    age_days: 9, category_id: 6, triaged_days_ago: 8.5, status: "in_progress", supervisor_id: 8, updated_days_ago: 0.4,
    assessment: { materials_available: true, work_required: "Replace the stained ceiling board and seal the roof leak above it.", notes: null, days_ago: 6 },
    assignment: { artisan_id: 5, artisan_name: "Arthur Artisan", days_ago: 5 },
    completion_reports: [
      { description: "Replaced the ceiling board.", materials_used: "1 x ceiling board, 4 screws", days_ago: 1.5, review: { outcome: "rejected", suggested_fixes: "The roof above is still leaking. Seal it before closing the ceiling.", days_ago: 0.4 } },
    ],
  },
  {
    name: "Paul Kibet", pf_number: "10655", email: "paul.kibet@uni.ac.ke", phone_extension: "2012", location_id: 12,
    description: "The light switch in the records room is broken.",
    age_days: 10, category_id: 1, triaged_days_ago: 9.5, status: "closed", supervisor_id: 2, updated_days_ago: 3, closed_days_ago: 3,
    assessment: { materials_available: true, work_required: "Replace the light switch and test the circuit.", notes: null, days_ago: 8 },
    assignment: { artisan_id: 5, artisan_name: "Arthur Artisan", days_ago: 7 },
    completion_reports: [
      { description: "Replaced the switch and tested the circuit.", materials_used: "1 x light switch", days_ago: 4, review: { outcome: "approved", suggested_fixes: null, days_ago: 3 } },
    ],
  },
];

const ago = (days) => new Date(Date.now() - days * DAY_MS).toISOString();

export const buildSeedRequests = () =>
  SAMPLES.map((sample, index) => {
    const {
      age_days,
      triaged_days_ago,
      updated_days_ago,
      category_id,
      status,
      supervisor_id,
      assessment,
      requisition,
      assignment,
      completion_reports,
      closed_days_ago,
      
      ...fields
    } = sample;

    const id = index + 1;
    const triaged = category_id != null;

    return {
      id,
      tracking_number: `REQ-${String(id).padStart(5, "0")}`,
      confirm_token: crypto.randomUUID(),
      status: status ?? (triaged ? "received" : "confirmed"),
      created_at: ago(age_days + 0.01),
      confirmed_at: ago(age_days),
      category_id: category_id ?? null,
      supervisor_id: supervisor_id ?? null,
      triaged_at: triaged ? ago(triaged_days_ago) : null,
      updated_at: ago(updated_days_ago ?? triaged_days_ago ?? age_days),
      closed_at: closed_days_ago != null ? ago(closed_days_ago) : null,
      assessment: assessment
        ? {
            materials_available: assessment.materials_available,
            work_required: assessment.work_required,
            notes: assessment.notes,
            created_at: ago(assessment.days_ago),
          }
        : null,
      requisition: requisition
        ? {
            status: requisition.status,
            procurement_ref: requisition.procurement_ref,
            created_at: ago(requisition.days_ago),
          }
        : null,
      assignment: assignment
        ? {
            artisan_id: assignment.artisan_id,
            artisan_name: assignment.artisan_name,
            assigned_at: ago(assignment.days_ago),
          }
        : null,
      completion_reports: (completion_reports ?? []).map((report, reportIndex) => ({
        id: reportIndex + 1,
        description: report.description,
        materials_used: report.materials_used,
        completed_at: ago(report.days_ago),
        review: report.review
          ? {
              outcome: report.review.outcome,
              suggested_fixes: report.review.suggested_fixes,
              reviewed_at: ago(report.review.days_ago),
            }
          : null,
      })),
      ...fields,
    };
  });