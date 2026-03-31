import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import Navbar from '../../components/Navbar';
import Tabs from '../../components/Tabs';
import PendingBanner from '../../components/PendingBanner';

import PersonalInfoTab from './tabs/PersonalInfoTab';
import AcademicProfileTab from './tabs/AcademicProfileTab';
import CoursesTab from './tabs/CoursesTab';
import ExperiencesTab from './tabs/ExperiencesTab';
import PublicationsTab from './tabs/PublicationsTab';
import EducationTab from './tabs/EducationTab';
import SupervisionTab from './tabs/SupervisionTab';

const TABS = [
  { key: 'personal', label: 'Personal Info' },
  { key: 'academic', label: 'Academic Profile' },
  { key: 'education', label: 'Education' }, 
  { key: 'courses', label: 'Courses Taught' },
  { key: 'experiences', label: 'Experience' },
  { key: 'publications', label: 'Publications' },
  { key: 'supervision', label: 'Thesis & Dissertations' },
];

export default function FacultyDashboard() {
  const { status } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal');
  const isApproved = status === 'APPROVED';

  const renderTab = () => {
    if (!isApproved) return <PendingBanner />;

    switch (activeTab) {
      case 'personal':     return <PersonalInfoTab />;
      case 'academic':     return <AcademicProfileTab />;
      case 'education':    return <EducationTab />;
      case 'courses':      return <CoursesTab />;
      case 'experiences':  return <ExperiencesTab />;
      case 'publications': return <PublicationsTab />;
      case 'supervision':  return <SupervisionTab />;
      default:             return <PersonalInfoTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto py-6 px-4">
        {/* page title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your faculty information
          </p>
        </div>

        {/* tabs — disabled look when pending */}
        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${!isApproved ? 'opacity-60 pointer-events-none' : ''}`}>
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* tab content */}
        <div className="mt-4">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}