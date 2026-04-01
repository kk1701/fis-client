import api from './axios';

export const getResearchDomainsApi = () =>
  api.get('/admin/analytics/research-domains');

export const getPublicationTrendsApi = () =>
  api.get('/admin/analytics/publication-trends');

export const getDepartmentHealthApi = () =>
  api.get('/admin/analytics/department-health');

export const getResearchMomentumApi = (departmentId?: number) =>
  api.get('/admin/analytics/research-momentum', {
    params: departmentId ? { departmentId } : {},
  });

export const getQualificationDistributionApi = () =>
  api.get('/admin/analytics/qualification-distribution');

export const getExperienceProfileApi = () =>
  api.get('/admin/analytics/experience-profile');

export const getCourseLoadApi = (academicYear?: string) =>
  api.get('/admin/analytics/course-load', {
    params: academicYear ? { academicYear } : {},
  });

export const getSupervisionPipelineApi = () =>
  api.get('/admin/analytics/supervision-pipeline');