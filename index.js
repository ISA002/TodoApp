// элементы дом дерева
const input = document.getElementById("input-todo__input");
const todoList = document.getElementById("todo-list__ul");
const content = document.getElementById("todo-list__empty");
const todoCounter = document.getElementById("todo-counter");
const toggleAll = document.getElementById("arrow");

// Начальное стостояние
let initialState = {
  todosArray: (todosArray = localStorage.getItem("todoAppList")
    ? JSON.parse(localStorage.getItem("todoAppList"))
    : []),
  activeTodos: 0,
  filterController: "all",
};
localStorage.setItem("todoAppList", JSON.stringify(initialState.todosArray));

// Ререндер дом дерева
const rerender = (value) => {
  todoList.innerHTML = "";
  if (value.length == 0) {
    content.innerHTML = "";
    const el = document.createElement("div");
    el.innerHTML = "<div>...</div>";
    el.classList = "todo-list__empty";
    content.appendChild(el);
  } else {
    content.innerHTML = "";
    renderFilter(value, state.filterController);
  }
  initialState.activeTodos = value.filter((el) => !el.completed).length;
  todoCounter.innerHTML = state.activeTodos;
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

// создание тудухи
const createTodo = (todo) => {
  const newTodo = document.createElement("li");
  newTodo.innerHTML = `<div class="${todo.completed}">
    </div>
    <div class="li__text">
        ${todo.title}
    </div>
    <div id="li__delete" class="li__delete" onClick="deleteTodo(event);">
        <img src="deleteIcon.png"/>
    </div>
    <input onblur="stopEditing(event)" type="text" pattern="[0-9A-Za-z]"/>`;
  newTodo.classList = "ul__li";
  newTodo.id = todo.id;

  newTodo.addEventListener(
    "click",
    customDblClick((event) => {
      event.currentTarget.classList.add("editing");
      event.currentTarget.lastChild.focus();
      event.currentTarget.lastChild.value = todo.title;
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
    if (
      event.keyCode === 13 &&
      event.target.value !== "" &&
      !event.target.value.match(/[<>]/)
    ) {
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
    console.log(event.target.value === "" && event.target.value.match(/[<>]/));
    if (!event.target.value) {
      arrCopy.splice(index, 1);
    } else {
      !event.target.value.match(/[<>]/)
        ? (arrCopy[index].title = event.target.value)
        : arrCopy.splice(index, 1);
    }
    state.todosArray = [...arrCopy];
  }
  event.target.parentNode.classList.remove("editing");
};

// обработчик toggleAll
toggleAll.addEventListener("click", (event) => {
  event.stopPropagation();
  state.todosArray = state.todosArray.map((el) => {
    if (state.activeTodos > 0) {
      el.completed = !el.completed ? !el.completed : el.completed;
    } else {
      el.completed = !el.completed;
    }
    return el;
  });
});

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
    if (
      event.keyCode === 13 &&
      input.value != "" &&
      !input.value.match(/[<>]/)
    ) {
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

input.addEventListener("blur", (event) => {
  if (event.target.value !== "" && !input.value.match(/[<>]/)) {
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
const changeFilters = (type) => {
  state.filterController = type;
  changeActive(type);
};

// удаление выполненных тудух
const clearTodos = () => {
  state.todosArray = state.todosArray.filter((el) => !el.completed);
};

// util функции
const filterProperties = {
  all: (value) => value,
  active: (value) => value.filter((el) => !el.completed),
  completed: (value) => value.filter((el) => el.completed),
};

const settingArray = ["all", "active", "completed"];

const renderFilter = (value, option) => {
  filterProperties[option](value).forEach((el) => createTodo(el));
};

const changeActive = (type) => {
  settingArray.forEach((el) => {
    const item = document.getElementById(el);
    item.classList = "nav__a";
    if (el === type) item.classList.add("active");
  });
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
