class Todo {
  selectors = {
    root: "[data-js-todo]",
    newTaskForm: "[data-js-todo-new-task-form]",
    newTaskInput: "[data-js-todo-new-task-input]",
    searchTaskForm: "[data-js-todo-search-task-form]",
    searchTaskInput: "[data-js-todo-search-task-input]",
    totalTasks: "[data-js-todo-total-tasks]",
    deleteAllButton: "[data-js-todo-delete-all-button]",
    list: "[data-js-todo-list]",
    item: "[data-js-todo-item]",
    itemCheckbox: "[data-js-todo-item-checkbox]",
    itemLabel: "[data-js-todo-item-label]",
    itemDeleteButton: "[data-js-todo-item-delete-button]",
    itemChangeButton: "[data-js-todo-item-change-button]",
    emptyMessage: "[data-js-todo-empty-message]",
  };

  stateClasses = {
    isVisible: "is-visible",
    isDisappearing: "is-disappearing",
  };

  localStorageKey = "todo-items";
  isEditing = false;

  constructor() {
    this.itemLabel = document.querySelector(this.selectors.itemLabel);

    this.rootElement = document.querySelector(this.selectors.root);
    this.newTaskFormElement = this.rootElement.querySelector(
      this.selectors.newTaskForm,
    );
    this.newTaskInputElement = this.rootElement.querySelector(
      this.selectors.newTaskInput,
    );
    this.searchTaskFormElement = this.rootElement.querySelector(
      this.selectors.searchTaskForm,
    );
    this.searchTaskInputElement = this.rootElement.querySelector(
      this.selectors.searchTaskInput,
    );
    this.totalTasksElement = this.rootElement.querySelector(
      this.selectors.totalTasks,
    );
    this.deleteAllButtonElement = this.rootElement.querySelector(
      this.selectors.deleteAllButton,
    );

    this.changeItemButtonElement = this.rootElement.querySelector(
      this.selectors.itemChangeButton,
    );

    this.listElement = this.rootElement.querySelector(this.selectors.list);

    ((this.emptyMessageElement = this.rootElement.querySelector(
      this.selectors.emptyMessage,
    )),
      (this.state = {
        items: this.getItemsFromLocalStorage(),
        filteredItems: null,
        searchQuery: "",
      }));
    this.render();
    this.bindEvents();
  }

  getItemsFromLocalStorage() {
    const rawData = localStorage.getItem(this.localStorageKey);
    console.log(typeof rawData);

    if (!rawData) {
      return [];
    }

    try {
      const parsedData = JSON.parse(rawData);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch {
      console.error("Todo items parse error");
      return [];
    }
  }

  saveItemsToLocalStorage() {
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(this.state.items),
    );
  }

  render() {
    this.totalTasksElement.textContent = this.state.items.length;

    this.deleteAllButtonElement.classList.toggle(
      this.stateClasses.isVisible,
      this.state.items.length > 0,
    );

    const items = this.state.filteredItems ?? this.state.items;

    this.listElement.textContent = "";

    items.forEach(({ id, title, isChecked }) => {
      let li = document.createElement("li");
      li.classList.add("todo__item", "todo-item");
      li.dataset.jsTodoItem = "";

      let input = document.createElement("input");
      input.classList.add("todo-item__checkbox");
      input.id = id;
      input.type = "checkbox";
      input.checked = isChecked;
      input.dataset.jsTodoItemCheckbox = "";

      let label = document.createElement("label");
      label.classList.add("todo-item__label");
      label.setAttribute("for", id);
      label.dataset.jsTodoItemLabel = "";

      // solves an important issue with label text height
      if (title.length > 30) {
        label.style.alignItems = "flex-start";
      }
      label.textContent = title;

      let changebutton = document.createElement("button");
      changebutton.classList.add("todo-item__change-button");
      changebutton.dataset.jsTodoItemChangeButton = "";
      changebutton.innerHTML = `<svg xmlns= "http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

      let deletebutton = document.createElement("button");
      deletebutton.classList.add("todo-item__delete-button");
      deletebutton.dataset.jsTodoItemDeleteButton = "";
      deletebutton.title = "Delete";
      deletebutton.setAttribute("aria-label", "Delete");
      deletebutton.innerHTML = `<svg width="20" height="20"   viewBox="0 0 20 20"  xmlns="http://www.w3.org/2000/svg"><path d="M15 5L5 15M5 5L15 15" stroke="#757575" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

      li.append(input, label, changebutton, deletebutton);
      this.listElement.prepend(li);
    });

    const isEmptyFilteredItems = this.state.filteredItems?.length === 0;
    const isEmptyItems = this.state.items.length === 0;

    this.emptyMessageElement.textContent = isEmptyFilteredItems
      ? "Tasks not found"
      : isEmptyItems
        ? "There are no tasks yet"
        : "";
  }

  addItem(title) {
    this.state.items.push({
      id: crypto?.randomUUID() ?? Date.now().toString(),
      title,
      isChecked: false,
    });

    this.saveItemsToLocalStorage();
    this.render();
  }

