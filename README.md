# CT-DelMesAndSwipeButtons

A simple SillyTavern/CozyTavern extension that adds dedicated "Delete Message" and "Delete Swipe" buttons to the chat interface for easier access.

## Features

- **Delete Message Button**: Adds a trash can icon to every message, allowing for quick deletion without entering the edit menu.
- **Delete Swipe Button**: Adds a backspace icon to messages with multiple swipes, allowing you to delete the current swipe version directly.
- **Smart Visibility**: The "Delete Swipe" button only appears on messages that have more than one swipe.
- **Safety**: Includes a confirmation popup before deleting to prevent accidental clicks.

## Installation

### Automatic Installation (Recommended)

1. Open SillyTavern.
2. Navigate to the **Extensions** menu.
3. Click on **Install Extension**.
4. Paste the repository URL: `https://github.com/leyam3k/CT-DelMesAndSwipeButtons`
5. Click **Save**.

### Manual Installation

1. Navigate to your SillyTavern installation folder: `.../SillyTavern/public/scripts/extensions/third-party/`
2. Clone this repository into a new folder named `CT-DelMesAndSwipeButtons`.
   ```bash
   git clone https://github.com/leyam3k/CT-DelMesAndSwipeButtons.git
   ```
3. Restart SillyTavern.

## Usage

Once installed, you will see two new buttons in the message toolbar (usually hidden under the "..." or visible on hover/selection depending on your theme settings):

- <i class="fa-solid fa-trash-can"></i> **Delete Message**: Click to delete the entire message.
- <i class="fa-solid fa-backspace"></i> **Delete Swipe**: Click to delete the currently displayed swipe (only visible if multiple swipes exist).

Both actions will prompt for confirmation.

## Credits

Created by leyam3k.
