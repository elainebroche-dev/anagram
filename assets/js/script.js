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
            runGame();
        })
    }

    // handle interactions on the main game panel
    document.getElementById("check-answer").addEventListener("click",checkAnswer);

    // handle interactions on the end panel
    document.getElementById("play-again").addEventListener("click",runTopics);
    document.getElementById("end-game").addEventListener("click",runLogin);

    // set up the topic list
    loadTopics();

    // kick off the login
    runLogin();
})

/**
 * Put the names of the topics on the 4 topic buttons 
 * if less than 4 topics are available - the number of topic buttons visible will match the number of topics loaded
 * - this function be extended later to choose 4 topics at random if more data was available in the quiz data structure
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
 * initialise list of topics and show the user the topic screen
 */
function runTopics() {
    showPanel("topic-panel"); 
}

/**
 * initialise a new round of the game and show the user the game screen
 */
function runGame() {
    document.getElementById("num-asked").innerText = "1 of 10";
    showPanel("game-panel");
}

/**
 * show the user the result
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
 * check the answer entered by the user, give feedback, update scores move to next question
 */
function checkAnswer() {
    console.log("check answer");
    console.log("lots to be written here");
    if (document.getElementById("check-answer").innerText === "End Round") {
        runEndGame(); 
    }
    else {
        console.log("got to here");

        let isCorrect = true;

        if (isCorrect) {
            console.log("answer is correct");
            incCounter("num-correct");
        }
        else {
            console.log("answer is wrong")
        }

        
        let questionsAsked = parseInt(document.getElementById("num-asked").innerText.substring(0,document.getElementById("num-asked").innerText.indexOf(' ')));
        if (questionsAsked < 10) {
            incCounter("num-asked");
        } else {
            console.log("no more questions to ask");
            document.getElementById("check-answer").innerText = "End Round";
        }
    }
}

/**
 * for the item id passed in, get the first part of the string and increment it, put it back in the html 
 * */ 
function incCounter(itemName) {
    let currStr = document.getElementById(itemName).innerText;
    let currNum = parseInt(currStr.substring(0,currStr.indexOf(' ')));
    let restOfStr = currStr.substring(currStr.indexOf(' '));
    document.getElementById(itemName).innerText = ++currNum + restOfStr;

    if (itemName === "num-asked") {   // need to update the progress bar as well for "num-asked"
        document.getElementById("progress").style.width = currNum * 10 + "%"; 
    }
}
