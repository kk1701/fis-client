import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getOwnEducationApi,
  addDegreeApi,
  updateDegreeApi,
  deleteDegreeApi,
} from '../../../api/education.api';

const DEGREE_LEVELS = [
  { value: 'TENTH', label: '10th (Secondary)' },
  { value: 'TWELFTH', label: '12th (Senior Secondary)' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'GRADUATION', label: 'Graduation (UG)' },
  { value: 'POST_GRADUATION', label: 'Post Graduation (PG)' },
  { value: 'DOCTORATE', label: 'Doctorate (PhD)' },
  { value: 'OTHER', label: 'Other' },
];

const LEVEL_ICONS: Record<string, string> = {
  TENTH: '📘',
  TWELFTH: '📗',
  DIPLOMA: '📜',
  GRADUATION: '🎓',
  POST_GRADUATION: '🏛️',
  DOCTORATE: '🔬',
  OTHER: '📄',
};

interface Degree {
  id: number;
  level: string;
  degreeName: string;
  specialization: string;
  institute: string;
  yearOfPassing: number;
  score?: number;
  scoreType?: string;
  division?: string;
}

const schema = z.object({
  level: z.enum([
    'TENTH', 'TWELFTH', 'DIPLOMA',
    'GRADUATION', 'POST_GRADUATION', 'DOCTORATE', 'OTHER',
  ]),
  degreeName: z.string().min(1, 'Degree name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  institute: z.string().min(1, 'Institute is required'),
  yearOfPassing: z.number().min(1950).max(new Date().getFullYear()),
  score: z.number().optional(),
  scoreType: z.string().optional(),
  division: z.string().optional(),
});

type DegreeForm = z.infer<typeof schema>;

export default function EducationTab() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<DegreeForm>({ resolver: zodResolver(schema) });

  const selectedLevel = watch('level');

  const fetchDegrees = async () => {
    const res = await getOwnEducationApi();
    setDegrees(res.data);
  };

  useEffect(() => {
    fetchDegrees().finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    reset({});
    setShowForm(true);
  };

  const openEdit = (d: Degree) => {
    setEditingId(d.id);
    reset({
      level: d.level as any,
      degreeName: d.degreeName,
      specialization: d.specialization,
      institute: d.institute,
      yearOfPassing: d.yearOfPassing,
      score: d.score ?? undefined,
      scoreType: d.scoreType ?? '',
      division: d.division ?? '',
    });
    setShowForm(true);
  };

  const onSubmit = async (data: DegreeForm) => {
    try {
      setSaving(true);
      setServerError('');
      if (editingId) {
        await updateDegreeApi(editingId, data);
      } else {
        await addDegreeApi(data);
      }
      await fetchDegrees();
      setShowForm(false);
      reset({});
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this education record?')) return;
    await deleteDegreeApi(id);
    await fetchDegrees();
  };

  // score type label changes based on level
  const scoreLabel = ['TENTH', 'TWELFTH'].includes(selectedLevel)
    ? 'Percentage / CGPA'
    : 'CGPA / Score';

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">Loading...</div>
  );

  return (
    <div className="space-y-4">

      {/* header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Education</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Add your academic qualifications from 10th onwards
            </p>
          </div>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Qualification
          </button>
        </div>
      </div>

      {/* form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Qualification' : 'Add Qualification'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* level */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEGREE_LEVELS.map((dl) => (
                    <label
                      key={dl.value}
                      className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer transition text-sm ${
                        selectedLevel === dl.value
                          ? 'border-primary bg-blue-50 text-primary'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        value={dl.value}
                        {...register('level')}
                        className="sr-only"
                      />
                      <span>{LEVEL_ICONS[dl.value]}</span>
                      <span className="text-xs font-medium">{dl.label}</span>
                    </label>
                  ))}
                </div>
                {errors.level && (
                  <p className="text-red-500 text-xs mt-1">{errors.level.message}</p>
                )}
              </div>

              {/* degree name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree / Certificate Name
                </label>
                <input
                  {...register('degreeName')}
                  placeholder="e.g. B.Tech, M.Tech, SSC"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.degreeName && (
                  <p className="text-red-500 text-xs mt-1">{errors.degreeName.message}</p>
                )}
              </div>

              {/* specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization / Stream
                </label>
                <input
                  {...register('specialization')}
                  placeholder="e.g. Computer Science, Science"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>
                )}
              </div>

              {/* institute */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution / Board / University
                </label>
                <input
                  {...register('institute')}
                  placeholder="e.g. MANIT Bhopal, CBSE"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.institute && (
                  <p className="text-red-500 text-xs mt-1">{errors.institute.message}</p>
                )}
              </div>

              {/* year of passing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Passing
                </label>
                <input
                  type="number"
                  {...register('yearOfPassing', { valueAsNumber: true })}
                  placeholder="e.g. 2015"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.yearOfPassing && (
                  <p className="text-red-500 text-xs mt-1">{errors.yearOfPassing.message}</p>
                )}
              </div>

              {/* score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {scoreLabel}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('score', { valueAsNumber: true })}
                  placeholder="e.g. 8.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* score type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score Type
                </label>
                <select
                  {...register('scoreType')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select type</option>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="CGPA_10">CGPA (out of 10)</option>
                  <option value="CGPA_4">CGPA (out of 4)</option>
                </select>
              </div>

              {/* division */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division / Grade
                </label>
                <select
                  {...register('division')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select division</option>
                  <option value="DISTINCTION">Distinction</option>
                  <option value="FIRST">First Division</option>
                  <option value="SECOND">Second Division</option>
                  <option value="THIRD">Third Division</option>
                  <option value="PASS">Pass</option>
                </select>
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
                onClick={() => { setShowForm(false); reset({}); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* education timeline */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {degrees.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No education records yet. Click "Add Qualification" to get started.
          </p>
        ) : (
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-100" />

            <div className="space-y-6">
              {degrees.map((d) => (
                <div key={d.id} className="flex gap-4 relative">
                  {/* icon */}
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xl shrink-0 z-10">
                    {LEVEL_ICONS[d.level]}
                  </div>

                  {/* content */}
                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full">
                            {DEGREE_LEVELS.find((l) => l.value === d.level)?.label}
                          </span>
                          <span className="text-xs text-gray-400">{d.yearOfPassing}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{d.degreeName}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{d.specialization}</p>
                        <p className="text-xs text-gray-500 mt-0.5">🏛 {d.institute}</p>
                        {d.score && (
                          <p className="text-xs text-gray-500 mt-1">
                            Score: {d.score}
                            {d.scoreType && ` (${d.scoreType})`}
                            {d.division && ` — ${d.division}`}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openEdit(d)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}