//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

const APIs = (() => {
    const createTodo = (newTodo) => {
        return fetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => {
        return fetch("http://localhost:3000/todos").then((res) => res.json());
    };

    const editTodo = (todo) =>{
        return fetch("http://localhost:3000/todos/"+todo.id, {
            method: 'PUT',
            body: JSON.stringify(todo),
            headers: {
              'Content-type': 'application/json; charsete=UTF-8',
            },
          }).then((response) => response.json());
    }
    return { createTodo, deleteTodo, getTodos, editTodo };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        
        set todos(newTodos) {
            // reassign value
            //console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, editTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        editTodo
    };
})();

const View = (() => {
    const todolistEl = document.querySelector(".todo-list");
    const completedlistEl = document.querySelector(".completed-list");
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");

    const renderTodos = (todos) => {
        let todosTemplate = "";
        let completedTemplate = "";
        todos.forEach((todo) => {
            // console.log(todo);
            if(todo.completed === false){
                const liTemplate = `
                    <li>
                        <span>${todo.content}</span>
                        <input class="edit-input" id=${todo.id} type="text"/>
                        <button class="edit-btn" id="${todo.id}">Edit</button>
                        <button class="delete-btn" id="${todo.id}">delete</button>
                        <button class="completed-btn" id="${todo.id}">></button>
                    </li>`;
                todosTemplate += liTemplate;
            }
            else{
                const completedLiTemplate = `
                    <li>
                        <button class="incomplete-btn" id="${todo.id}"><</button>
                        <span>${todo.content}</span>
                        <input class="edit-input" id=${todo.id} type="text"/>
                        <button class="edit-btn" id="${todo.id}">Edit</button>
                        <button class="delete-btn" id="${todo.id}">delete</button>    
                    </li>`;
                completedTemplate += completedLiTemplate;
            }
            
        });
        todolistEl.innerHTML = todosTemplate;
        completedlistEl.innerHTML = completedTemplate;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl, completedlistEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            if(view.inputEl.value.trim() !== ''){
                const inputValue = view.inputEl.value;
                model.createTodo({ content: inputValue, completed:false }).then((data) => {
                    state.todos = [data, ...state.todos];
                    view.clearInput();
                });
            }
        });
        view.inputEl.addEventListener("keyup", (event)=>{
            if(view.inputEl.value.trim() !== '' && event.code === 'Enter'){
                const inputValue = view.inputEl.value;
                model.createTodo({ content: inputValue, completed:false }).then((data) => {
                    state.todos = [data, ...state.todos];
                    view.clearInput();
                });
            }
        })
    };

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                console.log('delete!');
                const id = event.target.id;
                console.log("id", typeof id);

                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
        view.completedlistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                console.log('delete!');
                const id = event.target.id;
                console.log("id", typeof id);

                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const handleCompleted = () =>{
        view.todolistEl.addEventListener("click", (event)=>{
            // if(event.target.className === "completed-btn"){
            //     content = state.todos.find((todo)=> +todo.id===+event.target.id);
            //     //console.log(+event.target.id, content, state.todos);
            //     model.deleteTodo(+event.target.id).then((data) =>{
            //         state.todos = state.todos.filter((todo)=> todo.id !== +event.target.id);
            //         state.completedTodos = [content, ...state.completedTodos];
            //     })
            //     // model.createTodo({ content: content }).then((data) => {
            //     //     state.completedTodos = [data, ...state.completedTodos];
            //     // });
            // }
            if(event.target.className === "completed-btn"){
                console.log('..to completed tasks');
                console.log(state.todos)
                state.todos.map((todo) => {
                    if (+todo.id === +event.target.id) {
                      todo.completed = !todo.completed;
                      model.editTodo(todo);
                    }
                  });
            }
        });
        view.completedlistEl.addEventListener("click", (event)=>{
            if(event.target.className === "incomplete-btn"){
                console.log('..to completes tasks');
                console.log(state.todos)
                state.todos.map((todo) => {
                    if (+todo.id === +event.target.id) {
                      todo.completed = !todo.completed;
                      model.editTodo(todo);
                    }
                  });
            }
        })
    }

    const handleEdit = () =>{
        view.todolistEl.addEventListener("click", (event)=>{
            //target edit-input and check if its style === none

            if(event.target.className === "edit-btn"){
                console.log(document.getElementById(event.target.id));
                let myInput = document.getElementById(event.target.id);
                let mySpan = myInput.parentNode.querySelector('span');
                // console.log(myInput.style);
                if(myInput.style.display === ""){
                    myInput.style.display = "inline";
                // console.log(state.todos.find((todo)=> +todo.id===+event.target.id));
                myInput.value = state.todos.find((todo)=> +todo.id===+event.target.id)["content"];
                //hide span
                mySpan.style.display = "none";
                
                }
                else{
                    myInput.style.display = "";
                    mySpan.style.display = "inline";
                    //store input value
                    state.todos.map((todo)=>{
                        if(+todo.id === +event.target.id){
                            //console.log(todo.content, myInput.value);
                            todo.content = myInput.value;
                            model.editTodo(todo);
                        }
                    })
                }
            }
        })
        view.completedlistEl.addEventListener("click", (event)=>{
            //target edit-input and check if its style === none

            if(event.target.className === "edit-btn"){
                console.log(document.getElementById(event.target.id).parentNode.querySelector('input'));
                let myInput = document.getElementById(event.target.id).parentNode.querySelector('input');
                let mySpan = myInput.parentNode.querySelector('span');
                // console.log(myInput.style);
                if(myInput.style.display === ""){
                    myInput.style.display = "inline";
                // console.log(state.todos.find((todo)=> +todo.id===+event.target.id));
                myInput.value = state.todos.find((todo)=> +todo.id===+event.target.id)["content"];
                //hide span
                mySpan.style.display = "none";
                
                }
                else{
                    myInput.style.display = "";
                    mySpan.style.display = "inline";
                    //store input value
                    state.todos.map((todo)=>{
                        if(+todo.id === +event.target.id){
                            //console.log(todo.content, myInput.value);
                            todo.content = myInput.value;
                            model.editTodo(todo);
                        }
                    })
                }
            }
        })
    }

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleCompleted();
        handleEdit();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
