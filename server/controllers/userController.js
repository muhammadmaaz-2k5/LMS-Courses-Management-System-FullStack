import Stripe from "stripe"
import supabase from "../configs/supabase.js"

// Get users data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error || !user) {
            return res.json({ success: false, message: "User not found!" })
        }

        res.json({ success: true, user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// User enrolled courses with lecture link
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('enrolled_courses')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return res.json({ success: false, message: "User not found!" })
        }

        const enrolledCourseIds = user.enrolled_courses || []
        if (enrolledCourseIds.length === 0) {
            return res.json({ success: true, enrolledCourses: [] })
        }

        const { data: enrolledCourses, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .in('id', enrolledCourseIds)

        if (courseError) {
            return res.json({ success: false, message: courseError.message })
        }

        res.json({ success: true, enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Purchase course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const { origin } = req.headers
        const userId = req.auth.userId

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()

        if (!userData || !courseData) {
            return res.json({ success: false, message: "Data Not Found" })
        }

        const amount = (courseData.course_price - courseData.discount * courseData.course_price / 100).toFixed(2)

        const { data: newPurchase, error: purchaseError } = await supabase
            .from('purchases')
            .insert({
                course_id: courseId,
                user_id: userId,
                amount: Number(amount),
                status: 'pending'
            })
            .select()
            .single()

        if (purchaseError) {
            return res.json({ success: false, message: purchaseError.message })
        }

        // If Stripe is not configured, complete purchase directly
        if (!process.env.STRIPE_SECRET_KEY) {
            await supabase.from('purchases').update({ status: 'completed' }).eq('id', newPurchase.id)

            // Add course to user's enrolled courses
            const updatedCourses = [...(userData.enrolled_courses || []), courseId]
            await supabase.from('users').update({ enrolled_courses: updatedCourses }).eq('id', userId)

            // Add user to course's enrolled students
            const { data: course } = await supabase.from('courses').select('enrolled_students').eq('id', courseId).single()
            const updatedStudents = [...(course.enrolled_students || []), userId]
            await supabase.from('courses').update({ enrolled_students: updatedStudents }).eq('id', courseId)

            return res.json({ success: true, message: 'Course enrolled successfully' })
        }

        // Stripe gateway initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.course_title
                },
                unit_amount: Math.floor(amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase.id
            }
        })

        res.json({ success: true, session_url: session.url })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update user course progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId, lectureId } = req.body

        const { data: progressData, error: findError } = await supabase
            .from('course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single()

        if (progressData) {
            const completed = progressData.lecture_completed || []
            if (completed.includes(lectureId)) {
                return res.json({ success: true, message: "Lecture Already Completed" })
            }

            completed.push(lectureId)

            const { error: updateError } = await supabase
                .from('course_progress')
                .update({
                    lecture_completed: completed,
                    completed: true
                })
                .eq('id', progressData.id)

            if (updateError) {
                return res.json({ success: false, message: updateError.message })
            }
        } else {
            const { error: insertError } = await supabase
                .from('course_progress')
                .insert({
                    user_id: userId,
                    course_id: courseId,
                    lecture_completed: [lectureId],
                    completed: true
                })

            if (insertError) {
                return res.json({ success: false, message: insertError.message })
            }
        }

        res.json({ success: true, message: 'Progress Updated' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get user course progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId } = req.body

        const { data: progressData, error } = await supabase
            .from('course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single()

        // If no progress record found, return null (not an error)
        if (error && error.code !== 'PGRST116') {
            return res.json({ success: false, message: error.message })
        }

        res.json({ success: true, progressData: progressData || null })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Add user ratings to course
export const addUserRating = async (req, res) => {
    try {
        const userId = req.auth.userId
        const { courseId, rating } = req.body

        if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Invalid details" })
        }

        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single()

        if (courseError || !course) {
            return res.json({ success: false, message: "Course Not found!" })
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('enrolled_courses')
            .eq('id', userId)
            .single()

        if (userError || !user) {
            return res.json({ success: false, message: "User not found!" })
        }

        if (!user.enrolled_courses || !user.enrolled_courses.includes(courseId)) {
            return res.json({ success: false, message: "User has not purchased this course." })
        }

        const ratings = course.course_ratings || []
        const existingIndex = ratings.findIndex(r => r.userId === userId)

        if (existingIndex > -1) {
            ratings[existingIndex].rating = rating
        } else {
            ratings.push({ userId, rating })
        }

        const { error: updateError } = await supabase
            .from('courses')
            .update({ course_ratings: ratings })
            .eq('id', courseId)

        if (updateError) {
            return res.json({ success: false, message: updateError.message })
        }

        res.json({ success: true, message: "Rating Added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
