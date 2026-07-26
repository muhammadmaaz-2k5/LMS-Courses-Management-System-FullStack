import supabase from "../configs/supabase.js";

// Middleware (protect educator route)

export const protectEducator = async(req, res, next) => {
    try {
        const userId = req.auth?.userId

        if (!userId) {
            return res.json({success: false, message: "Unauthorized - please log in again"})
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (error || !user || user.role !== 'educator') {
            return res.json({success: false, message: "Unauthorized Access!"})
        }

        next()

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
