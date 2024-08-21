import React, { useContext, useEffect, useState } from "react";
import Avatar from "../container/Avatar";
import Logo from "../container/Logo";
import { UserContext } from "../container/UserContext";
import { uniqBy } from "lodash";

function Chat() {
  const [wsConnection, setWsConnection] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectuserId, setSelectuserId] = useState(null);
  const { username, id } = useContext(UserContext);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else {
      setMessages((prv) => [...prv, { ...messageData }]);
    }
  }
  function handleOnSubmit(e) {
    e.preventDefault();
    wsConnection.send(
      JSON.stringify({
        recipient: selectuserId,
        text: newMessage,
      })
    );
    setMessages((prv) => [
      ...prv,
      {
        text: newMessage,
        sender: id,
        recipient: selectuserId,
        _id: Date.now(),
      },
    ]);
    setNewMessage("");
  }
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    setWsConnection(ws);
    ws.addEventListener("message", handleMessage);
  }, []);
  //This method is used to Remove himself in an Object
  const onlinePeopleExcl = { ...onlinePeople };
  delete onlinePeopleExcl[id];

  const messageWithoutDups = uniqBy(messages, "_id");
  console.log(messageWithoutDups);
  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />{" "}
          {Object.keys(onlinePeopleExcl).map((userId) => (
            <div
              key={userId}
              onClick={() => setSelectuserId(userId)}
              className={` border-b border-gray-100 flex  items-center gap-2 cursor-pointer ${
                userId === selectuserId ? "bg-blue-50" : ""
              } `}
            >
              {userId === selectuserId && (
                <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
              )}
              <div className="flex gap-2 py-2 pl-4 items-center">
                <Avatar username={onlinePeople[userId]} userId={userId} />
                <span className="text-gray-800">{onlinePeople[userId]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            username
          </span>
          <button
            type="submit"
            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm"
          >
            logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectuserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-300">
                &larr; Select a person from the sidebar
              </div>
            </div>
          )}
          {!!selectuserId && (
            <div>
              {messageWithoutDups.map((message) => (
                <div
                  key={message._id}
                  className={message.sender === id ? "text-right" : "text-left"}
                >
                  <div
                    className={
                      "text-left inline-block p-2 my-2 rounded-md text-sm " +
                      (message.sender === id
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-500")
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* <div className="relative h-full">
            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
              <div>
                <div className="">
                  <div className="">
                    <a
                      target="_blank"
                      className="flex items-center gap-1 border-b"
                      href="{axios.defaults.baseURL + '/uploads/' + message.file}"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                
                </div>
              </div>

              <div></div>
            </div>
          </div> */}
        </div>
        {!!selectuserId && (
          <form onSubmit={handleOnSubmit} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here"
              className="bg-white flex-grow border rounded-sm p-2"
            />
            <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
              <input type="file" className="hidden" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;
