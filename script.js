import { WORDS } from "./words.js";

// You can configure some stuff here
const DEBUG = false;                 // Debug output to console
const WORD_PICK_METHOD = 'seed'     // Daily seed or random

// End of user definable configuration
let currentGuess = [];
let nextLetter = 0;
let rightGuessString
if (WORD_PICK_METHOD == 'random')
{ 
    if (DEBUG == true) { console.log('PICK METHOD IS RANDOM '); }
    rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)].toLowerCase();
}
else if (WORD_PICK_METHOD == 'seed')
{
    // let currentDate = new Date();
    // let seed = currentDate.getDate();
    // let derp = seed / WORDS.length;
    let temp = 3

    // rightGuessString = WORDS[Math.round(temp)].toLowerCase();
    rightGuessString = WORDS[temp].toLowerCase();
    // if (DEBUG == true) { console.log('PICK METHOD IS SEEDED. USING SEED ' + Math.round(derp)); }
    if (DEBUG == true) { console.log('PICK METHOD IS SEEDED.'); }
}
let wordLength = rightGuessString.length;
const MAX_GUESSES = Math.min(7, Math.max(4, Math.floor(wordLength / 2) + 3));
const NUMBER_OF_GUESSES = MAX_GUESSES;
let guessesRemaining = NUMBER_OF_GUESSES;
if (DEBUG == true) {
    console.log('WORD IS: ' + rightGuessString);
    console.log('LENGTH: ' + wordLength);
    console.log('MAX GUESSES: ' + MAX_GUESSES);
}

const color_guesscorrect    = getComputedStyle(document.documentElement).getPropertyValue('--main-guess-correct');
const color_guessClose      = getComputedStyle(document.documentElement).getPropertyValue('--main-guess-close');
const color_guessIncorrect  = getComputedStyle(document.documentElement).getPropertyValue('--main-guess-incorrect');

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < wordLength; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        } 

        board.appendChild(row)
    }
}

initBoard()

// Listen to virtual keyboard in DOM
document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

// Listen to physical keyboard input device
document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    let isNotLowerCaseLetter = !(/[a-z]|^F\d{1,2}$/i).test(pressedKey);

    if (isNotLowerCaseLetter == 'true') {
        return
    }

    console.log(isNotLowerCaseLetter);
    if (pressedKey === "Enter") {
        checkGuess()
        return
    }
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function insertLetter (pressedKey) {
    if (nextLetter === wordLength) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)
    console.log('The word: ' + rightGuess)
    console.log('Player input: ' + currentGuess)

    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != wordLength) {
        toastr.error("Not enough letters!")
        return
    }

    for (let i = 0; i < wordLength; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = color_guessIncorrect
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = color_guesscorrect
            } else {
                // shade box yellow
                letterColor = color_guessClose
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Thanks for playing!")
        guessesRemaining = 0
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.info(`The right word was: "${rightGuessString}"`)
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === color_guesscorrect) {
                return
            } 

            if (oldColor === color_guessClose && color !== color_guesscorrect) {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.5s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});
