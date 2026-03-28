import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SubTabs from "../../../components/SubTabs";
import {
  getOwnPublicationsApi,
  addPublicationApi,
  updatePublicationApi,
  deletePublicationApi,
} from "../../../api/publications.api";
import type { Publication } from "../../../types";

const SUB_TABS = [
  { key: "JOURNAL", label: "Journal" },
  { key: "CONFERENCE", label: "Conference" },
  { key: "BOOK", label: "Book" },
  { key: "BOOK_CHAPTER", label: "Book Chapter" },
];

const schema = z.object({
  type: z.enum(["JOURNAL", "CONFERENCE", "BOOK", "BOOK_CHAPTER"]),
  title: z.string().min(1, "Title is required"),
  authors: z.string().min(1, "At least one author is required"),
  venue: z.string().optional(),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  doi: z.string().optional(),
  url: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  citation: z.string().optional(),
  indexing: z.enum(["SCI", "SCOPUS", "NONE"]).optional(),
});

type PublicationForm = z.infer<typeof schema>;

type GroupedPublications = {
  JOURNAL: Publication[];
  CONFERENCE: Publication[];
  BOOK: Publication[];
  BOOK_CHAPTER: Publication[];
};

export default function PublicationsTab() {
  const [activeSubTab, setActiveSubTab] = useState("JOURNAL");
  const [grouped, setGrouped] = useState<GroupedPublications>({
    JOURNAL: [],
    CONFERENCE: [],
    BOOK: [],
    BOOK_CHAPTER: [],
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PublicationForm>({ resolver: zodResolver(schema) });

  const fetchPublications = async () => {
    const res = await getOwnPublicationsApi();
    setGrouped(res.data);
  };

  useEffect(() => {
    fetchPublications().finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    reset({
      type: activeSubTab as any,
      year: new Date().getFullYear(),
      indexing: "NONE",
    });
    setShowForm(true);
  };

  const openEdit = (p: Publication) => {
    setEditingId(p.id);
    reset({
      type: p.category,
      title: p.title,
      authors: p.authors.join(", "),
      venue: p.venue ?? "",
      year: p.year,
      doi: p.doi ?? "",
      url: p.url ?? "",
      pages: p.pages ?? "",
      publisher: p.publisher ?? "",
      citation: p.citation ?? "",
      indexing: p.indexing ?? "NONE",
    });
    setShowForm(true);
  };

  const onSubmit = async (data: PublicationForm) => {
    try {
      setSaving(true);
      setServerError("");

      const payload = {
        ...data,
        // convert comma separated string to array
        authors: data.authors
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await updatePublicationApi(editingId, payload);
      } else {
        await addPublicationApi(payload);
      }

      await fetchPublications();
      setShowForm(false);
      reset({});
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this publication?")) return;
    await deletePublicationApi(id);
    await fetchPublications();
  };

  const currentList = grouped[activeSubTab as keyof GroupedPublications];

  // show venue/doi/indexing only for journal and conference
  const isArticle = activeSubTab === "JOURNAL" || activeSubTab === "CONFERENCE";
  // show publisher for book and book chapter
  const isBook = activeSubTab === "BOOK" || activeSubTab === "BOOK_CHAPTER";

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">
        Loading...
      </div>
    );

  return (
    <div className="space-y-4">
      {/* header + sub tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Publications
          </h2>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Publication
          </button>
        </div>
        <SubTabs
          tabs={SUB_TABS}
          activeTab={activeSubTab}
          onChange={(key) => {
            setActiveSubTab(key);
            setShowForm(false);
            reset({});
          }}
        />
      </div>

      {/* add/edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingId
              ? "Edit Publication"
              : `Add ${activeSubTab.replace("_", " ")} Publication`}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("type")} value={activeSubTab} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* title */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  {...register("title")}
                  placeholder="Publication title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* authors */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authors
                  <span className="text-gray-400 font-normal ml-1">
                    (comma separated)
                  </span>
                </label>
                <input
                  {...register("authors")}
                  placeholder="e.g. Dr. John Doe, Dr. Jane Smith"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.authors && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.authors.message}
                  </p>
                )}
              </div>

              {/* venue — journal/conference only */}
              {isArticle && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activeSubTab === "JOURNAL"
                      ? "Journal Name"
                      : "Conference Name"}
                  </label>
                  <input
                    {...register("venue")}
                    placeholder={
                      activeSubTab === "JOURNAL"
                        ? "e.g. IEEE Transactions on..."
                        : "e.g. ICML 2024"
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* publisher — book only */}
              {isBook && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher
                  </label>
                  <input
                    {...register("publisher")}
                    placeholder="e.g. Springer, Wiley"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  {...register("year")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.year.message}
                  </p>
                )}
              </div>

              {/* pages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pages
                </label>
                <input
                  {...register("pages")}
                  placeholder="e.g. 123-135"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* doi — journal/conference only */}
              {isArticle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DOI
                  </label>
                  <input
                    {...register("doi")}
                    placeholder="e.g. 10.1109/..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* indexing — journal/conference only */}
              {isArticle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indexing
                  </label>
                  <select
                    {...register("indexing")}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="NONE">None</option>
                    <option value="SCOPUS">Scopus</option>
                    <option value="SCI">SCI</option>
                  </select>
                </div>
              )}

              {/* url */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  {...register("url")}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* citation */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Citation Text
                </label>
                <textarea
                  {...register("citation")}
                  rows={2}
                  placeholder="Full citation string..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                  reset({});
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
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

      {/* publications list */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {currentList.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No {activeSubTab.replace("_", " ").toLowerCase()} publications yet.
          </p>
        ) : (
          <div className="space-y-3">
            {currentList.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.authors.join(", ")}
                  </p>
                  <div className="flex gap-3 flex-wrap mt-1">
                    {p.venue && (
                      <span className="text-xs text-gray-500 italic">
                        {p.venue}
                      </span>
                    )}
                    {p.publisher && (
                      <span className="text-xs text-gray-500">
                        {p.publisher}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{p.year}</span>
                    {p.pages && (
                      <span className="text-xs text-gray-500">
                        pp. {p.pages}
                      </span>
                    )}
                    {p.indexing && p.indexing !== "NONE" && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {p.indexing}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1">
                    {p.doi && (
                      <a
                        href={`https://doi.org/${p.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        DOI
                      </a>
                    )}
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Link
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
