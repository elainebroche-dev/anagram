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

    // kick off the login
    runLogin();
})

/**
 * if the exit button is clicked move back a screen - close the window if x is clicked on the login screen
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
    showPanel("game-panel");
}

/**
 * show the user the result
 */
function runEndGame() {
    showPanel("end-panel");
}

/** 
 * verify that the username entered is valid 
 */
 function checkUser() {
    console.log("check the user name entered");

    runTopics('topic-panel');
}

/**
 * check the answer entered by the user, give feedback, update scores move to next question
 */
function checkAnswer() {
    console.log("check answer");
    // for now just go to the end page
    runEndGame();
}
