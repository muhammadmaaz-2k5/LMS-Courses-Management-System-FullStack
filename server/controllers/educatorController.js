import { v2 as cloudinary } from 'cloudinary'
import supabase from '../configs/supabase.js'
import { mapCourse } from '../configs/helpers.js'

// Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth?.userId

        if (!userId) {
            return res.json({ success: false, message: "Unauthorized - please log in again" })
        }

        const { error } = await supabase
            .from('users')
            .update({ role: 'educator', updated_at: new Date().toISOString() })
            .eq('id', userId)

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        res.json({ success: true, message: 'You can publish a course now' })
    } catch (error) {
        console.error("updateRoleToEducator error:", error.message)
        res.json({ success: false, message: error.message })
    }
}

// Add new course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail Not Attached" })
        }

        const parsedCourseData = JSON.parse(courseData)

        // Upload image to Cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        // Insert course into Supabase
        const { data: newCourse, error } = await supabase
            .from('courses')
            .insert({
                course_title: parsedCourseData.courseTitle,
                course_description: parsedCourseData.courseDescription,
                course_thumbnail: imageUpload.secure_url,
                course_price: Number(parsedCourseData.coursePrice),
                discount: Number(parsedCourseData.discount),
                is_published: true,
                course_content: parsedCourseData.courseContent || [],
                educator: educatorId,
                enrolled_students: [],
                course_ratings: []
            })
            .select()
            .single()

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        res.json({ success: true, message: "Course Added", course: mapCourse(newCourse) })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId

        const { data: courses, error } = await supabase
            .from('courses')
            .select('*')
            .eq('educator', educator)

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        const mapped = (courses || []).map(mapCourse)
        res.json({ success: true, courses: mapped })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get educator dashboard data
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId

        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id, course_title, enrolled_students')
            .eq('educator', educator)

        if (coursesError) {
            return res.json({ success: false, message: coursesError.message })
        }

        const totalCourses = courses.length
        const courseIds = courses.map(course => course.id)

        const { data: purchases, error: purchasesError } = await supabase
            .from('purchases')
            .select('amount')
            .in('course_id', courseIds)
            .eq('status', 'completed')

        if (purchasesError) {
            return res.json({ success: false, message: purchasesError.message })
        }

        const totalEarnings = Math.round(purchases.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)

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
}

// Get Enrolled Students Data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId

        const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id, course_title')
            .eq('educator', educator)

        if (coursesError) {
            return res.json({ success: false, message: coursesError.message })
        }

        const courseIds = courses.map(course => course.id)
        const courseIdMap = {}
        courses.forEach(c => { courseIdMap[c.id] = c.course_title })

        const { data: purchases, error: purchasesError } = await supabase
            .from('purchases')
            .select('*')
            .in('course_id', courseIds)
            .eq('status', 'completed')

        if (purchasesError) {
            return res.json({ success: false, message: purchasesError.message })
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
}
