export interface StudentGroup {
  enrollment_id: number;
  group_id: number;
  group_name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  group_status: string;
  academic_status: string;
  final_grade: number | null;
  result_status: string | null;
  average_grade: number | null;
  completed_exams: number;
  has_report_data: boolean;
}

export interface Grade {
  exam_id: number;
  exam_title: string;
  module_name: string;
  grade: number;
  feedback: string | null;
  exam_date: string;
  grade_letter: string;
}

export interface GroupGradesResponse {
  success: boolean;
  student: {
    id: number;
    dni: string;
    fullname: string;
  };
  course_info: {
    course_name: string;
    group_name: string;
    start_date: string;
    end_date: string;
  };
  grades_summary: {
    total_grades: number;
    average_grade: number | null;
    highest_grade: number | null;
    lowest_grade: number | null;
  };
  detailed_grades: Grade[];
  can_generate_report: boolean;
}
