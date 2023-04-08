require('application.css')

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById("select-folder");
  const saveFile = document.getElementById("select-output");
  button.addEventListener("click", () => {
    window.myApi.openFolder();
  })
  saveFile.addEventListener("click", () => {
    window.myApi.showSaveDialog();
  })
  window.myApi.getPath();
  document.getElementById("start-rec").addEventListener("click", () => {
    let btns = document.getElementById("main-buttons");
    let messages = document.getElementById("messages");
    let opacity = 1;

    let timerId = setInterval(() => {
      opacity -= 0.1;
      btns.style.opacity = opacity;

      if (opacity <= 0) {
        clearInterval(timerId);
        console.log("Кнопки изменены");
        btns.style.display = "none";
        messages.style.opacity = 0;
        messages.style.display = "block";
        opacity = 0;

        timerId = setInterval(() => {
          opacity += 0.1;
          messages.style.opacity = opacity;

          if (opacity >= 1) {
            clearInterval(timerId);
            console.log("Поле появилось");
            window.myApi.startRec();
            window.myApi.getMessage();
          }
        }, 1000 / 60);
      }
    }, 1000 / 60);
  });
});