// Listen for messages from the server using SSE
new window.EventSource("/sse").onmessage = function(event) {
    window.messages.innerHTML += `<p>${event.data}</p>`;
  };
  
  // Send messages to the server
  window.form.addEventListener('submit', function(event) {
    event.preventDefault();
    window.fetch(`/chat?message=${window.input.value}`);
    window.input.value = '';
  });