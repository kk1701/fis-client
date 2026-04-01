import { useState } from 'react';
import Tabs from '../../components/Tabs';
import ResearchDomainsReport from './reports/ResearchDomainsReport';
import PublicationTrendsReport from './reports/PublicationTrendsReport';
import DepartmentHealthReport from './reports/DepartmentHealthReport';
import ResearchMomentumReport from './reports/ResearchMomentumReport';
import QualificationReport from './reports/QualificationReport';
import ExperienceProfileReport from './reports/ExperienceProfileReport';
import CourseLoadReport from './reports/CourseLoadReport';
// import SupervisionPipelineReport from './reports/SupervisionPipelineReport';

const TABS = [
  { key: 'domains', label: 'Research Domains' },
  { key: 'publications', label: 'Publication Trends' },
  { key: 'health', label: 'Dept Health Score' },
  { key: 'momentum', label: 'Research Momentum' },
  { key: 'qualifications', label: 'Qualifications' },
  { key: 'experience', label: 'Experience Profile' },
  { key: 'courseload', label: 'Course Load' },
  { key: 'supervision', label: 'Supervision Pipeline' },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('domains');

  const renderReport = () => {
    switch (activeTab) {
      case 'domains':      return <ResearchDomainsReport />;
      case 'publications': return <PublicationTrendsReport />;
      case 'health':       return <DepartmentHealthReport />;
      case 'momentum':     return <ResearchMomentumReport />;
      case 'qualifications': return <QualificationReport />;
      case 'experience':   return <ExperienceProfileReport />;
      case 'courseload':   return <CourseLoadReport />;
    //   case 'supervision':  return <SupervisionPipelineReport />;
      default:             return <ResearchDomainsReport />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Institutional insights derived from faculty data
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div>{renderReport()}</div>
    </div>
  );
}