/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { TodoList } from './components/TodoList/TodoList';
import { TodoItem } from './components/TodoItem/TodoItem';
import { Footer } from './components/Footer/Fotter';
import { Error } from './components/Error/Erros';
import { getTodos, addTodo, deleteTodo } from './api/todos';

import { Todo } from './types/Todo';

function filterTodos(todos: Todo[], status?: string | null) {
  const todosCopy = [...todos];

  switch (status) {
    case 'active':
      return todosCopy.filter(todo => todo.completed === false);
    case 'completed':
      return todosCopy.filter(todo => todo.completed === true);
    default:
      return todosCopy;
  }
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState('all');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deleteIds, setDeletedIds] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const areAllCompleted = todos.every(todo => todo.completed);
  const noTodos = todos.length === 0;
  const filteredTodos = filterTodos(todos, status);

  useEffect(() => {
    getTodos()
      .then(response => {
        setTodos(response);
      })
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizeTitle = title.trim();

    if (!normalizeTitle) {
      setErrorMessage('Title should not be empty');

      return;
    }

    setLoading(true);
    const newTodo = {
      userId: 2042,
      title: normalizeTitle,
      completed: false,
    };

    setTempTodo({
      id: 0,
      ...newTodo,
    });

    addTodo(newTodo)
      .then(response => {
        setTitle('');
        setTodos(existing => [...existing, response]);
      })
      .catch(() => setErrorMessage('Unable to add a todo'))
      .finally(() => {
        setLoading(false);
        setTempTodo(null);
      });
  };

  const handleDeleteOneTodo = (id: number) => {
    setLoading(true);
    setDeletedIds(existing => [...existing, id]);
    deleteTodo(id)
      .then(() => {
        setTodos(existing => existing.filter(current => current.id !== id));
      })
      .catch(() => setErrorMessage('Unable to delete a todo'))
      .finally(() => {
        setLoading(false);
        setDeletedIds([]);
      });
  };

  const handleDeleteCompletedTodos = () => {
    todos.forEach(todo => {
      if (todo.completed) {
        setLoading(true);
        setDeletedIds(existing => [...existing, todo.id]);
        deleteTodo(todo.id)
          .then(() =>
            setTodos(existing =>
              existing.filter(current => current.id !== todo.id),
            ),
          )
          .catch(() => setErrorMessage('Unable to delete a todo'))
          .finally(() => {
            setLoading(false);
            setDeletedIds(existing => existing.filter(id => id !== todo.id));
          });
      }
    });
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {!noTodos && (
            <button
              type="button"
              className={classNames('todoapp__toggle-all', {
                active: areAllCompleted,
              })}
              data-cy="ToggleAllButton"
            />
          )}

          {/* Add a todo on form submit */}
          <form onSubmit={event => handleSubmit(event)}>
            <input
              ref={inputRef}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={event => setTitle(event.target.value)}
              disabled={loading}
            />
          </form>
        </header>

        <TodoList
          filteredTodos={filteredTodos}
          onDelete={handleDeleteOneTodo}
          loading={loading}
          deleteIds={deleteIds}
        />

        {tempTodo && <TodoItem title={title} />}

        {!noTodos && (
          <Footer
            todos={todos}
            status={status}
            onStatusChange={value => setStatus(value)}
            clearCompletedTodos={handleDeleteCompletedTodos}
          />
        )}
      </div>

      <Error errorMessage={errorMessage} hideError={setErrorMessage} />
    </div>
  );
};
