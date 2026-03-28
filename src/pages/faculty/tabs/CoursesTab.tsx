import { useEffect, useState } from 'react';
import {
  getOwnCoursesApi,
  addCourseApi,
  updateCourseApi,
  deleteCourseApi,
  getCourseCatalogApi,
} from '../../../api/courses.api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CourseCatalog, FacultyCourse } from '../../../types';

const schema = z.object({
  catalogCourseId: z.number({ error: 'Select a course' }).min(1),
  semester: z.string().min(1, 'Semester is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  role: z.enum(['LECTURER', 'COORDINATOR', 'LAB']),
  hoursPerWeek: z.number().optional(),
  mode: z.enum(['THEORY', 'LAB']).optional(),
  notes: z.string().optional(),
});

type CourseForm = z.infer<typeof schema>;

export default function CoursesTab() {
  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [catalog, setCatalog] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  // filters
  const [filterSemester, setFilterSemester] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseForm>({ resolver: zodResolver(schema) });

  const fetchCourses = async () => {
    const res = await getOwnCoursesApi({
      semester: filterSemester || undefined,
      academicYear: filterYear || undefined,
    });
    setCourses(res.data);
  };

  useEffect(() => {
    Promise.all([fetchCourses(), getCourseCatalogApi()])
      .then(([, catalogRes]) => setCatalog(catalogRes.data))
      .finally(() => setLoading(false));
  }, []);

  // refetch when filters change
  useEffect(() => {
    fetchCourses();
  }, [filterSemester, filterYear]);

  const openAdd = () => {
    setEditingId(null);
    reset({});
    setShowForm(true);
  };

  const openEdit = (c: FacultyCourse) => {
    setEditingId(c.id);
    reset({
      catalogCourseId: c.catalogCourseId,
      semester: c.semester,
      academicYear: c.academicYear,
      role: c.role as any,
      hoursPerWeek: c.hoursPerWeek ?? undefined,
      mode: c.mode as any ?? undefined,
      notes: c.notes ?? '',
    });
    setShowForm(true);
  };

  const onSubmit = async (data: CourseForm) => {
    try {
      setSaving(true);
      setServerError('');
      if (editingId) {
        await updateCourseApi(editingId, data);
      } else {
        await addCourseApi(data);
      }
      await fetchCourses();
      setShowForm(false);
      reset({});
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this course record?')) return;
    await deleteCourseApi(id);
    await fetchCourses();
  };

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-400 text-sm">Loading...</div>
  );

  return (
    <div className="space-y-4">

      {/* header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Courses Taught / Teaching</h2>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Course
          </button>
        </div>

        {/* filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Semesters</option>
            <option value="ODD">ODD</option>
            <option value="EVEN">EVEN</option>
          </select>

          <input
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            placeholder="Academic Year e.g. 2024-25"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* add/edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Course Record' : 'Add Course Record'}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* course from catalog */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  {...register('catalogCourseId', { valueAsNumber: true })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select course</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) — {c.level}
                    </option>
                  ))}
                </select>
                {errors.catalogCourseId && (
                  <p className="text-red-500 text-xs mt-1">{errors.catalogCourseId.message}</p>
                )}
              </div>

              {/* role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  {...register('role')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select role</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="COORDINATOR">Coordinator</option>
                  <option value="LAB">Lab</option>
                </select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  {...register('semester')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select semester</option>
                  <option value="ODD">ODD</option>
                  <option value="EVEN">EVEN</option>
                </select>
                {errors.semester && (
                  <p className="text-red-500 text-xs mt-1">{errors.semester.message}</p>
                )}
              </div>

              {/* academic year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  {...register('academicYear')}
                  placeholder="e.g. 2024-25"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.academicYear && (
                  <p className="text-red-500 text-xs mt-1">{errors.academicYear.message}</p>
                )}
              </div>

              {/* hours per week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Week</label>
                <input
                  type="number"
                  {...register('hoursPerWeek')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                <select
                  {...register('mode')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select mode</option>
                  <option value="THEORY">Theory</option>
                  <option value="LAB">Lab</option>
                </select>
              </div>

              {/* notes */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
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

      {/* course list */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No course records yet. Click "Add Course" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div
                key={c.id}
                className="flex items-start justify-between border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {c.catalogCourse?.name}
                    <span className="text-gray-400 font-normal ml-2">
                      ({c.catalogCourse?.code})
                    </span>
                  </p>
                  <div className="flex gap-3 flex-wrap mt-1">
                    <span className="text-xs text-gray-500">{c.semester} — {c.academicYear}</span>
                    <span className="text-xs text-gray-500">Role: {c.role}</span>
                    {c.hoursPerWeek && (
                      <span className="text-xs text-gray-500">{c.hoursPerWeek} hrs/week</span>
                    )}
                    {c.mode && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {c.mode}
                      </span>
                    )}
                  </div>
                  {c.notes && (
                    <p className="text-xs text-gray-400 mt-1">{c.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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