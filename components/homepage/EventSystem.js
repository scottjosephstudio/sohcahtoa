// Create a custom event system for communication between components
export const eventSystem = {
  events: {},
  subscribe: function (eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // Return an unsubscribe function
    return () => {
      this.events[eventName] = this.events[eventName].filter(
        (cb) => cb !== callback,
      );
    };
  },
  publish: function (eventName, data) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach((callback) => callback(data));
  },
};
