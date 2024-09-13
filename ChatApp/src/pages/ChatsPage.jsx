import React, { useState, useEffect, useContext, createContext } from "react";
import { ChatUsersList } from "../components/chat/ChatUsersList";
import { ChatConversation } from "../components/chat/ChatConversation";
import { AuthContext } from "../utils/contexts/AuthProvider";
import useAxios from "../utils/axiosInstance";

export const ChatContext = createContext();

export function ChatsPage(){
    const { auth, socket } = useContext(AuthContext)
    const [ conversation, setConversation ] = useState(false)
    const [ messages, setMessages ] = useState([])
    const [contactName, setContactName] = useState('')
    const [conversationId, setConversationId] = useState('')
    const [receiverId, setReceiverId] = useState('')
    const [onlineStatus, setOnlineStatus] = useState('')
    const chatTextRef = React.useRef(null);
    const { userID } = auth;
    const axiosInstance = useAxios();
    const [connect, setConnect] = useState(false) 
    useEffect(() => {
        if (socket && auth.isAuthenticated) {
            console.log('Socket has been connected')
            socket.on('message', (message) => {
                const { sender } = message
                setMessages((prevMsg) => ([...prevMsg, message]))
                // Handle incoming message logic
            });

            socket.on('connect_error', (err) => {
                console.log('Socket connection error:', err);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });
          // Clean up the socket listeners when component unmounts
          return () => {
            // socket.off('message');
            // socket.off('connect_error');
            // socket.off('disconnect');
          };
        }
      }, [socket, auth.isAuthenticated]);
 
   async function fetchConversation(e){
        const statusElement = document.querySelector('.chatHeader');
        const status = e.querySelector('.status');
        setContactName(e.dataset.username)
        setReceiverId(e.dataset.id)
        if (status.classList.contains('active')) {
            statusElement.querySelector('.status').classList.add('active');
            statusElement.querySelector('p').textContent = 'online';
        } else {
            statusElement.querySelector('.status').classList.remove('active');
            statusElement.querySelector('p').textContent = 'offline';
        }

        try {
            let res = await axiosInstance.post('/user/fetchMessages',{receiverId: e.dataset.id})
            let { data } = res;
            document.querySelector('.msg-body').classList.remove('d-none');
                document.querySelector('.chatbox .modal-content').classList.remove('d-none');
                document.querySelector('.chat-welcome').classList.add('d-none');
                if (data.messages) {
                    setConversation(true)
                    setMessages(data.messages)
                }
                
                setConversationId(data.conversationId)
                socket.emit('join', data.conversationId);
                const msgBody = document.querySelector('.msg-body');
                msgBody.scrollTop = msgBody.scrollHeight;
        } catch (error) {
            console.error(error)
        }
        
    }

    const handleChatText = (e) => setChatText(e.target.value)
    
    const handleSendMessage = async (e) => {
        e.preventDefault()
        const chatText = chatTextRef.current.value;
        if (chatText !== "") {
            let params = { 
                text: chatText,
                receiverId,
                conversationId
             }
             try {
                await axiosInstance.post('/user/sendMessage', params)
                const msgBody = document.querySelector('.msg-body');
                msgBody.scrollTop = msgBody.scrollHeight;
             } catch (error) {
                console.log(error)
             }
             
            document.querySelector('#msgText').value = ""
            document.querySelector('#upload').value = ""
            document.querySelector('#file-tabs').innerHTML = ""
        }
    }
  
    return (
        <ChatContext.Provider value={{fetchConversation, messages}}>

            <section className="message-area">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="chat-area">
                               
                            { auth.isAuthenticated && <ChatUsersList userID={auth.userID} /> }
        
        
                            <div className="chatbox">
                                <div className="modal-dialog-scrollable">
                                    <div className="chat-welcome">
                                        <span>Start a conversation</span>
                                    </div>
                                    <div className="modal-content d-none">
                                    <div className="msg-head">
                                        <div className="row">
                                        <div className="col-8">
                                            <div className="d-flex align-items-center chatHeader">
                                            <span className="chat-icon">
                                                <img
                                                className="img-fluid"
                                                src="https://mehedihtml.com/chatbox/assets/img/arroleftt.svg"
                                                alt="arrow left"
                                                />
                                            </span>
                                            <div className="flex-shrink-0" style={{ position: 'relative' }}>
                                                <img
                                                className="img-fluid"
                                                src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png"
                                                alt="user"
                                                />
                                                <span className="status"></span>
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                <h3 className="recName">{contactName}</h3>
                                                <p className="active-status">{onlineStatus}</p>
                                            </div>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <ul className="moreoption">
                                            <li className="navbar nav-item dropdown">
                                                <a
                                                className="nav-link dropdown-toggle"
                                                href="#"
                                                role="button"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                >
                                                <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
                                                </a>
                                                <ul className="dropdown-menu">
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                    Action
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                    Another action
                                                    </a>
                                                </li>
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>
                                                <li>
                                                    <a className="dropdown-item" href="#">
                                                    Something else here
                                                    </a>
                                                </li>
                                                </ul>
                                            </li>
                                            </ul>
                                        </div>
                                        </div>
                                    </div>

                                    <div className="modal-body">
                                        <div className="msg-body d-none" data-receiver="">
                                        <ChatConversation messages={messages} userID={userID} />
                                        </div>
                                    </div>

                                    <div className="send-box">
                                        <form action="" onSubmit={handleSendMessage}>
                                        <div id="file-tabs" className="file-tabs"></div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="msgText"
                                            aria-label="message…"
                                            placeholder="Write message…"
                                            ref={chatTextRef}
                                            // onChange={handleChatText}
                                        />
                                        <button type="submit">
                                            <i className="fa fa-paper-plane" aria-hidden="true" id="sendMessage"></i> Send
                                        </button>
                                        </form>

                                        <div className="send-btns">
                                        <div className="attach">
                                            <div className="button-wrapper">
                                            <span className="label">
                                                <img
                                                className="img-fluid"
                                                src="https://mehedihtml.com/chatbox/assets/img/upload.svg"
                                                alt="upload"
                                                />
                                                attached file
                                            </span>
                                            <input
                                                type="file"
                                                name="files"
                                                id="upload"
                                                className="upload-box"
                                                multiple
                                                placeholder="Upload File"
                                                aria-label="Upload File"
                                            />
                                            </div>

                                            <select className="form-control" id="exampleFormControlSelect1">
                                            <option>Select template</option>
                                            <option>Template 1</option>
                                            <option>Template 2</option>
                                            </select>

                                            <div className="add-apoint">
                                            <a href="#" data-toggle="modal" data-target="#exampleModal4">
                                                <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                >
                                                <path
                                                    d="M8 16C3.58862 16 0 12.4114 0 8C0 3.58862 3.58862 0 8 0C12.4114 0 16 3.58862 16 8C16 12.4114 12.4114 16 8 16ZM8 1C4.14001 1 1 4.14001 1 8C1 11.86 4.14001 15 8 15C11.86 15 15 11.86 15 8C15 4.14001 11.86 1 8 1Z"
                                                    fill="#7D7D7D"
                                                />
                                                <path
                                                    d="M11.5 8.5H4.5C4.224 8.5 4 8.276 4 8C4 7.724 4.224 7.5 4.5 7.5H11.5C11.776 7.5 12 7.724 12 8C12 8.276 11.776 8.5 11.5 8.5Z"
                                                    fill="#7D7D7D"
                                                />
                                                <path
                                                    d="M8 12C7.724 12 7.5 11.776 7.5 11.5V4.5C7.5 4.224 7.724 4 8 4C8.276 4 8.5 4.224 8.5 4.5V11.5C8.5 11.776 8.276 12 8 12Z"
                                                    fill="#7D7D7D"
                                                />
                                                </svg>{' '}
                                                Appoinment
                                            </a>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
        
        
                        </div>
                    </div>
                </div>
            </section>
        </ChatContext.Provider>
    )
}