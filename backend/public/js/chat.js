document.addEventListener("DOMContentLoaded", function() {
    
    processRequest('/api/chat', { method: 'POST' })
    .then(response => response.json())
    .then((data) => {
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
        const socket = io({
            auth: {
                token: localStorage.getItem('accessToken'),
            }
        });
        // Handle user status updates only after the initial setup is done
        socket.on('userStatus', (status) => {
            const { userId, online } = status;
            console.log(`User ${userId} is ${online ? 'online' : 'offline'}`);
            // if (userId !== $('body').data('id')) {
                
                const statusElement = $(`.status-${userId}`)
                if (statusElement) {
                    
                    if(online){
                        statusElement.find('.status').addClass('active');
                    } else {
                        statusElement.find('.status').removeClass('active');
                    }
                    statusElement.find('p').text(online ? 'online' : 'offline');
                    // $('.active-status').text(online ? 'online' : 'offline');
                }
            // }
        });
        socket.on('connect', () => {
            var userId = $('body').data('id')
            console.log('Connected to server');
            socket.emit('userOnline', userId);
        });
       // Listen for 'testEvent' from server
        socket.on('testEvent', (data) => {
            console.log('Received testEvent from server:', data);
        });
        window.fetchConversation = async function(e) { // Attach function to the window object
            var receiverId = e.dataset.id
            const statusElement = $(`.chatHeader`)
            if ($(e).find('.status').hasClass('active')) {
                $(`.chatHeader`).find('.status').addClass('active')
                $(`.chatHeader`).find('p').text('online')
            } else {
                $(`.chatHeader`).find('.status').removeClass('active')
                $(`.chatHeader`).find('p').text('offline')
            }
            
            var userId = document.querySelector('body').dataset.id
            // $('.chatHeader').attr('class', `d-flex align-items-center chatHeader ${receiverId}-status`)
            // socket.emit('userStatus', { userId, online: true });
            try {
                document.querySelector('.recName').innerText = e.dataset.username
                const response = await processRequest('/api/fetchMessages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // Include cookies in cross-origin requests
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
                }
                if(data.messages){
                    $('.chatUI').html('')
                    document.querySelector('.noMessage').classList.add('d-none');
                    data.messages.forEach(message => {
                        // const formattedTime = formatTimestamp(message.timestamp);
                        if(message.sender !== data.userId){
                            if(message.deletedBy == null || !message.deletedBy.includes(parseInt(userId))){
                                renderMessage('received', message)
                            }
                        }else{
                            if(message.deletedBy == null || !message.deletedBy.includes(parseInt(userId))){
                                renderMessage('sent', message)
                            }
                        }
                       
                    });
                    $( ".chatUI li" ).hover(
                        function() {
                            $( this ).find( ".chatOptions" ).fadeIn(500) ;
                            
                        }, function() {
                            $( this ).find( ".chatOptions" ).fadeOut(100);
                            $(this).find('.chatOptionsList').hide()
                        }
                    );
                }
                
                document.querySelector('.msg-body').dataset.receiver = receiverId;
                const conversationId = data.conversationId; // Ensure your API returns this
                document.querySelector('.msg-body').dataset.conversation_id = conversationId
                // socket.emit('getUsersInConversation', conversationId, (userIds) => {
                //     console.log('Users in conversation:', userIds);
                // });
                socket.emit('join', conversationId);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    
    
        // Send a message
        document.querySelector('#sendMessageForm').addEventListener("submit", async function(event) {
            event.preventDefault();
            const text = document.querySelector('#msgText').value.trim();
            const conversationId = document.querySelector('.msg-body').dataset.conversation_id;
            const receiverId = document.querySelector('.msg-body').dataset.receiver;
            const fileInput = document.getElementById('upload');
            if(text !== "" || fileInput.files.length > 0){
                // renderMessage('sent sentText',{text, timestamp:Date.now()})
                const formData = new FormData();
                formData.append('conversationId', conversationId);
                formData.append('receiverId', receiverId);
                formData.append('text', text);

                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append('files', fileInput.files[i]);
                        // renderFile(fileInput.files[i], 'sent')
                }
                processRequest('/api/sendMessage',{
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch((error) => {console.log(error)})
            // socket.emit('sendMessage', {
            //     conversationId,
            //     receiverId,
            //     text
            // });
            document.querySelector('#msgText').value = ""
            document.querySelector('#upload').value = ""
            document.querySelector('#file-tabs').innerHTML = ""
            }
            
        });
    
        socket.on('message', (data) => {
            var userId = $('body').data('id')
            const { sender } = data
            
            if (sender == userId) {
                console.log('here')
                renderMessage('sent',data)
            } else {
                renderMessage('received',data)
            }
        });
        socket.on('deleteMessage', (data) => {
            var userId = $('body').data('id')
            const { sender } = data
            if (sender == userId) {
                renderMessage('sent',data)
            } else {
                renderMessage('received',data)
            }
        });
    })
    .catch(error => console.error('Error:', error));

    const renderFile = (file, type) => {
        let messageContainer = document.querySelector(".chatUI")
        if(file.type.startsWith('image/')){
            const imgBox = document.createElement('li')
            imgBox.classList.add()
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.maxHeight = '100px';
            imgBox.appendChild(img)
            // img.style.marginRight = '100px';
            messageContainer.appendChild(imgBox);
            imgBox.scrollIntoView(false)
        }
        // const msgBody = document.querySelector('.msg-body');
        // msgBody.scrollTop = msgBody.scrollHeight;
    }
    // Function to render friends
    const renderFriends = (friends) => {
        let chatList = document.querySelector('.chat-list');
        let friendsHTML = '';
        friends.forEach(friend => {
            friendsHTML += `<a href="#" class="d-flex align-items-center receiverUser status-${friend.id}" onclick="fetchConversation(this)" data-email="${friend.email || ""}" data-username="${friend.username}" data-id="${friend.id}">
                                <div class="flex-shrink-0">
                                    <img class="img-fluid" src="https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png" alt="user img">
                                    <span class="status"></span>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <h3>${friend.username}</h3>
                                    <p class=''>offline</p>
                                </div>
                            </a>`;
        });
        chatList.innerHTML = friendsHTML;
    };
    
    function scrollToBottom() {
        const messagesDiv = document.querySelector('.msg-body');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    const extractTime = (dateTimeString) => {
        const dateObject = new Date(dateTimeString);

        const hours = dateObject.getHours().toString().padStart(2, '0'); // Ensures 2 digits
        const minutes = dateObject.getMinutes().toString().padStart(2, '0'); // Ensures 2 digits

        const timeString = `${hours}:${minutes}`;

        return timeString;
    }
  
    function renderMessage(type,data){
        
        document.querySelector('.noMessage').classList.add('d-none');
        let messageContainer = document.querySelector(".chatUI");
        const userId = $('body').data('id')
        let chatActions = (userId == data.sender) ? `<div class="chatOptions" style="display:none">
                    <i class="fa fa-ellipsis-v showChatOptions" onclick="showChatOptions(this)" aria-hidden="true"></i>
                    <div class="chatOptionsList" style="display:none">
                        <span>Edit</span>
                        <span onclick="deleteChat(this)" data-id="${data.id}" >Delete</span>
                    </div>
                </div>` : ''
        if(data.files.length > 0){
            const files = data.files;
            const imageFormats = ['jpg', 'jpeg', 'png', 'webp'];
            
            files.forEach(file => {
                let el = document.createElement("li");
                el.setAttribute("onhover",`displayActions(this)`)
                let ext = file.split('.').pop().toLowerCase();
                if (imageFormats.includes(ext)) {
                    el.setAttribute("class",`${type} msg${data.id}id`)
                    
                el.innerHTML = `<div>
                ${chatActions}
                <img style="max-height: 100px;" src="/uploads/${file}" />
                </div><span class="time">${extractTime(data.timestamp)}</span>`;
                }
                
                messageContainer.appendChild(el);
            });
        }
            
            if (data.text !== "") {
                let el = document.createElement("li");
                el.setAttribute("class",`${type} ${type}Text msg${data.id}id`)
                el.setAttribute("onhover",`displayActions(this)`)
                el.innerHTML = `
                ${chatActions}
                <p> ${data.text} </p>
                <span class="time">${extractTime(data.timestamp)}</span>`;
                messageContainer.appendChild(el);
                
                
            }
            //scrolll chat to end
            const msgBody = document.querySelector('.msg-body');
                msgBody.scrollTop = msgBody.scrollHeight;
    }


});
