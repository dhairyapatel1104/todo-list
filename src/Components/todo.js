import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MdDelete } from "react-icons/md";
import './todo.css';

const ItemType = "TASK";
const LOCAL_STORAGE_KEY = "task-list";

const TodoList = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedTasks
      ? JSON.parse(savedTasks)
      : { todo: [], inProgress: [], completed: [] };
  });

  const [newTask, setNewTask] = useState("");

  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.trim() === "") return;
    const newTaskItem = {
      id: Date.now().toString(),
      text: newTask.trim(),
    };
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, newTaskItem],
    }));
    setNewTask("");
  };

  const moveTask = (task, fromColumn, toColumn, dragIndex, hoverIndex) => {
    const updatedTasks = { ...tasks };

    if (fromColumn === toColumn) {
      const columnTasks = [...updatedTasks[fromColumn]];
      const [movedTask] = columnTasks.splice(dragIndex, 1);
      columnTasks.splice(hoverIndex, 0, movedTask);
      updatedTasks[fromColumn] = columnTasks;
    } else {
      updatedTasks[fromColumn] = updatedTasks[fromColumn].filter(
        (t) => t.id !== task.id
      );
      updatedTasks[toColumn] = [...updatedTasks[toColumn], task];
    }

    setTasks(updatedTasks);
  };

  const deleteTask = (taskId, column) => {
    const updatedTasks = { ...tasks };
    updatedTasks[column] = updatedTasks[column].filter(
      (task) => task.id !== taskId
    );
    setTasks(updatedTasks);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="todo-container">
        <div className="title-section">
          <h1>Todo-List</h1>
          <img
            src="https://w7.pngwing.com/pngs/670/265/png-transparent-checkmark-done-exam-list-pencil-todo-xomo-basics-icon-thumbnail.png"
            alt="Todo List Icon"
            style={{ width: "50px", height: "50px", marginLeft: "10px" }}
          />
        </div>
        <div className="input-section">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter a new task"
          />
          <button onClick={addTask}>Add Task</button>
        </div>
        <div className="columns-container">
          <Column
            title="Todo"
            tasks={tasks.todo || []}
            moveTask={moveTask}
            column="todo"
            deleteTask={deleteTask}
          />
          <Column
            title="In-Progress"
            tasks={tasks.inProgress || []}
            moveTask={moveTask}
            column="inProgress"
            deleteTask={deleteTask}
          />
          <Column
            title="Completed"
            tasks={tasks.completed || []}
            moveTask={moveTask}
            column="completed"
            deleteTask={deleteTask}
          />
        </div>
      </div>
    </DndProvider>
  );
};

const Column = ({ title, tasks, moveTask, column, deleteTask }) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item) => {
      if (item.column !== column) {
        moveTask(item.task, item.column, column);
        item.column = column;
      }
    },
  });

  return (
    <div ref={drop} className="column">
      <h2>{title}</h2>
      {tasks.length > 0 ? (
        tasks.map((task, index) => (
          <Task
            key={task.id}
            task={task}
            index={index}
            column={column}
            moveTask={moveTask}
            deleteTask={deleteTask}
          />
        ))
      ) : (
        <p>No tasks in this column.</p>
      )}
    </div>
  );
};

const Task = ({ task, index, column, moveTask, deleteTask }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      if (item.column === column) {
        moveTask(item.task, column, column, dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index, task, column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="task"
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: "#444",
      }}
    >
      <span>{task.text}</span>
      <button onClick={() => deleteTask(task.id, column)}>
        <MdDelete className="delete-icon" />
      </button>
    </div>
  );
};

export default TodoList;


