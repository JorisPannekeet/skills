# Feel checklist

Tests and bots confirm that the game works. They do not confirm that it feels right, because a bot never gets annoyed. Walk this list by hand, or ask the player to, after any change to input, combat or the HUD.

## Input
- A buffered action uses the direction held when it fires, not the direction from when it was queued. Spamming attack and turning around must turn the next swing.
- An action pressed on the same tick as a direction uses that direction.
- Releasing a held input outside the canvas still releases it.
- Every device has its own mapping: keyboard, mouse (attack and guard on the two buttons), touch (stick and buttons sized for thumbs), gamepad if supported.
- Controls on screen match the device in use, and the help text names the right keys.

## Feedback
- Every cooldown and every resource the player waits on is visible while it recharges, and signals the moment it is ready.
- Every hit lands with something: a flash, a number, a sound, a short pause.
- An enemy shows its attack before it lands, long enough to react.
- The player always knows where to go next, or knows that they are meant to explore.

## Character
- Held items sit in the hands in every facing and every animation frame. Check each weapon type.
- The character turns to face what it attacks.
- Shadows sit under feet.

## Inventory
- An equipped item does not also appear as a loose item.
- Descriptions lead with the effect and the number.
- Picking up, equipping and discarding each take one obvious action.

## When the player reports a feel bug
1. Reproduce it with a scripted input sequence.
2. Turn that sequence into a test that fails.
3. Fix it, and add the case to this list if it is not here.
