"use client";

import { useMemo, useState } from "react";

import { bulkGrantTeacherCredentialsAction } from "@/lib/actions";
import { ADMIN_GRANTABLE_CREDENTIAL_GROUPS } from "@/lib/admin-credential-catalog";

export type AdminBulkTeacherRow = {
  id: string;
  slug: string;
  fullName: string;
  city: string;
};

type AdminTeacherBulkCredentialsProps = {
  teachers: AdminBulkTeacherRow[];
};

export function AdminTeacherBulkCredentials({ teachers }: AdminTeacherBulkCredentialsProps) {
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<string>>(() => new Set());
  const [selectedCredentials, setSelectedCredentials] = useState<Set<string>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);

  const allTeacherIds = useMemo(() => teachers.map((t) => t.id), [teachers]);
  const allSelected = teachers.length > 0 && selectedTeacherIds.size === teachers.length;

  function toggleTeacher(id: string) {
    setSelectedTeacherIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleCredential(label: string) {
    setSelectedCredentials((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  function selectAllTeachers() {
    setSelectedTeacherIds(new Set(allTeacherIds));
  }

  function clearTeachers() {
    setSelectedTeacherIds(new Set());
  }

  const canSubmit = selectedTeacherIds.size > 0 && selectedCredentials.size > 0 && !submitting;

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-900">Bulk assign credentials</h2>
      <p className="mt-2 text-sm text-stone-500">
        Select teachers and credentials to grant verified badges on public profiles without requiring file uploads.
      </p>

      <form
        className="mt-6 space-y-6"
        action={async (formData) => {
          setSubmitting(true);
          try {
            await bulkGrantTeacherCredentialsAction(formData);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <BulkGrantHiddenInputs selectedCredentials={selectedCredentials} selectedTeacherIds={selectedTeacherIds} />

        <BulkCredentialPicker onToggle={toggleCredential} selectedCredentials={selectedCredentials} />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-700">Review note (optional)</span>
          <textarea className="min-h-20 w-full" name="reviewNote" placeholder="Internal note for this bulk grant…" />
        </label>

        <div>
          <BulkTeacherToolbar
            allSelected={allSelected}
            onClear={clearTeachers}
            onSelectAll={selectAllTeachers}
            selectedCount={selectedTeacherIds.size}
            totalCount={teachers.length}
          />
          <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-stone-200">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="w-12 px-4 py-3" scope="col">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3" scope="col">
                    Teacher
                  </th>
                  <th className="px-4 py-3" scope="col">
                    City
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {teachers.map((teacher) => {
                  const checked = selectedTeacherIds.has(teacher.id);
                  return (
                    <tr className={checked ? "bg-emerald-50/40" : undefined} key={teacher.id}>
                      <td className="px-4 py-3">
                        <input
                          aria-label={`Select ${teacher.fullName}`}
                          checked={checked}
                          className="h-4 w-4 rounded border-stone-300"
                          onChange={() => toggleTeacher(teacher.id)}
                          type="checkbox"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-900">{teacher.fullName}</td>
                      <td className="px-4 py-3 text-stone-600">{teacher.city}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <button
          className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-300"
          disabled={!canSubmit}
          type="submit"
        >
          {submitting ? "Granting…" : "Grant selected credentials"}
        </button>
      </form>
    </section>
  );
}

function BulkGrantHiddenInputs({
  selectedTeacherIds,
  selectedCredentials
}: {
  selectedTeacherIds: Set<string>;
  selectedCredentials: Set<string>;
}) {
  return (
    <>
      {[...selectedTeacherIds].map((id) => (
        <input key={`teacher-${id}`} name="teacherIds" type="hidden" value={id} />
      ))}
      {[...selectedCredentials].map((label) => (
        <input key={`cred-${label}`} name="credentialLabels" type="hidden" value={label} />
      ))}
    </>
  );
}

function BulkCredentialPicker({
  selectedCredentials,
  onToggle
}: {
  selectedCredentials: Set<string>;
  onToggle: (label: string) => void;
}) {
  return (
    <fieldset className="space-y-5">
      <legend className="text-sm font-medium text-stone-700">Credentials to grant</legend>
      {ADMIN_GRANTABLE_CREDENTIAL_GROUPS.map((group) => (
        <div key={group.category}>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{group.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.credentials.map((entry) => {
              const checked = selectedCredentials.has(entry.label);
              return (
                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                    checked ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-stone-200 bg-white text-stone-700"
                  }`}
                  key={entry.id}
                >
                  <input
                    checked={checked}
                    className="sr-only"
                    onChange={() => onToggle(entry.label)}
                    type="checkbox"
                  />
                  {entry.label}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

function BulkTeacherToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onClear
}: {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-stone-600">
        {selectedCount} of {totalCount} teachers selected
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700"
          onClick={onSelectAll}
          type="button"
        >
          {allSelected ? "All selected" : "Select all"}
        </button>
        <button
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700"
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
