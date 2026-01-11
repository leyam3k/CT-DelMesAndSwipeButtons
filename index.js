import { getContext } from "../../../extensions.js";
import { deleteMessage } from "../../../../script.js";

const extensionName = "CT-DelMesAndSwipeButtons";
const { eventSource, event_types, Popup } = getContext();

/**
 * Gets the chat object from the context.
 * We get it fresh every time because the reference might change (though usually the array is mutated).
 */
function getChat() {
  return getContext().chat;
}

/**
 * Checks if a message has multiple swipes.
 * @param {object} message - The message object.
 * @returns {boolean}
 */
function hasMultipleSwipes(message) {
  return Array.isArray(message.swipes) && message.swipes.length > 1;
}

/**
 * Handles the Delete Message button click.
 * @param {number} mesId - The ID of the message to delete.
 */
async function handleDeleteMessage(mesId) {
  const confirm = await Popup.show.confirm(
    "Are you sure you want to delete this message?",
    "Delete Message"
  );
  if (confirm) {
    // Pass false for askConfirmation to skip the built-in popup
    await deleteMessage(mesId, undefined, false);
  }
}

/**
 * Handles the Delete Swipe button click.
 * @param {number} mesId - The ID of the message.
 */
async function handleDeleteSwipe(mesId) {
  const chat = getChat();
  const message = chat[mesId];

  if (!message) {
    console.error(`[${extensionName}] Message not found: ${mesId}`);
    return;
  }

  // Check if we can delete a swipe (must have > 1 swipes)
  if (!hasMultipleSwipes(message)) {
    // This shouldn't be reachable if we hide the button, but good for safety
    toastr.warning(
      "Cannot delete swipe: This message has only one version.",
      "Delete Swipe"
    );
    return;
  }

  const swipeIndex = message.swipe_id ?? 0;

  const confirm = await Popup.show.confirm(
    "Are you sure you want to delete this swipe?",
    "Delete Swipe"
  );
  if (confirm) {
    // Pass swipeDeletionIndex and askConfirmation=false
    await deleteMessage(mesId, swipeIndex, false);
  }
}

/**
 * Injects the buttons into a message element.
 * @param {jQuery} $mesElement - The jQuery object for the message element (.mes).
 */
function injectButtons($mesElement) {
  const mesId = $mesElement.attr("mesid");
  if (mesId === undefined) return;

  // Check if buttons are already injected
  if ($mesElement.find(`.ct-del-buttons`).length > 0) return;

  // Target the .extraMesButtons container
  const $extraButtons = $mesElement.find(".extraMesButtons");
  if ($extraButtons.length === 0) return;

  // Create the container for our buttons
  const $myButtons = $(
    `<div class="ct-del-buttons" style="display: contents;"></div>`
  );

  // Create Delete Swipe button
  const $delSwipeBtn = $(`
        <div title="Delete Swipe" class="mes_button mes_delete_swipe fa-solid fa-backspace interactable" tabindex="0" role="button"></div>
    `);
  $delSwipeBtn.on("click", () => handleDeleteSwipe(Number(mesId)));
  $myButtons.append($delSwipeBtn);

  // Create Delete Message button
  const $delMesBtn = $(`
        <div title="Delete Message" class="mes_button mes_delete_message fa-solid fa-trash-can interactable" tabindex="0" role="button"></div>
    `);
  $delMesBtn.on("click", () => handleDeleteMessage(Number(mesId)));
  $myButtons.append($delMesBtn);

  // Append to extraMesButtons
  $extraButtons.append($myButtons);

  // Initial check for swipe button visibility
  updateSwipeButtonVisibility($mesElement);
}

/**
 * Updates the visibility of the Delete Swipe button based on the number of swipes.
 * @param {jQuery} $mesElement
 */
function updateSwipeButtonVisibility($mesElement) {
  const mesId = $mesElement.attr("mesid");
  if (mesId === undefined) return;

  const chat = getChat();
  const message = chat[mesId];

  if (message) {
    const $swipeBtn = $mesElement.find(".mes_delete_swipe");
    if (hasMultipleSwipes(message)) {
      $swipeBtn.show();
    } else {
      $swipeBtn.hide();
    }
  }
}

/**
 * Scans the chat and injects buttons into all message elements.
 */
function scanAndInject() {
  $("#chat .mes").each(function () {
    injectButtons($(this));
  });
}

jQuery(async () => {
  // Initial scan
  scanAndInject();

  // Listen for new messages rendered
  eventSource.on(event_types.USER_MESSAGE_RENDERED, (mesId) => {
    const $mes = $(`#chat .mes[mesid="${mesId}"]`);
    injectButtons($mes);
  });

  eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (mesId) => {
    const $mes = $(`#chat .mes[mesid="${mesId}"]`);
    injectButtons($mes);
  });

  // When chat is changed/loaded
  eventSource.on(event_types.CHAT_CHANGED, () => {
    // Wait a bit for render
    setTimeout(scanAndInject, 100);
  });

  // Using a MutationObserver on the chat container
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && $(node).hasClass("mes")) {
            injectButtons($(node));
          }
        });
      }
    });
  });

  const chatContainer = document.getElementById("chat");
  if (chatContainer) {
    observer.observe(chatContainer, { childList: true });
  }

  // Use delegation on chat for mouseenter to ensure buttons are present and updated
  // This covers cases where buttons might be wiped by re-renders or updates
  $("#chat").on("mouseenter", ".mes", function () {
    injectButtons($(this)); // Ensure buttons exist
    updateSwipeButtonVisibility($(this)); // Update state
  });
});
