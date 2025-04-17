document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('.code-block-container');

  codeBlocks.forEach(container => {
    const copyButton = container.querySelector('.copy-button');
    // Use the hidden textarea for copying
    const codeToCopyArea = container.querySelector('.code-to-copy');
    const copyStatus = container.querySelector('.copy-status');

    if (copyButton && codeToCopyArea) {
      copyButton.addEventListener('click', async () => {
        try {
          // Get text from the hidden textarea
          const textToCopy = codeToCopyArea.value;
          await navigator.clipboard.writeText(textToCopy);

          // Visual feedback: Add class, set text
          copyButton.classList.add('copied');
          if (copyStatus) {
            copyStatus.textContent = 'Copied!'; // Set text content
            copyButton.setAttribute('aria-label', 'Code copied to clipboard');
            copyButton.disabled = true;
          }

          // Reset feedback after a delay: Remove class, clear text
          setTimeout(() => {
            copyButton.classList.remove('copied');
            if (copyStatus) {
              copyStatus.textContent = ''; // Clear text content
              copyButton.setAttribute('aria-label', 'Copy code snippet');
              copyButton.disabled = false;
            }
          }, 800); // Reset after 0.80 seconds

        } catch (err) {
          console.error('Failed to copy text: ', err);
          // Handle failure: Add class, set text (optional)
          copyButton.classList.add('copied'); // Use same class for visual consistency
          if (copyStatus) {
            copyStatus.textContent = 'Failed!'; // Indicate failure
            copyButton.disabled = true; // Keep disabled briefly on fail too
          }
           // Reset feedback after a delay: Remove class, clear text
           setTimeout(() => {
            copyButton.classList.remove('copied');
            if (copyStatus) {
              copyStatus.textContent = ''; // Clear text content
              copyButton.disabled = false;
            }
          }, 1000); // Slightly longer timeout for failure message
        }
      });
    }
  });
}); 