import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';

import { createTodo, updateTodo, deleteTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { type CreateTodoInput, type Todo } from './API';

import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';
Amplify.configure(config);

const initialState: CreateTodoInput = { name: '', description: '' };
const client = generateClient();

const App = () => {
  const [formState, setFormState] = useState<CreateTodoInput>(initialState);
  const [todos, setTodos] = useState<Todo[] | CreateTodoInput[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const [word, setWord] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [filterWord, setFilterWord] = useState("");

  const onChange = (event) => {
    setWord(event.target.value);
  }

  const onClick = ()=> {
    setFilterWord(word);
  }


  //setFilterWord("上坂");
  const filter = {
    name: {
      'contains': filterWord //nameでaaaと一致するものに絞り込んでくれます。
    }
  }

  useEffect(() => {
    if (searchWord == ""){
      setFilterWord("")
    } else {
      setFilterWord(searchWord)
    }
  },[searchWord]
  )

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos,
        variables: { filter: filter}
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value })
        }
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={(event) =>
          setFormState({ ...formState, description: event.target.value })
        }
        style={styles.input}
        value={formState.description as string}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>
        Create Todo
      </button>
      {todos.map((todo, index) => (
        <div key={todo.id ? todo.id : index} style={styles.todo}>
          <p style={styles.todoName}>{todo.name}</p>
          <p style={styles.todoDescription}>{todo.description}</p>
        </div>
      ))}
      <div className='mx-0 my-3 row'>
        <input type="text" className='form-control col' onChange={onChange} />
        <button className='btn btn-primary col-2' onClick={onClick}>検索</button>
        <p>現在の入力値：{word}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: 400,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { marginBottom: 15 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 10,
    padding: 8,
    fontSize: 18,
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
  },
} as const;

export default App;