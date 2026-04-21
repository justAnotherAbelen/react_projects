// How to create and update state
// also understand components life cycle and when will useState trigger re-render 
import { useState } from "react";

type Todo = {
    id : number ;
    text :string ;
    done : boolean
}

const TodoList = () => {

  // create useState for todo list 
  const [todo,setTodo] = useState<Todo[]>([]);
  const [input,setInput] = useState("")  ;

  const addTodo = () =>{
    if(!input.trim()) return ;

    const newTodo : Todo = {
        id : Date.now(),
        // add input 
        text : input.trim(),

        done : false ,
    }

    // texting in console
    console.log(newTodo)

    //...prev : It creates a new array that contains all the old todo items
    // [ ...prev, newTodo ] : A new array literal whose contents are: all the old items, then newTodo as the last element.
    setTodo(prev => [...prev,newTodo]);
    
    // reset input
    setInput("")
  }

  const toggle = (id : number) => {
    // flow : access the array through prev => map every index in array by id  if match 
    setTodo(prev => prev.map(t => (t.id === id ? {...t,done: !t.done} : t)));
  }

  const remove = (id:number) => {
    // 
    setTodo(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div style={{ maxWidth: "520px", margin: "40px auto", padding: "24px", borderRadius: "14px", background: "#ffffff", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ marginTop: 0, marginBottom: "16px", color: "#1f2937" }}>React Todo List useState</h2>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Whats need doing ? "
            style={{ flex: 1, padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }}
            />
            <button onClick={addTodo} style={{ padding: "10px 16px", border: "none", borderRadius: "8px", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Add</button>
        </div>
        
        <div style={{ paddingLeft: 0 }}>
            {todo.map(t => (
                <li key={t.id} style={{ listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "10px", background: t.done ? "#f8fafc" : "#fff" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={t.done}
                            onChange={() => toggle(t.id)}
                            style={{ width: "16px", height: "16px" }}
                        />

                        <span style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? "#9ca3af" : "#111827", fontSize: "15px" }} >
                            {t.text}
                        </span>

                    </label>

                    <button onClick={() => remove(t.id)} style={{ border: "none", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", fontWeight: 700 }}>✕</button>
                </li>
            ))}
        </div>
    </div>
  )
}

export default TodoList;