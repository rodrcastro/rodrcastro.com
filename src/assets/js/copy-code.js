document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('.code-block-container');

  codeBlocks.forEach(container => {
    const copyButton = container.querySelector('.copy-button');
    // Use the hidden textarea for copying
    const codeToCopyArea = container.querySelector('.code-to-copy');
    const copyStatus = container.querySelector('.copy-status');

    if (copyButton && codeToCopyArea && navigator.clipboard) {
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

  if (!navigator.clipboard) {
    return;
  }

  const headerAnchors = document.querySelectorAll('.post-container.has-heading-anchors .header-anchor');

  headerAnchors.forEach(anchor => {
    const statusEl = anchor.querySelector('.anchor-copy-status');
    const defaultLabel = anchor.dataset.copyLabel || anchor.getAttribute('aria-label') || 'Copiar link da seção';
    const defaultAriaLabel = anchor.dataset.copyAriaLabel || anchor.getAttribute('aria-label') || defaultLabel;
    const copiedLabel = anchor.dataset.copiedLabel || '✅';
    const copiedAriaLabel = anchor.dataset.copiedAriaLabel || 'Link copiado!';
    const errorLabel = anchor.dataset.copyErrorLabel || 'Erro ❌';
    const errorAriaLabel = anchor.dataset.copyErrorAriaLabel || 'Não foi possível copiar o link';
    const hash = anchor.getAttribute('href');

    const updateStatus = (message, stateClass, ariaMessage = message) => {
      anchor.classList.remove('copied', 'copy-error');
      if (stateClass) {
        anchor.classList.add(stateClass);
      }
      anchor.setAttribute('aria-label', ariaMessage);
      if (statusEl) {
        statusEl.textContent = message;
      }
    };

    const resetStatus = () => {
      anchor.classList.remove('copied', 'copy-error');
      anchor.setAttribute('aria-label', defaultAriaLabel);
      if (statusEl) {
        statusEl.textContent = '';
      }
    };

    const copyLink = async () => {
      try {
        const urlToCopy = hash ? `${window.location.origin}${window.location.pathname}${hash}` : window.location.href;
        await navigator.clipboard.writeText(urlToCopy);
        updateStatus(copiedLabel, 'copied', copiedAriaLabel);
        if (hash && history.replaceState) {
          history.replaceState(null, '', hash);
        }
        setTimeout(resetStatus, 1200);
      } catch (error) {
        console.error('Failed to copy heading link:', error);
        updateStatus(errorLabel, 'copy-error', errorAriaLabel);
        setTimeout(resetStatus, 1600);
      }
    };

    anchor.addEventListener('click', event => {
      event.preventDefault();
      copyLink();
    });

    anchor.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        copyLink();
      }
    });
  });
});
