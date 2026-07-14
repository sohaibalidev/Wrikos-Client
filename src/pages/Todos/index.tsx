import { useState, useEffect, type JSX } from "react";
import { useAuth } from "@/context";
import api from "@/utils/axios";
import { type Todo } from "@/types";
import styles from "./Todos.module.css";

const Todos = (): JSX.Element => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const capitalizeAll = (str: string): string =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  const fetchTodos = async (): Promise<void> => {
    try {
      const response = await api.get<Todo[]>("/api/todos");
      setTodos(response.data);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setError("Failed to fetch todos");
      }
      setLoading(false);
    }
  };

  const addTodo = async (): Promise<void> => {
    if (!title.trim()) return;

    try {
      const response = await api.post<Todo>("/api/todos", { title });
      setTodos([...todos, response.data]);
      setTitle("");
    } catch (err) {
      setError("Failed to add todo");
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    if (!id) {
      setError("Invalid todo ID");
      return;
    }

    try {
      await api.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      setError("Failed to delete todo");
    }
  };

  const toggleComplete = async (id: string): Promise<void> => {
    if (!id) {
      setError("Invalid todo ID");
      return;
    }

    try {
      const response = await api.patch<Todo>(`/api/todos/${id}/toggle`);
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
    } catch (err) {
      setError("Failed to update todo");
    }
  };

  const startEditing = (todo: Todo): void => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
  };

  const cancelEditing = (): void => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (id: string): Promise<void> => {
    if (!id) {
      setError("Invalid todo ID");
      return;
    }

    if (!editTitle.trim()) return;

    try {
      const response = await api.put<Todo>(`/api/todos/${id}`, {
        title: editTitle,
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
      setEditingId(null);
      setEditTitle("");
    } catch (err) {
      setError("Failed to update todo");
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void,
  ): void => {
    if (e.key === "Enter") {
      action();
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  if (loading) {
    return <div className={styles.loading}>Loading your todos...</div>;
  }

  const displayName = user?.username ? capitalizeAll(user.username) : "User";

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.headerCard}>
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            {displayName ? getInitials(displayName) : "U"}
          </div>
          <div className={styles.userName}>
            Welcome back, <span>{displayName}</span>
          </div>
        </div>
        <div className={styles.stats}>
          <strong>{completedCount}</strong> / {todos.length} done
          <div className={styles.statsProgress}>
            <div
              className={styles.statsProgressBar}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.form}>
        <input
          type="text"
          className={styles.input}
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          placeholder="What needs to be done?"
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyPress(e, addTodo)
          }
        />
        <button className={styles.addButton} onClick={addTodo}>
          Add Todo
        </button>
      </div>

      <ul className={styles.list}>
        {todos.length === 0 ? (
          <li className={styles.empty}>
            <span className={styles.emptyIcon}>✨</span>
            <div className={styles.emptyText}>No todos yet</div>
            <div className={styles.emptySubtext}>
              Add one above to get started
            </div>
          </li>
        ) : (
          todos.map((todo) => (
            <li
              key={todo._id}
              className={`${styles.item} ${todo.completed ? styles.completed : ""}`}
            >
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo._id)}
                  aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
                />
              </div>

              {editingId === todo._id ? (
                <input
                  type="text"
                  className={styles.editInput}
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditTitle(e.target.value)
                  }
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                    handleKeyPress(e, () => saveEdit(todo._id))
                  }
                  autoFocus
                  aria-label="Edit todo title"
                />
              ) : (
                <span
                  className={`${styles.title} ${todo.completed ? styles.completed : ""}`}
                  onDoubleClick={() => startEditing(todo)}
                  title="Double-click to edit"
                >
                  {todo.title}
                </span>
              )}

              <div className={styles.actions}>
                {editingId === todo._id ? (
                  <>
                    <button
                      className={`${styles.actionButton} ${styles.saveButton}`}
                      onClick={() => saveEdit(todo._id)}
                      aria-label="Save changes"
                    >
                      Save
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                      onClick={cancelEditing}
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => startEditing(todo)}
                      aria-label="Edit todo"
                    >
                      Edit
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => deleteTodo(todo._id)}
                      aria-label="Delete todo"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Todos;
