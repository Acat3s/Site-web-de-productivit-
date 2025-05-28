// todo-firebase-bridge.js
// Ce script sert de pont entre les modules ES6 et le code non-module
// Il expose TodoFirebaseManager globalement pour qu'il soit accessible depuis todo.js

import { TodoFirebaseManager } from './todo-firebase.js';

// Exposer TodoFirebaseManager globalement
window.TodoFirebaseManager = TodoFirebaseManager;

console.log('TodoFirebaseManager exposé globalement'); 