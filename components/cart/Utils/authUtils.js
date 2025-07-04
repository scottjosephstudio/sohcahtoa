/// In authUtils.js
export const loginUser = (userData) => {
  // Set all auth-related data in one place
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userEmail", userData.email);
  localStorage.setItem("userPassword", userData.password);

  // Store additional user details if provided
  if (userData.firstName) {
    localStorage.setItem("firstName", userData.firstName);
  }
  if (userData.lastName) {
    localStorage.setItem("lastName", userData.lastName);
  }

  // Dispatch event for components to listen to
  const authEvent = new CustomEvent("authStateChange", {
    detail: {
      isAuthenticated: true,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
    },
  });
  window.dispatchEvent(authEvent);
};

// Modify your existing logoutUser to also clear cart state
export const logoutUser = () => {
  // Clear all auth-related data
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userPassword");
  localStorage.removeItem("isCartAuthenticated");
  clearCartState(); // Add this line to clear cart state on logout

  // Dispatch logout event
  const authEvent = new CustomEvent("authStateChange", {
    detail: { isAuthenticated: false },
  });
  window.dispatchEvent(authEvent);
};

export const isUserAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

export const resetCartProgress = () => {
  localStorage.removeItem("hasProceedBeenClicked");
};

export const saveCartState = (cartState) => {
  // Save complete cart state including form position
  const completeState = {
    ...cartState,
    lastPosition: {
      showRegistration: cartState.showRegistration || false,
      showUsageSelection: cartState.showUsageSelection || false,
      showPaymentForm: cartState.showPaymentForm || false,
      isRegistrationComplete: cartState.isRegistrationComplete || false,
      selectedUsage: cartState.selectedUsage || null,
      eulaAccepted: cartState.eulaAccepted || false,
      isAuthenticatedAndPending: cartState.isAuthenticatedAndPending || false,
    },
  };
  localStorage.setItem("cartState", JSON.stringify(completeState));
};

export const getCartState = () => {
  const savedCart = localStorage.getItem("cartState");
  if (!savedCart) return null;

  const parsedCart = JSON.parse(savedCart);
  // Always return the complete state including lastPosition
  return {
    ...parsedCart,
    lastPosition: parsedCart.lastPosition || {},
  };
};

export const clearCartState = () => {
  // Store current auth state
  const currentAuthState = localStorage.getItem("isAuthenticated");
  const userEmail = localStorage.getItem("userEmail");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  // Clear cart-specific items
  localStorage.removeItem("cartState");
  localStorage.removeItem("hasProceedBeenClicked");

  // Restore auth state if user was logged in
  if (currentAuthState === "true" && userEmail) {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", userEmail);
    if (firstName) localStorage.setItem("firstName", firstName);
    if (lastName) localStorage.setItem("lastName", lastName);
  }
};
