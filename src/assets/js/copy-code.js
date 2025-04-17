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

          // Visual feedback
          if (copyStatus) {
            copyStatus.textContent = 'Copied!';
            copyButton.setAttribute('aria-label', 'Code copied to clipboard');
            copyButton.disabled = true; // Briefly disable button
          }

          // Reset feedback after a delay
          setTimeout(() => {
            if (copyStatus) {
              copyStatus.textContent = '';
              copyButton.setAttribute('aria-label', 'Copy code snippet');
              copyButton.disabled = false;
            }
          }, 2000); // Reset after 2 seconds

        } catch (err) {
          console.error('Failed to copy text: ', err);
          if (copyStatus) {
            copyStatus.textContent = 'Failed!';
          }
           // Reset feedback after a delay even on failure
           setTimeout(() => {
            if (copyStatus) {
              copyStatus.textContent = '';
            }
          }, 2000);
        }
      });
    }
  });
}); 