console.log('chat.js file loaded!')

const messageInput = document.getElementById('messageInput')

var socket = io.connect()
//prompt to ask user's name
const username = prompt('Welcome! Please enter your name:')

// emit event to server with the user's name
socket.emit('new-connection', { username })

socket.on('welcome-message', (data) => {
  console.log('received welcome-message >>', data)
  // appends message in chat container, with isSelf flag true
  addMessage(data, false)
})

socket.on('broadcast-message', (data) => {
  console.log('📢 broadcast-message event >> ', data)
  // appends message in chat container, with isSelf flag false
  addMessage(data, false)
})

const messageForm = document.getElementById('messageForm')

messageForm.addEventListener('submit', (e) => {
  // avoids submit the form and refresh the page
  e.preventDefault()

  const messageInput = document.getElementById('messageInput')

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

// receives two params, the message and if it was sent by yourself
// so we can style them differently
function addMessage(data, isSelf = false) {
  const messageElement = document.createElement('div')
  messageElement.classList.add('message')

  if (isSelf) {
    messageElement.classList.add('self-message')
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
  // get chatContainer element from our html page
  const chatContainer = document.getElementById('chatContainer')

  // adds the new div to the message container div
  chatContainer.append(messageElement)
}
