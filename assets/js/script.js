/* jshint esversion: 6 */
/* globals self: false */
/* globals quiz: false */

// variables to hold the topic qustions for the current round
let thisRoundQuestions = [];
let thisRoundAnswers = [];
let timer;

// Wait for the DOM to finish loading then add listeners
document.addEventListener("DOMContentLoaded", function () {

  // check that the quiz data is available - this code will throw an error if quiz does not exist or is empty
  try {
    if(!quiz.length) {
      throw `Error trying to access Quiz data. Aborting`;
    }
  }
  catch (error) {
    alert(`Error trying to access Quiz data`);
    throw `Error trying to access Quiz data. Aborting`;
  }
 
  document.getElementById("exit").addEventListener("click", exit);

  // handle interactions on the login panel
  document.getElementById("user").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
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
  document.getElementById("answer").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleGameButton();
    }
  });
  document.getElementById("game-button").addEventListener("click", handleGameButton);

  // handle interactions on the end panel
  document.getElementById("play-again").addEventListener("click", runTopics);
  document.getElementById("end-game").addEventListener("click", runLogin);

  // set up the topic buttons
  loadTopics();

  // kick off the login
  runLogin();

  // run welcome animation and title fade in
  typeWriter();

});

/**
 * Put the names of the topics on the 4 topic buttons 
 * if less than 4 topics are available - the number of topic buttons visible will match the number of topics loaded
 * - this function could be extended later to choose 4 topics at random if more data was available in the quiz data structure
 */
function loadTopics() {
  let topics = document.getElementsByClassName("topic-btn");
  for (let i = 0; (i < 4) && (i < quiz.length); i++) {
    topics[i].innerText = quiz[i].topicTitle;
    topics[i].style.display = "inline";
  }
}

/**
 * if the exit button is clicked move back - close the window if x is clicked on the login screen
 */
function exit() {
  clearInterval(timer); // stop the timer
  let panels = document.getElementsByClassName("panel");
  for (let panel of panels) {
    if (panel.style.display === "block") {
      if (panel.id === "login-panel") self.close();
      else if (panel.id === "topic-panel") runLogin();
      else if ((panel.id === "game-panel") || (panel.id === "end-panel")) runTopics();
    }
  }
}

/**
 * turn on the named panel and turn the others off
 */
function showPanel(panelName) {
  let panels = document.getElementsByClassName("panel");
  for (let panel of panels) {
    if (panel.id === panelName) {
      panel.style.display = "block";
    } else panel.style.display = "none";
  }
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

  // get the index of the topic so that it can be used when accessing the quiz data structure
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
 * show the user the result of the round and let them choose to play again or exit
 */
function runEndGame() {
  let currStr = document.getElementById("num-correct").innerText;
  let numCorrect = parseInt(currStr.substring(0, currStr.indexOf(' ')));

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
      throw `Error checking num correct answers: ${numCorrect}. Aborting`;
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
    runTopics('topic-panel');
  } else {
    document.getElementById("message-1").style.display = "block";
    document.getElementById("user").value = "";
    document.getElementById("user").focus();
  }
}

/**
 * build an array of 10 questions randomly picked from the the questions available for the topic
 */
function buildThisRound(topicNumber) {
  // build an array of 10 unique random numbers between 0 and (the number of questions available for the 
  // current topic) - 1      .... because the topics may have differing numbers of questions

  // first check that at least 10 questions are available to choose from
  if (quiz[topicNumber].questions.length < 10) {
    alert(`Error - minimum of 10 questions required.  Only ${quiz[topicNumber].questions.length} questions are available.`);
    throw `Error - minimum of 10 questions required.  Only ${quiz[topicNumber].questions.length} questions are available. Aborting`;
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
 */
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * decide on how to handle the button click on the main game panel depending on state
 */
function handleGameButton() {

  let currState = document.getElementById("game-button").innerText;
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
      throw `Unknown button click: ${currState}. Aborting`;
  }
}

/**
 * check the answer entered by the user and give feedback
 */
function checkAnswer() {
  // stop the timer
  clearInterval(timer);

  let answer = thisRoundAnswers.pop();
  document.getElementById("word-display").innerText = answer;
  let isCorrect = stringsMatch(answer, document.getElementById("answer").value);
  let icon = document.getElementById("response-icon");
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
  document.getElementById("response-icon").style.visibility = "visible";

  let questionsAsked = parseInt(document.getElementById("num-asked").innerText.substring(0, document.getElementById("num-asked").innerText.indexOf(' ')));
  document.getElementById("game-button").innerText = (questionsAsked < 10) ? "Continue" : "End Round";
}

/**
 * clean up the input strings and compare them - return true if they match, otherwise false.
 */
function stringsMatch(str1, str2) {
  // replace multiple whitespace chars with a single space
  str1 = str1.replace(/\s\s+/g, ' ').trim().toUpperCase();
  str2 = str2.replace(/\s\s+/g, ' ').trim().toUpperCase();
  return (str1 === str2) ? true : false;
}

/** 
 * move on to the next question - initalize answer field, progress bar, question, action button and response icon 
 */
function askNextQuestion() {
  let currNum = incCounter("num-asked");
  document.getElementById("answer").style.background = "white";
  document.getElementById("answer").value = "";
  document.getElementById("progress").style.width = currNum * 10 + "%";
  document.getElementById("word-display").innerText = thisRoundQuestions.pop();
  document.getElementById("game-button").innerText = "Check Answer";
  document.getElementById("response-icon").classList.add("fa-clock");
  document.getElementById("response-icon").classList.remove("fa-times-circle", "fa-check-circle");
  startTimer();
}

/**
 * for the item id passed in, get the first part of the string and increment it, put it back in the html 
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
  elem.style.width = "100%";
  let width = 2400;
  timer = setInterval(frame, 25);

  function frame() {
    if (width <= 0) {
      checkAnswer();
    } else {
      width--;
      if (width < 600) elem.style.backgroundColor = "rgb(220,37,46)";
      elem.style.width = (width / 24).toFixed(2) + "%";
    }
  }
}

/** 
 * animate welcome message to look like typed letters and fade in game title
 */

 function typeWriter() {
  let txt1 = "Cool Met We";
  let txt2 = "Welcome to . . .";
  let a = 1;
  let b = txt1.length;
  let c = 1;

  let elem1 = document.getElementById("welcome-text");
  let keepGoing = setInterval(typeText, 100);

  function typeText() {
    try {
      elem1.style.visibility = "visible";
      if (a < txt1.length) {
        elem1.innerHTML += txt1.charAt(a);
        a++;
      } else if (b > 0) {
        mystr = document.getElementById("welcome-text").innerHTML;
        elem1.innerHTML = mystr.substring(0, b);
        b--;
      } else if (b == 0) {  //need this for a smooth transition across to the new string - otherwise there will be jump on-screen if element is empty
        elem1.innerHTML = txt2.charAt(0);
        b--;
      } else if (c < txt2.length) {
        elem1.innerHTML += txt2.charAt(c);
        c++;
      } else {
        clearInterval(keepGoing);
        fadeIn(document.getElementById("game-title"));            // fade in game title
      }
    }
    catch(e) {
      clearInterval(keepGoing);
      throw e;
    }
  }
}

/**  
 * fade in the game title
 */
 function fadeIn(element) {
  let op = 0.1;  // initial opacity
  element.style.opacity = op;
  element.style.visibility = 'visible';
  let fadetimer = setInterval(function () {
      if (op >= 1){
          clearInterval(fadetimer);
      }
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op += op * 0.1;
  }, 50);
}
