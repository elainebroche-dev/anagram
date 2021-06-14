/* jshint esversion: 6 */
/* globals quiz: false */

// variables to hold the topic qustions for the current round
let thisRoundQuestions = [];
let thisRoundAnswers = [];
let timer;

// Wait for the DOM to finish loading then add listeners
document.addEventListener("DOMContentLoaded", function () {

  // check that the quiz data is available - this code will  
  // throw an error if quiz does not exist or quiz is empty
  
  if ((typeof quiz === 'undefined') || (!quiz.length)) {
    alert(`Error trying to access Quiz data`);
    throw `Error trying to access Quiz data.`;
  }
 
  document.getElementById("goBack").addEventListener("click", goBack);

  // handle interactions on the login panel
  document.getElementById("user").addEventListener("keydown", function (evt) {
    if (evt.key === "Enter") {
      checkUser();
    }
  });
  document.getElementById("login").addEventListener("click", checkUser);

  // handle interactions on the topics panel
  let topics = document.getElementsByClassName("topic-btn");
  for (let topic of topics) {
    topic.addEventListener("click", runGame);
  }

  // handle interactions on the main game panel
  document.getElementById("answer").addEventListener("keydown", 
    function (evt) {
      if (evt.key === "Enter") {
        handleGameBtn();
      }
  });
  document.getElementById("game-btn").addEventListener("click", handleGameBtn);

  // handle interactions on the end panel
  document.getElementById("play-again").addEventListener("click", runTopics);
  document.getElementById("end-game").addEventListener("click", runLogin);

  // set up the topic buttons
  loadTopics();

  // kick off the login
  runLogin();

  // run welcome animation and title fade in
  setTimeout(typeWriter,1200);

});

/**
 * Put the names of the topics on the 4 topic buttons 
 * if less than 4 topics are available - the number of topic buttons visible 
 * will match the number of topics loaded - this function could be extended 
 * later to choose 4 topics at random if more data was available in the quiz 
 * data structure
 */
function loadTopics() {
  let topics = document.getElementsByClassName("topic-btn");
  for (let i = 0; (i < 4) && (i < quiz.length); i++) {
    topics[i].innerText = quiz[i].topicTitle;
    topics[i].style.display = "inline";
  }
}

/**
 * if the goback button is clicked move back 
 */
function goBack() {
  clearInterval(timer); // stop the timer
  let panels = document.getElementsByClassName("panel");
  for (let panel of panels) {
    if (panel.style.display === "block") {
      if (panel.id === "topic-panel") runLogin();
      else if ((panel.id === "game-panel") || (panel.id === "end-panel")) 
        runTopics();
    }
  }
}

/**
 * turn on the named panel and turn the others off
 * 
 * @param {string} panelName - id of the panel which should be visible
 */
function showPanel(panelName) {
  let panels = document.getElementsByClassName("panel");
  for (let panel of panels) {
    if (panel.id === panelName) {
      panel.style.display = "block";
    } else panel.style.display = "none";
  }
  document.getElementById("goBack").style.visibility = 
    (panelName === "login-panel") ? "hidden" : "visible";
}

/**
 * show the user the login screen and initialise game
 */
function runLogin() {
  document.getElementById("message-1").style.display = "none";
  document.getElementById("username").innerText = "";
  document.getElementById("user").value = "";
  showPanel("login-panel");
  document.getElementById("user").focus();
}

/**
 * show the user the list of topics to choose from
 */
function runTopics() {
  showPanel("topic-panel");
}

/**
 * initialise a new round of the game and show the user the game screen
 */
function runGame() {
  // initialize the elements on the panel to start the new round
  document.getElementById("topic-title").innerText = this.innerText;
  document.getElementById("num-asked").innerText = "0 of 10";
  document.getElementById("num-correct").innerText = "0 correct answers";

  // get the index of the topic to use when accessing the quiz data structure
  let topicNumber = quiz.map(function (e) {
    return e.topicTitle;
  }).indexOf(document.getElementById("topic-title").innerText);

  // build the array of questions for the round 
  buildThisRound(topicNumber);

  // show the panel
  showPanel("game-panel");

  // initialize the elements on the panel to start a new question
  askNextQuestion();
}

