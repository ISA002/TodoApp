// элементы дом дерева
const input = document.getElementById("input-todo__input");
const todoList = document.getElementById("todo-list__ul");
const content = document.getElementById("todo-list__empty");
const todoCounter = document.getElementById("todo-counter");

// Начальное стостояние
let initialState = {
  todosArray: (todosArray = localStorage.getItem("todoAppList")
    ? JSON.parse(localStorage.getItem("todoAppList"))
    : []),
  activeTodos: [],
  filterController: "all",
};
localStorage.setItem("todoAppList", JSON.stringify(initialState.todosArray));

// Ререндер дом дерева
const rerender = (value) => {
  todoList.innerHTML = "";
  if (value.length == 0) {
    const el = document.createElement("div");
    el.innerHTML = "<div>...</div>";
    el.classList = "todo-list__empty";
    content.appendChild(el);
  } else {
    content.innerHTML = "";
    renderFilter(value, state.filterController);
  }
  initialState.activeTodos = value.filter((el) => !el.completed);
  todoCounter.innerHTML = state.activeTodos.length;
};

// Наблюдаемое сотояние приложения
const state = new Proxy(initialState, {
  set: (target, key, value) => {
    target[key] = value;
    rerender(initialState.todosArray);
    localStorage.setItem("todoAppList", JSON.stringify(target.todosArray));
    return true;
  },
});

// удаление выполненных тудух
const clearTodos = () => {
  if (state.todosArray.length !== 0) {
    state.todosArray = state.todosArray.filter((el) => !el.completed);
  }
};

// создание тудухи
const createTodo = (todo) => {
  const newTodo = document.createElement("li");
  newTodo.innerHTML = `<input class="toggle" type="checkbox" ${
    todo.completed && "checked"
  } />
    <div class="li__text">
        ${todo.title}
    </div>
    <div id="li__delete" class="li__delete" onClick="deleteTodo(event);">
        <img src="deleteIcon.png"/>
    </div>
    <input onblur="stopEditing(event)" type="text"/>`;
  newTodo.classList = "ul__li";
  newTodo.id = todo.id;

  newTodo.addEventListener(
    "click",
    customDblClick((event) => {
      event.target.classList.add("editing");
      event.target.lastChild.focus();
      event.target.lastChild.value = todo.title;
    })
  );

  newTodo.children[0].addEventListener("click", (event) => {
    event.stopPropagation();
    const itemId = event.target.parentNode.getAttribute("id");
    const index = state.todosArray.findIndex((el) => el.id === itemId);
    if (index !== -1) {
      const arrCopy = [...state.todosArray];
      arrCopy[index].completed = !arrCopy[index].completed;
      state.todosArray = [...arrCopy];
    }
  });

  newTodo.lastChild.addEventListener("keydown", (event) => {
    if (event.keyCode === 13 && event.target.value !== "") {
      const itemId = event.target.parentNode.getAttribute("id");
      const index = state.todosArray.findIndex((el) => el.id === itemId);
      if (index !== -1) {
        const arrCopy = [...state.todosArray];
        arrCopy[index].title = event.target.value;
        state.todosArray = [...arrCopy];
      }
      event.target.parentNode.classList.remove("editing");
    }
  });

  todoList.appendChild(newTodo);
};

// onBlur функция для editing инпута
const stopEditing = (event) => {
  const itemId = event.target.parentNode.getAttribute("id");
  const index = state.todosArray.findIndex((el) => el.id === itemId);
  if (index !== -1) {
    const arrCopy = [...state.todosArray];
    arrCopy[index].title = event.target.value;
    state.todosArray = [...arrCopy];
  }
  event.target.parentNode.classList.remove("editing");
};

// удаление тудухи
const deleteTodo = (event) => {
  event.stopPropagation();
  state.todosArray = state.todosArray.filter(
    (el) => el.id !== event.target.parentNode.parentNode.id
  );
};

// обработка нажатиия на главный инпут
input.addEventListener(
  "keydown",
  (event) => {
    if (event.keyCode === 13 && input.value != "") {
      state.todosArray = [
        ...state.todosArray,
        {
          id: Date.now().toString(),
          title: input.value,
          completed: false,
        },
      ];
      input.value = "";
    }
  },
  true
);

input.addEventListener(
  "blur", (event) => {
  if (event.target.value !== "") {
    state.todosArray = [
      ...state.todosArray,
      {
        id: Date.now().toString(),
        title: input.value,
        completed: false,
      },
    ];
    input.value = "";
  }
});

// обработка нажатия фильтров
const showAll = () => {
  state.filterController = "all";
};
const showActive = () => {
  state.filterController = "active";
};
const showCompleted = () => {
  state.filterController = "completed";
};

// util функции
const renderFilter = (value, option) => {
  switch (option) {
    case "all":
      value.map((el) => createTodo(el));
      break;
    case "active":
      value.filter((el) => !el.completed).map((el) => createTodo(el));
      break;
    case "completed":
      value.filter((el) => el.completed).map((el) => createTodo(el));
      break;
    default:
      value.map((el) => createTodo(el));
  }
};

const customDblClick = (handler, delay = 250) => {
  const dblclickconf = {
    clicks: 0,
    timer: null,
    delay,
  };

  return (event) => {
    dblclickconf["clicks"] += 1;
    if (dblclickconf["clicks"] <= 1) {
      dblclickconf["timer"] = setTimeout(() => {
        dblclickconf["clicks"] = 0;
      }, dblclickconf["delay"]);
    } else {
      clearTimeout(dblclickconf["timer"]);
      dblclickconf["clicks"] = 0;
      handler(event);
    }
  };
};

// начальный рендер
rerender(state.todosArray);
