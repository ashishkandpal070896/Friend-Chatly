import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import download from "../assets/download.png";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

import EmojiPicker from "emoji-picker-react";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import { serverUrl } from "../main";
import { setMessages } from "../redux/messageSlice";

function MessageArea() {
  let [frontedImage, setFrontedImage] = useState(null);
  let [backendImage, setBackendImage] = useState(null);
  let image = useRef();
  let [input, setInput] = useState("");
  let { messages } = useSelector((state) => state.message);

  const handleImage = (e) => {
    let file = e.target.files[0];
    setBackendImage(file);
    setFrontedImage(URL.createObjectURL(file));
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.length == 0 && backendImage == null) {
      return null;
    }
    try {
      let formData = new FormData();
      formData.append("message", input);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      // console.log("selectedUser:", selectedUser);
      let result = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      dispatch(setMessages([...messages, result.data]));
      setInput("");
      setFrontedImage(null);
      setBackendImage(null);
    } catch (error) {
      console.log(error);
    }
  };
  let { selectedUser, userData, socket } = useSelector((state) => state.user);
  let dispatch = useDispatch();
  let [showPicker, setShowPicker] = useState(false);

  const onEmojiClick = (emojiData) => {
    setInput((prevInput) => prevInput + emojiData.emoji);
    setShowPicker(false);
  };
  useEffect(() => {
    socket.on("newMessage", (mess) => {
      dispatch(setMessages([...messages, mess]));
    });
    return () => socket.off("newMessages");
  }, [messages, setMessages]);

  return (
    <div
      className={`lg:w-[70%] relative ${
        selectedUser ? "flex" : "hidden"
      } lg:flex w-full h-full bg-slate-200
  border-l-2 border-gray-300`}
    >
      {selectedUser && (
        <div className="w-full h-[100vh] flex flex-col ">
          <div className="w-full h-[100px]  bg-[#1797c2] rounded-b-[30px] shadow-gray-400 shadow-lg gap-[20px] flex items-center px-[20px]">
            <div
              className="cursor-pointer"
              onClick={() => dispatch(setSelectedUser(null))}
            >
              <IoIosArrowRoundBack className="w-[40px] h-[40px] text-white" />
            </div>
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center bg-white cursor-pointer shadow-gray-500 shadow-lg">
              <img
                src={selectedUser?.image || download}
                alt=""
                className="h-[100%]"
              />
            </div>
            <h1 className="text-white font-semibold text-[20px] ">
              {selectedUser?.name || "user"}
            </h1>
          </div>
          <div className="w-full h-[70%] flex flex-col py-[30px] px-[20px] overflow-auto gap-[20px]  ">
            {showPicker && (
              <div className="absolute bottom-[120px] left-[20px] ">
                <EmojiPicker
                  width={250}
                  height={450}
                  className="shadow-lg z-[100]"
                  onEmojiClick={onEmojiClick}
                />
              </div>
            )}
            {messages &&
              messages.map((mess) =>
                mess.sender == userData._id ? (
                  <SenderMessage image={mess.image} message={mess.message} />
                ) : (
                  <ReceiverMessage image={mess.image} message={mess.message} />
                )
              )}
          </div>
        </div>
      )}
      {selectedUser && (
        <div className="w-full lg:w-[70%] h-[100px] fixed bottom-[20px] flex items-center justify-center">
          <img
            src={frontedImage}
            alt=""
            className="w-[80px] absolute bottom-[100px] right-[20%] rounded-lg shadow-gray-400 shadow-lg"
          />
          <form
            className="w-[95%] lg:w-[70%] h-[60px] bg-[#1797c2] rounded-full shadow-gray-400 shadow-lg flex items-center gap-[20px] px-[20px] relative"
            onSubmit={handleSendMessage}
          >
            <div onClick={() => setShowPicker((prev) => !prev)}>
              <RiEmojiStickerLine className="w-[25px] h-[25px] text-white cursor-pointer" />
            </div>

            <input
              type="file"
              accept="image/*"
              ref={image}
              hidden
              onChange={handleImage}
            />
            <input
              type="text"
              className="w-full h-full px-[10px] outline-none border-0 text-[19px] text-white bg-transparent placeholder-white "
              placeholder="Message"
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <div onClick={() => image.current.click()}>
              <FaImages className="w-[25px] h-[25px] text-white cursor-pointer" />
            </div>

            {(input.length > 0 || backendImage != null) && (
              <button>
                <IoSend className="w-[25px] h-[25px] text-white cursor-pointer" />
              </button>
            )}
          </form>
        </div>
      )}
      {!selectedUser && (
        <div className="w-full h-full flex flex-col justify-center items-center gap-[20px]">
          <h1 className="text-gray-700 font-bold text-[50px]">
            Welcome to Chatly
          </h1>
          <span className="text-gray-700 font-semibold text-[30px]">
            Chat Friendly !
          </span>
        </div>
      )}
    </div>
  );
}

export default MessageArea;
