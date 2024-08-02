document.addEventListener("DOMContentLoaded", function() {
    console.log('jere')
    const socket = io();

    window.fetchConversation = async function(receiverId) { // Attach function to the window object
        try {
            const response = await fetch('/api/fetchMessages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receiverId })
            });
            const data = await response.json();
            if (data.NoMessage) {
                document.querySelector('.noMessage').classList.remove('d-none');
                document.querySelector('.noMessage').textContent = data.NoMessage;
            }
            if(data.messages){
                console.log(data.messages)
            }
            document.querySelector('.msg-body').dataset.receiver = receiverId;
            const conversationId = data.conversationId; // Ensure your API returns this
            document.querySelector('.msg-body').dataset.conversation_id = conversationId
            console.log(`Joining conversation with ID: ${conversationId}`);
            socket.emit('join', conversationId);
            console.log(document.querySelector('.msg-body').dataset.conversation_id);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Handle user status updates
    socket.on('userStatus', (status) => {
        const { userId, online } = status;
        console.log(`User ${userId} is ${online ? 'online' : 'offline'}`);
        // Update your UI to reflect user online status
    });

    // Send a message
    document.querySelector('#sendMessageForm').addEventListener("submit", async function(event) {
        event.preventDefault();
        const text = document.querySelector('#msgText').value;
        const conversationId = document.querySelector('.msg-body').dataset.conversation_id;
        const receiverId = document.querySelector('.msg-body').dataset.receiver;
        console.log(conversationId)
        socket.emit('sendMessage', {
            conversationId,
            receiverId,
            text
        });
    });

    socket.on('message', (message) => {
        console.log('New message received:', message);
        // Update your chat UI with the new message
    });
});
