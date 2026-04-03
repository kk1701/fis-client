import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getAdminPublishedReportsApi,
  updatePublishedReportApi,
  deletePublishedReportApi,
} from "../../api/published-reports.api";

const REPORT_TYPE_LABELS: Record<string, string> = {
  RESEARCH_DOMAINS: "Research Domain Profiling",
  PUBLICATION_TRENDS: "Publication Trends",
  DEPARTMENT_HEALTH: "Department Health Score",
  RESEARCH_MOMENTUM: "Faculty Research Momentum",
  QUALIFICATION_DISTRIBUTION: "Qualification Distribution",
  EXPERIENCE_PROFILE: "Experience Profile",
  COURSE_LOAD: "Course Load Analysis",
  SUPERVISION_PIPELINE: "Supervision Pipeline",
};

const REPORT_TYPE_ICONS: Record<string, string> = {
  RESEARCH_DOMAINS: "🔬",
  PUBLICATION_TRENDS: "📈",
  DEPARTMENT_HEALTH: "🏛️",
  RESEARCH_MOMENTUM: "⚡",
  QUALIFICATION_DISTRIBUTION: "🎓",
  EXPERIENCE_PROFILE: "💼",
  COURSE_LOAD: "📚",
  SUPERVISION_PIPELINE: "🧑‍🏫",
};

interface PublishedReport {
  id: number;
  title: string;
  description?: string;
  reportType: string;
  isPublic: boolean;
  publishedAt: string;
  updatedAt: string;
  publishedBy: { id: number; email: string };
}

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

// ── Edit Modal ────────────────────────────────────────────

function EditModal({
  report,
  onClose,
  onSaved,
}: {
  report: PublishedReport;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: report.title,
      description: report.description ?? "",
    },
  });

  const onSubmit = async (data: EditForm) => {
    try {
      setServerError("");
      await updatePublishedReportApi(report.id, data);
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1500);
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to update");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Edit Report
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Update title and description
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 text-center">
            ✓ Report updated successfully
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                {...register("title")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="text-gray-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────

export default function PublishedReportsPage() {
  const [reports, setReports] = useState<PublishedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<PublishedReport | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReports = async () => {
    const res = await getAdminPublishedReportsApi();
    setReports(res.data);
  };

  useEffect(() => {
    fetchReports().finally(() => setLoading(false));
  }, []);

  const handleToggleVisibility = async (report: PublishedReport) => {
    try {
      setTogglingId(report.id);
      await updatePublishedReportApi(report.id, { isPublic: !report.isPublic });
      await fetchReports();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this report from the public page?")) return;
    try {
      setDeletingId(id);
      await deletePublishedReportApi(id);
      await fetchReports();
    } finally {
      setDeletingId(null);
    }
  };

  const publicCount = reports.filter((r) => r.isPublic).length;

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Published Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {publicCount} of {reports.length} reports visible to public
          </p>
        </div>
        <a
          href="/reports"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline font-medium"
        >
          View public page →
        </a>
      </div>

      {/* empty state */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 text-sm">No reports published yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Go to Analytics and click "Publish" on any report.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 transition ${
                r.isPublic ? "border-green-400" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* icon */}
                  <div className="text-2xl shrink-0 mt-0.5">
                    {REPORT_TYPE_ICONS[r.reportType] ?? "📄"}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {r.title}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          r.isPublic
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.isPublic ? "🌐 Public" : "🔒 Hidden"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-1">
                      {REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}
                    </p>

                    {r.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-1">
                        {r.description}
                      </p>
                    )}

                    <p className="text-xs text-gray-300">
                      Published{" "}
                      {new Date(r.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* toggle visibility */}
                  <button
                    onClick={() => handleToggleVisibility(r)}
                    disabled={togglingId === r.id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                      r.isPublic
                        ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {togglingId === r.id
                      ? "..."
                      : r.isPublic
                        ? "Hide"
                        : "Make Public"}
                  </button>

                  {/* edit */}
                  <button
                    onClick={() => setEditingReport(r)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  {/* delete */}
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    {deletingId === r.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* edit modal */}
      {editingReport && (
        <EditModal
          report={editingReport}
          onClose={() => setEditingReport(null)}
          onSaved={fetchReports}
        />
      )}
    </div>
  );
}
