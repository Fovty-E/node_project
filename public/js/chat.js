(function(){
    console.log('jere')
    const app = document.querySelector(".app");
    const socket = io();

    // Send a message
        
        document.querySelector('#sendMessageForm').addEventListener("submit", async function(event){
            event.preventDefault()
            var msg = $('#msgText').val()
            var conversationId = $('.msg-body').data('conversation')
            var receiverId = $('.msg-body').data('receiver')
            console.log(msgText)
            socket.emit('sendMessage', {
                conversationId,
                receiverId,
                msg
            });
            // processRequest('/api/sendMessage',{
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ receiverId })
            // })
            // .then(response => response.json())
            // .then((data) => {

            // })
        })
        socket.on('message', (message) => {
            console.log('New message received:', message);
            // Update your chat UI with the new message
        });
    // let uname;

    // app.querySelector(".join-screen #join-user").addEventListener("click", function(){
    //     let username = app.querySelector(".join-screen #username").value;
    //     if (username.length == 0) {
    //         return;
    //     }
    //     socket.emit("newuser", username);
    //     uname = username
    //     app.querySelector(".join-screen").classList.remove("active")
    //     app.querySelector(".chat-screen").classList.add("active")
    // })
    // app.querySelector(".chat-screen #send-message").addEventListener("click", function(){
    //     let message = app.querySelector(".chat-screen #message-input").value
    //     if(message.length == 0){
    //         return;
    //     }
    //     renderMessage("my",{
    //         username: uname,
    //         text:message
    //     })
    //     socket.emit("chat",{
    //         username:uname,
    //         text:message
    //     })
    //     app.querySelector(".chat-screen #message-input").value = "";
    // })

    // app.querySelector(".chat-screen #exit-chat").addEventListener("click", function(){
    //     socket.emit("exituser",uname);
    //     window.location.href = window.location.href
    // })

    // socket.on("update", function(update){
    //     console.log('hello'+update)
    //     renderMessage("update",update)
    // })
    // socket.on("chat", function(message){
    //     renderMessage("other",message)
    // })

    // function renderMessage(type,message){
    //     let messageContainer = app.querySelector(".chat-screen .messages");
    //     if (type == "my") {
    //         let el = document.createElement("div");
    //         el.setAttribute("class","message my-message")
    //         el.innerHTML = `
    //             <div>
    //                 <div class="name">You</div>
    //             <div class="text">${message.text}</div>
    //         `;
    //         messageContainer.appendChild(el);
    //     } else if (type == "other") {
    //         let el = document.createElement("div");
    //         el.setAttribute("class","message other-message")
    //         el.innerHTML = `
    //             <div>
    //                 <div class="name">${message.username}</div>
    //             <div class="text">${message.text}</div>
    //         `;
    //         messageContainer.appendChild(el);
    //     } else if (type == "update") {
    //         let el = document.createElement("div");
    //         el.setAttribute("class","update")
    //         el.innerText = message;
    //         messageContainer.appendChild(el);
    //     }
    //     //scrolll chat to end
    //     messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight
    // }
})();