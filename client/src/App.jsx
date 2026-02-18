// function App() {
//   return
//       <div className="min-h-screen bg-gray-800 flex justify-center items-center p-4 text-white">
//         <h1 className=""> PERN TODO APP</h1>
//       </div>
// min-h-screen bg-gray-800 flex justify-center items-center p-4 text-white
// }

import axios from "axios";
import { useEffect, useState } from "react";
import {
  MdDoneOutline,
  MdModeEditOutline,
  MdOutlineDelete,
  MdOutlineDone,
} from "react-icons/md";
import { FaTrash } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

function App() {
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [error, setError] = useState(null);

  const getTodos = async () => {
    try {
      setError(null);
      const res = await axios.get("http://localhost:5000/todos");
      setTodos(res.data);
      console.log(res.data);
    } catch (err) {
      console.error(err.message);
      setError("Failed to fetch todos. Please try again later");
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  const onSubmitForm = async (e) => {
    e.preventDefault();
    if(!description.trim()) return;
    try {
      setError(null);
      const res = await axios.post("http://localhost:5000/todos", {
        description,
        completed: false,
      });
      setTodos([...todos, res.data]);
      setDescription("");
    } catch (err) {
      console.error(err.message);
      setError("Failed to add todo. Please try again");
    }
  };

  const saveEdit = async (id) => {
    try {
      setError(null);
      const currentTodo = todos.find((todo) => todo.todo_id === id);
      const trimmedText = editedText.trim();

      if(currentTodo.description === trimmedText){
        setEditingTodo(null); 
        setEditedText(""); 
        return;
      }
      await axios.put(`http://localhost:5000/todos/${id}`, {
        description: editedText,
      });
      setEditingTodo(null);
      setEditedText("");
      setTodos(todos.map((todo) => todo.todo_id === id ? {...todo, description: editedText, completed: false}: todo))
    } catch (err) {
      console.error(err.message);
      setError("Failed to update todo. Please try again");
    }
  };

  const deleteTodo = async (id) => {
    try {
      setError(null);
      axios.delete(`http://localhost:5000/todos/${id}`);
      setTodos(todos.filter((todo) => todo.todo_id !== id));
    } catch (err) {
      console.error(err.message);
      setError("Failed to delete the todo. Please try again");
    }
  };

  const toggleCompleted = async (id) => {
    try {
      const todo = todos.find((todo) => todo.todo_id === id);
      await axios.put(`http://localhost:5000/todos/${id}`, {
        description: todo.description,
        completed: !todo.completed,
      });
      setTodos(
        todos.map((todo) =>
          todo.todo_id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );
      getTodos();
    } catch (err) {
      console.error(err.message);
    }
  };
  return (
    <div className="min-h-screen bg-gray-800 flex justify-center items-center p-4 ">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">PERN TODO APP</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form
          onSubmit={onSubmitForm}
          className="flex items-center gap-2 shadow-sm border p-2 rounded-lg mb-6"
        >
          <input
            className="flex-1 w-full outline-none px-3 py-2 text-gray-700 placeholder-gray-400"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs to be done?"
            required
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium cursor-pointer">
            Add Task
          </button>
        </form>
        <div>
          {todos.length === 0 ? (
            <p className="text-gray-600"> No task available, add a new task</p>
          ) : (
            <div className="flex flex-col gap-3">
              {todos.map((todo) => (
                <div key={todo.todo_id} className="pb-4">
                  {editingTodo === todo.todo_id ? (
                    <div className="flex items-center gap-x-3">
                      <input
                        className=" flex-1 p-3 border rounded-lg border-gray-200 outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 shadow-inner"
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                      />
                      <button
                        onClick={() => saveEdit(todo.todo_id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg mr-2 mt-2 hover:bg-green-600 duration-200"
                      >
                        <MdOutlineDone />
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2 mt-2 hover:bg-gray-600 duration-200"
                        onClick={() => setEditingTodo(null)}
                      >
                        <IoClose />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-x-4 overflow-hidden">
                        <button
                          onClick={() => toggleCompleted(todo.todo_id)}
                          className={`shrink-0 h-6 w-6 border-2 rounded-full flex items-center justify-center 
                       ${
                         todo.completed
                           ? "bg-green-500 border-green-500 text-white"
                           : "border-gray-300 hover:border-blue-400"
                       }`}
                        >
                          {todo.completed && <MdOutlineDone size={16} />}
                        </button>
                        <span>{todo.description}</span>
                      </div>

                      <div className="flex gap-x-2">
                        <button
                          onClick={() => {
                            setEditingTodo(todo.todo_id);
                            setEditedText(todo.description);
                          }}
                          className="p-2 text-blue-400 hover:text-blue-700 rounded-lg hover: bg-blue-50"
                        >
                          <MdModeEditOutline />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.todo_id)}
                          className="p-2 text-red-400 hover:text-red-700 rounded-lg hover: bg-red-50 duration-200"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div> // This was missing
  );
}

export default App;
