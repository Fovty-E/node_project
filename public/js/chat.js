document.addEventListener("DOMContentLoaded", function() {
    
    processRequest('/api/chat', { method: 'POST' })
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        let chatList = document.querySelector('.chat-list');
        document.querySelector('body').dataset.id = data.userid;
        renderFriends(data.friends)
        // Add event listener to search input
        document.querySelector('.searchChatInput').addEventListener('input', (event) => {
            const searchQuery = event.target.value.toLowerCase();
            const filteredFriends = data.friends.filter(friend =>
                friend.username.toLowerCase().includes(searchQuery)
            );
            renderFriends(filteredFriends);
        });
        const socket = io();
        // Handle user status updates only after the initial setup is done
        socket.on('userStatus', (status) => {
            const { userId, online } = status;
            console.log(`User ${userId} is ${online ? 'online' : 'offline'}`);
            console.log($('body').data('id'));
            if (userId !== $('body').data('id')) {
                const statusElement = $(`.${userId}-status`)
                if (statusElement) {
                    statusElement.text(online ? 'online' : 'offline');
                    $('.active-status').text(online ? 'online' : 'offline');
                }
            }
        });
        window.fetchConversation = async function(e) { // Attach function to the window object
            var receiverId = e.dataset.id
            try {
                document.querySelector('.recName').innerText = e.dataset.username
                const response = await fetch('/api/fetchMessages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ receiverId })
                });
                const data = await response.json();
                document.querySelector('.msg-body').classList.remove('d-none');
                document.querySelector('.chatbox .modal-content').classList.remove('d-none');
                document.querySelector('.chat-welcome').classList.add('d-none');
                var el = ''
                if (data.NoMessage) {
                    document.querySelector('.noMessage').classList.remove('d-none');
                    document.querySelector('.noMessage').textContent = data.NoMessage;
                    console.log('dhcsb')
                }
                if(data.messages){
                    document.querySelector('.noMessage').classList.add('d-none');
                    data.messages.forEach(message => {
                        // const formattedTime = formatTimestamp(message.timestamp);
                        if(message.sender !== data.userId){
                            el += `<li class="receiver">
                                    <p> ${message.text} </p>
                                    <span class="time">${new Date(message.timestamp).toLocaleTimeString()}</span>
                                </li>`
                        }else{
                            el += `<li class="reply">
                                    <p> ${message.text} </p>
                                    <span class="time">${new Date(message.timestamp).toLocaleTimeString()}</span>
                                </li>` 
                        }
                        
                        // console.log(`Message: ${message.text}, Sent at: ${formattedTime}`);
                        // Update your chat UI with the message and formatted time
                        // Example: appendMessageToChatUI(message.text, formattedTime);
                    });
                    
                }
                document.querySelector('.chatUI').innerHTML = el
                    scrollToBottom()
                document.querySelector('.msg-body').dataset.receiver = receiverId;
                const conversationId = data.conversationId; // Ensure your API returns this
                document.querySelector('.msg-body').dataset.conversation_id = conversationId
                socket.emit('join', conversationId);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    
        // // Handle user status updates
        // socket.on('userStatus', (status) => {
        //     const { userId, online } = status;
        //     console.log(`User ${userId} is ${online ? 'online' : 'offline'}`);
        //     console.log(document.querySelector('body').dataset.id)
        //     if (userId !== document.querySelector('body').dataset.id) {
        //         document.querySelector(`.${userId}-status`).innerText = online ? 'online' : 'offline'
            
        //     // Update your UI to reflect user online status
        //     }
            
        // });
    
        // Send a message
        document.querySelector('#sendMessageForm').addEventListener("submit", async function(event) {
            event.preventDefault();
            const text = document.querySelector('#msgText').value.trim();
            const conversationId = document.querySelector('.msg-body').dataset.conversation_id;
            const receiverId = document.querySelector('.msg-body').dataset.receiver;
            if(text !== ""){
                renderMessage('reply',{text, timestamp:Date.now()})
            socket.emit('sendMessage', {
                conversationId,
                receiverId,
                text
            });
            document.querySelector('#msgText').value = ""
            }
            
        });
    
        socket.on('message', (data) => {
            const receiverId = document.querySelector('.msg-body').dataset.receiver;
            if(data.sender !== receiverId){
                return;
            }
            renderMessage('receiver',data)
            // Update your chat UI with the new message
        });
    })
    .catch(error => console.error('Error:', error));
    // Function to render friends
    const renderFriends = (friends) => {
        let chatList = document.querySelector('.chat-list');
        let friendsHTML = '';
        friends.forEach(friend => {
            friendsHTML += `<a href="#" class="d-flex align-items-center receiverUser" onclick="fetchConversation(this)" data-email="${friend.email || ""}" data-username="${friend.username}" data-id="${friend._id}">
                                <div class="flex-shrink-0">
                                    <img class="img-fluid" src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png" alt="user img">
                                    <span class="status"></span>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h3>${friend.username}</h3>
                                    <p class='${friend._id}-status'>offline</p>
                                </div>
                            </a>`;
        });
        chatList.innerHTML = friendsHTML;
    };
    
    function scrollToBottom() {
        const messagesDiv = document.querySelector('.msg-body');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    function renderMessage(type,data){
        document.querySelector('.noMessage').classList.add('d-none');
        let messageContainer = document.querySelector(".chatUI");
        let el = document.createElement("li");
            el.setAttribute("class",type)
            el.innerHTML = `
                <p> ${data.text} </p>
                <span class="time">${new Date(data.timestamp).toLocaleTimeString()}</span>
            `;
            messageContainer.appendChild(el);
        //scrolll chat to end
        const msgBody = document.querySelector('.msg-body');
        msgBody.scrollTop = msgBody.scrollHeight;
    }
});