  deleteItem(id) {
    this.state.items = this.state.items.filter((item) => item.id !== id);
    this.saveItemsToLocalStorage();
    this.render();
  }

  toggleCheckedState(id) {
    this.state.items = this.state.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isChecked: !item.isChecked,
        };
      }
      return item;
    });
    this.saveItemsToLocalStorage();
    this.render();
  }

  filter() {
    const queryFormatted = this.state.searchQuery.toLowerCase();

    this.state.filteredItems = this.state.items.filter(({ title }) => {
      const titleFormatted = title.toLowerCase();

      return titleFormatted.includes(queryFormatted);
    });

    this.render();
  }

  resetFilter() {
    this.state.filteredItems = null;
    this.state.searchQuery = "";
    this.render();
  }

  onNewTaskFormSubmit = (event) => {
    event.preventDefault();
    const newTodoItemTitle = this.newTaskInputElement.value;

    if (newTodoItemTitle.trim().length > 0) {
      this.addItem(newTodoItemTitle);
      this.resetFilter();
      this.newTaskInputElement.value = "";
      this.newTaskInputElement.focus();
    }
  };

  onSearchTaskFormSubmit = (event) => {
    event.preventDefault();
  };

  onSearchTaskInputChange = ({ target }) => {
    const value = target.value.trim();

    if (value.length > 0) {
      this.state.searchQuery = value;
      this.filter();
    } else {
      this.resetFilter();
    }
  };

  onDeleteAllButtonClick = () => {
    const isConfirmed = confirm("Are you sure you want to delete all?");

    if (isConfirmed) {
      this.state.items = [];
      this.saveItemsToLocalStorage();
      this.render();
    }
  };

  onClick = ({ target }) => {
    if (target.matches(this.selectors.itemDeleteButton)) {
      const itemElement = target.closest(this.selectors.item); //li
      const itemCheckboxElement = itemElement.querySelector(
        this.selectors.itemCheckbox,
      );

      itemElement.classList.add(this.stateClasses.isDisappearing);
      setTimeout(() => {
        this.deleteItem(itemCheckboxElement.id);
      }, 400);
    }
  };

  onChangeCheckBox = ({ target }) => {
    if (target.matches(this.selectors.itemCheckbox)) {
      this.toggleCheckedState(target.id);
    }
  };

  ontitleChange = ({ target }) => {
    if (target.matches(this.selectors.itemChangeButton)) {
      let label = target.closest(this.selectors.item).querySelector("label");

      if (!this.isEditing) {
        target.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256"><g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(3.55556,3.55556)"><path d="M46.454,11c3.063,0 5.546,2.483 5.546,5.546v40.646c0,3.009 -3.617,4.54 -5.777,2.444l-10.223,-9.919l-10.223,9.919c-2.16,2.095 -5.777,0.565 -5.777,-2.445v-40.645c0,-3.063 2.483,-5.546 5.546,-5.546z"></path></g></g></svg>`;
        this.isEditing = true;
        label.setAttribute("contenteditable", "true");
        label.focus();
      } else {
        target.innerHTML = `<svg xmlns= "http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        this.isEditing = false;
        label.setAttribute("contenteditable", "false");

        let newTitleValue = label.textContent;
        let titleId = label.getAttribute("for");

        this.updateTitle(newTitleValue, titleId);
        this.saveItemsToLocalStorage();
      }
    }
  };

  updateTitle = (newTitle, id) => {
    this.state.items.forEach((item) => {
      if (id === item.id) {
        item.title = newTitle;
      }
    });
  };

  bindEvents() {
    this.newTaskFormElement.addEventListener(
      "submit",
      this.onNewTaskFormSubmit,
    );
    this.searchTaskFormElement.addEventListener(
      "submit",
      this.onSearchTaskFormSubmit,
    );
    this.searchTaskInputElement.addEventListener(
      "input",
      this.onSearchTaskInputChange,
    );
    this.deleteAllButtonElement.addEventListener(
      "click",
      this.onDeleteAllButtonClick,
    );
    this.listElement.addEventListener("click", this.onClick);
    this.listElement.addEventListener("change", this.onChangeCheckBox);
    this.listElement.addEventListener("click", this.ontitleChange);
  }
}
new Todo();



class ThemeSwitch {
  selectors = {
    themeSwitch: "[data-js-todo-theme-switch]",
    themeCircle: "[data-js-todo-theme-circle]",
  };

  constructor() {
    this.themeSwitch = document.querySelector(this.selectors.themeSwitch);
    this.themeCircle = document.querySelector(this.selectors.themeCircle);
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      document.body.classList.toggle("dark-theme", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme:dark)",
      ).matches;
      document.body.classList.toggle("dark-theme", prefersDark);
    }

    this.themeSwitch.addEventListener("click", () => this.toggleTheme());
  }

  toggleTheme() {
    let isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }
}

new ThemeSwitch();
