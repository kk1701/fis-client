import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SubTabs from '../../../components/SubTabs';
import {
  getOwnExperiencesApi,
  addExperienceApi,
  updateExperienceApi,
  deleteExperienceApi,
} from '../../../api/experiences.api';
import type { Experience } from '../../../types';

const SUB_TABS = [
  { key: 'TEACHING', label: 'Teaching' },
  { key: 'INDUSTRIAL', label: 'Industrial' },
  { key: 'RESEARCH', label: 'Research' },
  { key: 'ADMINISTRATIVE', label: 'Administrative' },
];

const schema = z.object({
  type: z.enum(['TEACHING', 'INDUSTRIAL', 'RESEARCH', 'ADMINISTRATIVE']),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().min(1, 'Organization is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  location: z.string().optional(),
  details: z.string().optional(),
  payScale: z.string().optional(),
});

type ExperienceForm = z.infer<typeof schema>;

type GroupedExperiences = {
  TEACHING: Experience[];
  INDUSTRIAL: Experience[];
  RESEARCH: Experience[];
  ADMINISTRATIVE: Experience[];
};

export default function ExperiencesTab() {
  const [activeSubTab, setActiveSubTab] = useState('TEACHING');
  const [grouped, setGrouped] = useState<GroupedExperiences>({
    TEACHING: [],
    INDUSTRIAL: [],
    RESEARCH: [],
    ADMINISTRATIVE: [],
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExperienceForm>({ resolver: zodResolver(schema) });

  const fetchExperiences = async () => {
    const res = await getOwnExperiencesApi();
    setGrouped(res.data);
  };

  useEffect(() => {
    fetchExperiences().finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    reset({ type: activeSubTab as any });
    setShowForm(true);
  };

  const openEdit = (e: Experience) => {
    setEditingId(e.id);
    reset({
      type: e.type,
      title: e.designation,
      organization: e.organization,
      startDate: e.startDate.split('T')[0],
      endDate: e.endDate ? e.endDate.split('T')[0] : '',
      location: e.location ?? '',
      details: e.natureOfWork ?? '',
      payScale: e.payScale ?? '',
    });
    setShowForm(true);
  };

  const onSubmit = async (data: ExperienceForm) => {
    try {
      setSaving(true);
      setServerError('');
      if (editingId) {
        await updateExperienceApi(editingId, data);
      } else {
        await addExperienceApi(data);
      }
      await fetchExperiences();
      setShowForm(false);
      reset({});
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this experience record?')) return;
    await deleteExperienceApi(id);
    await fetchExperiences();
  };

  const currentList = grouped[activeSubTab as keyof GroupedExperiences];

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">Loading...</div>
  );

  return (
    <div className="space-y-4">

      {/* header + sub tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Experience</h2>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Experience
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
            {editingId ? 'Edit Experience' : `Add ${activeSubTab.charAt(0) + activeSubTab.slice(1).toLowerCase()} Experience`}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* hidden type field */}
            <input type="hidden" {...register('type')} value={activeSubTab} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title / Designation
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g. Assistant Professor"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization / Institution
                </label>
                <input
                  {...register('organization')}
                  placeholder="e.g. MANIT Bhopal"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.organization && (
                  <p className="text-red-500 text-xs mt-1">{errors.organization.message}</p>
                )}
              </div>

              {/* start date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                )}
              </div>

              {/* end date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                  <span className="text-gray-400 font-normal ml-1">(leave blank if current)</span>
                </label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  {...register('location')}
                  placeholder="e.g. Bhopal, MP"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* pay scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Scale</label>
                <input
                  {...register('payScale')}
                  placeholder="e.g. Level 10"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* details */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details / Nature of Work
                </label>
                <textarea
                  {...register('details')}
                  rows={3}
                  placeholder="Brief description of responsibilities..."
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

      {/* experience list for active sub tab */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {currentList.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No {activeSubTab.toLowerCase()} experience records yet.
          </p>
        ) : (
          <div className="space-y-3">
            {currentList.map((e) => (
              <div
                key={e.id}
                className="flex items-start justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{e.designation}</p>
                  <p className="text-sm text-gray-600">{e.organization}</p>
                  <div className="flex gap-3 flex-wrap mt-1">
                    <span className="text-xs text-gray-500">
                      {e.startDate.split('T')[0]} →{' '}
                      {e.endDate ? e.endDate.split('T')[0] : 'Present'}
                    </span>
                    {e.location && (
                      <span className="text-xs text-gray-500">📍 {e.location}</span>
                    )}
                    {e.payScale && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {e.payScale}
                      </span>
                    )}
                  </div>
                  {e.natureOfWork && (
                    <p className="text-xs text-gray-400 mt-1">{e.natureOfWork}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => openEdit(e)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
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