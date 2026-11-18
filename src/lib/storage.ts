import { Subject, Note, TimetableClass, Task, Exam, FocusSession, Flashcard, UserProfile } from '../types';

export interface StudyOSData {
  profile: UserProfile;
  subjects: Subject[];
  notes: Note[];
  timetable: TimetableClass[];
  tasks: Task[];
  exams: Exam[];
  focusSessions: FocusSession[];
  flashcards: Flashcard[];
  apiKey?: string;
  theme: 'dark' | 'light';
}

const STORAGE_KEY = 'studyos_data_v1';

export const INITIAL_DATA: StudyOSData = {
  profile: {
    id: 'user_default',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    university: 'Stanford University',
    major: 'Computer Science & Engineering',
    semester: 'Semester 5 (Fall 2026)',
    targetGpa: '3.92',
    studyGoalMinutesPerDay: 180, // 3 hours
    streak: 14,
    lastActiveDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  subjects: [
    {
      id: 'sub_cs301',
      code: 'CS 301',
      name: 'Algorithms & Data Structures',
      color: '#0071E3', // Apple Blue
      semester: 'Semester 5 (Fall 2026)',
      faculty: 'Prof. David Karger',
      room: 'Gates Hall 104',
      credits: 4,
      description: 'Design and analysis of efficient algorithms, dynamic programming, graph algorithms, and NP-completeness.',
      targetGrade: 'A',
      syllabusTopics: [
        { id: 'top_1', title: 'Divide and Conquer: Master Theorem', completed: true },
        { id: 'top_2', title: 'Dynamic Programming: Knapsack & Edit Distance', completed: true },
        { id: 'top_3', title: 'Graph Algorithms: Dijkstra & A* Search', completed: true },
        { id: 'top_4', title: 'Maximum Flow & Min-Cut Theorem', completed: false },
        { id: 'top_5', title: 'NP-Completeness & Reductions', completed: false },
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'sub_cs340',
      code: 'CS 340',
      name: 'Operating Systems & Concurrency',
      color: '#F472B6', // Light Blush Pink
      semester: 'Semester 5 (Fall 2026)',
      faculty: 'Dr. Sarah Chen',
      room: 'Hewlett 200',
      credits: 4,
      description: 'Kernel architecture, virtual memory, threads, synchronization primitives, file systems, and distributed OS.',
      targetGrade: 'A-',
      syllabusTopics: [
        { id: 'top_6', title: 'Process Lifecycle & Context Switching', completed: true },
        { id: 'top_7', title: 'Mutexes, Semaphores & Deadlock Avoidance', completed: true },
        { id: 'top_8', title: 'Virtual Memory & Page Replacement', completed: false },
        { id: 'top_9', title: 'File System Inodes & Journaling', completed: false },
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'sub_math250',
      code: 'MATH 250',
      name: 'Linear Algebra & Matrix Analysis',
      color: '#DEC5A6', // Warm Creme
      semester: 'Semester 5 (Fall 2026)',
      faculty: 'Prof. Marcus Vance',
      room: 'Math Corner 380',
      credits: 3,
      description: 'Vector spaces, linear transformations, eigenvalues, singular value decomposition (SVD), and applications in ML.',
      targetGrade: 'A+',
      syllabusTopics: [
        { id: 'top_10', title: 'Vector Spaces & Subspaces', completed: true },
        { id: 'top_11', title: 'Orthogonality & Gram-Schmidt Process', completed: true },
        { id: 'top_12', title: 'Eigenvalues & Diagonalization', completed: true },
        { id: 'top_13', title: 'Singular Value Decomposition (SVD)', completed: false },
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'sub_phys210',
      code: 'PHYS 210',
      name: 'Electromagnetism & Waves',
      color: '#38BDF8', // Apple Sky Azure
      semester: 'Semester 5 (Fall 2026)',
      faculty: 'Dr. Elena Rostova',
      room: 'Varian Physics 108',
      credits: 3,
      description: 'Electric fields, Gauss Law, magnetic induction, Maxwell equations, and electromagnetic wave propagation.',
      targetGrade: 'B+',
      syllabusTopics: [
        { id: 'top_14', title: 'Coulomb Law & Electric Potential', completed: true },
        { id: 'top_15', title: 'Gauss Law & Dielectrics', completed: true },
        { id: 'top_16', title: 'Biot-Savart Law & Ampere Law', completed: false },
        { id: 'top_17', title: 'Faraday Law of Induction', completed: false },
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ],
  timetable: [
    {
      id: 'tt_1',
      subjectId: 'sub_cs301',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'Gates Hall 104',
      faculty: 'Prof. David Karger',
      type: 'Lecture',
    },
    {
      id: 'tt_2',
      subjectId: 'sub_cs340',
      day: 'Monday',
      startTime: '11:00',
      endTime: '12:30',
      room: 'Hewlett 200',
      faculty: 'Dr. Sarah Chen',
      type: 'Lecture',
    },
    {
      id: 'tt_3',
      subjectId: 'sub_math250',
      day: 'Monday',
      startTime: '14:00',
      endTime: '15:15',
      room: 'Math Corner 380',
      faculty: 'Prof. Marcus Vance',
      type: 'Lecture',
    },
    {
      id: 'tt_4',
      subjectId: 'sub_cs301',
      day: 'Tuesday',
      startTime: '10:00',
      endTime: '12:00',
      room: 'Gates B02',
      faculty: 'TA Alex M.',
      type: 'Lab',
    },
    {
      id: 'tt_5',
      subjectId: 'sub_phys210',
      day: 'Tuesday',
      startTime: '13:30',
      endTime: '15:00',
      room: 'Varian 108',
      faculty: 'Dr. Elena Rostova',
      type: 'Lecture',
    },
    {
      id: 'tt_6',
      subjectId: 'sub_cs340',
      day: 'Wednesday',
      startTime: '09:00',
      endTime: '11:00',
      room: 'Packard Lab 102',
      faculty: 'Dr. Sarah Chen',
      type: 'Lab',
    },
    {
      id: 'tt_7',
      subjectId: 'sub_math250',
      day: 'Wednesday',
      startTime: '14:00',
      endTime: '15:15',
      room: 'Math Corner 380',
      faculty: 'Prof. Marcus Vance',
      type: 'Lecture',
    },
    {
      id: 'tt_8',
      subjectId: 'sub_cs301',
      day: 'Thursday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'Gates Hall 104',
      faculty: 'Prof. David Karger',
      type: 'Lecture',
    },
    {
      id: 'tt_9',
      subjectId: 'sub_phys210',
      day: 'Thursday',
      startTime: '13:30',
      endTime: '15:00',
      room: 'Varian 108',
      faculty: 'Dr. Elena Rostova',
      type: 'Lecture',
    },
    {
      id: 'tt_10',
      subjectId: 'sub_cs340',
      day: 'Friday',
      startTime: '11:00',
      endTime: '12:30',
      room: 'Hewlett 200',
      faculty: 'Dr. Sarah Chen',
      type: 'Lecture',
    },
  ],
  tasks: [
    {
      id: 'task_1',
      title: 'Implement Ford-Fulkerson Max Flow Algorithm',
      description: 'Implement Edmonds-Karp with BFS augmenting paths. Include benchmark tests comparing adjacency matrix vs list.',
      subjectId: 'sub_cs301',
      category: 'assignment',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days
      estimatedMinutes: 120,
      subtasks: [
        { id: 'st_1', title: 'Write Residual Graph data structure', completed: true },
        { id: 'st_2', title: 'Implement BFS augmenting path finder', completed: true },
        { id: 'st_3', title: 'Add capacity bottleneck tracking', completed: false },
        { id: 'st_4', title: 'Generate benchmark plots', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'task_2',
      title: 'Problem Set 4: Multi-Threaded Cache Simulator',
      description: 'Simulate LRU and FIFO cache coherence policies with pthread synchronization locks.',
      subjectId: 'sub_cs340',
      category: 'homework',
      priority: 'high',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], // 4 days
      estimatedMinutes: 90,
      subtasks: [
        { id: 'st_5', title: 'Read Assignment Spec and header files', completed: true },
        { id: 'st_6', title: 'Implement LRU linked list queue', completed: false },
        { id: 'st_7', title: 'Add thread-safe mutex protections', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'task_3',
      title: 'Linear Algebra SVD Theorem Proof Writeup',
      description: 'Complete formal proof of the Spectral Theorem and write orthogonal matrix transformation summary.',
      subjectId: 'sub_math250',
      category: 'homework',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
      estimatedMinutes: 60,
      subtasks: [
        { id: 'st_8', title: 'Section 6.3 problem 12-18', completed: false },
        { id: 'st_9', title: 'LaTeX formatting and export', completed: false },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'task_4',
      title: 'Electromagnetism Lab Report #3: Faraday Induction',
      description: 'Calculate induced EMF from solenoid oscillation data and analyze experimental error percentages.',
      subjectId: 'sub_phys210',
      category: 'project',
      priority: 'low',
      status: 'completed',
      dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      estimatedMinutes: 75,
      subtasks: [
        { id: 'st_10', title: 'Import oscilloscope CSV data', completed: true },
        { id: 'st_11', title: 'Plot peak amplitude vs frequency', completed: true },
        { id: 'st_12', title: 'Submit PDF to Canvas', completed: true },
      ],
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ],
  notes: [
    {
      id: 'note_1',
      title: 'Dynamic Programming Patterns & Memoization Recipes',
      subjectId: 'sub_cs301',
      tags: ['Algorithms', 'CheatSheet', 'InterviewPrep'],
      pinned: true,
      folder: 'Lectures',
      content: `# Dynamic Programming Master Patterns

Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems and optimal substructures.

### 1. The 5-Step Framework
1. **Define the State**: What variables fully describe a subproblem? (e.g., \`dp[i][j]\`)
2. **Base Cases**: What are the trivial smallest inputs?
3. **State Transition**: How does \`dp[i]\` relate to previous states?
4. **Order of Computation**: Bottom-up (iterative) vs Top-down (memoization).
5. **Extract the Answer**: Is it at \`dp[n]\`, or the maximum in the array?

### Common Problem Archetypes
- **0/1 Knapsack**: Pick or skip each item.
- **Unbounded Knapsack**: Infinite copies permitted (Coin Change).
- **Longest Common Subsequence (LCS)**: 2D grid matrix comparison.
- **Interval DP**: Matrix chain multiplication.

> **Key Takeaway**: Always draw the state transition DAG (directed acyclic graph) before writing code.`,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'note_2',
      title: 'Virtual Memory & Page Table Translation Notes',
      subjectId: 'sub_cs340',
      tags: ['OperatingSystems', 'Hardware', 'Memory'],
      pinned: true,
      folder: 'Lectures',
      content: `# Virtual Memory Architecture

Virtual Memory decouples physical DRAM from the process address space.

## Key Hardware Components
- **MMU (Memory Management Unit)**: Translates virtual addresses to physical addresses at hardware speed.
- **TLB (Translation Lookaside Buffer)**: High-speed associative cache holding recent translations.
  - TLB Hit: ~1 cycle latency.
  - TLB Miss: Memory walk through multi-level page table (~50-100 cycles).

## Multi-Level Paging (x86-64)
- 48-bit canonical virtual address.
- 4-level hierarchy: PML4 -> PDPT -> PD -> PT -> Physical Frame.
- Saves massive physical RAM compared to a flat page table.`,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'note_3',
      title: 'Singular Value Decomposition (SVD) Intuition & Proof',
      subjectId: 'sub_math250',
      tags: ['LinearAlgebra', 'MachineLearning', 'Theory'],
      pinned: false,
      folder: 'Revision',
      content: `# SVD: The Fundamental Matrix Factorization

Every real $m \\times n$ matrix $A$ can be decomposed as:

$$A = U \\Sigma V^T$$

Where:
- $U$ is an $m \\times m$ orthogonal matrix (eigenvectors of $AA^T$).
- $\\Sigma$ is an $m \\times n$ diagonal matrix of singular values $\\sigma_i = \\sqrt{\\lambda_i}$.
- $V^T$ is an $n \\times n$ orthogonal matrix (eigenvectors of $A^T A$).

### Geometric Interpretation
1. Rotate the space using $V^T$.
2. Stretch along coordinate axes by singular values in $\\Sigma$.
3. Rotate to the target space with $U$.`,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  exams: [
    {
      id: 'exam_1',
      subjectId: 'sub_cs301',
      title: 'CS 301 Midterm Examination',
      date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0], // In 8 days
      startTime: '10:00',
      durationMinutes: 120,
      room: 'Hewlett Auditorium 200',
      weightagePercent: 30,
      targetScore: 92,
      topics: [
        { id: 'et_1', name: 'Master Theorem & Recurrences', status: 'mastered' },
        { id: 'et_2', name: 'Dynamic Programming (Knapsack, LCS)', status: 'mastered' },
        { id: 'et_3', name: 'Shortest Path: Dijkstra & Bellman-Ford', status: 'reviewing' },
        { id: 'et_4', name: 'Ford-Fulkerson & Max-Flow Min-Cut', status: 'not_started' },
        { id: 'et_5', name: 'Disjoint-Set Union (Union Find)', status: 'mastered' },
      ],
      notes: 'Cheat sheet allowed: 1 page double-sided handwritten. No calculator.',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'exam_2',
      subjectId: 'sub_cs340',
      title: 'CS 340 Midterm: Concurrency & Virtual Memory',
      date: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0], // In 15 days
      startTime: '14:00',
      durationMinutes: 90,
      room: 'Gates B01',
      weightagePercent: 25,
      targetScore: 88,
      topics: [
        { id: 'et_6', name: 'Processes, Threads, and Fork semantics', status: 'mastered' },
        { id: 'et_7', name: 'Synchronization: Mutex, Condition Variables', status: 'reviewing' },
        { id: 'et_8', name: 'Deadlock: Coffman conditions & Banker Algo', status: 'reviewing' },
        { id: 'et_9', name: 'Page Tables, TLB, Page Fault Handler', status: 'not_started' },
      ],
      notes: 'Closed book. Focus on race condition debugging scenarios.',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'exam_3',
      subjectId: 'sub_math250',
      title: 'MATH 250 Midterm Exam',
      date: new Date(Date.now() + 86400000 * 22).toISOString().split('T')[0], // In 22 days
      startTime: '09:00',
      durationMinutes: 110,
      room: 'Math Building 380',
      weightagePercent: 35,
      targetScore: 95,
      topics: [
        { id: 'et_10', name: 'Basis, Dimension, Null Space & Column Space', status: 'mastered' },
        { id: 'et_11', name: 'Eigenvalues & Characteristic Polynomial', status: 'reviewing' },
        { id: 'et_12', name: 'Orthogonal Projection & Gram-Schmidt', status: 'mastered' },
        { id: 'et_13', name: 'SVD & Pseudoinverse', status: 'not_started' },
      ],
      notes: 'Formula sheet will be provided by instructor.',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ],
  focusSessions: [
    {
      id: 'fs_1',
      durationMinutes: 25,
      type: 'pomodoro',
      subjectId: 'sub_cs301',
      taskId: 'task_1',
      notes: 'Implemented Edmonds-Karp BFS search loop.',
      completedAt: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'fs_2',
      durationMinutes: 25,
      type: 'pomodoro',
      subjectId: 'sub_cs301',
      taskId: 'task_1',
      notes: 'Added residual matrix update and testing.',
      completedAt: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'fs_3',
      durationMinutes: 50,
      type: 'custom',
      subjectId: 'sub_cs340',
      taskId: 'task_2',
      notes: 'Studied lock-free queues and atomic instructions.',
      completedAt: new Date(Date.now() - 86400000 + 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: 'fs_4',
      durationMinutes: 25,
      type: 'pomodoro',
      subjectId: 'sub_math250',
      notes: 'Practiced Gram-Schmidt orthogonalization homework.',
      completedAt: new Date().toISOString(),
    },
  ],
  flashcards: [
    {
      id: 'fc_1',
      subjectId: 'sub_cs301',
      front: 'What is the time complexity of the Edmonds-Karp algorithm for Maximum Flow?',
      back: 'O(V * E^2). It uses BFS to find the shortest augmenting path in terms of edge count.',
      mastery: 'good',
      reviewCount: 4,
      lastReviewed: new Date().toISOString(),
    },
    {
      id: 'fc_2',
      subjectId: 'sub_cs340',
      front: 'What are the 4 Coffman conditions required for Deadlock to occur?',
      back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
      mastery: 'mastered' as unknown as 'easy',
      reviewCount: 6,
      lastReviewed: new Date().toISOString(),
    },
    {
      id: 'fc_3',
      subjectId: 'sub_math250',
      front: 'If matrix A is symmetric (A = A^T), what does the Spectral Theorem guarantee?',
      back: 'All eigenvalues of A are real, and eigenvectors corresponding to distinct eigenvalues are mutually orthogonal. A can be orthogonally diagonalized: A = Q Λ Q^T.',
      mastery: 'good',
      reviewCount: 3,
      lastReviewed: new Date().toISOString(),
    },
    {
      id: 'fc_4',
      subjectId: 'sub_phys210',
      front: 'State Faraday’s Law of Electromagnetic Induction.',
      back: 'The induced electromotive force (EMF) in any closed circuit is equal to the negative rate of change of magnetic flux through the circuit: ε = -dΦ_B / dt.',
      mastery: 'hard',
      reviewCount: 2,
      lastReviewed: new Date().toISOString(),
    },
  ],
  theme: 'dark',
};

export class StorageService {
  static loadData(): StudyOSData {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        this.saveData(INITIAL_DATA);
        return INITIAL_DATA;
      }
      const parsed = JSON.parse(serialized);
      // Ensure merged with defaults in case of missing keys
      return {
        ...INITIAL_DATA,
        ...parsed,
        profile: { ...INITIAL_DATA.profile, ...(parsed.profile || {}) },
        subjects: parsed.subjects || INITIAL_DATA.subjects,
        notes: parsed.notes || INITIAL_DATA.notes,
        timetable: parsed.timetable || INITIAL_DATA.timetable,
        tasks: parsed.tasks || INITIAL_DATA.tasks,
        exams: parsed.exams || INITIAL_DATA.exams,
        focusSessions: parsed.focusSessions || INITIAL_DATA.focusSessions,
        flashcards: parsed.flashcards || INITIAL_DATA.flashcards,
      };
    } catch (e) {
      console.error('Failed to load StudyOS data from storage, resetting to default', e);
      return INITIAL_DATA;
    }
  }

  static saveData(data: StudyOSData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save StudyOS data', e);
    }
  }

  static exportToJson(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  }

  static importFromJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.subjects) {
        throw new Error('Invalid StudyOS backup format');
      }
      this.saveData(parsed);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  }

  static resetToDefault(): StudyOSData {
    this.saveData(INITIAL_DATA);
    return INITIAL_DATA;
  }
}
