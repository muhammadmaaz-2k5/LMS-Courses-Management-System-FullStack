import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

// ── Sample Data ──────────────────────────────────────────────

const users = [
  {
    id: 'user_educator1',
    name: 'Muhammad Maaz',
    email: 'maaz@maazlms.com',
    image_url: 'https://ui-avatars.com/api/?name=MM&background=16a34a&color=fff&size=200',
    enrolled_courses: []
  },
  {
    id: 'user_educator2',
    name: 'Sarah Johnson',
    email: 'sarah@maazlms.com',
    image_url: 'https://ui-avatars.com/api/?name=SJ&background=2563eb&color=fff&size=200',
    enrolled_courses: []
  },
  {
    id: 'user_student1',
    name: 'Alex Miller',
    email: 'alex@student.com',
    image_url: 'https://ui-avatars.com/api/?name=AM&background=f59e0b&color=fff&size=200',
    enrolled_courses: []
  },
  {
    id: 'user_student2',
    name: 'Emma Wilson',
    email: 'emma@student.com',
    image_url: 'https://ui-avatars.com/api/?name=EW&background=ec4899&color=fff&size=200',
    enrolled_courses: []
  },
  {
    id: 'user_student3',
    name: 'James Chen',
    email: 'james@student.com',
    image_url: 'https://ui-avatars.com/api/?name=JC&background=8b5cf6&color=fff&size=200',
    enrolled_courses: []
  }
]

const courses = [
  {
    course_title: 'Complete Web Development Bootcamp',
    course_description: 'Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects from scratch. This comprehensive course covers everything you need to become a full-stack web developer.',
    course_thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    course_price: 89.99,
    is_published: true,
    discount: 20,
    educator: 'user_educator1',
    enrolled_students: ['user_student1', 'user_student2'],
    course_ratings: [
      { userId: 'user_student1', rating: 5 },
      { userId: 'user_student2', rating: 4 }
    ],
    course_content: [
      {
        chapterId: 'ch_1',
        chapterOrder: 1,
        chapterTitle: 'Getting Started with HTML',
        chapterContent: [
          {
            lectureId: 'lec_1_1',
            lectureTitle: 'Introduction to HTML',
            lectureDuration: 15,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 1
          },
          {
            lectureId: 'lec_1_2',
            lectureTitle: 'HTML Document Structure',
            lectureDuration: 20,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 2
          },
          {
            lectureId: 'lec_1_3',
            lectureTitle: 'Forms and Input Elements',
            lectureDuration: 25,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: false,
            lectureOrder: 3
          }
        ]
      },
      {
        chapterId: 'ch_2',
        chapterOrder: 2,
        chapterTitle: 'CSS Fundamentals',
        chapterContent: [
          {
            lectureId: 'lec_2_1',
            lectureTitle: 'CSS Selectors and Properties',
            lectureDuration: 22,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 1
          },
          {
            lectureId: 'lec_2_2',
            lectureTitle: 'Flexbox and Grid Layout',
            lectureDuration: 30,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: false,
            lectureOrder: 2
          }
        ]
      },
      {
        chapterId: 'ch_3',
        chapterOrder: 3,
        chapterTitle: 'JavaScript Essentials',
        chapterContent: [
          {
            lectureId: 'lec_3_1',
            lectureTitle: 'Variables and Data Types',
            lectureDuration: 18,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 1
          },
          {
            lectureId: 'lec_3_2',
            lectureTitle: 'Functions and Scope',
            lectureDuration: 25,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: false,
            lectureOrder: 2
          },
          {
            lectureId: 'lec_3_3',
            lectureTitle: 'DOM Manipulation',
            lectureDuration: 28,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: false,
            lectureOrder: 3
          }
        ]
      }
    ]
  },
  {
    course_title: 'React & Next.js Masterclass',
    course_description: 'Master React 19 and Next.js 15. Build production-ready applications with Server Components, Server Actions, and the App Router. Deploy to Vercel.',
    course_thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    course_price: 99.99,
    is_published: true,
    discount: 15,
    educator: 'user_educator1',
    enrolled_students: ['user_student1', 'user_student3'],
    course_ratings: [
      { userId: 'user_student1', rating: 5 },
      { userId: 'user_student3', rating: 5 }
    ],
    course_content: [
      {
        chapterId: 'ch_r1',
        chapterOrder: 1,
        chapterTitle: 'React Fundamentals',
        chapterContent: [
          {
            lectureId: 'lec_r1_1',
            lectureTitle: 'JSX and Components',
            lectureDuration: 20,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 1
          },
          {
            lectureId: 'lec_r1_2',
            lectureTitle: 'Props and State',
            lectureDuration: 25,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 2
          }
        ]
      },
      {
        chapterId: 'ch_r2',
        chapterOrder: 2,
        chapterTitle: 'Next.js App Router',
        chapterContent: [
          {
            lectureId: 'lec_r2_1',
            lectureTitle: 'File-based Routing',
            lectureDuration: 22,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: false,
            lectureOrder: 1
          },
          {
            lectureId: 'lec_r2_2',
            lectureTitle: 'Server Components',
            lectureDuration: 28,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: false,
            lectureOrder: 2
          }
        ]
      }
    ]
  },
  {
    course_title: 'Python for Data Science & AI',
    course_description: 'Learn Python, NumPy, Pandas, Matplotlib, Scikit-learn, and TensorFlow. Build machine learning models and neural networks from scratch.',
    course_thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    course_price: 79.99,
    is_published: true,
    discount: 25,
    educator: 'user_educator2',
    enrolled_students: ['user_student2', 'user_student3'],
    course_ratings: [
      { userId: 'user_student2', rating: 4 },
      { userId: 'user_student3', rating: 5 }
    ],
    course_content: [
      {
        chapterId: 'ch_p1',
        chapterOrder: 1,
        chapterTitle: 'Python Basics',
        chapterContent: [
          {
            lectureId: 'lec_p1_1',
            lectureTitle: 'Setting Up Python',
            lectureDuration: 12,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 1
          },
          {
            lectureId: 'lec_p1_2',
            lectureTitle: 'Variables and Control Flow',
            lectureDuration: 20,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 2
          }
        ]
      },
      {
        chapterId: 'ch_p2',
        chapterOrder: 2,
        chapterTitle: 'Data Analysis with Pandas',
        chapterContent: [
          {
            lectureId: 'lec_p2_1',
            lectureTitle: 'DataFrames and Series',
            lectureDuration: 25,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: false,
            lectureOrder: 1
          }
        ]
      }
    ]
  },
  {
    course_title: 'UI/UX Design with Figma',
    course_description: 'Learn modern UI/UX design principles, create stunning interfaces in Figma, build design systems, and create professional portfolios.',
    course_thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    course_price: 69.99,
    is_published: true,
    discount: 10,
    educator: 'user_educator2',
    enrolled_students: [],
    course_ratings: [],
    course_content: [
      {
        chapterId: 'ch_u1',
        chapterOrder: 1,
        chapterTitle: 'Design Principles',
        chapterContent: [
          {
            lectureId: 'lec_u1_1',
            lectureTitle: 'Color Theory',
            lectureDuration: 18,
            lectureUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isPreviewFree: true,
            lectureOrder: 1
          }
        ]
      }
    ]
  }
]

