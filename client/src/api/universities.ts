import api from "./client";
import type { University } from "../types/api";

/**
 * The partner institutions.
 *
 * `uploadImage` is not re-exported here, the same as in api/people: logos go
 * through the one upload in api/happenings, and a second function doing the
 * identical POST to /media would be two places to change when that moves.
 */

export type UniversityInput = Partial<
  Omit<University, "_id" | "slug" | "createdAt" | "updatedAt">
>;

/**
 * The published wall, for the public page.
 *
 * `quiet` so the site-wide loading veil stays down. This is one list on one
 * page and the page has its own empty and loading states — raising the
 * curtain over the whole site for it would be the veil announcing something
 * the page is already saying. See context/LoadingContext.
 */
export const fetchUniversities = async (): Promise<University[]> =>
  (
    await api.get<{ universities: University[] }>("/universities", {
      quiet: true,
    })
  ).data.universities;

/** One institution's page. 404s on an unpublished record as well as a
    missing one — an unpublished partner is off the site, not hidden. */
export const fetchUniversity = async (slug: string): Promise<University> =>
  (await api.get<{ university: University }>(`/universities/${slug}`)).data
    .university;

/** Everything, published or not. Admin only. */
export const fetchAllUniversities = async (): Promise<University[]> =>
  (await api.get<{ universities: University[] }>("/universities/admin")).data
    .universities;

export const createUniversity = async (
  input: UniversityInput
): Promise<University> =>
  (await api.post<{ university: University }>("/universities", input)).data
    .university;

export const updateUniversity = async (
  id: string,
  input: UniversityInput
): Promise<University> =>
  (await api.patch<{ university: University }>(`/universities/${id}`, input))
    .data.university;

export const deleteUniversity = async (id: string): Promise<void> => {
  await api.delete(`/universities/${id}`);
};
