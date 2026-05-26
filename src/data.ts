/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notice, NewsEvent, Faculty, StudentResult } from './types';

export const SCHOOL_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Class VI Admission Test Results Published',
    banglaTitle: '৬ষ্ঠ শ্রেণির ভর্তি পরীক্ষার ফলাফল প্রকাশ',
    publishDate: '12 Jan 2026',
    category: 'Admission',
    isNew: true,
    content: 'The official results of the Class VI Admission Test for the academic session 2026 have been published. Selected candidates are requested to complete their admission formalities between 15th January and 20th January 2026. Please bring all original transfer certificates, primary school completion cards, and birth registration documents during admission.',
    banglaContent: '২০২৬ শিক্ষাবর্ষের ৬ষ্ঠ শ্রেণির ভর্তি পরীক্ষার ফলাফল চূড়ান্তভাবে প্রকাশ করা হয়েছে। উত্তীর্ণ শিক্ষার্থীদের আগামী ১৫ জানুয়ারি থেকে ২০ জানুয়ারি ২০২৬-এর মধ্যে ভর্তি প্রক্রিয়া সম্পূর্ণ করার জন্য অনুরোধ করা হলো। ভর্তির সময় সকল মূল ছাড়পত্র, প্রাথমিক সমাপনী কার্ড এবং জন্ম নিবন্ধন সনদ সঙ্গে আনতে হবে।'
  },
  {
    id: 'n2',
    title: 'Book Distribution Festival 2026 Schedule',
    banglaTitle: 'পাঠ্যপুস্তক উৎসব ২০২৬ সময়সূচী',
    publishDate: '05 Jan 2026',
    category: 'Academic',
    content: 'Free textbook distribution for academic year 2026 will start from January 1st. Class-wise schedules are Class VI-VII on Jan 1st at 10:00 AM, Class VIII on Jan 2nd at 11:30 AM, and Class IX-X on Jan 3rd at 10:00 AM. Please ensure student presence with previous year roll card.',
    banglaContent: '২০২৬ শিক্ষাবর্ষের বিনামূল্যে পাঠ্যপুস্তক বিতরণ ১ জানুয়ারি থেকে শুরু হবে। শ্রেণিভিত্তিক সময়সূচী: ৬ষ্ঠ ও ৭ম শ্রেণি: ১ জানুয়ারি সকাল ১০টা, ৮ম শ্রেণি: ২ জানুয়ারি বেলা ১১:৩০ এবং ৯ম ও ১০ম শ্রেণি: ৩ জানুয়ারি সকাল ১০টা। বিগত বছরের আইডি কার্ড সহ উপস্থিতি নিশ্চিত করতে হবে।'
  },
  {
    id: 'n3',
    title: 'Annual Examination 2025 Marksheets Available Online',
    banglaTitle: 'বার্ষিক পরীক্ষা ২০২৫ এর মার্কশিট এখন অনলাইনেই',
    publishDate: '20 Dec 2025',
    category: 'Exam',
    content: 'All class marksheets for the Annual Examination 2025 are now declared and uploaded to the website. Students can query and print their results card by entering their Student ID in the Result Portal.',
    banglaContent: 'বার্ষিক পরীক্ষা ২০২৫-এর সকল শ্রেণির নম্বরপত্র এখন ওয়েবসাইটে পাওয়া যাচ্ছে। শিক্ষার্থীরা ফলাফল পোর্টালে তাদের স্টুডেন্ট আইডি ও পরীক্ষার নাম দিয়ে ফলাফল দেখতে ও প্রিন্ট করতে পারবে।'
  },
  {
    id: 'n4',
    title: 'Winter Vacation and School Reopening Date',
    banglaTitle: 'শীতকালীন ছুটি ও স্কুল পুনরায় খোলার তারিখ',
    publishDate: '15 Dec 2025',
    category: 'Holiday',
    content: 'School will remain closed from December 16th to December 31st on account of Winter Vacation and Victory Day. School will regularly resume all classes from January 1st, 2026.',
    banglaContent: 'শীতকালীন ছুটি এবং মহান বিজয় দিবস উপলক্ষে আগামী ১৬ ডিসেম্বর থেকে ৩১ ডিসেম্বর পর্যন্ত বিদ্যালয় বন্ধ থাকবে। ২০২৬ সালের ১ জানুয়ারি থেকে নিয়মতান্ত্রিকভাবে সমস্ত ক্লাস পুনরায় শুরু হবে।'
  },
  {
    id: 'n5',
    title: 'Inter-School Mathematics Olympiad Registration Open',
    banglaTitle: 'আন্তঃস্কুল গণিত অলিম্পিয়াড নিবন্ধন শুরু',
    publishDate: '10 Nov 2025',
    category: 'Academic',
    content: 'Students from Class VI to X interested in representing the school in the upcoming Divisional Science and Mathematics Fair are requested to register their name with the Science Club Coordinator by November 20th.',
    banglaContent: '৬ষ্ঠ থেকে ১০ম শ্রেণির যেসকল শিক্ষার্থী বিভাগীয় বিজ্ঞান ও গণিত মেলায় বিদ্যালয়ের প্রতিনিধিত্ব করতে আগ্রহী, তাদেরকে ২০ নভেম্বরের মধ্যে বিজ্ঞান ক্লাবের কো-অর্ডিনেটরের কাছে নিবন্ধন করতে অনুরোধ করা হচ্ছে।'
  }
];

