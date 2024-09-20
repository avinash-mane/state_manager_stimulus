export default class StateManager {
    constructor(wrapperElement, onStateUpdate, watchers) {
      this.wrapperElement = wrapperElement;
      this.onStateUpdate = onStateUpdate;
      this.watchers = watchers;
      this.state = {};
  
      this.#initializeState();
      this.#addEventListeners();
    }

    destroy(){
      this.#removeEventListeners()
    }

    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.#updateElements(); // Update form elements to reflect the new state
    }
  
    // Initialize form state with current values
    #initializeState() {
      const formElements = this.wrapperElement.querySelectorAll('input, select, textarea');
      formElements.forEach((element) => {
        this.#updateState(element, false);
      });
    }
  
    // Update form state when a field changes
    #updateState(element, callUpdate) {
      const previousState = { ...this.state };
  
      if (element.type === 'checkbox' && element.name.endsWith('[]')) {
        this.state[element.name] = this.state[element.name] || [];
        if (element.checked) {
          if (!this.state[element.name].includes(element.value)) {
            this.state[element.name].push(element.value);
          }
        } else {
          this.state[element.name] = this.state[element.name].filter((value) => value !== element.value);
        }
      } else if (element.type === 'checkbox') {
        this.state[element.name] = element.checked;
      } else if (element.type === 'radio') {
        this.state[element.name] = element.checked ? element.value : "";
      } else {
        this.state[element.name] = element.value;
      }
  
      if (callUpdate && JSON.stringify(previousState) !== JSON.stringify(this.state)) {
        if (typeof this.onStateUpdate === 'function' && this.#isWatchedFieldChanged(previousState, this.state)) {
          this.onStateUpdate(previousState, this.state);
        }
      }
    }
  
    // Helper function to check if a watched field has changed
    #isWatchedFieldChanged(prevState, currentState) {
      return this.watchers ? this.watchers.some((field) => prevState[field] !== currentState[field]) : true;
    }
  
    // Add event listeners to track changes in form fields
    #addEventListeners() {
      const formElements = this.wrapperElement.querySelectorAll('input, select, textarea');
      formElements.forEach((element) => {
        element.addEventListener('input', () => this.#updateState(element, true));
        element.addEventListener('change', () => this.#updateState(element, true));
      });
    }
  
    #removeEventListeners() {
      const formElements = this.wrapperElement.querySelectorAll('input, select, textarea');
      formElements.forEach((element) => {
        element.removeEventListener('input', () => this.#updateState(element, true));
        element.removeEventListener('change', () => this.#updateState(element, true));
      });
    }
  
    // Update form elements when the state changes
    #updateElements() {
      const formElements = this.wrapperElement.querySelectorAll('input, select, textarea');
      formElements.forEach((element) => {
        if (this.state[element.name] !== undefined) {
          if (element.type === 'checkbox' && element.name.endsWith('[]')) {
            element.checked = this.state[element.name]?.includes(element.value);
          } else if (element.type === 'checkbox') {
            element.checked = this.state[element.name];
          } else if (element.type === 'radio') {
            element.checked = this.state[element.name] === element.value;
          } else {
            element.value = this.state[element.name];
          }
        }
      });
    }
}