// ── Seed Functions ──────────────────────────────────────────

async function seedUsers() {
  console.log('\nSeeding users...')
  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' })

    if (error) {
      console.log(`  ✗ ${user.name}: ${error.message}`)
    } else {
      console.log(`  ✓ ${user.name} (${user.id})`)
    }
  }
}

async function seedCourses() {
  console.log('\nSeeding courses...')
  for (const course of courses) {
    const { error } = await supabase
      .from('courses')
      .upsert(course, { onConflict: 'id' })

    if (error) {
      console.log(`  ✗ ${course.course_title}: ${error.message}`)
    } else {
      console.log(`  ✓ ${course.course_title}`)
    }
  }
}

async function seedPurchases() {
  console.log('\nSeeding purchases...')

  const purchases = [
    {
      course_id: null, // Will be filled after courses are seeded
      user_id: 'user_student1',
      amount: 71.99,
      status: 'completed'
    },
    {
      course_id: null,
      user_id: 'user_student2',
      amount: 71.99,
      status: 'completed'
    },
    {
      course_id: null,
      user_id: 'user_student1',
      amount: 84.99,
      status: 'completed'
    }
  ]

  // Get course IDs
  const { data: courseRows } = await supabase
    .from('courses')
    .select('id, course_title')
    .order('created_at')

  if (!courseRows || courseRows.length < 2) {
    console.log('  ⚠ Need at least 2 courses for purchases')
    return
  }

  purchases[0].course_id = courseRows[0].id
  purchases[1].course_id = courseRows[0].id
  purchases[2].course_id = courseRows[1].id

  for (const purchase of purchases) {
    const { error } = await supabase
      .from('purchases')
      .insert(purchase)

    if (error) {
      console.log(`  ✗ Purchase for ${purchase.user_id}: ${error.message}`)
    } else {
      console.log(`  ✓ Purchase: ${purchase.user_id} → course (${purchase.amount})`)
    }
  }
}

async function seedProgress() {
  console.log('\nSeeding course progress...')

  // Get course IDs
  const { data: courseRows } = await supabase
    .from('courses')
    .select('id')
    .order('created_at')

  if (!courseRows || courseRows.length === 0) {
    console.log('  ⚠ No courses found')
    return
  }

  const progresses = [
    {
      user_id: 'user_student1',
      course_id: courseRows[0].id,
      completed: false,
      lecture_completed: ['lec_1_1', 'lec_1_2']
    },
    {
      user_id: 'user_student2',
      course_id: courseRows[0].id,
      completed: false,
      lecture_completed: ['lec_1_1']
    }
  ]

  for (const progress of progresses) {
    const { error } = await supabase
      .from('course_progress')
      .upsert(progress, { onConflict: 'user_id,course_id' })

    if (error) {
      console.log(`  ✗ Progress for ${progress.user_id}: ${error.message}`)
    } else {
      console.log(`  ✓ Progress: ${progress.user_id} (${progress.lecture_completed.length} lectures)`)
    }
  }
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('  Maaz LMS - Database Seed')
  console.log('='.repeat(60))

  // Verify tables exist first
  console.log('\nChecking tables...')
  const { error: checkError } = await supabase.from('users').select('id').limit(1)
  if (checkError) {
    console.log(`\n✗ Cannot access users table: ${checkError.message}`)
    console.log('  Run migration first: node scripts/migrate.js')
    return
  }
  console.log('  ✓ Tables accessible')

  await seedUsers()
  await seedCourses()
  await seedPurchases()
  await seedProgress()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('  Seed Complete!')
  console.log('='.repeat(60))

  const counts = {
    users: (await supabase.from('users').select('id', { count: 'exact', head: true })).count,
    courses: (await supabase.from('courses').select('id', { count: 'exact', head: true })).count,
    purchases: (await supabase.from('purchases').select('id', { count: 'exact', head: true })).count,
    progress: (await supabase.from('course_progress').select('id', { count: 'exact', head: true })).count
  }

  console.log(`
  Users:          ${counts.users}
  Courses:        ${counts.courses}
  Purchases:      ${counts.purchases}
  Course Progress: ${counts.progress}
`)
}

main().catch(console.error)
