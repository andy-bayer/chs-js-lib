import { default as Arc } from '../src/arc.js';
import { default as Circle } from '../src/circle.js';
import { default as Color } from '../src/color.js';
import { default as Console } from '../src/console/console.js';
import { default as Graphics } from '../src/graphics.js';
import { default as Keyboard } from '../src/keyboard.js';
import { default as Line } from '../src/line.js';
import { default as Oval } from '../src/oval.js';
import { default as Polygon } from '../src/polygon.js';
import { default as Queue } from '../src/datastructures/queue.js';
import { default as Rectangle } from '../src/rectangle.js';
import { default as Sound } from '../src/sound.js';
import { default as Stack } from '../src/datastructures/stack.js';
import { default as Text } from '../src/text.js';
import { default as WebImage } from '../src/webimage.js';
import * as Randomizer from '../src/randomizer.js';

window.Arc = Arc;
window.Circle = Circle;
window.Color = Color;
window.Console = Console;
window.Graphics = Graphics;
window.Keyboard = Keyboard;
window.Line = Line;
window.Oval = Oval;
window.Polygon = Polygon;
window.Queue = Queue;
window.Rectangle = Rectangle;
window.Sound = Sound;
window.Stack = Stack;
window.Text = Text;
window.WebImage = WebImage;
window.Randomizer = Randomizer;

const GraphicsInstance = new Graphics();
window.__graphics__ = GraphicsInstance;
window.add = GraphicsInstance.add.bind(GraphicsInstance);
window.Audio = GraphicsInstance.Audio.bind(GraphicsInstance);
window.getWidth = GraphicsInstance.getWidth.bind(GraphicsInstance);
window.getHeight = GraphicsInstance.getHeight.bind(GraphicsInstance);
window.mouseClickMethod = GraphicsInstance.mouseClickMethod.bind(GraphicsInstance);
window.mouseDownMethod = GraphicsInstance.mouseDownMethod.bind(GraphicsInstance);
window.mouseUpMethod = GraphicsInstance.mouseUpMethod.bind(GraphicsInstance);
window.mouseMoveMethod = GraphicsInstance.mouseMoveMethod.bind(GraphicsInstance);
window.stopAllTimers = GraphicsInstance.stopAllTimers.bind(GraphicsInstance);
window.setMainTimer = GraphicsInstance.setMainTimer.bind(GraphicsInstance);
window.stopTimer = GraphicsInstance.stopTimer.bind(GraphicsInstance);
window.setTimer = GraphicsInstance.setTimer.bind(GraphicsInstance);
window.keyDownMethod = GraphicsInstance.keyDownMethod.bind(GraphicsInstance);
window.removeAll = GraphicsInstance.removeAll.bind(GraphicsInstance);
window.remove = GraphicsInstance.remove.bind(GraphicsInstance);
window.setBackgroundColor = GraphicsInstance.setBackgroundColor.bind(GraphicsInstance);
window.getElementAt = GraphicsInstance.getElementAt.bind(GraphicsInstance);
window.setFullscreen = GraphicsInstance.setFullscreen.bind(GraphicsInstance);
window.setSize = GraphicsInstance.setSize.bind(GraphicsInstance);

const ConsoleInstance = new Console();
window.readLine = ConsoleInstance.readLine.bind(ConsoleInstance);
window.readInt = ConsoleInstance.readInt.bind(ConsoleInstance);
