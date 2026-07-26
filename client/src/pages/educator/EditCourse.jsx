import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'

const EditCourse = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { backendUrl } = useContext(AppContext)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(null)
  const [existingThumbnail, setExistingThumbnail] = useState('')
  const [chapters, setChapters] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [currentChapterId, setCurrentChapterId] = useState(null)
  const [loading, setLoading] = useState(true)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  })

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/course/' + courseId)
        if (data.success) {
          const c = data.courseData
          setCourseTitle(c.courseTitle)
          setCoursePrice(c.coursePrice)
          setDiscount(c.discount)
          setExistingThumbnail(c.courseThumbnail)
          setChapters(c.courseContent || [])
        } else {
          toast.error(data.message)
          navigate('/educator/my-courses')
        }
      } catch (e) {
        toast.error(e.message)
        navigate('/educator/my-courses')
      }
      setLoading(false)
    }
    fetchCourse()
  }, [courseId])

  const addChapter = () => {
    const newChapter = {
      chapterId: 'ch_' + Date.now(),
      chapterOrder: chapters.length + 1,
      chapterTitle: 'New Chapter',
      chapterContent: [],
      collapsed: true
    }
    setChapters([...chapters, newChapter])
  }

  const handleChapter = (action, chapterId) => {
    if (action === 'remove') {
      setChapters(chapters.filter(ch => ch.chapterId !== chapterId))
    } else if (action === 'toggle') {
      setChapters(chapters.map(ch =>
        ch.chapterId === chapterId ? { ...ch, collapsed: !ch.collapsed } : ch
      ))
    } else if (action === 'update-title') {
      const title = prompt('Enter chapter title:')
      if (title) {
        setChapters(chapters.map(ch =>
          ch.chapterId === chapterId ? { ...ch, chapterTitle: title } : ch
        ))
      }
    }
  }

  const addLecture = (chapterId) => {
    setCurrentChapterId(chapterId)
    setShowPopup(true)
  }

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'remove') {
      setChapters(chapters.map(ch => {
        if (ch.chapterId === chapterId) {
          ch.chapterContent.splice(lectureIndex, 1)
        }
        return { ...ch }
      }))
    }
  }

  const addLectureToChapter = () => {
    if (!lectureDetails.lectureTitle || !lectureDetails.lectureDuration) {
      toast.error('Please fill all lecture details')
      return
    }

    setChapters(chapters.map(ch => {
      if (ch.chapterId === currentChapterId) {
        ch.chapterContent.push({
          lectureId: 'lec_' + Date.now(),
          lectureTitle: lectureDetails.lectureTitle,
          lectureDuration: Number(lectureDetails.lectureDuration),
          lectureUrl: lectureDetails.lectureUrl,
          isPreviewFree: lectureDetails.isPreviewFree,
          lectureOrder: ch.chapterContent.length + 1
        })
      }
      return { ...ch }
    }))

    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    })
    setShowPopup(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const testUser = (() => { try { return JSON.parse(localStorage.getItem('testUser')) } catch { return null } })()
    if (!testUser) {
      toast.error('Test login required')
      return
    }

    const courseData = {
      courseTitle,
      courseDescription: '',
      coursePrice: Number(coursePrice),
      discount: Number(discount),
      courseContent: chapters,
    }

    const formData = new FormData()
    formData.append('courseData', JSON.stringify(courseData))
    formData.append('userId', testUser.id)
    formData.append('courseId', courseId)
    if (image) {
      formData.append('image', image)
    }

    try {
      const { data } = await axios.put(backendUrl + '/api/test/update-course', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (data.success) {
        toast.success(data.message)
        navigate('/educator/my-courses')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <form onSubmit={handleSubmit} className="max-w-3xl w-full">
        <h2 className="text-lg font-medium mb-4">Edit Course</h2>

        <div className="flex flex-col gap-3 mb-4">
          <label className="text-sm font-medium text-gray-700">Course Title</label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <label className="text-sm font-medium text-gray-700">Course Thumbnail</label>
          {existingThumbnail && !image && (
            <img src={existingThumbnail} alt="Current thumbnail" className="w-40 rounded" />
          )}
          <label className="cursor-pointer bg-green-50 border border-green-500 rounded p-3 flex items-center justify-center">
            <img src={assets.file_upload_icon} alt="upload" className="p-3 bg-green-500 rounded" />
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="hidden" />
          </label>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              min="0"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium text-gray-700">Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Chapters & Lectures */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Course Content</label>
            <button type="button" onClick={addChapter} className="text-green-600 text-sm border border-green-600 px-3 py-1 rounded">
              + Add Chapter
            </button>
          </div>

          {chapters.map((chapter, chIndex) => (
            <div key={chapter.chapterId} className="border border-gray-200 rounded-lg mb-3">
              <div className="flex items-center justify-between p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <img
                    onClick={() => handleChapter('toggle', chapter.chapterId)}
                    width={14}
                    className={`cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}
                    src={assets.dropdown_icon}
                    alt=""
                  />
                  <span className="font-medium text-sm">{chapter.chapterTitle}</span>
                  <span className="text-xs text-gray-400">({chapter.chapterContent.length} lectures)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleChapter('update-title', chapter.chapterId)} className="text-xs text-blue-500">Rename</button>
                  <button type="button" onClick={() => addLecture(chapter.chapterId)} className="text-xs text-green-600">+ Lecture</button>
                  <img onClick={() => handleChapter('remove', chapter.chapterId)} className='cursor-pointer' src={assets.cross_icon} alt="" />
                </div>
              </div>
              {!chapter.collapsed && (
                <div className="p-3">
                  {chapter.chapterContent.map((lecture, lecIndex) => (
                    <div key={lecIndex} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="text-sm">
                        <span className="font-medium">{lecture.lectureTitle}</span>
                        <span className="text-gray-400 ml-2">{lecture.lectureDuration} min</span>
                        {lecture.isPreviewFree && <span className="text-green-500 ml-2 text-xs">Free</span>}
                      </div>
                      <img onClick={() => handleLecture('remove', chapter.chapterId, lecIndex)} src={assets.cross_icon} className='cursor-pointer w-3' alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">
            Update Course
          </button>
          <button type="button" onClick={() => navigate('/educator/my-courses')} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
            Cancel
          </button>
        </div>
      </form>

      {/* Add Lecture Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <img onClick={() => setShowPopup(false)} className='absolute top-4 right-4 w-4 cursor-pointer' src={assets.cross_icon} alt="" />
            <h3 className="text-lg font-medium mb-4">Add Lecture</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Lecture Title"
                value={lectureDetails.lectureTitle}
                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={lectureDetails.lectureDuration}
                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Video URL (YouTube)"
                value={lectureDetails.lectureUrl}
                onChange={(e) => setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) => setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })}
                />
                Free Preview
              </label>
              <button onClick={addLectureToChapter} className="bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
                Add Lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditCourse
