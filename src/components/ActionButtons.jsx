import { useState } from 'react'

function ActionButtons({ initialFollowed = false, initialBookmarked = false }) {
  const [isFollowed, setIsFollowed] = useState(initialFollowed)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    setIsLoading(true)
    try {
      // 这里应该调用API
      await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
      setIsFollowed(!isFollowed)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = async () => {
    setIsLoading(true)
    try {
      // 这里应该调用API
      await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
      setIsBookmarked(!isBookmarked)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isFollowed
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        <svg
          className={`h-4 w-4 ${isFollowed ? 'text-green-600' : 'text-white'} mr-1`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isFollowed ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          )}
        </svg>
        {isFollowed ? '已关注' : '关注'}
      </button>

      <button
        onClick={handleBookmark}
        disabled={isLoading}
        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          isBookmarked
            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        <svg
          className={`h-4 w-4 mr-1 ${isBookmarked ? 'text-yellow-600' : 'text-gray-500'}`}
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
        {isBookmarked ? '已收藏' : '收藏'}
      </button>
    </div>
  )
}

export default ActionButtons 