import { Assignment, SchoolClass, Student, Submission, AppSettings, NotificationItem } from '../types';

export const initialClasses: SchoolClass[] = [
  { id: 'c-5-9', name: '5/9', grade: 5, academicYear: '2025-2026', studentCount: 8 },
  { id: 'c-5-1', name: '5/1', grade: 5, academicYear: '2025-2026', studentCount: 5 },
  { id: 'c-4-2', name: '4/2', grade: 4, academicYear: '2025-2026', studentCount: 4 }
];

export const initialStudents: Student[] = [
  { id: 'std-001', fullName: 'Nguyễn Văn An', studentCode: 'HS001', classId: 'c-5-9', className: '5/9', gender: 'nam', dob: '2015-03-12', parentPhone: '0912345671', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-002', fullName: 'Trần Thị Bình', studentCode: 'HS002', classId: 'c-5-9', className: '5/9', gender: 'nu', dob: '2015-07-24', parentPhone: '0912345672', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-003', fullName: 'Lê Văn Cường', studentCode: 'HS003', classId: 'c-5-9', className: '5/9', gender: 'nam', dob: '2015-11-05', parentPhone: '0912345673', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-004', fullName: 'Phạm Minh Đức', studentCode: 'HS004', classId: 'c-5-9', className: '5/9', gender: 'nam', dob: '2015-01-19', parentPhone: '0912345674', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-005', fullName: 'Hoàng Ngọc Hà', studentCode: 'HS005', classId: 'c-5-9', className: '5/9', gender: 'nu', dob: '2015-09-08', parentPhone: '0912345675', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-006', fullName: 'Đỗ Hải Yến', studentCode: 'HS006', classId: 'c-5-9', className: '5/9', gender: 'nu', dob: '2015-05-14', parentPhone: '0912345676', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-007', fullName: 'Vũ Quốc Huy', studentCode: 'HS007', classId: 'c-5-9', className: '5/9', gender: 'nam', dob: '2015-08-30', parentPhone: '0912345677', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-008', fullName: 'Bùi Mai Linh', studentCode: 'HS008', classId: 'c-5-9', className: '5/9', gender: 'nu', dob: '2015-12-02', parentPhone: '0912345678', status: 'active', createdAt: '2026-09-01' },
  
  // Class 5/1
  { id: 'std-101', fullName: 'Ngô Kiến Huy', studentCode: 'HS101', classId: 'c-5-1', className: '5/1', gender: 'nam', dob: '2015-04-11', parentPhone: '0912345681', status: 'active', createdAt: '2026-09-01' },
  { id: 'std-102', fullName: 'Phan Thùy Trang', studentCode: 'HS102', classId: 'c-5-1', className: '5/1', gender: 'nu', dob: '2015-06-21', parentPhone: '0912345682', status: 'active', createdAt: '2026-09-01' }
];

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-001',
    code: 'TOAN5-260919-A7K',
    title: 'Ôn tập Tuần 2: Hỗn số và Phân số thập phân',
    subject: 'Toán',
    classId: 'c-5-9',
    className: '5/9',
    teacherId: 'tch-001',
    teacherName: 'Thầy Huy',
    startDate: '2026-09-18T08:00',
    dueDate: '2026-09-25T20:00',
    durationMinutes: 30,
    maxAttempts: 2,
    showAnswer: true,
    autoGrade: true,
    targetAudience: 'all',
    createdAt: '2026-09-18T08:00',
    questions: [
      {
        id: 'q-1',
        type: 'single_choice',
        prompt: 'Hỗn số 3 2/5 được viết dưới dạng phân số là bao nhiêu?',
        options: ['17/5', '11/5', '15/5', '13/5'],
        correctAnswer: '17/5',
        explanation: 'Ta lấy phần nguyên nhân mẫu số cộng tử số: (3 × 5 + 2) / 5 = 17/5.',
        points: 1
      },
      {
        id: 'q-2',
        type: 'multiple_choice',
        prompt: 'Các phân số nào dưới đây là phân số thập phân? (Chọn tất cả đáp án đúng)',
        options: ['3/10', '15/100', '7/20', '49/1000'],
        correctAnswer: ['3/10', '15/100', '49/1000'],
        explanation: 'Phân số thập phân có mẫu số là 10, 100, 1000,... Do đó 3/10, 15/100, 49/1000 là đúng.',
        points: 1
      },
      {
        id: 'q-3',
        type: 'true_false',
        prompt: 'Phân số 1/4 có thể viết thành phân số thập phân có mẫu số là 100 đúng hay sai?',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Đúng',
        explanation: 'Nhân cả tử và mẫu với 25: 1/4 = 25/100 (Đúng).',
        points: 1
      },
      {
        id: 'q-4',
        type: 'fill_blank',
        prompt: 'Chuyển phân số 4/5 thành phân số thập phân có mẫu số là 10. Tử số mới là số nào?',
        correctAnswer: '8',
        explanation: 'Nhân cả tử và mẫu với 2: (4 × 2)/(5 × 2) = 8/10. Tử số là 8.',
        points: 1
      },
      {
        id: 'q-5',
        type: 'short_answer',
        prompt: 'Em hãy viết kết quả phép tính: 2 1/3 + 1 2/3 = ?',
        correctAnswer: '4',
        explanation: '2 1/3 + 1 2/3 = (2 + 1) + (1/3 + 2/3) = 3 + 1 = 4.',
        points: 1
      },
      {
        id: 'q-6',
        type: 'matching',
        prompt: 'Nối phân số với dạng thập phân tương ứng:',
        points: 1,
        matchingPairs: [
          { id: 'm-1', left: '1/2', right: '5/10' },
          { id: 'm-2', left: '3/4', right: '75/100' },
          { id: 'm-3', left: '1/5', right: '2/10' }
        ],
        explanation: '1/2 = 5/10; 3/4 = 75/100; 1/5 = 2/10.'
      },
      {
        id: 'q-7',
        type: 'reorder',
        prompt: 'Sắp xếp các phân số sau theo thứ tự từ bé đến lớn:',
        sequenceItems: ['1/10', '3/10', '7/10', '9/10'],
        correctAnswer: ['1/10', '3/10', '7/10', '9/10'],
        points: 1,
        explanation: 'Vì các phân số có cùng mẫu số là 10, phân số nào có tử bé hơn thì bé hơn.'
      },
      {
        id: 'q-8',
        type: 'image_question',
        prompt: 'Quan sát hình vẽ sau và cho biết phân số chỉ phần tô màu là bao nhiêu?',
        imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
        options: ['3/4', '1/2', '2/5', '5/8'],
        correctAnswer: '3/4',
        explanation: 'Hình được chia thành 4 phần bằng nhau, tô màu 3 phần => 3/4.',
        points: 1
      },
      {
        id: 'q-9',
        type: 'audio_question',
        prompt: 'Nghe phát âm và chọn số thập phân được đọc:',
        audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
        options: ['Số 0,5 (năm phần mười)', 'Số 0,25 (hai mươi lăm phần trăm)', 'Số 1,5', 'Số 3,14'],
        correctAnswer: 'Số 0,5 (năm phần mười)',
        explanation: 'Đoạn ghi âm phát âm rõ năm phần mười (0,5).',
        points: 1
      },
      {
        id: 'q-10',
        type: 'video_question',
        prompt: 'Xem đoạn video thí nghiệm toán học và trả lời: Phân số thập phân thường được ứng dụng nhiều nhất trong đo lường đơn vị nào?',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        options: ['Đo chiều dài và khối lượng (mét, kilôgam)', 'Đo số đếm học sinh', 'Đo ngày trong tuần', 'Không có ứng dụng'],
        correctAnswer: 'Đo chiều dài và khối lượng (mét, kilôgam)',
        explanation: '1dm = 1/10m, 1cm = 1/100m, 1g = 1/1000kg là các phân số thập phân thông dụng.',
        points: 1
      }
    ]
  },
  {
    id: 'asg-002',
    code: 'KH5-260921-C9X',
    title: 'Khoa học – Ôn tập về chất và năng lượng',
    subject: 'Khoa học',
    classId: 'c-5-9',
    className: '5/9',
    teacherId: 'tch-001',
    teacherName: 'Thầy Huy',
    startDate: '2026-09-19T07:00',
    dueDate: '2026-09-20T20:00',
    durationMinutes: 20,
    maxAttempts: 1,
    showAnswer: false,
    autoGrade: true,
    targetAudience: 'all',
    createdAt: '2026-09-19T07:00',
    questions: [
      {
        id: 'kq-1',
        type: 'single_choice',
        prompt: 'Vật nào sau đây dẫn điện tốt nhất?',
        options: ['Dây đồng', 'Thước nhựa', 'Que gỗ khô', 'Thủy tinh'],
        correctAnswer: 'Dây đồng',
        explanation: 'Đồng là kim loại dẫn điện rất tốt.',
        points: 5
      },
      {
        id: 'kq-2',
        type: 'true_false',
        prompt: 'Nước đá khi tan chảy chuyển từ thể rắn sang thể lỏng là biến đổi hóa học đúng hay sai?',
        options: ['Đúng', 'Sai'],
        correctAnswer: 'Sai',
        explanation: 'Đó chỉ là sự biến đổi lý học (thay đổi trạng thái), không tạo chất mới.',
        points: 5
      }
    ]
  },
  {
    id: 'asg-003',
    code: 'TV5-260920-B3M',
    title: 'Tiếng Việt – Luyện từ và câu: Từ đồng nghĩa, Trái nghĩa',
    subject: 'Tiếng Việt',
    classId: 'c-5-9',
    className: '5/9',
    teacherId: 'tch-001',
    teacherName: 'Thầy Huy',
    startDate: '2026-09-15T08:00',
    dueDate: '2026-09-18T18:00',
    durationMinutes: 25,
    maxAttempts: 1,
    showAnswer: true,
    autoGrade: true,
    targetAudience: 'all',
    createdAt: '2026-09-15T08:00',
    questions: [
      {
        id: 'tv-1',
        type: 'single_choice',
        prompt: 'Từ nào đồng nghĩa với từ "bao la"?',
        options: ['Mênh mông', 'Chật hẹp', 'Thanh bình', 'Vắng vẻ'],
        correctAnswer: 'Mênh mông',
        explanation: 'Bao la và mênh mông đều chỉ không gian rộng lớn không cùng.',
        points: 5
      },
      {
        id: 'tv-2',
        type: 'matching',
        prompt: 'Ghép cặp từ trái nghĩa:',
        matchingPairs: [
          { id: 'm-1', left: 'Siêng năng', right: 'Lười biếng' },
          { id: 'm-2', left: 'Dũng cảm', right: 'Hèn nhát' },
          { id: 'm-3', left: 'Thật thà', right: 'Gian dối' }
        ],
        points: 5,
        explanation: 'Cặp từ trái nghĩa biểu thị ý nghĩa tương phản.'
      }
    ]
  }
];