/**
 * show the user the result of the round and let them choose 
 * to play again or return to login
 */
function runEndGame() {
  let currStr = document.getElementById("num-correct").innerText;
  let numCorrect = parseInt(currStr.substring(0, currStr.indexOf(" ")));

  let msgStr = "";
  switch (true) {
    case (numCorrect < 3):
      msgStr = "Aw, they didn't really suit you";
      break;
    case (numCorrect <= 5):
      msgStr = "Better luck next time";
      break;
    case (numCorrect <= 9):
      msgStr = "That's impressive !";
      break;
    case (numCorrect == 10):
      msgStr = "Congratulations !";
      break;
    default:
      alert(`Error checking num correct answers: ${numCorrect}`);
      throw `Error checking num correct answers: ${numCorrect}.`;
  }
  document.getElementById("result-text").innerText = numCorrect + " out of 10";
  document.getElementById("result-msg").innerText = msgStr;
  showPanel("end-panel");
}

/** 
 * verify that the username entered is valid 
 */
function checkUser() {

  let regexp = /^[0-9a-zA-Z]+$/;
  let username = document.getElementById("user").value.trim();

  // check that the username satisfies the alphanumeric reg expression
  if (username.match(regexp)) {
    document.getElementById("username").innerText = username;
    runTopics("topic-panel");
  } else {
    document.getElementById("message-1").style.display = "block";
    document.getElementById("user").value = "";
    document.getElementById("user").focus();
  }
}

/**
 * build array of 10 questions randomly picked from questions 
 * available for the topic
 * 
 * @param {int} topicNumber - index of the current topic within the quiz DS
 */
function buildThisRound(topicNumber) {
  // build an array of 10 unique random numbers between 0 and (the number of 
  // questions available for the current topic) - 1  .... because the topics 
  // may have differing numbers of questions

  // first check that at least 10 questions are available to choose from
  let qtot = quiz[topicNumber].questions.length;
  if (qtot < 10) {
    alert(`Error - min 10 questions required.  Only ${qtot} questions found.`);
    throw `Error - min 10 questions required.  Only ${qtot} questions found.`;
  }

  let arr = [];
  while (arr.length < 10) {
    let r = randomIntFromInterval(0, quiz[topicNumber].questions.length - 1);
    if (arr.indexOf(r) === -1) arr.push(r);
  }

  // now build the array of questions used those question indices
  thisRoundQuestions = [];
  thisRoundAnswers = [];
  for (let i = 0; i < arr.length; i++) {
    thisRoundQuestions.push(quiz[topicNumber].questions[arr[i]].question);
    thisRoundAnswers.push(quiz[topicNumber].questions[arr[i]].answer);
  }
}

/** 
 * generate a random number between min and max (inclusive)
 * 
 * @param {int} min - lowest number within random number range
 * @param {int} max - highest number within random number range
 * @return {int} number in range
 */
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * decide on how to handle button click on main game panel depending on state
 */
function handleGameBtn() {

  let currState = document.getElementById("game-btn").innerText;
  switch (true) {
    case (currState === "End Round"):
      runEndGame();
      break;
    case (currState === "Continue"):
      askNextQuestion();
      break;
    case (currState == "Check Answer"):
      checkAnswer();
      break;
    default:
      alert(`Unknown button click: ${currState}`);
      throw `Unknown button click: ${currState}.`;
  }
}

/**
 * check the answer entered by the user and give feedback
 */
function checkAnswer() {
  // stop the timer
  clearInterval(timer);

  let answer = thisRoundAnswers.pop();
  let userAnswer = document.getElementById("answer").value;
  document.getElementById("word-display").innerText = answer;
  let isCorrect = stringsMatch(answer, userAnswer);
  let icon = document.getElementById("resp-icon");
  if (isCorrect) {
    incCounter("num-correct");
    icon.classList.add("fa-check-circle");
    icon.classList.remove("fa-times-circle", "fa-clock");
    document.getElementById("answer").style.background = "#8acc84";
  } else {
    icon.classList.add("fa-times-circle");
    icon.classList.remove("fa-check-circle", "fa-clock");
    document.getElementById("answer").style.background = "#ec5959";
  }
  document.getElementById("resp-icon").style.visibility = "visible";

  let elem = document.getElementById("num-asked");
  let questionsAsked = 
    parseInt(elem.innerText.substring(0, elem.innerText.indexOf(" ")));
  document.getElementById("game-btn").innerText = 
    (questionsAsked < 10) ? "Continue" : "End Round";
}

