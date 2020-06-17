// элементы дом дерева
const input = document.getElementById("input-todo__input");
const todoList = document.getElementById("todo-list");
const content = document.getElementById("todo-list__empty");
const todoCounter = document.getElementById("todo-counter");
const toggleAll = document.getElementById("arrow");
const hiddenInput = document.getElementById("hidden-input");

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
  content.innerHTML = "";
  if (value.length == 0) {
    const el = document.createElement("div");
    el.innerHTML = "<div>...</div>";
    el.classList = "empty";
    content.appendChild(el);
  } else {
    renderFilter(value, state.filterController);
  }
  initialState.activeTodos = value.filter((el) => !el.completed).length;
  todoCounter.innerHTML =
    state.activeTodos + " " + declOfNum(state.activeTodos);
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

// рендер тудухи
const renderTodo = (todo) => {
  const newTodo = document.createElement("li");
  newTodo.classList = "ul__li";
  newTodo.id = todo.id;
  newTodo.innerHTML = `<div id="li__toggle" class="li__checkbox ${todo.completed}">
    </div>
    <div class="li__text">
        ${todo.title}
    </div>
    <div id="li__delete" class="li__delete" data-id="${todo.id}" onClick="deleteTodo(event);">
        <img src="deleteIcon.png"/>
    </div>
    <input id="hidden-input" onblur="stopEditing(event)" type="text" pattern="[0-9A-Za-z]"/>`;

  newTodo.addEventListener(
    "click",
    customDblClick((event) => {
      event.currentTarget.classList.add("editing");
      event.currentTarget.lastChild.focus();
      event.currentTarget.lastChild.value = todo.title;
    })
  );

  newTodo.querySelector("#li__toggle").addEventListener("click", (event) => {
    event.stopPropagation();
    const itemId = event.target.parentNode.getAttribute("id");
    const index = state.todosArray.findIndex((el) => el.id === itemId);
    if (index !== -1) {
      const arrCopy = [...state.todosArray];
      arrCopy[index].completed = !arrCopy[index].completed;
      state.todosArray = [...arrCopy];
    }
  });

  newTodo
    .querySelector("#hidden-input")
    .addEventListener("keydown", (event) => {
      if (isInputValid(event)) {
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
  const todoId = event.target.parentNode.getAttribute("data-id");
  state.todosArray = state.todosArray.filter((el) => el.id !== todoId);
};

// обработка нажатиия на главный инпут
input.addEventListener(
  "keydown",
  (event) => {
    if (isInputValid(event)) {
      createTodo(input);
    }
  },
  true
);

input.addEventListener("blur", (event) => {
  if (event.target.value !== "" && !input.value.match(/[<>]/)) {
    createTodo(input);
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

// создание тудухи
const createTodo = (target) => {
  state.todosArray = [
    ...state.todosArray,
    {
      id: Date.now().toString(),
      title: target.value,
      completed: false,
    },
  ];
  target.value = "";
};

// util функции
const filterProperties = {
  all: (value) => value,
  active: (value) => value.filter((el) => !el.completed),
  completed: (value) => value.filter((el) => el.completed),
};

const settingArray = ["all", "active", "completed"];

const renderFilter = (value, option) => {
  filterProperties[option](value).forEach((el) => renderTodo(el));
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

const declOfNum = (number) => {
  titles = ["item", "items"];
  return titles[number === 1 ? 0 : 1];
};

const isInputValid = (event) => {
  return (
    event.keyCode === 13 &&
    event.target.value != "" &&
    !event.target.value.match(/[<>]/)
  );
};

// начальный рендер
rerender(state.todosArray);
