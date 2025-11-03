// src/admin/Categories.jsx
import { useState } from "react";

const Categories = () => {
  const [categories, setCategories] = useState(["Action", "Comedy", "Drama", "Sci-Fi"]);
  const [newCategory, setNewCategory] = useState("");

  const handleAdd = () => {
    if (!newCategory) return;
    setCategories([...categories, newCategory]);
    setNewCategory("");
  };

  const handleDelete = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border p-2 rounded mr-3"
        />
        <button
          onClick={handleAdd}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <ul className="bg-white p-4 rounded-lg shadow space-y-2">
        {categories.map((cat, i) => (
          <li
            key={i}
            className="flex justify-between items-center border-b pb-1"
          >
            <span>{cat}</span>
            <button
              onClick={() => handleDelete(cat)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
