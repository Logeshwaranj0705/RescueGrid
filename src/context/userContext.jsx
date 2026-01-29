import React, { createContext, useState } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const updateUser = (userData) => setUser(userData);
  const clearUser = () => {
    setUser(null);
    setSelectedUserId(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider
      value={{ user, updateUser, clearUser, selectedUserId, setSelectedUserId }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
