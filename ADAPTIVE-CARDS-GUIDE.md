# Adaptive Cards Support Guide

## Overview
The D365 Modern Chat Widget now has **full support for Microsoft Adaptive Cards**, allowing Copilot Studio and other bots to send rich, interactive forms and UI elements.

## Features Implemented

### 1. **Automatic Detection**
The widget automatically detects when a message contains Adaptive Card JSON:
- Direct Adaptive Card payloads
- Adaptive Cards wrapped in attachments array
- Content type: `application/vnd.microsoft.card.adaptive`

### 2. **Rich Rendering**
Adaptive Cards are rendered with proper styling including:
- Text blocks with proper formatting
- Input fields (text, email, phone, etc.)
- Choice sets (dropdowns and radio buttons)
- Action buttons
- Customized theme matching the chat widget design

### 3. **Form Handling**
When users submit Adaptive Card forms:
- All form data is collected automatically
- Data is sent as a message through the D365 Omnichannel SDK
- Form values are formatted and displayed in the chat
- Metadata is preserved for backend processing

### 4. **Session Persistence**
Adaptive Cards are properly saved and restored:
- Cards are stored in localStorage with session data
- When chat is restored, cards are re-rendered correctly
- All form interactions are preserved

## Technical Implementation

### Libraries Added
```html
<!-- Adaptive Cards Library v3.0.2 -->
<script src="https://unpkg.com/adaptivecards@3.0.2/dist/adaptivecards.min.js"></script>
```

### Key Functions

#### `isAdaptiveCardContent(content)`
Detects if message content contains an Adaptive Card by checking:
- Direct `type: "AdaptiveCard"` property
- Attachments with contentType `application/vnd.microsoft.card.adaptive`

#### `addAdaptiveCardMessage(content, isUser, senderName, senderImage)`
Renders an Adaptive Card message:
1. Parses the JSON content
2. Extracts the card payload
3. Renders using AdaptiveCards library
4. Sets up action handlers for form submissions
5. Adds to message history

#### Action Handler
```javascript
adaptiveCardRenderer.onExecuteAction = async (action) => {
    if (action instanceof AdaptiveCards.SubmitAction) {
        const data = action.data;
        // Send form data via SDK
        await chatSDK.sendMessage({
            content: formattedData,
            metadata: { adaptiveCardData: data }
        });
    }
};
```

### CSS Styling
Custom styles ensure cards match the chat widget theme:
- Gradient submit buttons matching widget primary colors
- Input fields with focus states
- Proper spacing and padding
- Responsive design

## Example Adaptive Card
The widget supports cards like this from Copilot Studio:

```json
{
  "attachments": [{
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": {
      "type": "AdaptiveCard",
      "body": [
        {
          "text": "Please provide the following information",
          "wrap": true,
          "type": "TextBlock"
        },
        {
          "placeholder": "Enter your first name",
          "label": "First Name*:",
          "type": "Input.Text",
          "id": "contactfirst"
        },
        {
          "placeholder": "Enter your last name",
          "label": "Last Name*:",
          "type": "Input.Text",
          "id": "contactlast"
        },
        {
          "placeholder": "Enter your email",
          "label": "Email Address*:",
          "type": "Input.Text",
          "id": "contactemail"
        },
        {
          "choices": [
            {"title": "Yes", "value": "Yes"},
            {"title": "No", "value": "No"}
          ],
          "style": "compact",
          "label": "Current Customer?:",
          "type": "Input.ChoiceSet",
          "id": "current"
        },
        {
          "actions": [{
            "data": {"actionSubmitId": "Start Live Conversation"},
            "type": "Action.Submit",
            "title": "Start Live Conversation"
          }],
          "type": "ActionSet"
        }
      ],
      "version": "1.5"
    }
  }]
}
```

## Supported Card Elements

### Input Types
- ✅ `Input.Text` - Text input fields
- ✅ `Input.ChoiceSet` - Dropdowns and radio buttons
- ✅ `Input.Number` - Numeric inputs
- ✅ `Input.Date` - Date pickers
- ✅ `Input.Time` - Time pickers
- ✅ `Input.Toggle` - Checkboxes

### Display Elements
- ✅ `TextBlock` - Text with various styles
- ✅ `Image` - Images with sizing options
- ✅ `Container` - Grouping elements
- ✅ `ColumnSet` - Multi-column layouts

### Actions
- ✅ `Action.Submit` - Form submission
- ✅ `Action.OpenUrl` - Open links
- ✅ `Action.ShowCard` - Expandable cards

## Browser Compatibility
Adaptive Cards work in all modern browsers:
- Chrome/Edge (Chromium) - Full support
- Firefox - Full support
- Safari - Full support
- Mobile browsers - Full support

## Debugging
The widget includes comprehensive logging:
```javascript
console.log('📋 Detected Adaptive Card in message content');
console.log('Adaptive Card action executed:', action);
console.log('Submit action data:', data);
```

Look for these console messages to debug card rendering and submission.

## Known Limitations
1. **Complex Actions**: Some advanced action types may require additional implementation
2. **Custom Renderers**: The widget uses default rendering - custom renderers would require additional configuration
3. **Validation**: Client-side validation is limited to HTML5 constraints

## Future Enhancements
Potential improvements for the future:
- Custom validation messages
- File upload support in cards
- Enhanced styling options
- Accessibility improvements (ARIA labels)
- Animation effects for card transitions

## Testing Checklist
When testing Adaptive Cards:
- [ ] Card renders correctly on first display
- [ ] All input fields are accessible
- [ ] Form submission sends data to bot
- [ ] Submitted data appears in chat
- [ ] Card persists after page refresh
- [ ] Multiple cards can be displayed
- [ ] Cards work on mobile devices

## Troubleshooting

### Card Not Displaying
1. Check browser console for errors
2. Verify JSON structure is valid
3. Confirm AdaptiveCards library is loaded
4. Check contentType is correct

### Form Submission Not Working
1. Verify chatSDK is initialized
2. Check action handler is configured
3. Confirm data structure in console
4. Verify network connectivity

### Styling Issues
1. Check CSS is not being overridden
2. Verify container classes are correct
3. Test in different browsers
4. Check for CSS conflicts

## Support
For issues or questions:
1. Check browser console logs
2. Review this guide
3. Test with sample Adaptive Card
4. Check Microsoft Adaptive Cards documentation: https://adaptivecards.io/

---

**Implementation Date**: December 2024  
**Library Version**: AdaptiveCards 3.0.2  
**Status**: ✅ Production Ready
