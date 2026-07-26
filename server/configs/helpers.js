// Map Supabase snake_case course to frontend camelCase
export function mapCourse(course) {
    if (!course) return null
    return {
        _id: course.id,
        courseTitle: course.course_title,
        courseDescription: course.course_description,
        courseThumbnail: course.course_thumbnail,
        coursePrice: course.course_price,
        isPublished: course.is_published,
        discount: course.discount,
        courseContent: course.course_content || [],
        courseRatings: course.course_ratings || [],
        educator: course.educator,
        enrolledStudents: course.enrolled_students || [],
        createdAt: course.created_at,
        updatedAt: course.updated_at,
    }
}

// Map Supabase snake_case user to frontend camelCase
export function mapUser(user) {
    if (!user) return null
    return {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        imageUrl: user.image_url,
        enrolledCourses: user.enrolled_courses || [],
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    }
}

// Map Supabase course_progress to frontend format
export function mapProgress(progress) {
    if (!progress) return null
    return {
        _id: progress.id,
        userId: progress.user_id,
        courseId: progress.course_id,
        completed: progress.completed,
        lectureCompleted: progress.lecture_completed || [],
    }
}

// Map Supabase purchase to frontend format
export function mapPurchase(purchase) {
    if (!purchase) return null
    return {
        _id: purchase.id,
        courseId: purchase.course_id,
        userId: purchase.user_id,
        amount: purchase.amount,
        status: purchase.status,
        createdAt: purchase.created_at,
    }
}
