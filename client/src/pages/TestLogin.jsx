import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const backendUrl = import.meta.env.VITE_BACKEND_URL

const TestLogin = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [testUser, setTestUser] = useState(null)

    useEffect(() => {
        const saved = localStorage.getItem('testUser')
        if (saved) {
            const user = JSON.parse(saved)
            setTestUser(user)
            fetchUser(user.id)
        }
    }, [])

    const fetchUser = async (userId) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/test/user-data/${userId}`)
            if (data.success) {
                setTestUser(data.user)
                localStorage.setItem('testUser', JSON.stringify(data.user))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!email || !name) {
            toast.error('Email and name are required')
            return
        }
        setLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/test/login`, { email, name })
            if (data.success) {
                const user = { id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role }
                setTestUser(user)
                localStorage.setItem('testUser', JSON.stringify(user))
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (e) {
            toast.error(e.message)
        }
        setLoading(false)
    }

    const handleBecomeEducator = async () => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/test/become-educator`, { userId: testUser.id })
            if (data.success) {
                toast.success(data.message)
                const updated = { ...testUser, role: 'educator' }
                setTestUser(updated)
                localStorage.setItem('testUser', JSON.stringify(updated))
            } else {
                toast.error(data.message)
            }
        } catch (e) {
            toast.error(e.message)
        }
    }

    const handlePurchase = async (courseId) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/test/purchase`, { userId: testUser.id, courseId })
            if (data.success) {
                toast.success(data.message)
                fetchUser(testUser.id)
            } else {
                toast.error(data.message)
            }
        } catch (e) {
            toast.error(e.message)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('testUser')
        setTestUser(null)
        toast.success('Logged out')
    }

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-green-700 mb-2">Test Login</h1>
                <p className="text-gray-500 text-sm mb-6">Bypass Clerk to test features</p>

                {!testUser ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Test User"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="test@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Logged in as</p>
                            <p className="font-bold text-gray-800">{testUser.name}</p>
                            <p className="text-sm text-gray-600">{testUser.email}</p>
                            <p className="text-sm mt-1">
                                Role: <span className={`font-bold ${testUser.role === 'educator' ? 'text-green-600' : 'text-gray-600'}`}>{testUser.role}</span>
                            </p>
                        </div>

                        <div className="space-y-2">
                            {testUser.role !== 'educator' && (
                                <button
                                    onClick={handleBecomeEducator}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                                >
                                    Become Educator
                                </button>
                            )}

                            {testUser.role === 'educator' && (
                                <button
                                    onClick={() => navigate('/educator')}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                                >
                                    Go to Educator Dashboard
                                </button>
                            )}

                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                            >
                                Go to Home
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-100 text-red-600 py-2 rounded-lg font-medium hover:bg-red-200 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TestLogin
