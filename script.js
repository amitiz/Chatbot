const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const messageInput = document.querySelector(".message-input");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatBody = document.querySelector(".chat-body");



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

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

//get the message input 
const handleInputMessage = (e) => {
     e.preventDefault();
     userData.message = messageInput.value.trim();
     messageInput.value = "";

     messageInput.dispatchEvent (new Event("input"));
     fileUploadWrapper.classList.remove("file-uploaded");

     const messageContain = `<div class="message-text"></div>
     ${userData.file.data ? `<img src = "data:${userData.file.mime_type}:base64, ${userData.file.data}"
        class = "attachment" />` : ""}`;

    const outGoingMessageDiv = createMessageElement(messageContain, "user-message");
    outGoingMessageDiv.querySelector(".message-text").innerHTML = userData.message;
    chatBody.appendChild(outGoingMessageDiv);
}

//handle enter key for sending message 
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage && window.innerWidth > 768) {
        console.log(userMessage);
        handleInputMessage(e);
    }
})

document.querySelector("#file-upload").addEventListener("click", () => fileInput.click())
fileInput.addEventListener("change", () => {
   const file = fileInput.files[0];
   console.log(file);
   if(!file) return;

   const reader = new FileReader();
   reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    console.log(e.target.result);

    const base64String = e.target.result.split(",")[1];
    userData.file = {
        data: base64String,
        mime_type: file.type,
    }
   }

   reader.readAsDataURL(file);

} )
fileCancelButton.addEventListener("click", () => {
    //remove the file-uploaded css class
    //clear the user date
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");

})