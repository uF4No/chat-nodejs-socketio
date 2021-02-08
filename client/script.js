/**
 * Use io (loaded earlier) to connect with the socket instance running in your server.
 * IMPORTANT! By default, socket.io() connects to the host that
 * served the page, so we dont have to pass the server url
 */
var socket = io()

//prompt to ask user's name
const name = prompt('Welcome! Please enter your name:')

// emit event to server with the user's name
socket.emit('new-connection', { username: name })

// get elements of our html page
const chatContainer = document.getElementById('chat-container')
const messageInput = document.getElementById('messageInput')
const messageForm = document.getElementById('messageForm')

messageForm.addEventListener('submit', (e) => {
  // avoids submit the form and refresh the page
  e.preventDefault()
  // check if there is a message in the input
  if (messageInput.value !== '') {
    let newMessage = messageInput.value
    //sends message and our id to socket server
    socket.emit('new-message', { user: socket.id, message: newMessage })
    // appends message in chat container
    addMessage({ message: newMessage }, true)
    //resets input
    messageInput.value = ''
  } else {
    // adds error styling to input
    messageInput.classList.add('error')
  }
})

socket.on('welcome', function (data) {
  console.log('📢 welcome event >> ', data)
  addMessage(data)
})

socket.on('broadcast-message', (data) => {
  console.log('📢 broadcast-message event >> ', data)
  addMessage(data)
})

// removes error class from input
messageInput.addEventListener('keyup', (e) => {
  messageInput.classList.remove('error')
})

// receives two params, the message and if it was sent by yourself
// so we can style them differently
function addMessage(data, isSelf = false) {
  const messageElement = document.createElement('div')
  messageElement.classList.add('message')

  if (isSelf) {
    messageElement.classList.add('my-message')
    messageElement.innerText = `${data.message}`
  } else {
    if (data.user === 'server') {
      // message is from the server, like a notification of new user connected
      // messageElement.classList.add('others-message')
      messageElement.innerText = `${data.message}`
    } else {
      // message is from other user
      messageElement.classList.add('others-message')
      messageElement.innerText = `${data.user}: ${data.message}`
    }
  }
  // adds the new div to the message container div
  chatContainer.append(messageElement)
}