export const SCHOOL_EVENTS: NewsEvent[] = [
  {
    id: 'e1',
    title: 'Inter-School Science Fair 2026',
    banglaTitle: 'আন্তঃস্কুল বিজ্ঞান মেলা ২০২৬',
    date: '18 Feb 2026',
    category: 'Event',
    description: 'Our students secured top positions at the regional science fair, demonstrating exceptional innovative projects in renewable energy and green technology.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtEWCK5zJvI_PSAnFe2iuZpNx3Oz-JHXU7alD4KvRaPk9xEZkNGhiXOJoXPo2ojOKlCgwAmPVe2x3Hv5UfNOh9GQ5FWgoNQtMDWs6Ofsg9uBmN97G2sdTJbO1xVETMoSZPyzRSSwmz0jzOoEOyQxUpFDZRKuCEhX0k1VhpSBuYtKz8JHlFcbYAdAVwo342goJc8d4BFQImXARVFA3Oi44dPxYfxPsVm3mkAbb2Ew9oLXgOaBTLixhltAn-vzBiHbnv17kjhkmt8DU',
    content: 'Damagara Syed Meena Dimukhe High School successfully hosted the Inter-School Science Fair on our campus. Over 15 schools from across the region participated with innovative models. Our Class X students won the Best Innovation Award for their "Solar Powered Organic Irrigation Model," showcasing practical and eco-friendly solutions for rural agriculture. Headmaster Md. Abul Kalam Shahana congratulated the winners and expressed full support for setting up a modern innovators lab.'
  },
  {
    id: 'e2',
    title: 'Annual Sports Day Preparations',
    banglaTitle: 'বার্ষিক ক্রীড়া প্রতিযোগিতা প্রস্তুতি',
    date: '08 Feb 2026',
    category: 'Sports',
    description: 'Students are gearing up for the upcoming Annual Sports Day. House selections, running trials, and special drills are currently underway.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBojlVHNiUiRz58fIps-R1ZOqwS-1MuOm7rNYaSRwzqhsSbIbhBC7ZltVirlY8PONnWJRXoAREC7Zx8RLhhvL66s-TQDlxKLIZVmtTysJsa07NkaR7G8OtEkNjUdK8wl2M1W5ZceGJaZFR2lgpFS5EKldDX0RPuOiBQZ2_7SGIQJfFes7VhivvQQe8Se97U82GrV9zvnK_knAJW8xq9pTp9OEWe3VeCldDhLqw6qRkW2jYmyLTjXeG0GyBkrZIi7Suin5tnz5q37pI',
    content: 'Preparations for the most awaited event of the terms, the Annual Sports Day, are in full swing! Students are split into four competitive academic houses: Shere-Bangla, Nazrul, Rabindra, and Fazlul Huq House. The athletics tracks have been repainted and students are undergoing training under coach guidance in high-jump, shot-put, discus, and sprints. The final event is scheduled for February 25th, featuring a spectacular grand display of drill formations.'
  },
  {
    id: 'e3',
    title: 'Victory Day Celebrations',
    banglaTitle: 'মহান বিজয় দিবস উদযাপন',
    date: '16 Dec 2025',
    category: 'Culture',
    description: 'A grand cultural program was organized to commemorate Victory Day, featuring patriotic performances, dramas, and choral songs by students.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm6Q8k3R-71kFASQs36Zqr2mwsDaNefWMPrK051cLNMbWTalKdFRyzls_vbbEXkl9AKC_InGRjQMvT4y_Jt38DhqLEqUvF4JWV-icmwQpmTIBfPEq0hu3-t85qVdBh9TePR3xJ1NqipTl7C3FSFbe9XTuJM4HougpvnabKbjNUOwdulgortmJmwIyiScLWj1YRpi67GDPjDhoKlvnJRb8EtaVO_DHhhmejuiRR0d3fySCp7nsZ2SmaRnp54cRehn10TZCjPqzc6kY',
    content: 'December 16th was celebrated with traditional grandeur and due respect at the school premises. The morning commenced with the national anthem, flag hoisting ceremony, and paying solemn tribute to the martyrs of the Liberation War. Students staged an intense patriotic stage play "Amra Bhabna Shobuj Kaler" followed by folk and local classical dances and chorus songs. Special sweets were distributed among all present attendees, including respected guardians.'
  }
];

