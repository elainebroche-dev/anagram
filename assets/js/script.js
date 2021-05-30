// global variable to hold the topic qustions for the current round
let thisRoundQuestions = [];
let thisRoundAnswers = [];
let timer;

// Wait for the DOM to finish loading then add listeners
document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("exit").addEventListener("click",exit);

    // handle interactions on the login panel
    document.getElementById("user").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            checkUser();
        }
    })
    document.getElementById("login").addEventListener("click",checkUser);

    // handle interactions on the topics panel
    let topics = document.getElementsByClassName("topic-btn");
    for (let topic of topics) {
        topic.addEventListener("click", function() {
            runGame(this.innerText);
        })
    }

    // handle interactions on the main game panel
    document.getElementById("game-button").addEventListener("click",handleGameButton);

    // handle interactions on the end panel
    document.getElementById("play-again").addEventListener("click",runTopics);
    document.getElementById("end-game").addEventListener("click",runLogin);

    // set up the topic buttons
    loadTopics();

    // kick off the login
    runLogin();
})

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
        }
        else panel.style.display = "none";
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
function runGame(topicTitle) {
    // initialize the elements on the panel to start the new round
    document.getElementById("topic-title").innerText = topicTitle;
    document.getElementById("response-icon").style.visibility = "hidden";
    document.getElementById("num-asked").innerText = "1 of 10";
    document.getElementById("num-correct").innerText = "0 correct answers";
    document.getElementById("progress").style.width = "10%";
    document.getElementById("game-button").innerText = "Check Answer"

    // get the index of the topic so that it can be used when accessing the quiz data structure
    let topicNumber = quiz.map(function(e) { return e.topicTitle; }).indexOf(document.getElementById("topic-title").innerText);
    
    // build the array of questions for the round 
    buildThisRound(topicNumber);
    
    // display the first question
    document.getElementById("word-display").innerText = thisRoundQuestions.pop();
    showPanel("game-panel");
    startTimer();
}

/**
 * show the user the result of the round and let them choose to play again or exit
 */
function runEndGame() {
    let currStr = document.getElementById("num-correct").innerText;
    let numCorrect = parseInt(currStr.substring(0,currStr.indexOf(' ')));

    let msgStr = "";
    switch(true) {
        case (numCorrect < 3) :
            msgStr = "Aw, they didn't really suit you";
            break;
        case (numCorrect <= 5) :
            msgStr = "Better luck next time"
            break;
        case (numCorrect <= 9) :
            msgStr = "That's impressive !"
            break;
        case (numCorrect == 10) :
            msgStr = "Congratulations !"
            break;
        default :
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
    if(username.match(regexp)) {
        document.getElementById("username").innerText = username;
        runTopics('topic-panel');
    }
    else {
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
    arr = [];
    while(arr.length < 10){
        let r = randomIntFromInterval(0,quiz[topicNumber].questions.length-1);
        if(arr.indexOf(r) === -1) arr.push(r);
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
    return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * decide on how to handle the button click on the main game panel depending on state
 */
function handleGameButton() {

    let currState = document.getElementById("game-button").innerText;
    switch (true) {
        case(currState === "End Round") :
            runEndGame();
            break;
        case(currState === "Continue") :
            askNextQuestion();
            break;
        case(currState == "Check Answer") :
            checkAnswer();
            break;
        default :
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

    let isCorrect = randomIntFromInterval(0,1);  // this line is temporary
    
    document.getElementById("word-display").innerText = thisRoundAnswers.pop();
    let icon = document.getElementById("response-icon");
    if (isCorrect) {
        console.log("answer is correct");
        incCounter("num-correct");
        icon.classList.add("fa-check-circle");
        icon.classList.remove("fa-times-circle");
        document.getElementById("answer").style.background = "#8acc84";
    }
    else {
        console.log("answer is wrong")
        icon.classList.add("fa-times-circle");
        icon.classList.remove("fa-check-circle");
        document.getElementById("answer").style.background = "#ec5959";
    }
    document.getElementById("response-icon").style.visibility = "visible";
  
    let questionsAsked = parseInt(document.getElementById("num-asked").innerText.substring(0,document.getElementById("num-asked").innerText.indexOf(' ')));
    (questionsAsked < 10) ? document.getElementById("game-button").innerText = "Continue" : document.getElementById("game-button").innerText = "End Round";
}

/** 
 * after the user has reviewed the feedback and clicked the Continue, move on to the next question
 */
function askNextQuestion() {
    let topicNumber = quiz.map(function(e) { return e.topicTitle; }).indexOf(document.getElementById("topic-title").innerText);
    let currNum = incCounter("num-asked");
    document.getElementById("answer").style.background = "white";
    document.getElementById("answer").value = "";
    document.getElementById("response-icon").style.visibility = "hidden";
    document.getElementById("progress").style.width = currNum * 10 + "%";
    document.getElementById("word-display").innerText = thisRoundQuestions.pop();
    document.getElementById("game-button").innerText = "Check Answer";
    startTimer();
}

/**
 * for the item id passed in, get the first part of the string and increment it, put it back in the html 
 * */ 
function incCounter(itemName) {
    let currStr = document.getElementById(itemName).innerText;
    let currNum = parseInt(currStr.substring(0,currStr.indexOf(" ")));
    let restOfStr = currStr.substring(currStr.indexOf(" "));
    document.getElementById(itemName).innerText = ++currNum + restOfStr;
    return currNum;
}

var i = 0;
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
            elem.style.width = "0%";
            clearInterval(timer);
            checkAnswer();
        } else {
            width--;
            elem.style.width = (width/24) + "%";
        }
    }
} 
