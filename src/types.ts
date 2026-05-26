/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Notice {
  id: string;
  title: string;
  banglaTitle?: string;
  publishDate: string;
  category: 'Admission' | 'Academic' | 'Exam' | 'Holiday' | 'General';
  isNew?: boolean;
  content: string;
  banglaContent?: string;
}

export interface NewsEvent {
  id: string;
  title: string;
  banglaTitle?: string;
  date: string;
  category: 'Event' | 'Sports' | 'Culture' | 'General';
  description: string;
  imageUrl: string;
  content: string;
}

export interface Faculty {
  id: string;
  name: string;
  banglaName?: string;
  designation: string;
  banglaDesignation?: string;
  qualification: string;
  phone?: string;
  email: string;
  imageUrl?: string;
  joiningYear: number;
}

export interface Subject {
  code: string;
  name: string;
  banglaName?: string;
  class: string;
  type: 'Core' | 'Elective';
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  banglaName?: string;
  class: string;
  section: string;
  rollNo: number;
  examType: string;
  year: number;
  subjectsMarks: {
    subjectName: string;
    banglaSubjectName?: string;
    marks: number;
    highestMarks: number;
  }[];
}

export interface AdmissionApplication {
  trackingId: string;
  studentName: string;
  studentNameBangla: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  bloodGroup: string;
  seekingClass: string;
  fatherName: string;
  fatherProfession: string;
  motherName: string;
  motherProfession: string;
  mobileNumber: string;
  email: string;
  permanentAddress: string;
  photoUrl?: string;
  status: 'Pending' | 'Approved' | 'ReviewRequired';
  appliedDate: string;
}
