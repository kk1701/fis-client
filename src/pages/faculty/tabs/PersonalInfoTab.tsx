import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getOwnProfileApi, updatePersonalApi } from '../../../api/faculty.api';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  nationality: z.string().optional(),
  category: z.string().optional(),
  dob: z.string().optional(),
  orcidId: z.string().optional(),
  photoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type PersonalForm = z.infer<typeof schema>;

export default function PersonalInfoTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalForm>({ resolver: zodResolver(schema) });

  useEffect(() => {
    getOwnProfileApi()
      .then((res) => {
        const f = res.data;
        reset({
          name: f.name ?? '',
          mobile: f.mobile ?? '',
          gender: f.gender ?? undefined,
          nationality: f.nationality ?? '',
          category: f.category ?? '',
          dob: f.dob ? f.dob.split('T')[0] : '',
          orcidId: f.orcidId ?? '',
          photoUrl: f.photoUrl ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: PersonalForm) => {
    try {
      setSaving(true);
      setServerError('');
      setSuccess(false);
      await updatePersonalApi(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-6">Personal Information</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              {...register('name')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input
              {...register('mobile')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* dob */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              {...register('dob')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              {...register('gender')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            <input
              {...register('nationality')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              {...register('category')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="">Select category</option>
              <option value="GENERAL">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          {/* orcid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ORCID ID</label>
            <input
              {...register('orcidId')}
              placeholder="0000-0000-0000-0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* photo url */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
            <input
              {...register('photoUrl')}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.photoUrl && <p className="text-red-500 text-xs mt-1">{errors.photoUrl.message}</p>}
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
            Personal information saved successfully.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}