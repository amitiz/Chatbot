const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const messageInput = document.querySelector(".message-input");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatBody = document.querySelector(".chat-body");
const sendMessage = document.querySelector("#send-message");

const API_KEY ="PASTE YOUR API_KEY ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;


const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null,

    }
}

// Toggler event listener 
chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot")
});

//keyboard arrwon down event listener 
closeChatbot.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot")
});

//this will create a dynamic container with class message and rutern it 
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

//creage bot response using gemini api
const chatHistory = [];
const createBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message}, ...(userData.file.data ? [{inline_data: userData.file}]: [])],
    });

    const requestOptions = {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
            contents:chatHistory,
        })
    }

    //create an api request
    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);
        //console.log("data",data);
        //return;
    
        const apiResponseText = data.candidates[0].content.parts[0].text;
        messageElement.innerText =apiResponseText;
        //console.log("Response Text",apiResponseText);
        //return;
    
        //add bot response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: apiResponseText}],
        })

    } catch (error) {
        console.log("Error",error);
        messageElement.innerText =error.message;
        messageElement.style.color ="#ff0000";

    } finally {
        //reset user's data
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
    }

   
    

}





//get the message input 
const handleInputMessage = (e) => {
     e.preventDefault();
     //add message input to userData message
     userData.message = messageInput.value.trim();
     messageInput.value = "";
     
     messageInput.dispatchEvent (new Event("input")); //triggers an input event to update thr UI
     fileUploadWrapper.classList.remove("file-uploaded");

     const messageContent = `<div class="message-text"></div>
     ${userData.file.data ? `<img src = "data:${userData.file.mime_type};base64, ${userData.file.data}" class = "attachment" />` : ""}`;

    //create a message element with dynamic classess and return it 

    const outGoingMessageDiv = createMessageElement(messageContent, "user-message");
    outGoingMessageDiv.querySelector(".message-text").innerHTML = userData.message;
    chatBody.appendChild(outGoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                  <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                  </svg>

            <div class="message-text">
                <div class="thinking-indicator">
                   <div class="dot"></div>
                   <div class="dot"></div>
                   <div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
        //function to call gemini api
        createBotResponse(incomingMessageDiv);

        
    }, 6000)
}

//handle enter key for sending message 
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && !e.shiftkey && userMessage && window.innerWidth > 768 ) {
        //console.log(userMessage);
        handleInputMessage(e);
    }
})

//add event listner on attach file icon which on click makes the file input clickable

document.querySelector("#file-upload").addEventListener("click", () => fileInput.click())
fileInput.addEventListener("change", () => {
   const file = fileInput.files[0];
   console.log("file selected", fileInput.files);
   if(!file) return;

   const reader = new FileReader();
   console.log(reader, "Reader");
   reader.onload = (e) => {
       fileInput.value = "";
       fileUploadWrapper.querySelector("img").src = e.target.result;
       fileUploadWrapper.classList.add("file-uploaded");
       console.log(e.target.result);
    
       //extract the base64 encoded string and add it to userData's data
       const base64String = e.target.result.split(",")[1];
       userData.file = {
          data: base64String,
          mime_type:file.type,
        }
    }

   reader.readAsDataURL(file);

} )

fileCancelButton.addEventListener("click", () => {
    //remove the file-uploaded css class
    //clear the user data
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");

})

sendMessage.addEventListener("click", (e) => handleInputMessage(e));

const initialInputHeight = messageInput.scrollHeight;

//adjust input field height dynamically
messageInput.addEventListener("input",() => {
    messageInput.style.height = `${ initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";

})

//initialise emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus(); // Keep focus on the input field
    },
    onClickOutside: (e) => {
        const emojiPickerContainer = document.querySelector("#emoji-picker"); // Get the emoji picker element
        if (!emojiPickerContainer) return; // Ensure it exists
    
        if (e.target.id === "emoji-picker") {
            emojiPickerContainer.classList.toggle("show-emoji-picker");  //  Fix: Use the correct element
        } else {
            emojiPickerContainer.classList.remove("show-emoji-picker");  // Fix: Use the correct element
        }
    }
    
})

document.querySelector(".chat-form").appendChild(picker);
