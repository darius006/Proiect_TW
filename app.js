window.onload = function() {
  const menu = document.querySelector("#mobile-menu");
  const menuLinks = document.querySelector(".navbar__menu");

  menu.addEventListener("click", function() {
    menu.classList.toggle("is-active");
    menuLinks.classList.toggle("is-active");
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  });

  const hiddenElements = document.querySelectorAll(".hidden");
  hiddenElements.forEach((el) => observer.observe(el));

  const start = document.getElementById("start"), quiz = document.getElementById("quiz");
  var seconds;

  const colors = ["rgb(231, 240, 131)", "rgb(123, 231, 175)", "rgb(215, 149, 234)", "rgb(255, 167, 167)"]

  sessionStorage.setItem("score", 0);
  hsMessage = document.getElementById("highscore");

  if (!("users" in localStorage)) {
    localStorage.setItem("users", JSON.stringify({}))
  }

  if (isNaN(localStorage["high_score"])) {
    localStorage.setItem("high_score", 0);
  }

  if (localStorage["high_score"] != 0 && hsMessage !== null) {
    hsMessage.innerText = `High score: ${localStorage["hs_user"]} - ${localStorage["high_score"]}`;
  }
  
  if (quiz === Object()) {
    defaultBorder = getComputedStyle(quiz).border;
    quiz.addEventListener("click", quizClickHandler);

    function quizClickHandler(event) {
      quiz.style.border = "solid white";
      event.stopPropagation();
    }

    document.body.addEventListener("click", bodyClickHandler);

    function bodyClickHandler(event) {
      quiz.style.border = defaultBorder;
    }
  }

  let scoresButton = document.getElementsByClassName("all-scores")[0];

  if (scoresButton !== Object()) {
    scoresButton.addEventListener("click", (event) => {
      scoresPanel = document.createElement("div");
      scoresPanel.id = "scores-panel";
      quiz.appendChild(scoresPanel);
      let goBack = document.createElement("div");
      goBack.textContent = "Back to quiz <<";
      goBack.className = "all-scores";
      goBack.addEventListener("click", (event) => {
        quiz.removeChild(scoresPanel);
      });
      scoresPanel.appendChild(goBack);
      let users = JSON.parse(localStorage["users"]);
      scoresList = document.createElement("div");
      scoresList.id = "scores-list";
      if (Object.keys(users).length === 0) {
        let scoresMessage = document.createElement("div"),
        messageText = document.createElement("div");
        scoresMessage.id = "scores-message";
        scoresMessage.textContent = "Scores will be shown here";
        // scoresMessage.appendChild(messageText);
        scoresList.appendChild(scoresMessage);
        scoresPanel.appendChild(scoresList);
        return;
      }
      let arr = Object.keys(users);
      arr.sort((a, b) => users[b] - users[a])
      arr.forEach((name) => {
        let currentScore = document.createElement("div");
        currentScore.textContent = `${name}: ${users[name]}`;
        currentScore.className = "current-score";
        scoresList.appendChild(currentScore);
      });
      scoresPanel.appendChild(scoresList);
    });
  }

  if (start !== null) {
    start.addEventListener("click", (event) => {
      let username = document.getElementById("username").value;
      if (username == "") {
        alert("Please enter a username!");
        return;
      }
      if (username.length > 10) {
        alert("Username must have between 1 and 10 characters.");
        return;
      }
      quiz.removeEventListener("click", quizClickHandler);
      document.body.removeEventListener("click", bodyClickHandler);
      quiz.style.display = "grid";
      quiz.style.gridTemplate = "1fr 4fr 1fr / 1fr";
      seconds = document.getElementById("seconds").value;
      sessionStorage.setItem("username", username);
      startQuiz(1);
    });
  }

  function startQuiz(number) {
    quiz.innerHTML = "";
    let k;
    let arr = quiz.style.border.split(" ");
    arr.shift();
    let borderColor = arr.join(" ");
    do {
      k = Math.floor(Math.random() * 10 / 3);
    }
    while (colors[k] == borderColor);
    quiz.style.border = `solid ${colors[k]}`;
    let top = document.createElement("div");
    top.id = "quiz__top";
    let q = document.createElement("div");
    q.className = "quiz__heading";
    q.innerText = "Flag #" + number;
    q.style.textAlign = "center";
    top.appendChild(q);
    let t = document.createElement("div");
    t.className = "quiz__heading";
    t.innerText = seconds;
    t.style.textAlign = "center";
    top.appendChild(t);
    quiz.appendChild(top);
    let question = document.createElement("div");
    question.id = "question";
    let options = document.createElement("div");
    options.id = "options";
    let message = document.createElement("div");
    message.id = "quiz__message";
    message.style.fontSize = "1.2rem";
    let nextButton = document.createElement("button");
    nextButton.id = "next"
    nextButton.innerText = "Next";
    nextButton.disabled = true;
    let timer = setInterval(function() {
      t.innerText--;
      if (t.innerText == 0) {
        clearInterval(timer);
        nextButton.disabled = false;
        nextButton.style.cursor = "pointer";
        options.classList.add("disabled");
        message.innerText = "Out of time!";
        message.style.color = "red";
        options.removeEventListener("click", choiceEventHandler);
      }
    }, 1000);
    
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "./flags.json", false);
    xhr.send();
    let flags = JSON.parse(xhr.responseText)["flags"];
    let i = number - 1;
    let image = document.createElement("img");
    image.src = flags[i]["image"];
    image.alt = flags[i]["country"];
    image.style.height = "120px";
    image.style.margin = "auto";
    question.appendChild(image);
    question.appendChild(options);
    let used = new Array(10).fill(0);
    used[i] = 1;
    let correct = Math.floor(10 * Math.random() / 3);
    for (let k = 0; k < 4; ++k) {
      let chr = String.fromCharCode(97 + k);
      let j = Math.floor(10 * Math.random());
      while (used[j]) {
        j = Math.floor(10 * Math.random());
      }
      let option = document.createElement("div");
      option.innerText = chr + ") ";
      if (k == correct) {
        option.innerText += flags[i]["country"];
      }
      else {
        option.innerText += flags[j]["country"];
        used[j] = 1;
      }
      option.className = "option";
      option.classList.add(k);
      options.appendChild(option);
    }
    options.addEventListener("click", choiceEventHandler);

    function choiceEventHandler(event) {
      if (event.target === event.currentTarget) {
        return;
      }
      clearInterval(timer);
      nextButton.disabled = false;
      nextButton.style.cursor = "pointer";
      options.classList.add("disabled");
      let target = event.target;
      let nbr = target.classList.length - 1;
      if (target.classList[nbr] != correct) {
        target.style.backgroundColor = "rgb(190, 9, 9)";
        message.innerText += `Correct answer: ${flags[i]["country"]}`;
        message.style.color = "red";
      }
      else {
        target.style.backgroundColor = "green";
        message.innerText = "Correct!";
        message.style.color = "green";
        sessionStorage["score"]++;
      }
      options.removeEventListener("click", choiceEventHandler);
    }
    quiz.appendChild(question);

    let bottom = document.createElement("div");
    bottom.id = "quiz__bottom";
    let nextContainer = document.createElement("div");
    nextContainer.id = "next__container";
    nextContainer.appendChild(nextButton);
    bottom.appendChild(message);
    bottom.appendChild(nextContainer);
    quiz.appendChild(bottom);
    nextButton.addEventListener("click", (event) => {
      if (number < 10) {
        startQuiz(number + 1);
      }
      else {
        endQuiz();
      }
    });
  }

  function endQuiz() {
    quiz.innerHTML = "";
    quiz.style.gridTemplateRows = "1fr 1fr";
    let endMessage = document.createElement("div");
    endMessage.className = "quiz__heading";
    endMessage.style.margin = "auto";
    let username = sessionStorage["username"],
    score = sessionStorage["score"],
    users = JSON.parse(localStorage["users"]);
    endMessage.innerText = `You got ${score}/10 flags right.`;
    if (parseInt(score) >= parseInt(localStorage["high_score"])) {
      localStorage["hs_user"] = username;
      localStorage["high_score"] = score;
    }
    if (isNaN(localStorage["users"][username]) || score > localStorage["users"][username]){
      users[username] = score;
    }
    localStorage["users"] = JSON.stringify(users);
    let tryAgain = document.createElement("button");
    tryAgain.innerText = "Try again";
    tryAgain.id = "try-again";
    
    tryAgain.addEventListener("click", (event) => {
      location.reload();
    });
    quiz.appendChild(endMessage);
    quiz.appendChild(tryAgain);
  }
}
