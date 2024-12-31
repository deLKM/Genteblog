import { useState } from 'react'

function CategoryTabs({ categories, onSelect }) {
  const [selectedCategory, setSelectedCategory] = useState('全部')

  const handleSelect = (category) => {
    setSelectedCategory(category)
    onSelect(category)
  }

  return (
    <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleSelect(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-sm scale-105'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryTabs 