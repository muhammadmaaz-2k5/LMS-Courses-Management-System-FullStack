import supabase from "../configs/supabase.js"

// Get all courses
export const getAllCourse = async (req, res) => {
    try {
        const { data: courses, error } = await supabase
            .from('courses')
            .select('id, course_title, course_description, course_thumbnail, course_price, discount, is_published, course_ratings, educator, enrolled_students, created_at, updated_at')
            .eq('is_published', true)

        if (error) {
            return res.json({ success: false, message: error.message })
        }

        // Fetch educator names for each course
        const educatorIds = [...new Set(courses.map(c => c.educator))]
        const { data: educators } = await supabase
            .from('users')
            .select('id, name, email, image_url')
            .in('id', educatorIds)

        const educatorMap = {}
        if (educators) {
            educators.forEach(e => { educatorMap[e.id] = e })
        }

        const enrichedCourses = courses.map(course => ({
            ...course,
            educator: educatorMap[course.educator] || course.educator
        }))

        res.json({ success: true, courses: enrichedCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get course by id
export const getCourseId = async (req, res) => {
    const { id } = req.params
    try {
        const { data: courseData, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !courseData) {
            return res.json({ success: false, message: "Course not found!" })
        }

        // Fetch educator info
        const { data: educator } = await supabase
            .from('users')
            .select('id, name, email, image_url')
            .eq('id', courseData.educator)
            .single()

        courseData.educator = educator || courseData.educator

        // Remove lecture URL if previewFree is false
        if (courseData.course_content) {
            courseData.course_content.forEach(chapter => {
                if (chapter.chapterContent) {
                    chapter.chapterContent.forEach(lecture => {
                        if (!lecture.isPreviewFree) {
                            lecture.lectureUrl = ""
                        }
                    })
                }
            })
        }

        res.json({ success: true, courseData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
