export const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'] as const;

export type Level = (typeof LEVELS)[number];

// Levels with published content; enabling a new one = adding data + one entry here
export const ENABLED_LEVELS = ['n5'] as const satisfies readonly Level[];

export type EnabledLevel = (typeof ENABLED_LEVELS)[number];

export const isEnabledLevel = (value: string): value is EnabledLevel =>
  (ENABLED_LEVELS as readonly string[]).includes(value);
