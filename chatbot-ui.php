<main id="chatgpt-style-chat">
  <header class="chatbot-header">
    <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" alt="Heart Icon" class="chatbot-logo">
    <h1>The AmeriCorps Amplifier</h1>
    <p class="chatbot-intro">
      You’re doing powerful work. This assistant helps you amplify it—turning stories, data, and updates into blog posts, social content, speeches, op-eds, and more.
      Fast, clear, and inspiring—so your impact gets seen, supported, and celebrated. Let’s do this! ❤️, The America Learns Team
    </p>
  </header>

  <div class="chat-starters">
    <button class="starter" onclick="startConversation('What can I do here?')">What can I do here?</button>
    <button class="starter" onclick="startConversation('Create a social media post for my program.')">Create a social media post for my program.</button>
    <button class="starter" onclick="startConversation('Create a blog post for our website.')">Create a blog post for our website.</button>
    <button class="starter" onclick="startConversation('Write an op-ed about the importance of funding AmeriCorps, using our program as an example.')">Write an op-ed about the importance of funding AmeriCorps...</button>
  </div>

  <div id="chat-thread" class="chat-thread"></div>

  <form id="chat-input-form" class="chat-input-form">
    <button type="button" id="voice-btn" title="Speak">🎤</button>
    <input type="text" id="user-input" placeholder="   Ask anything" autocomplete="off" required />
    <button type="submit" title="Send"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-2xl"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z" fill="currentColor"></path></svg></button>
  </form>
</main>
