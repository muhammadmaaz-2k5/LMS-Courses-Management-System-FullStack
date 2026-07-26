import express from 'express'
import supabase from '../configs/supabase.js'
import { v2 as cloudinary } from 'cloudinary'
import upload from '../configs/multer.js'

const testRouter = express.Router()

// Test login - creates/finds a user directly in Supabase (bypasses Clerk)
testRouter.post('/login', async (req, res) => {
    try {
        const { email, name } = req.body

        if (!email || !name) {
            return res.json({ success: false, message: "Email and name are required" })
        }

        const testId = 'test_' + email.replace(/[^a-zA-Z0-9]/g, '_')

        const { data: existing } = await supabase
            .from('users')
            .select('*')
            .eq('id', testId)
            .single()

        if (existing) {
            return res.json({ success: true, user: existing, message: "Logged in" })
        }

        const newUser = {
            id: testId,
            email,
            name,
            role: 'user',
            image_url: '',
            enrolled_courses: []
        }

        const { data: created, error } = await supabase
            .from('users')
            .upsert(newUser, { onConflict: 'id' })
            .select()
            .single()

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        res.json({ success: true, user: created, message: "Account created and logged in" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test become educator
testRouter.post('/become-educator', async (req, res) => {
    try {
        const { userId } = req.body

        if (!userId) {
            return res.json({ success: false, message: "userId required" })
        }

        const { error } = await supabase
            .from('users')
            .update({ role: 'educator', updated_at: new Date().toISOString() })
            .eq('id', userId)

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        res.json({ success: true, message: 'You are now an educator!' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test get user data (bypasses Clerk auth)
testRouter.get('/user-data/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        if (!userId) {
            return res.json({ success: false, message: "userId required" })
        }

        let { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error || !user) {
            return res.json({ success: false, message: "User not found" })
        }

        res.json({ success: true, user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            imageUrl: user.image_url,
            enrolledCourses: user.enrolled_courses || [],
        }})
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test enrolled courses (bypasses Clerk auth)
testRouter.get('/enrolled-courses/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const { data: user } = await supabase
            .from('users')
            .select('enrolled_courses')
            .eq('id', userId)
            .single()

        const enrolledCourseIds = user?.enrolled_courses || []
        if (enrolledCourseIds.length === 0) {
            return res.json({ success: true, enrolledCourses: [] })
        }

        const { data: courses } = await supabase
            .from('courses')
            .select('*')
            .in('id', enrolledCourseIds)

        const mapped = (courses || []).map(c => ({
            _id: c.id,
            courseTitle: c.course_title,
            courseDescription: c.course_description,
            courseThumbnail: c.course_thumbnail,
            coursePrice: c.course_price,
            isPublished: c.is_published,
            discount: c.discount,
            courseContent: c.course_content || [],
            courseRatings: c.course_ratings || [],
            educator: c.educator,
            enrolledStudents: c.enrolled_students || [],
        }))

        res.json({ success: true, enrolledCourses: mapped })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test purchase course (bypasses Clerk auth)
testRouter.post('/purchase', async (req, res) => {
    try {
        const { userId, courseId } = req.body

        if (!userId || !courseId) {
            return res.json({ success: false, message: "userId and courseId required" })
        }

        const { data: courseData } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()

        if (!courseData) {
            return res.json({ success: false, message: "Course not found" })
        }

        const amount = (courseData.course_price - courseData.discount * courseData.course_price / 100).toFixed(2)

        const { error: purchaseError } = await supabase
            .from('purchases')
            .insert({
                course_id: courseId,
                user_id: userId,
                amount: Number(amount),
                status: 'completed'
            })

        if (purchaseError) {
            return res.json({ success: false, message: purchaseError.message })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('enrolled_courses')
            .eq('id', userId)
            .single()

        const updatedCourses = [...(userData?.enrolled_courses || []), courseId]
        await supabase.from('users').update({ enrolled_courses: updatedCourses }).eq('id', userId)

        const { data: course } = await supabase.from('courses').select('enrolled_students').eq('id', courseId).single()
        const updatedStudents = [...(course?.enrolled_students || []), userId]
        await supabase.from('courses').update({ enrolled_students: updatedStudents }).eq('id', courseId)

        res.json({ success: true, message: 'Course enrolled successfully' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test educator dashboard
testRouter.get('/educator/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (!user || user.role !== 'educator') {
            return res.json({ success: false, message: "Not an educator" })
        }

        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id, course_title, enrolled_students')
            .eq('educator', userId)

        if (coursesError) {
            return res.json({ success: false, message: coursesError.message })
        }

        const totalCourses = courses.length
        const courseIds = courses.map(course => course.id)

        const { data: purchases } = await supabase
            .from('purchases')
            .select('amount')
            .in('course_id', courseIds)
            .eq('status', 'completed')

        const totalEarnings = Math.round((purchases || []).reduce((sum, p) => sum + p.amount, 0)).toFixed(2)

        const enrolledStudentsData = []
        for (const course of courses) {
            const studentIds = course.enrolled_students || []
            if (studentIds.length === 0) continue

            const { data: students } = await supabase
                .from('users')
                .select('id, name, image_url')
                .in('id', studentIds)

            if (students) {
                students.forEach(student => {
                    enrolledStudentsData.push({
                        courseTitle: course.course_title,
                        student: {
                            _id: student.id,
                            name: student.name,
                            imageUrl: student.image_url
                        }
                    })
                })
            }
        }

        res.json({
            success: true, dashboardData: {
                totalEarnings, enrolledStudentsData, totalCourses
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test educator courses
testRouter.get('/educator/courses/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('educator', userId)

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        const mapped = (courses || []).map(c => ({
            _id: c.id,
            courseTitle: c.course_title,
            courseDescription: c.course_description,
            courseThumbnail: c.course_thumbnail,
            coursePrice: c.course_price,
            isPublished: c.is_published,
            discount: c.discount,
            courseContent: c.course_content || [],
            courseRatings: c.course_ratings || [],
            educator: c.educator,
            enrolledStudents: c.enrolled_students || [],
            createdAt: c.created_at,
            updatedAt: c.updated_at,
        }))

        res.json({ success: true, courses: mapped })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test educator enrolled students
testRouter.get('/educator/enrolled-students/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const { data: courses } = await supabase
            .from('courses')
            .select('id, course_title')
            .eq('educator', userId)

        if (!courses || courses.length === 0) {
            return res.json({ success: true, enrolledStudents: [] })
        }

        const courseIds = courses.map(c => c.id)
        const courseIdMap = {}
        courses.forEach(c => { courseIdMap[c.id] = c.course_title })

        const { data: purchases } = await supabase
            .from('purchases')
            .select('*')
            .in('course_id', courseIds)
            .eq('status', 'completed')

        if (!purchases || purchases.length === 0) {
            return res.json({ success: true, enrolledStudents: [] })
        }

        const userIds = [...new Set(purchases.map(p => p.user_id))]
        const { data: users } = await supabase
            .from('users')
            .select('id, name, image_url')
            .in('id', userIds)

        const userMap = {}
        if (users) {
            users.forEach(u => {
                userMap[u.id] = {
                    _id: u.id,
                    name: u.name,
                    imageUrl: u.image_url
                }
            })
        }

        const enrolledStudents = purchases.map(purchase => ({
            student: userMap[purchase.user_id] || { _id: purchase.user_id, name: 'Unknown', imageUrl: '' },
            courseTitle: courseIdMap[purchase.course_id] || 'Unknown Course',
            purchaseDate: purchase.created_at
        }))

        res.json({ success: true, enrolledStudents })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

// Test add course
testRouter.post('/add-course', upload.single('image'), async (req, res) => {
    try {
        const { courseData, userId } = req.body
        const imageFile = req.file

        if (!userId) {
            return res.json({ success: false, message: "userId required" })
        }

        const parsedCourseData = JSON.parse(courseData)

        let thumbnailUrl = ''
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path)
            thumbnailUrl = imageUpload.secure_url
        }

        const { data: newCourse, error } = await supabase
            .from('courses')
            .insert({
                course_title: parsedCourseData.courseTitle,
                course_description: parsedCourseData.courseDescription || '',
                course_thumbnail: thumbnailUrl,
                course_price: Number(parsedCourseData.coursePrice),
                discount: Number(parsedCourseData.discount),
                is_published: true,
                course_content: parsedCourseData.courseContent || [],
                educator: userId,
                enrolled_students: [],
                course_ratings: []
            })
            .select()
            .single()

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        res.json({ success: true, message: "Course Added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
})

export default testRouter