export const SCHOOL_FACULTY: Faculty[] = [
  {
    id: 'f1',
    name: 'Md. Abul Kalam Shahana',
    banglaName: 'মোঃ আবুল কালাম শাহানা',
    designation: 'Headmaster',
    banglaDesignation: 'প্রধান শিক্ষক',
    qualification: 'M.Sc (Mathematics), M.Ed',
    email: 'headmaster@damagarasmdhs.edu.bd',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB06KFjNO_pB_0Rlb7LNFeuETlVQCaHRqjjS2k-kLQ6z7RqNehnQOr5iLFHbg49tFeThzu5P55FbRb2ejInYVmDfxhtr5LwsZTljs6nwn-KZkfFA8VvWEb5xqyOrEXQ61EjRtGqnqk_407GDgenQZbbK6TkfS88zFb7WoKFfaQhuG9BV76LK1Na1Ua_lodikx43d14aY_Ng69EvB7gcPNEPRzxHDwd3gTJCURh0Fmt_RT_2Pjw8tHU3N1dTYXyKmYJZspXnS1tudFo',
    joiningYear: 2012
  },
  {
    id: 'f2',
    name: 'Dilara Jahan Begum',
    banglaName: 'দিলারা জাহান বেগম',
    designation: 'Assistant Headmistress',
    banglaDesignation: 'সহকারী প্রধান শিক্ষক',
    qualification: 'M.A (English), B.Ed',
    email: 'dilara.assthead@damagarasmdhs.edu.bd',
    joiningYear: 2015
  },
  {
    id: 'f3',
    name: 'Abu Naser Siddique',
    banglaName: 'আবু নাসের সিদ্দিকী',
    designation: 'Senior Teacher (Mathematics)',
    banglaDesignation: 'সিনিয়র শিক্ষক (গণিত)',
    qualification: 'B.Sc (Hons), M.Sc in Mathematics',
    email: 'abunaser.math@damagarasmdhs.edu.bd',
    joiningYear: 2010
  },
  {
    id: 'f4',
    name: 'Sultana Razia',
    banglaName: 'সুলতানা রাজিয়া',
    designation: 'Senior Teacher (Bengali)',
    banglaDesignation: 'সিনিয়র শিক্ষক (বাংলা)',
    qualification: 'M.A (Bengali Literature)',
    email: 'sultana.bangla@damagarasmdhs.edu.bd',
    joiningYear: 2014
  },
  {
    id: 'f5',
    name: 'Dr. Mukul Chandra Roy',
    banglaName: 'ড. মুকুল চন্দ্র রায়',
    designation: 'Senior Teacher (Science)',
    banglaDesignation: 'সিনিয়র শিক্ষক (বিজ্ঞান)',
    qualification: 'M.Sc (Physics), Ph.D',
    email: 'mukul.physics@damagarasmdhs.edu.bd',
    joiningYear: 2017
  },
  {
    id: 'f6',
    name: 'A.H.M. Kamruzzaman',
    banglaName: 'এ.এইচ.এম. কামরুজ্জামান',
    designation: 'Lecturer (ICT)',
    banglaDesignation: 'প্রভাষক (তথ্য ও যোগাযোগ প্রযুক্তি)',
    qualification: 'B.Sc in Computer Science (CSE)',
    email: 'kamruzzaman.ict@damagarasmdhs.edu.bd',
    joiningYear: 2020
  }
];

