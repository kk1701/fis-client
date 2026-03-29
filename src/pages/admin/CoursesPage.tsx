import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getAdminCoursesApi,
  createAdminCourseApi,
  updateAdminCourseApi,
  deleteAdminCourseApi,
  getAdminDepartmentsApi,
} from '../../api/admin.api';
import type { Department } from '../../types';

interface Course {
  id: number;
  name: string;
  code: string;
  level: string;
  credits: number | null;
  department: Department;
  _count: { coursesTaught: number };
}

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  departmentId: z.number({ error: 'Select a department' }).min(1),
  courseLevel: z.enum(['UG', 'PG', 'PHD']),
  credits: z.number().optional(),
});

type CourseForm = z.infer<typeof schema>;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CourseForm>({ resolver: zodResolver(schema) });

  const fetchCourses = async () => {
    const res = await getAdminCoursesApi({
      departmentId: filterDept ? parseInt(filterDept) : undefined,
      level: filterLevel || undefined,
    });
    setCourses(res.data);
  };

  useEffect(() => {
    Promise.all([fetchCourses(), getAdminDepartmentsApi()])
      .then(([, deptRes]) => setDepartments(deptRes.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCourses(); }, [filterDept, filterLevel]);

  const openAdd = () => {
    setEditingId(null);
    reset({});
    setShowForm(true);
  };

  const openEdit = (c: Course) => {
    setEditingId(c.id);
    reset({
      name: c.name,
      code: c.code,
      departmentId: c.department.id,
      courseLevel: c.level as any,
      credits: c.credits ?? undefined,
    });
    setShowForm(true);
  };

  const onSubmit = async (data: CourseForm) => {
    try {
      setSaving(true);
      setServerError('');
      if (editingId) {
        await updateAdminCourseApi(editingId, data);
      } else {
        await createAdminCourseApi(data);
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
    if (!confirm('Delete this course?')) return;
    try {
      await deleteAdminCourseApi(id);
      await fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to delete');
    }
  };

  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-500 text-sm mt-0.5">{courses.length} courses</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          + Add Course
        </button>
      </div>

      {/* filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-3 flex-wrap">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Levels</option>
          <option value="UG">UG</option>
          <option value="PG">PG</option>
          <option value="PHD">PHD</option>
        </select>
      </div>

      {/* form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Course' : 'Add Course'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Data Structures"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  {...register('code')}
                  placeholder="e.g. CS101"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  {...register('departmentId', { valueAsNumber: true })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
                {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  {...register('courseLevel')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select level</option>
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                  <option value="PHD">PHD</option>
                </select>
                {errors.courseLevel && <p className="text-red-500 text-xs mt-1">{errors.courseLevel.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  {...register('credits')}
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
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
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

      {/* table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Code</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Department</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Level</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Credits</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Used by</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.code}</td>
                <td className="px-4 py-3 text-gray-600">{c.department?.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {c.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.credits ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{c._count.coursesTaught} faculty</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 justify-end">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}