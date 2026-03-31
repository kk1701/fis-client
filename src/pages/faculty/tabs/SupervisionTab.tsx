import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SubTabs from "../../../components/SubTabs";
import {
  getOwnThesesApi,
  addThesisApi,
  updateThesisApi,
  deleteThesisApi,
  getOwnDissertationsApi,
  addDissertationApi,
  updateDissertationApi,
  deleteDissertationApi,
} from "../../../api/thesis.api";

const SUB_TABS = [
  { key: "THESIS", label: "Thesis Supervisions" },
  { key: "DISSERTATION", label: "Dissertation Supervisions" },
];

const THESIS_STATUS = ["Ongoing", "Completed", "Submitted", "Awarded"];
const ROLES = ["Supervisor", "Co-Supervisor", "External Examiner"];

const thesisSchema = z.object({
  title: z.string().min(1, "Title is required"),
  researchArea: z.string().min(1, "Research area is required"),
  year: z
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  status: z.string().min(1, "Status is required"),
  role: z.string().min(1, "Role is required"),
});

const dissertationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  specialization: z.string().min(1, "Specialization is required"),
  year: z
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  role: z.string().min(1, "Role is required"),
});

type ThesisForm = z.infer<typeof thesisSchema>;
type DissertationForm = z.infer<typeof dissertationSchema>;

interface Thesis {
  id: number;
  title: string;
  researchArea: string;
  year: number;
  status: string;
  role: string;
}

interface Dissertation {
  id: number;
  title: string;
  specialization: string;
  year: number;
  role: string;
}

