import express from 'express'
import supabase from '../configs/supabase.js'

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

export default testRouter
