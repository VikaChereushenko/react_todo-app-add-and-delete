/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { TodoList } from './components/TodoList/TodoList';
import { TodoItem } from './components/TodoItem/TodoItem';
import { Footer } from './components/Footer/Fotter';
import { Error } from './components/Error/Erros';
import { Todo } from './types/Todo';
import { getTodos, addTodo } from './api/todos';

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

function findMaxId(todos: Todo[]) {
  const allIds = todos.map(todo => todo.id);

  return Math.max(...allIds) + 1;
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState('all');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const areAllCompleted = todos.every(todo => todo.completed);
  const maxId = findMaxId(todos);
  const noTodos = todos.length === 0;
  const filteredTodos = filterTodos(todos, status);

  useEffect(() => {
    getTodos()
      .then(response => {
        setTodos(response);
      })
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!title) {
      setErrorMessage('Title should not be empty');

      return;
    }

    e.preventDefault();

    const normalizeTitle = title.trim();

    setLoading(true);
    setTempTodo({
      id: 0,
      userId: 2042,
      title: normalizeTitle,
      completed: false,
    });

    const newTodo = {
      id: maxId,
      userId: 2042,
      title: normalizeTitle,
      completed: false,
    };

    addTodo(newTodo)
      .then(() => {
        setTitle('');
        setTodos(existing => [...existing, newTodo]);
      })
      .catch(() => setErrorMessage('Unable to add a todo'))
      .finally(() => {
        setLoading(false);
        setTempTodo(null);
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
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={title}
              onChange={event => setTitle(event.target.value)}
              autoFocus={!loading}
              disabled={loading}
            />
          </form>
        </header>

        <TodoList filteredTodos={filteredTodos} />
        {tempTodo && <TodoItem title={title} />}

        {!noTodos && (
          <Footer todos={todos} status={status} onStatusChange={setStatus} />
        )}
      </div>

      <Error errorMessage={errorMessage} hideError={setErrorMessage} />
    </div>
  );
};