// reusable record card
function RecordCard({
  title,
  subtitle,
  year,
  badges,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  year: number;
  badges: { label: string; color?: string }[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        <div className="flex gap-2 flex-wrap mt-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {year}
          </span>
          {badges.map((b, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                b.color === "green"
                  ? "bg-green-50 text-green-700"
                  : b.color === "orange"
                    ? "bg-orange-50 text-orange-700"
                    : b.color === "blue"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-600"
              }`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        <button
          onClick={onEdit}
          className="text-xs text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function SupervisionTab() {
  const [activeSubTab, setActiveSubTab] = useState("THESIS");
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [dissertations, setDissertations] = useState<Dissertation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const thesisForm = useForm<ThesisForm>({
    resolver: zodResolver(thesisSchema),
  });
  const dissertationForm = useForm<DissertationForm>({
    resolver: zodResolver(dissertationSchema),
  });

  const activeForm = activeSubTab === "THESIS" ? thesisForm : dissertationForm;

  const fetchAll = async () => {
    const [thesisRes, dissertationRes] = await Promise.all([
      getOwnThesesApi(),
      getOwnDissertationsApi(),
    ]);
    setTheses(thesisRes.data);
    setDissertations(dissertationRes.data);
  };

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    activeForm.reset({});
    setShowForm(true);
  };

  const openEditThesis = (t: Thesis) => {
    setEditingId(t.id);
    thesisForm.reset({
      title: t.title,
      researchArea: t.researchArea,
      year: t.year,
      status: t.status,
      role: t.role,
    });
    setShowForm(true);
  };

  const openEditDissertation = (d: Dissertation) => {
    setEditingId(d.id);
    dissertationForm.reset({
      title: d.title,
      specialization: d.specialization,
      year: d.year,
      role: d.role,
    });
    setShowForm(true);
  };

  const onSubmitThesis = async (data: ThesisForm) => {
    try {
      setSaving(true);
      setServerError("");
      if (editingId) {
        await updateThesisApi(editingId, data);
      } else {
        await addThesisApi(data);
      }
      await fetchAll();
      setShowForm(false);
      thesisForm.reset({});
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onSubmitDissertation = async (data: DissertationForm) => {
    try {
      setSaving(true);
      setServerError("");
      if (editingId) {
        await updateDissertationApi(editingId, data);
      } else {
        await addDissertationApi(data);
      }
      await fetchAll();
      setShowForm(false);
      dissertationForm.reset({});
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteThesis = async (id: number) => {
    if (!confirm("Delete this thesis record?")) return;
    await deleteThesisApi(id);
    await fetchAll();
  };

  const handleDeleteDissertation = async (id: number) => {
    if (!confirm("Delete this dissertation record?")) return;
    await deleteDissertationApi(id);
    await fetchAll();
  };

  const statusColor = (status: string) => {
    if (status === "Completed" || status === "Awarded") return "green";
    if (status === "Ongoing") return "orange";
    return "blue";
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">
        Loading...
      </div>
    );

  return (
    <div className="space-y-4">
      {/* header + subtabs */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Thesis & Dissertation Supervisions
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Record PhD thesis and PG dissertation supervisions
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Record
          </button>
        </div>
        <SubTabs
          tabs={SUB_TABS}
          activeTab={activeSubTab}
          onChange={(key) => {
            setActiveSubTab(key);
            setShowForm(false);
            setEditingId(null);
          }}
        />
      </div>

      {/* thesis form */}
      {showForm && activeSubTab === "THESIS" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingId ? "Edit Thesis Record" : "Add Thesis Supervision"}
          </h3>
          <form
            onSubmit={thesisForm.handleSubmit(onSubmitThesis)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thesis Title
                </label>
                <input
                  {...thesisForm.register("title")}
                  placeholder="Full title of the thesis"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {thesisForm.formState.errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {thesisForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Research Area
                </label>
                <input
                  {...thesisForm.register("researchArea")}
                  placeholder="e.g. Machine Learning, VLSI"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {thesisForm.formState.errors.researchArea && (
                  <p className="text-red-500 text-xs mt-1">
                    {thesisForm.formState.errors.researchArea.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  {...thesisForm.register("year", { valueAsNumber: true })}
                  placeholder="e.g. 2023"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {thesisForm.formState.errors.year && (
                  <p className="text-red-500 text-xs mt-1">
                    {thesisForm.formState.errors.year.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...thesisForm.register("status")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select status</option>
                  {THESIS_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {thesisForm.formState.errors.status && (
                  <p className="text-red-500 text-xs mt-1">
                    {thesisForm.formState.errors.status.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Role
                </label>
                <select
                  {...thesisForm.register("role")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {thesisForm.formState.errors.role && (
                  <p className="text-red-500 text-xs mt-1">
                    {thesisForm.formState.errors.role.message}
                  </p>
                )}
              </div>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  thesisForm.reset({});
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* dissertation form */}
      {showForm && activeSubTab === "DISSERTATION" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingId
              ? "Edit Dissertation Record"
              : "Add Dissertation Supervision"}
          </h3>
          <form
            onSubmit={dissertationForm.handleSubmit(onSubmitDissertation)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dissertation Title
                </label>
                <input
                  {...dissertationForm.register("title")}
                  placeholder="Full title of the dissertation"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {dissertationForm.formState.errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {dissertationForm.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  {...dissertationForm.register("specialization")}
                  placeholder="e.g. Data Science, Power Systems"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {dissertationForm.formState.errors.specialization && (
                  <p className="text-red-500 text-xs mt-1">
                    {dissertationForm.formState.errors.specialization.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  {...dissertationForm.register("year", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g. 2023"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {dissertationForm.formState.errors.year && (
                  <p className="text-red-500 text-xs mt-1">
                    {dissertationForm.formState.errors.year.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Role
                </label>
                <select
                  {...dissertationForm.register("role")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {dissertationForm.formState.errors.role && (
                  <p className="text-red-500 text-xs mt-1">
                    {dissertationForm.formState.errors.role.message}
                  </p>
                )}
              </div>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  dissertationForm.reset({});
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* thesis list */}
      {activeSubTab === "THESIS" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {theses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No thesis supervision records yet.
            </p>
          ) : (
            <div className="space-y-3">
              {theses.map((t) => (
                <RecordCard
                  key={t.id}
                  title={t.title}
                  subtitle={t.researchArea}
                  year={t.year}
                  badges={[
                    { label: t.role, color: "blue" },
                    { label: t.status, color: statusColor(t.status) },
                  ]}
                  onEdit={() => openEditThesis(t)}
                  onDelete={() => handleDeleteThesis(t.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* dissertation list */}
      {activeSubTab === "DISSERTATION" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {dissertations.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No dissertation supervision records yet.
            </p>
          ) : (
            <div className="space-y-3">
              {dissertations.map((d) => (
                <RecordCard
                  key={d.id}
                  title={d.title}
                  subtitle={d.specialization}
                  year={d.year}
                  badges={[{ label: d.role, color: "blue" }]}
                  onEdit={() => openEditDissertation(d)}
                  onDelete={() => handleDeleteDissertation(d.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
