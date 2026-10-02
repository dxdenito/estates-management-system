const DAY_MS = 24 * 60 * 60 * 1000;

const ago = (days) => new Date(Date.now() - days * DAY_MS).toISOString();

export const buildSeedInspections = () => [
  {
    id: 1,
    staff_user_id: 3,
    location_id: 4,
    notes: "Routine weekly inspection of the reading hall and reference section.",
    inspected_at: ago(3),
    deficiencies: [
      {
        id: 1,
        description: "Dust has built up on the top shelves and window ledges.",
        status: "open",
        corrective_actions: [
          { id: 1, action_taken: "Dusted all shelves and wiped the window ledges.", status: "completed", resolved_at: ago(0.1), review_note: null },
        ],
      },
      {
        id: 2,
        description: "Bins near the entrance are overflowing.",
        status: "open",
        corrective_actions: [
          { id: 2, action_taken: "Extra bin collection scheduled for tomorrow morning.", status: "pending", resolved_at: null, review_note: null },
        ],
      },
      {
        id: 3,
        description: "The floor in the reference section was not mopped.",
        status: "resolved",
        corrective_actions: [
          { id: 3, action_taken: "Mopped and polished the floor.", status: "completed", resolved_at: ago(2), review_note: null },
        ],
      },
    ],
  },
  {
    id: 2,
    staff_user_id: 3,
    location_id: 9,
    notes: null,
    inspected_at: ago(2),
    deficiencies: [
      {
        id: 4,
        description: "Sinks are stained and the soap dispensers are empty.",
        status: "open",
        corrective_actions: [],
      },
    ],
  },
  {
    id: 3,
    staff_user_id: 3,
    location_id: 12,
    notes: "Early inspection before staff arrival.",
    inspected_at: ago(6),
    deficiencies: [
      {
        id: 5,
        description: "The washrooms were not cleaned before 9am.",
        status: "resolved",
        corrective_actions: [
          { id: 4, action_taken: "Washrooms cleaned. Shift start moved to 6am.", status: "completed", resolved_at: ago(5), review_note: null },
        ],
      },
    ],
  },
  {
    id: 4,
    staff_user_id: 8,
    location_id: 17,
    notes: "Hostel block walk-through.",
    inspected_at: ago(1),
    deficiencies: [
      {
        id: 6,
        description: "Corridor floors are sticky and unmopped.",
        status: "open",
        corrective_actions: [
          { id: 5, action_taken: "Mopped all corridors on every floor.", status: "completed", resolved_at: ago(0.2), review_note: null },
        ],
      },
      {
        id: 7,
        description: "Broken glass was swept but not disposed of near the bins.",
        status: "open",
        corrective_actions: [],
      },
    ],
  },
  {
    id: 5,
    staff_user_id: 8,
    location_id: 15,
    notes: null,
    inspected_at: ago(4),
    deficiencies: [
      {
        id: 8,
        description: "Litter along the main walkway.",
        status: "open",
        corrective_actions: [
          { id: 6, action_taken: "Litter pickers assigned for tomorrow.", status: "pending", resolved_at: null, review_note: null },
        ],
      },
    ],
  },
];