/**
 * clean up strings and compare them - return true if 
 * they match, otherwise false.
 * 
 * @param {string} str1 - first string to be compared
 * @param {string} str2 - second string to be compared
 * @return {bool} true if strings match, otherwise false
 */
function stringsMatch(str1, str2) {
  // replace multiple whitespace chars with a single space
  str1 = str1.replace(/\s\s+/g, " ").trim().toUpperCase();
  str2 = str2.replace(/\s\s+/g, " ").trim().toUpperCase();
  return (str1 === str2) ? true : false;
}

/** 
 * move on to the next question - initalize answer field, progress bar, 
 * question, action button and response icon 
 */
function askNextQuestion() {
  let currNum = incCounter("num-asked");
  document.getElementById("answer").style.background = "white";
  document.getElementById("answer").value = "";
  document.getElementById("progress").style.width = currNum * 10 + "%";
  document.getElementById("word-display").innerText = thisRoundQuestions.pop();
  document.getElementById("game-btn").innerText = "Check Answer";
  document.getElementById("resp-icon").classList.add("fa-clock");
  document.getElementById("resp-icon").classList
    .remove("fa-times-circle", "fa-check-circle");
  startTimer();
}

/**
 * for id passed in, get the first part of the string and 
 * increment it, put it back in the html 
 * 
 * @param {string} itemName - string to be updated 
 * @return {int} the updated number embedded in the string
 * */
function incCounter(itemName) {
  let currStr = document.getElementById(itemName).innerText;
  let currNum = parseInt(currStr.substring(0, currStr.indexOf(" ")));
  let restOfStr = currStr.substring(currStr.indexOf(" "));
  document.getElementById(itemName).innerText = ++currNum + restOfStr;
  return currNum;
}

/**
 * initialize the timer bar and kick off the countdown interval
 */
function startTimer() {
  let elem = document.getElementById("timer");
  elem.style.backgroundColor = "rgb(20, 176, 80)";
  elem.style.width = "100%";
  let width = 2400;
  timer = setInterval(frame, 25);

  function frame() {
    try {
      if (width <= 0) {
        checkAnswer();
      } else {
        width--;
        if (width < 600) elem.style.backgroundColor = "rgb(220,37,46)";
        elem.style.width = (width / 24).toFixed(2) + "%";
      }
    } catch (e) {
      clearInterval(timer);   // something went wrong so clear timer
      throw e;                // re-throw the error
    }
  }
}

/** 
 * animate welcome message to look like typed letters and fade in game title
 */
 function typeWriter() {
  let txt1 = "Cool Met We . . .";
  let txt2 = "Welcome to . . .";
  let a = 0;
  let b = txt1.length;
  let c = 0;

  let elem1 = document.getElementById("welcome-text");
  let keepGoing = setInterval(function() {
    try {
      if (a < txt1.length) {
        elem1.innerHTML += txt1.charAt(a);
        a++;
      } else if (b >= 0) {
        let mystr = elem1.innerHTML;
        elem1.innerHTML = mystr.substring(0, b);
        b--;
      } else if (c < txt2.length) {
        elem1.innerHTML += txt2.charAt(c);
        c++;
      } else {
        clearInterval(keepGoing);
        fadeIn(document.getElementById("game-title"));  // fade in game title
      }
    } catch(e) {
      clearInterval(keepGoing);   // something has gone wrong so clear timer
      throw e;
    }
  }, 100);
}

/**  
 * fade in the game title
 * 
 * @param {HTMLElement} - element to apply fade-in to
 */
 function fadeIn(element) {
  let op = 0.1;  // initial opacity
  element.style.opacity = op;
  element.style.visibility = "visible";
  let fadetimer = setInterval(function () {
    try {
      if (op >= 1){
          clearInterval(fadetimer);
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op += op * 0.1;
    } catch(e) {
      clearInterval(fadetimer);
      throw e;
    }
  }, 50);
}
