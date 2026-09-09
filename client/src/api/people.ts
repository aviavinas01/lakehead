import api from "./client";
import type { Director, StaffMember } from "../types/api";

/**
 * The people behind the consultancy: one director's message and the team.
 *
 * One file because they are one admin screen; two collections on the server
 * because they are genuinely different records — see the models for why they
 * are not merged.
 *
 * `uploadImage` is not re-exported here. Photographs go through the same
 * upload as everything else in the admin (api/happenings), and a second
 * function doing the identical POST to /media would be two places to change
 * when the media route moves.
 */

export type DirectorInput = Pick<
  Director,
  "name" | "title" | "photo" | "lead" | "statement" | "published"
>;

export type StaffInput = Partial<
  Omit<StaffMember, "_id" | "createdAt" | "updatedAt">
>;

/**
 * The published message, or null when nobody has written one yet.
 *
 * Null is an ordinary answer rather than an error — see the note on
 * getPublishedDirector in the service. The page renders a placeholder.
 */
export const fetchDirector = async (): Promise<Director | null> =>
  (await api.get<{ director: Director | null }>("/people/director")).data.director;

/** The record as the admin sees it, published or not. */
export const fetchDirectorAdmin = async (): Promise<Director | null> =>
  (await api.get<{ director: Director | null }>("/people/director/admin")).data.director;

/** Creates the record the first time and updates it after — one call either
    way, because the server upserts. */
export const saveDirector = async (input: DirectorInput): Promise<Director> =>
  (await api.put<{ director: Director }>("/people/director", input)).data.director;

export const fetchStaff = async (): Promise<StaffMember[]> =>
  (await api.get<{ staff: StaffMember[] }>("/people/staff")).data.staff;

export const fetchAllStaff = async (): Promise<StaffMember[]> =>
  (await api.get<{ staff: StaffMember[] }>("/people/staff/admin")).data.staff;

export const createStaff = async (input: StaffInput): Promise<StaffMember> =>
  (await api.post<{ member: StaffMember }>("/people/staff", input)).data.member;

export const updateStaff = async (
  id: string,
  input: StaffInput
): Promise<StaffMember> =>
  (await api.patch<{ member: StaffMember }>(`/people/staff/${id}`, input)).data.member;

export const deleteStaff = async (id: string): Promise<void> => {
  await api.delete(`/people/staff/${id}`);
};
