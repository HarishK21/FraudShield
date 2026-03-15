import { type DemoUser } from "@/lib/types";
import { demoUser } from "@/lib/demo-data";

const FIRST_NAMES = [
  "Alex",
  "Sam",
  "Jordan",
  "Taylor",
  "Casey",
  "Morgan",
  "Avery",
  "Quinn",
  "Riley",
  "Cameron"
];

const LAST_NAMES = [
  "Brooks",
  "Lee",
  "Patel",
  "Kim",
  "Nguyen",
  "Garcia",
  "Singh",
  "Rivera",
  "Wright",
  "Carter"
];

const DEFAULT_TEST_USER_COUNT = 50;
export const TEST_USER_COUNT = Number.parseInt(
  process.env.TEST_USER_COUNT ?? String(DEFAULT_TEST_USER_COUNT),
  10
);

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? "T"}${lastName[0] ?? "U"}`.toUpperCase();
}

export function buildSeededTestUsers(count = TEST_USER_COUNT): DemoUser[] {
  const safeCount = Math.max(1, Number.isFinite(count) ? count : DEFAULT_TEST_USER_COUNT);

  return Array.from({ length: safeCount }, (_, index) => {
    const ordinal = index + 1;
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
    const userIndex = String(ordinal).padStart(3, "0");

    return {
      id: `test-user-${userIndex}`,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      avatarInitials: initials(firstName, lastName),
      membershipSince: "2024-01-01T00:00:00.000Z",
      email: `test.user.${userIndex}@northmaple.test`,
      phone: `+1 (555) 01${String(ordinal).padStart(2, "0")}-1000`,
      address: `${ordinal} Test Lane\nToronto, ON M5V 2H1\nCanada`
    };
  });
}

export const seededTestUsers = buildSeededTestUsers();
export const availableBankUsers: DemoUser[] = [demoUser, ...seededTestUsers];

export function getBankUserById(userId: string) {
  return availableBankUsers.find((user) => user.id === userId) ?? null;
}

