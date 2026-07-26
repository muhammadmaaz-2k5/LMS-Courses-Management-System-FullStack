import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { data, useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration"
import {useAuth, useUser} from '@clerk/clerk-react'
import axios from 'axios'
import {  toast } from 'react-toastify';
export const AppContext = createContext()

export const AppContextProvider = (props)=>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();

    const {getToken} = useAuth();
    const {user} = useUser()

    const [allCourses, setAllCourses] = useState([])
    const [isEducator, setIsEducator] = useState(false)
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [userData, setUserData] = useState(null)

    const getTestUser = () => {
        try {
            const saved = localStorage.getItem('testUser')
            return saved ? JSON.parse(saved) : null
        } catch { return null }
    }

    const isTestMode = !!getTestUser()

    const getAuthHeaders = async () => {
        if (isTestMode) return {}
        const token = await getToken()
        return { Authorization: `Bearer ${token}` }
    }

    // fetch all courses
    const fetchAllCourses = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/course/all');
            if(data.success)
            {
                setAllCourses(data.courses)
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // fetch user data
    const fetchUserData = async ()=>{
        const testUser = getTestUser()

        if (testUser) {
            try {
                const {data} = await axios.get(backendUrl + '/api/test/user-data/' + testUser.id)
                if(data.success){
                    setUserData(data.user)
                    if(data.user.role === 'educator'){
                        setIsEducator(true);
                    }
                }
            } catch (error) {
                console.error(error)
            }
            return
        }

        try {
            const token = await getToken();

            const {data} = await axios.get(backendUrl + '/api/user/data' , {headers: {Authorization: `Bearer ${token}`}})

            if(data.success){
                setUserData(data.user)
                if(data.user.role === 'educator'){
                    setIsEducator(true);
                }
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    // Function to calculate average rating of course
    const calculateRating = (course) => {
        if(course.courseRatings.length === 0){
            return 0;
        }
        let totalRating = 0;
        course.courseRatings.forEach(rating =>{
            totalRating += rating.rating;
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    // function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})
    }

    // Function to calculate course Duratuion
    const calculateCourseDuration = (course)=>{
        let time = 0 ;
        course.courseContent.map((chapter)=> chapter.chapterContent.map(
            (lecture)=> time += lecture.lectureDuration
        ))

        return humanizeDuration(time * 60 * 1000, {units: ["h", "m"]})
    }

    // Function to calculate to no. of lectures in the course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    const fetchUserEnrolledCourses = async () => {
        const testUser = getTestUser()

        if (testUser) {
            try {
                const { data } = await axios.get(backendUrl + "/api/test/enrolled-courses/" + testUser.id);
                if (data.success && data.enrolledCourses) {
                    setEnrolledCourses(data.enrolledCourses.reverse());
                }
            } catch (error) {
                console.error("Error fetching test user courses:", error);
            }
            return
        }

        try {
            const token = await getToken();
            const response = await axios.get(backendUrl + "/api/user/enrolled-courses", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.enrolledCourses) {
                setEnrolledCourses(response.data.enrolledCourses.reverse());
            } else {
                toast.error(response.data?.message || "No enrolled courses found.");
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    };

    useEffect(()=>{
        fetchAllCourses()
    },[])

    useEffect(()=>{

    },[])

    useEffect(()=>{
        if(user){
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    },[user])

    useEffect(()=>{
        if(isTestMode && !user){
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    },[])

    const value = {
        currency,allCourses, navigate, isEducator, setIsEducator,
        calculateRating,calculateChapterTime,calculateCourseDuration,calculateNoOfLectures
        ,fetchUserEnrolledCourses, setEnrolledCourses,enrolledCourses,backendUrl, userData, setUserData, getToken, fetchAllCourses

    }


    return (
        <AppContext.Provider value={value} >
            {props.children}
        </AppContext.Provider>
    )



}
