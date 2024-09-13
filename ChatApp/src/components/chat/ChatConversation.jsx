import { useState } from "react";


export function ChatConversation({messages, userID}){
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const extractTime = (dateTimeString) => {
        const dateObject = new Date(dateTimeString);

        const hours = dateObject.getHours().toString().padStart(2, '0'); // Ensures 2 digits
        const minutes = dateObject.getMinutes().toString().padStart(2, '0'); // Ensures 2 digits

        const timeString = `${hours}:${minutes}`;

        return timeString;
    }
    const deleteChat = (e) => {
        const chatid = e.dataset.id;
        processRequest('/api/deleteMessage', {
            method: 'DELETE',
            body: JSON.stringify({ id: chatid }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then((result) => {
            console.log(result.success)
            if (result.success) {
                $(`.msg${chatid}id`).remove();
            }
        })
        .catch(error => { console.log(error) })
    }
    return (
        messages.length < 1 ? (
            <div className="noMessage">Send a message to start a conversation</div>
        ) : (
            <ul className="chatUI" key={1}>
                {messages.map((message) => {
                    let type;
                    const isSender = message.sender === userID;
                    
                    if (!message.deletedBy || !message.deletedBy.includes(parseInt(userID))) {
                        type = isSender ? 'sent' : 'received';
                    }

                    // Only render the message if it's not deleted
                    return type ? (
                        <li
                            key={message.id}
                            className={`${type} ${type}Text msg${message.id}id`}
                            onMouseEnter={() => setHoveredMessage(message.id)}
                            onMouseLeave={() => setHoveredMessage(null)}
                        >
                            {/* Show chat options when the message is hovered */}
                            {hoveredMessage === message.id && (
                                <div className="chatOptions">
                                    {isSender && <i className="fa fa-ellipsis-v showChatOptions" aria-hidden="true"></i> }
                                    {isSender && showActions && <div className="chatOptionsList">
                                        <span>Edit</span>
                                        <span onClick={() => deleteChat(message.id)}>Delete</span>
                                    </div>}
                                </div>
                            )}
                            
                            <p>{message.text}</p>
                            <span className="time">{extractTime(message.timestamp)}</span>
                        </li>
                    ) : null;
                })}
            </ul>
        )
    );
    
}