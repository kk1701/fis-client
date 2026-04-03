import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { publishReportApi } from "../api/analytics.api";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type Form = z.infer<typeof schema>;

interface Props {
  reportType: string;
  defaultTitle: string;
  data: any;
  onClose: () => void;
}

export default function PublishReportModal({
  reportType,
  defaultTitle,
  data,
  onClose,
}: Props) {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { title: defaultTitle },
  });

  const onSubmit = async (form: Form) => {
    try {
      setServerError("");
      await publishReportApi({
        title: form.title,
        description: form.description,
        reportType,
        data,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? "Failed to publish");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Publish Report
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              This will make the report visible on the public reports page
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
            ✓ Report published successfully
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Title
              </label>
              <input
                {...register("title")}
                placeholder="e.g. Research Domain Analysis — April 2026"
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
                placeholder="Add context for the public about this report..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* data preview */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500">
                📊 A snapshot of the current report data will be saved. The
                public will see this exact data, not live updates.
              </p>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-1">
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
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Publishing..." : "🌐 Publish to Public Page"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
