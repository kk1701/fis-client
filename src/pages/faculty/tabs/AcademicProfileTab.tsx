import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getOwnProfileApi, updateAcademicApi } from "../../../api/faculty.api";
import api from "../../../api/axios";
import type { Department } from "../../../types";

const schema = z.object({
  designation: z.string().optional(),
  highestQualification: z.string().optional(),
  specialization: z.string().optional(), // comma separated, split before sending
  joiningDate: z.string().optional(),
  experienceYears: z
    .number()
    .min(0, "Experience cannot be negative.")
    .optional(),
  departmentId: z.number().optional(),
});

type AcademicForm = z.infer<typeof schema>;

export default function AcademicProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcademicForm>({ resolver: zodResolver(schema) });

  useEffect(() => {
    Promise.all([getOwnProfileApi(), api.get<Department[]>("/departments")])
      .then(([profileRes, deptRes]) => {
        const f = profileRes.data;
        setDepartments(deptRes.data);
        reset({
          designation: f.designation ?? "",
          highestQualification: f.highestQualification ?? "",
          specialization: f.specialization?.join(", ") ?? "",
          joiningDate: f.joiningDate ? f.joiningDate.split("T")[0] : "",
          experienceYears: f.experienceYears ?? undefined,
          departmentId: f.departmentId ?? undefined,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: AcademicForm) => {
    try {
      setSaving(true);
      setServerError("");
      setSuccess(false);

      await updateAcademicApi({
        ...data,
        // convert comma-separated string to array
        specialization: data.specialization
          ? data.specialization
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">
        Loading...
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-6">
        Academic Profile
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <input
              {...register("designation")}
              placeholder="e.g. Associate Professor"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* highest qualification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Highest Qualification
            </label>
            <input
              {...register("highestQualification")}
              placeholder="e.g. PhD"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              {...register("departmentId", { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* joining date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joining Date
            </label>
            <input
              type="date"
              {...register("joiningDate")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* experience years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              {...register("experienceYears", { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
              <span className="text-gray-400 font-normal ml-1">
                (comma separated)
              </span>
            </label>
            <input
              {...register("specialization")}
              placeholder="e.g. Machine Learning, Data Science"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* feedback */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {serverError}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
            Academic profile saved successfully.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