export const ACADEMIC_SYLLABUS = [
  { code: 'SYL-06', className: 'Class VI', file: 'Syllabus_Class_6_2026.pdf', size: '2.4 MB', lastUpdated: '10 Jan 2026' },
  { code: 'SYL-07', className: 'Class VII', file: 'Syllabus_Class_7_2026.pdf', size: '2.5 MB', lastUpdated: '10 Jan 2026' },
  { code: 'SYL-08', className: 'Class VIII', file: 'Syllabus_Class_8_2026.pdf', size: '2.8 MB', lastUpdated: '08 Jan 2026' },
  { code: 'SYL-09', className: 'Class IX', file: 'Syllabus_Class_9_2026_NewCurriculum.pdf', size: '3.6 MB', lastUpdated: '05 Jan 2026' },
  { code: 'SYL-10', className: 'Class X', file: 'Syllabus_Class_10_2026_SSC.pdf', size: '4.2 MB', lastUpdated: '04 Jan 2026' },
];

export const MOCK_STUDENT_RESULTS: StudentResult[] = [
  {
    studentId: 'DSMD-101',
    studentName: 'Shakib Al Hasan',
    banglaName: 'সাকিব আল হাসান',
    class: 'Class X',
    section: 'A',
    rollNo: 1,
    examType: 'Annual Examination',
    year: 2025,
    subjectsMarks: [
      { subjectName: 'Bengali', banglaSubjectName: 'বাংলা', marks: 88, highestMarks: 94 },
      { subjectName: 'English', banglaSubjectName: 'ইংরেজি', marks: 85, highestMarks: 90 },
      { subjectName: 'Mathematics', banglaSubjectName: 'গণিত', marks: 98, highestMarks: 98 },
      { subjectName: 'Physics', banglaSubjectName: 'পদার্থবিজ্ঞান', marks: 92, highestMarks: 95 },
      { subjectName: 'Chemistry', banglaSubjectName: 'রসায়ন', marks: 89, highestMarks: 93 },
      { subjectName: 'ICT', banglaSubjectName: 'আইসিটি', marks: 95, highestMarks: 97 }
    ]
  },
  {
    studentId: 'DSMD-102',
    studentName: 'Fatima Zohra',
    banglaName: 'ফাতিমা জোহরা',
    class: 'Class X',
    section: 'A',
    rollNo: 2,
    examType: 'Annual Examination',
    year: 2025,
    subjectsMarks: [
      { subjectName: 'Bengali', banglaSubjectName: 'বাংলা', marks: 92, highestMarks: 94 },
      { subjectName: 'English', banglaSubjectName: 'ইংরেজি', marks: 90, highestMarks: 90 },
      { subjectName: 'Mathematics', banglaSubjectName: 'গণিত', marks: 84, highestMarks: 98 },
      { subjectName: 'Physics', banglaSubjectName: 'পদার্থবিজ্ঞান', marks: 88, highestMarks: 95 },
      { subjectName: 'Chemistry', banglaSubjectName: 'রসায়ন', marks: 93, highestMarks: 93 },
      { subjectName: 'ICT', banglaSubjectName: 'আইসিটি', marks: 91, highestMarks: 97 }
    ]
  },
  {
    studentId: 'DSMD-801',
    studentName: 'Abrar Fahim',
    banglaName: 'আবরার ফাহিম',
    class: 'Class VIII',
    section: 'B',
    rollNo: 1,
    examType: 'Annual Examination',
    year: 2025,
    subjectsMarks: [
      { subjectName: 'Bengali', banglaSubjectName: 'বাংলা', marks: 82, highestMarks: 89 },
      { subjectName: 'English', banglaSubjectName: 'ইংরেজি', marks: 88, highestMarks: 92 },
      { subjectName: 'Mathematics', banglaSubjectName: 'গণিত', marks: 94, highestMarks: 96 },
      { subjectName: 'General Science', banglaSubjectName: 'বিজ্ঞান', marks: 90, highestMarks: 94 },
      { subjectName: 'Social Science', banglaSubjectName: 'বাংলাদেশ ও বিশ্বপরিচয়', marks: 85, highestMarks: 91 },
      { subjectName: 'Religion', banglaSubjectName: 'ধর্ম ও নৈতিক শিক্ষা', marks: 96, highestMarks: 98 }
    ]
  }
];
