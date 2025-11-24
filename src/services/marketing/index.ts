// ============================================
// RE-EXPORT ALL TYPES
// ============================================
export type {
    // Students
    StudentProfile,
    StudentFromAPI,
    StudentForUI,

    // Proposals
    ProposalFromAPI,
    ProposalForUI,
    CreateProposalDTO,
    UpdateProposalDTO,

    // Courses
    CourseFromAPI,
    CourseForUI,
    CourseVersionFromAPI,
    CourseVersionForUI,

    // Campaigns
    CampaignFromAPI,
    CampaignForUI,
    CreateCampaignDTO,
    UpdateCampaignDTO,

    // Campaign Metrics
    CampaignMetricsFromAPI,
    CampaignMetricsForUI,

    // Posts
    PostFromAPI,
    PostForUI,
    CreatePostDTO,
    UpdatePostDTO,

    // Post Metrics (NUEVO SISTEMA)
    MetricFromAPI,
    MetricForUI,
    PostMetricsResponseFromAPI,
    PostMetricsForUI
} from './types';

// ============================================
// RE-EXPORT ALL FUNCTIONS
// ============================================

// Students
export { fetchStudents } from './studentService';

// Proposals
export {
    fetchProposals,
    fetchProposalById,
    createProposal,
    updateProposal,
    deleteProposal
} from './proposalService';

// Courses
export {
    fetchCourses,
    fetchVersions
} from './courseService';

// Campaigns
export {
    fetchCampaignsByProposal,
    fetchCampaignById,
    fetchAllCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    fetchCampaignMetrics,
    fetchCampaignPosts,
    fetchGlobalMetrics
} from './campaignService';

// Posts
export {
    createPost,
    updatePost,
    deletePost,
    fetchPostMetrics
} from './postService';

// Course Detail (nuevas funciones para detalle de curso)
export {
    fetchCourseById,
    fetchCourseVersions,
    fetchCourseCampaigns
} from './courseService';

// Re-export tipos adicionales para detalle de curso
export type {
    CourseDetailFromAPI,
    CourseDetailForUI,
    CampaignWithMetricsFromAPI,
    CampaignWithMetricsForUI,
    CourseCampaignsFromAPI,
    CourseCampaignsForUI
} from './types';