export const initialSubmissions: Submission[] = [
  {
    id: 'sub-001',
    assignmentId: 'asg-001',
    assignmentCode: 'TOAN5-260919-A7K',
    assignmentTitle: 'Ôn tập Tuần 2: Hỗn số và Phân số thập phân',
    subject: 'Toán',
    studentId: 'std-001',
    studentName: 'Nguyễn Văn An',
    studentCode: 'HS001',
    className: '5/9',
    startedAt: '2026-09-19T14:00:00',
    submittedAt: '2026-09-19T14:12:35',
    lastSavedAt: '2026-09-19T14:12:35',
    durationSeconds: 755, // 12m 35s
    status: 'submitted',
    score: 9.0,
    correctCount: 9,
    totalQuestions: 10,
    attemptNumber: 1,
    evaluation: 'excellent',
    answers: {
      'q-1': '17/5',
      'q-2': ['3/10', '15/100', '49/1000'],
      'q-3': 'Đúng',
      'q-4': '8',
      'q-5': '4',
      'q-6': { '1/2': '5/10', '3/4': '75/100', '1/5': '2/10' },
      'q-7': ['1/10', '3/10', '7/10', '9/10'],
      'q-8': '3/4',
      'q-9': 'Số 0,5 (năm phần mười)',
      'q-10': 'Đo chiều dài và khối lượng (mét, kilôgam)'
    }
  },
  {
    id: 'sub-002',
    assignmentId: 'asg-001',
    assignmentCode: 'TOAN5-260919-A7K',
    assignmentTitle: 'Ôn tập Tuần 2: Hỗn số và Phân số thập phân',
    subject: 'Toán',
    studentId: 'std-002',
    studentName: 'Trần Thị Bình',
    studentCode: 'HS002',
    className: '5/9',
    startedAt: '2026-09-19T15:00:00',
    submittedAt: '2026-09-19T15:15:20',
    lastSavedAt: '2026-09-19T15:15:20',
    durationSeconds: 920, // 15m 20s
    status: 'submitted',
    score: 8.5,
    correctCount: 8,
    totalQuestions: 10,
    attemptNumber: 1,
    evaluation: 'excellent',
    answers: {
      'q-1': '17/5',
      'q-2': ['3/10', '15/100'],
      'q-3': 'Đúng',
      'q-4': '8',
      'q-5': '4',
      'q-6': { '1/2': '5/10', '3/4': '75/100', '1/5': '2/10' },
      'q-7': ['1/10', '3/10', '7/10', '9/10'],
      'q-8': '3/4',
      'q-9': 'Số 0,5 (năm phần mười)'
    }
  },
  {
    id: 'sub-003',
    assignmentId: 'asg-001',
    assignmentCode: 'TOAN5-260919-A7K',
    assignmentTitle: 'Ôn tập Tuần 2: Hỗn số và Phân số thập phân',
    subject: 'Toán',
    studentId: 'std-004',
    studentName: 'Phạm Minh Đức',
    studentCode: 'HS004',
    className: '5/9',
    startedAt: '2026-09-19T16:00:00',
    submittedAt: '2026-09-19T16:22:10',
    lastSavedAt: '2026-09-19T16:22:10',
    durationSeconds: 1330,
    status: 'submitted',
    score: 6.0,
    correctCount: 6,
    totalQuestions: 10,
    attemptNumber: 1,
    evaluation: 'completed',
    answers: {
      'q-1': '17/5',
      'q-2': ['3/10'],
      'q-3': 'Đúng',
      'q-4': '8'
    }
  },
  {
    id: 'sub-004',
    assignmentId: 'asg-001',
    assignmentCode: 'TOAN5-260919-A7K',
    assignmentTitle: 'Ôn tập Tuần 2: Hỗn số và Phân số thập phân',
    subject: 'Toán',
    studentId: 'std-005',
    studentName: 'Hoàng Ngọc Hà',
    studentCode: 'HS005',
    className: '5/9',
    startedAt: '2026-09-19T17:00:00',
    lastSavedAt: '2026-09-19T17:10:00',
    durationSeconds: 600,
    status: 'in_progress',
    totalQuestions: 10,
    attemptNumber: 1,
    answers: {
      'q-1': '17/5',
      'q-2': ['3/10', '15/100', '49/1000']
    }
  },
  {
    id: 'sub-005',
    assignmentId: 'asg-003',
    assignmentCode: 'TV5-260920-B3M',
    assignmentTitle: 'Tiếng Việt – Luyện từ và câu: Từ đồng nghĩa, Trái nghĩa',
    subject: 'Tiếng Việt',
    studentId: 'std-001',
    studentName: 'Nguyễn Văn An',
    studentCode: 'HS001',
    className: '5/9',
    startedAt: '2026-09-17T19:00:00',
    submittedAt: '2026-09-17T19:14:00',
    lastSavedAt: '2026-09-17T19:14:00',
    durationSeconds: 840,
    status: 'submitted',
    score: 10.0,
    correctCount: 2,
    totalQuestions: 2,
    attemptNumber: 1,
    evaluation: 'excellent',
    answers: {
      'tv-1': 'Mênh mông',
      'tv-2': { 'Siêng năng': 'Lười biếng', 'Dũng cảm': 'Hèn nhát', 'Thật thà': 'Gian dối' }
    }
  },
  {
    id: 'sub-006',
    assignmentId: 'asg-003',
    assignmentCode: 'TV5-260920-B3M',
    assignmentTitle: 'Tiếng Việt – Luyện từ và câu: Từ đồng nghĩa, Trái nghĩa',
    subject: 'Tiếng Việt',
    studentId: 'std-007',
    studentName: 'Vũ Quốc Huy',
    studentCode: 'HS007',
    className: '5/9',
    startedAt: '2026-09-18T21:00:00',
    submittedAt: '2026-09-18T21:20:00',
    lastSavedAt: '2026-09-18T21:20:00',
    durationSeconds: 1200,
    status: 'late', // Late submission!
    score: 4.0,
    correctCount: 1,
    totalQuestions: 2,
    attemptNumber: 1,
    evaluation: 'need_effort',
    answers: {
      'tv-1': 'Mênh mông'
    }
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-001',
    targetClassId: 'c-5-9',
    title: 'Bài tập mới từ Thầy Huy',
    message: 'Thầy Huy vừa giao bài mới: "Khoa học – Ôn tập về chất và năng lượng"',
    type: 'new_assignment',
    assignmentId: 'asg-002',
    assignmentCode: 'KH5-260921-C9X',
    createdAt: '2026-09-19T07:00:00',
    read: false
  },
  {
    id: 'notif-002',
    targetClassId: 'c-5-9',
    title: 'Sắp hết hạn nộp bài',
    message: 'Bài tập "Khoa học – Ôn tập về chất và năng lượng" sắp hết hạn vào 20:00 ngày mai!',
    type: 'due_soon',
    assignmentId: 'asg-002',
    assignmentCode: 'KH5-260921-C9X',
    createdAt: '2026-09-19T10:00:00',
    read: false
  }
];

export const initialSettings: AppSettings = {
  teacherName: 'Thầy Huy',
  teacherEmail: 'dhhuy25@gmail.com',
  schoolName: 'Trường Tiểu Học Chu Văn An',
  gradeThresholds: {
    needEffortMax: 4.9,
    completedMax: 7.9,
    excellentMin: 8.0
  },
  allowStudentViewLeaderboard: false,
  useFirebase: false
};
