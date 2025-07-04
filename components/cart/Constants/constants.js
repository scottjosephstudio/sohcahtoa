// src/components/cart/constants.js

export const LICENSE_TYPES = {
  print: { displayName: "Desktop", optionsKey: "print" },
  web: { displayName: "Web", optionsKey: "web" },
  app: { displayName: "App", optionsKey: "app" },
  social: { displayName: "Social Media", optionsKey: "social" },
};

export const packages = {
  small: {
    price: 200,
    print: "(1-5 users, maximum 1 location)",
    web: "(1 domain, maximum 50k monthly visitors)",
    app: "(1 app, maximum 10k downloads)",
    social: "(maximum 10k followers)",
  },
  medium: {
    price: 400,
    print: "(6–15 users, maximum 2 locations)",
    web: "(1 domain, maximum 100k monthly visitors)",
    app: "(1 app, maximum 50k downloads)",
    social: "(maximum 50k followers)",
  },
  large: {
    price: 800,
    print: "(16–30 users, maximum 5 locations)",
    web: "(1 domain, maximum 500k monthly visitors)",
    app: "(1 app, maximum 200k downloads)",
    social: "(maximum 100k followers)",
  },
};

export const licenseOptions = {
  print: {
    small: {
      name: "Small",
      limit: "(1-5 users, maximum 1 location)",
      price: 60,
    },
    medium: {
      name: "Medium",
      limit: "(6–15 users, maximum 2 locations)",
      price: 120,
    },
    large: {
      name: "Large",
      limit: "(15–30 users, maximum 5 locations)",
      price: 240,
    },
  },
  web: {
    small: {
      name: "Small",
      limit: "(1 domain, maximum 50k monthly visitors)",
      price: 50,
    },
    medium: {
      name: "Medium",
      limit: "(1 domain, maximum 100k monthly visitors)",
      price: 100,
    },
    large: {
      name: "Large",
      limit: "(1 domain, maximum 500k monthly visitors)",
      price: 200,
    },
  },
  app: {
    small: {
      name: "Small",
      limit: "(1 app, maximum 10k downloads)",
      price: 50,
    },
    medium: {
      name: "Medium",
      limit: "(1 app, maximum 50k downloads)",
      price: 100,
    },
    large: {
      name: "Large",
      limit: "(1 app, maximum 100k downloads)",
      price: 200,
    },
  },
  social: {
    small: {
      name: "Small",
      limit: "(all platforms, maximum 10k followers)",
      price: 40,
    },
    medium: {
      name: "Medium",
      limit: "(all platforms, maximum 50k followers)",
      price: 80,
    },
    large: {
      name: "Large",
      limit: "(all platforms, maximum 100k followers)",
      price: 160,
    },
  },
};
