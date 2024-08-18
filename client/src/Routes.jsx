import React, { useContext } from "react";
import RegesterAndLoginForm from "./pages/RegesterAndLoginForm";
import { UserContext } from "./container/UserContext";
import Chat from "./pages/Chat";

function Routes() {
  const { username, id } = useContext(UserContext);
  if (username) {
    return <Chat />;
  }
  return (
    <div>
      <RegesterAndLoginForm />
    </div>
  );
}

export default Routes;
